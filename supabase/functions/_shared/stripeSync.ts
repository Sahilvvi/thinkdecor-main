// Pulls one user's billing state from Stripe into the database: subscription rows, payments and credits.
// Shared by sync-billing (the customer's own "refresh") and super-admin ("Sync from Stripe" for any user).
// Idempotent: credit grants use the same unique `reference` values as the webhook, so nothing is credited twice.

import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { CATALOG } from "./catalog.ts";

type Admin = ReturnType<typeof createClient>;

export interface SyncSummary {
  subscriptions: number;
  creditsGranted: number;
  payments: number;
  customers: number;
}

/** Which catalogue product does this Stripe price belong to? */
export function planKeyForPrice(priceId: string | null | undefined): string | null {
  if (!priceId) return null;
  for (const [key, entry] of Object.entries(CATALOG)) {
    const envs = entry.kind === "subscription" ? [entry.monthlyEnv, entry.yearlyEnv] : [entry.priceEnv];
    if (envs.some((e) => Deno.env.get(e) === priceId)) return key;
  }
  return null;
}

async function grantCredits(admin: Admin, userId: string, amount: number, reason: string, reference: string) {
  if (!amount || amount <= 0) return false;
  const { error } = await admin.from("credit_ledger").insert({ user_id: userId, delta: amount, reason, reference });
  if (error && error.code !== "23505") throw error; // 23505 = already granted
  return !error;
}

export async function syncUserBilling(admin: Admin, stripe: Stripe, userId: string, email: string): Promise<SyncSummary> {
  const summary: SyncSummary = { subscriptions: 0, creditsGranted: 0, payments: 0, customers: 0 };

  // Claim any subscription the webhook recorded but couldn't attach to an account
  // (checkout wasn't signed in, or the Stripe customer's email wasn't registered yet
  // at the time) whose customer email matches this account. Safe to run every time —
  // once claimed, user_id is no longer null so this matches nothing on later syncs.
  await admin
    .from("subscriptions")
    .update({ user_id: userId, updated_at: new Date().toISOString() })
    .is("user_id", null)
    .ilike("customer_email", email);

  // The user's Stripe customers: linked one first, then anyone with this email, then any recent
  // checkout session that carries this user's id (the payer's email can differ from the account email).
  const customerIds = new Set<string>();
  const { data: linked } = await admin.from("billing_customers").select("stripe_customer_id").eq("user_id", userId).maybeSingle();
  if (linked?.stripe_customer_id) customerIds.add(linked.stripe_customer_id);
  for (const c of (await stripe.customers.list({ email, limit: 10 })).data) customerIds.add(c.id);
  for (const s of (await stripe.checkout.sessions.list({ limit: 100 })).data) {
    if (s.metadata?.user_id === userId && typeof s.customer === "string") customerIds.add(s.customer);
  }
  summary.customers = customerIds.size;

  for (const customerId of customerIds) {
    await admin.from("billing_customers").upsert(
      { user_id: userId, stripe_customer_id: customerId, email },
      { onConflict: "user_id" },
    );

    const subs = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 10 });
    for (const sub of subs.data) {
      const owner = sub.metadata?.user_id;
      if (owner && owner !== userId) continue; // belongs to a different account

      const item = sub.items.data[0];
      const priceId = item?.price?.id ?? null;
      const planKey = sub.metadata?.product_key || planKeyForPrice(priceId);

      await admin.from("subscriptions").upsert({
        id: sub.id,
        user_id: userId,
        status: sub.status,
        price_id: priceId,
        plan_key: planKey,
        interval: item?.price?.recurring?.interval ?? null,
        current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
        cancel_at_period_end: sub.cancel_at_period_end ?? false,
        updated_at: new Date().toISOString(),
      });
      summary.subscriptions++;

      const credits = Number(sub.metadata?.credits ?? 0) || (planKey && CATALOG[planKey] ? CATALOG[planKey].credits : 0);
      if (credits > 0) {
        const invoices = await stripe.invoices.list({ subscription: sub.id, status: "paid", limit: 12 });
        for (const inv of invoices.data) {
          if (await grantCredits(admin, userId, credits, "plan_renewal", inv.id)) summary.creditsGranted += credits;
        }
      }
    }

    const sessions = await stripe.checkout.sessions.list({ customer: customerId, limit: 20 });
    for (const s of sessions.data) {
      if (s.status !== "complete") continue;
      const owner = s.metadata?.user_id;
      if (owner && owner !== userId) continue;

      await admin.from("payments").upsert({
        id: s.id,
        user_id: userId,
        email,
        amount_total: s.amount_total,
        currency: s.currency,
        mode: s.mode,
        product_key: s.metadata?.product_key ?? null,
        status: s.payment_status,
      });
      summary.payments++;

      const credits = Number(s.metadata?.credits ?? 0);
      if (s.mode === "payment" && s.payment_status === "paid" && credits > 0) {
        if (await grantCredits(admin, userId, credits, "pack_purchase", s.id)) summary.creditsGranted += credits;
      }
    }
  }
  return summary;
}
