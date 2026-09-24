// Pulls the signed-in user's billing state straight from Stripe and writes it to the
// database: subscription row, payments, and credits.
//
// Why this exists: entitlements were granted ONLY by stripe-webhook, so if the webhook
// is misconfigured (wrong signing secret, wrong endpoint, live vs test mode) a customer can
// pay and still see the free plan. This function is the safety net. The checkout success
// page and the Billing tab call it, so a paid customer is upgraded within a second or two
// regardless of the webhook.
//
// It is safe to run repeatedly and alongside the webhook: credit grants use the same
// unique `reference` values as the webhook (invoice id / checkout session id), so
// nothing can be credited twice.
//
// Deploy:  supabase functions deploy sync-billing
// Secrets: STRIPE_SECRET_KEY (already set), STRIPE_PRICE_* (already set)

import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { CATALOG, corsHeaders } from "../_shared/catalog.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

const admin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } },
);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

/** Which catalogue product does this Stripe price belong to? */
function planKeyForPrice(priceId: string | null | undefined): string | null {
  if (!priceId) return null;
  for (const [key, entry] of Object.entries(CATALOG)) {
    const envs = entry.kind === "subscription" ? [entry.monthlyEnv, entry.yearlyEnv] : [entry.priceEnv];
    if (envs.some((e) => Deno.env.get(e) === priceId)) return key;
  }
  return null;
}

async function grantCredits(userId: string, amount: number, reason: string, reference: string) {
  if (!amount || amount <= 0) return false;
  const { error } = await admin
    .from("credit_ledger")
    .insert({ user_id: userId, delta: amount, reason, reference });
  if (error && error.code !== "23505") throw error; // 23505 = already granted
  return !error;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (!Deno.env.get("STRIPE_SECRET_KEY")) return json({ error: "Billing is not configured." }, 503);

    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    const { data: auth } = token ? await admin.auth.getUser(token) : { data: null };
    const user = auth?.user;
    if (!user?.email) return json({ error: "Sign in first." }, 401);

    const summary = { subscriptions: 0, creditsGranted: 0, payments: 0, customers: 0 };

    // ---- the user's Stripe customers: linked one first, then anyone with this email -------
    const customerIds = new Set<string>();
    const { data: linked } = await admin
      .from("billing_customers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (linked?.stripe_customer_id) customerIds.add(linked.stripe_customer_id);

    const byEmail = await stripe.customers.list({ email: user.email, limit: 10 });
    for (const c of byEmail.data) customerIds.add(c.id);
    summary.customers = customerIds.size;

    for (const customerId of customerIds) {
      // Only adopt a customer that is provably this user's: email match (above) or a metadata link.
      await admin.from("billing_customers").upsert(
        { user_id: user.id, stripe_customer_id: customerId, email: user.email },
        { onConflict: "user_id" },
      );

      // ---- subscriptions + renewal credits ---------------------------------------------
      const subs = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 10 });
      for (const sub of subs.data) {
        const owner = sub.metadata?.user_id;
        if (owner && owner !== user.id) continue; // belongs to a different account

        const item = sub.items.data[0];
        const priceId = item?.price?.id ?? null;
        const planKey = sub.metadata?.product_key || planKeyForPrice(priceId);

        await admin.from("subscriptions").upsert({
          id: sub.id,
          user_id: user.id,
          status: sub.status,
          price_id: priceId,
          plan_key: planKey,
          interval: item?.price?.recurring?.interval ?? null,
          current_period_end: sub.current_period_end
            ? new Date(sub.current_period_end * 1000).toISOString()
            : null,
          cancel_at_period_end: sub.cancel_at_period_end ?? false,
          updated_at: new Date().toISOString(),
        });
        summary.subscriptions++;

        const credits = Number(sub.metadata?.credits ?? 0) ||
          (planKey && CATALOG[planKey] ? CATALOG[planKey].credits : 0);
        if (credits > 0) {
          const invoices = await stripe.invoices.list({ subscription: sub.id, status: "paid", limit: 12 });
          for (const inv of invoices.data) {
            if (await grantCredits(user.id, credits, "plan_renewal", inv.id)) summary.creditsGranted += credits;
          }
        }
      }

      // ---- one-off credit packs ----------------------------------------------------------
      const sessions = await stripe.checkout.sessions.list({ customer: customerId, limit: 20 });
      for (const s of sessions.data) {
        if (s.status !== "complete") continue;
        const owner = s.metadata?.user_id;
        if (owner && owner !== user.id) continue;

        await admin.from("payments").upsert({
          id: s.id,
          user_id: user.id,
          email: user.email,
          amount_total: s.amount_total,
          currency: s.currency,
          mode: s.mode,
          product_key: s.metadata?.product_key ?? null,
          status: s.payment_status,
        });
        summary.payments++;

        const credits = Number(s.metadata?.credits ?? 0);
        if (s.mode === "payment" && s.payment_status === "paid" && credits > 0) {
          if (await grantCredits(user.id, credits, "pack_purchase", s.id)) summary.creditsGranted += credits;
        }
      }
    }

    return json({ ok: true, ...summary });
  } catch (err) {
    console.error("sync-billing failed:", err);
    return json({ error: "Could not refresh billing right now." }, 500);
  }
});
