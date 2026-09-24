// Pulls the signed-in user's billing state straight from Stripe and writes it to the
// database: subscription row, payments, and credits.
//
// Why this exists: entitlements were granted ONLY by stripe-webhook, so if the webhook
// is misconfigured (wrong signing secret, wrong endpoint, live vs test mode) a customer can
// pay and still see the free plan. This function is the safety net. The checkout success
// page and the Billing tab call it, so a paid customer is upgraded within a second or two
// regardless of the webhook. The work itself lives in _shared/stripeSync.ts (also used by
// the super admin panel).
//
// Deploy:  supabase functions deploy sync-billing
// Secrets: STRIPE_SECRET_KEY (already set), STRIPE_PRICE_* (already set)

import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/catalog.ts";
import { syncUserBilling } from "../_shared/stripeSync.ts";

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (!Deno.env.get("STRIPE_SECRET_KEY")) return json({ error: "Billing is not configured." }, 503);

    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    const { data: auth } = token ? await admin.auth.getUser(token) : { data: null };
    const user = auth?.user;
    if (!user?.email) return json({ error: "Sign in first." }, 401);

    const summary = await syncUserBilling(admin, stripe, user.id, user.email);
    return json({ ok: true, ...summary });
  } catch (err) {
    console.error("sync-billing failed:", err);
    return json({ error: "Could not refresh billing right now." }, 500);
  }
});
