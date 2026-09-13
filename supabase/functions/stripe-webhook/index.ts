// Stripe webhook — the ONLY place entitlements are granted.
//
// Deploy:  supabase functions deploy stripe-webhook --no-verify-jwt
//          (--no-verify-jwt is required: Stripe cannot send a Supabase JWT.
//           Authenticity comes from the Stripe signature check below.)
// Secrets: supabase secrets set STRIPE_SECRET_KEY=sk_...
//          supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
//
// Endpoint URL to paste into Stripe:
//   https://<project-ref>.supabase.co/functions/v1/stripe-webhook

import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

const admin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } },
);

/** Find the Supabase user for a Stripe customer, by metadata then by email. */
async function resolveUser(
  metaUserId: string | undefined,
  customerId: string | null,
  email: string | null,
): Promise<string | null> {
  if (metaUserId) return metaUserId;

  if (customerId) {
    const { data } = await admin
      .from("billing_customers")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();
    if (data?.user_id) return data.user_id;
  }

  if (email) {
    // listUsers is paged; fine at this scale, revisit past a few thousand users.
    const { data } = await admin.auth.admin.listUsers();
    const hit = data?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase(),
    );
    if (hit) return hit.id;
  }

  return null;
}

async function linkCustomer(userId: string, customerId: string, email: string | null) {
  await admin.from("billing_customers").upsert(
    { user_id: userId, stripe_customer_id: customerId, email },
    { onConflict: "user_id" },
  );
}

/**
 * Grant credits. `reference` has a unique index, so a webhook replay
 * inserts nothing rather than double-crediting the account.
 */
async function grantCredits(
  userId: string,
  amount: number,
  reason: string,
  reference: string,
) {
  if (!userId || amount <= 0) return;
  const { error } = await admin
    .from("credit_ledger")
    .insert({ user_id: userId, delta: amount, reason, reference });

  // 23505 = unique violation = already granted. Expected on replay.
  if (error && error.code !== "23505") {
    console.error("credit grant failed:", error);
    throw error;
  }
}

Deno.serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !secret) {
    return new Response("Missing signature or webhook secret", { status: 400 });
  }

  // Signature must be verified against the RAW body, before parsing.
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(raw, signature, secret);
  } catch (err) {
    console.error("Signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  // Replay guard — Stripe retries, and retries must be harmless.
  const { error: seenErr } = await admin
    .from("stripe_events")
    .insert({ id: event.id, type: event.type });
  if (seenErr && seenErr.code === "23505") {
    return new Response(JSON.stringify({ received: true, duplicate: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    switch (event.type) {
      /* ---------------------------------------------- one-off + first charge */
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const customerId = typeof s.customer === "string" ? s.customer : null;
        const email = s.customer_details?.email ?? s.customer_email ?? null;
        const productKey = s.metadata?.product_key ?? null;
        const credits = Number(s.metadata?.credits ?? 0);

        const userId = await resolveUser(s.metadata?.user_id || undefined, customerId, email);
        if (userId && customerId) await linkCustomer(userId, customerId, email);

        await admin.from("payments").upsert({
          id: s.id,
          user_id: userId,
          email,
          amount_total: s.amount_total,
          currency: s.currency,
          mode: s.mode,
          product_key: productKey,
          status: s.payment_status,
        });

        // Credit packs settle here. Subscription credits are granted on the
        // invoice event instead, so renewals top up too.
        if (userId && s.mode === "payment" && credits > 0) {
          await grantCredits(userId, credits, "pack_purchase", s.id);
        }
        break;
      }

      /* --------------------------------------------- subscription lifecycle */
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : null;

        let email: string | null = null;
        if (customerId) {
          const c = await stripe.customers.retrieve(customerId);
          if (!("deleted" in c)) email = c.email ?? null;
        }

        const userId = await resolveUser(sub.metadata?.user_id || undefined, customerId, email);
        if (!userId) {
          console.warn("No user for subscription", sub.id);
          break;
        }
        if (customerId) await linkCustomer(userId, customerId, email);

        const item = sub.items.data[0];
        await admin.from("subscriptions").upsert({
          id: sub.id,
          user_id: userId,
          status: sub.status,
          price_id: item?.price?.id ?? null,
          plan_key: sub.metadata?.product_key ?? null,
          interval: item?.price?.recurring?.interval ?? null,
          current_period_end: sub.current_period_end
            ? new Date(sub.current_period_end * 1000).toISOString()
            : null,
          cancel_at_period_end: sub.cancel_at_period_end ?? false,
          updated_at: new Date().toISOString(),
        });
        break;
      }

      /* ------------------------------- monthly/yearly credit top-up on renewal */
      case "invoice.paid": {
        const inv = event.data.object as Stripe.Invoice;
        if (!inv.subscription) break;

        const subId = typeof inv.subscription === "string"
          ? inv.subscription
          : inv.subscription.id;
        const sub = await stripe.subscriptions.retrieve(subId);
        const customerId = typeof sub.customer === "string" ? sub.customer : null;

        const userId = await resolveUser(
          sub.metadata?.user_id || undefined,
          customerId,
          inv.customer_email ?? null,
        );
        const credits = Number(sub.metadata?.credits ?? 0);

        if (userId && credits > 0) {
          // Reference is the invoice, so each billing period grants once.
          await grantCredits(userId, credits, "plan_renewal", inv.id);
        }
        break;
      }

      case "invoice.payment_failed": {
        const inv = event.data.object as Stripe.Invoice;
        console.warn("Payment failed for invoice", inv.id, inv.customer_email);
        break;
      }

      default:
        // Unhandled types are fine — acknowledge so Stripe stops retrying.
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(`Handler failed for ${event.type}:`, err);
    // Roll back the replay guard so Stripe's retry can have another go.
    await admin.from("stripe_events").delete().eq("id", event.id);
    return new Response("Handler error", { status: 500 });
  }
});
