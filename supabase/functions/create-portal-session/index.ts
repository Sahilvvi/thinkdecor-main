// Opens Stripe's hosted Customer Portal, so a subscriber can cancel, change
// their card or download invoices without emailing support.
//
// Deploy:  supabase functions deploy create-portal-session
// Secrets: STRIPE_SECRET_KEY (already set for create-checkout-session)
// Stripe:  Dashboard → Settings → Billing → Customer portal → Save. Until the
//          portal has been saved once, Stripe refuses to create sessions.
//
// Self-contained (no ../_shared import) so it also deploys from the Supabase
// dashboard's function editor.

import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

const SITE_URL = Deno.env.get("SITE_URL") ?? "https://thinkdecor.app";
// Only these origins may choose where the portal sends people back to.
const ALLOWED_ORIGINS = [SITE_URL, "http://localhost:8080"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  if (!Deno.env.get("STRIPE_SECRET_KEY")) {
    return json({ error: "Billing is not configured yet.", code: "not_configured" }, 503);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return json({ error: "Please sign in again.", code: "unauthenticated" }, 401);
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const { data: { user } } = await admin.auth.getUser(authHeader.replace("Bearer ", ""));
  if (!user) {
    return json({ error: "Please sign in again.", code: "unauthenticated" }, 401);
  }

  const { data: customer } = await admin
    .from("billing_customers")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!customer?.stripe_customer_id) {
    return json({ error: "There's no billing account on this login yet.", code: "no_customer" }, 404);
  }

  const origin = req.headers.get("Origin");
  const returnBase = origin && ALLOWED_ORIGINS.includes(origin) ? origin : SITE_URL;

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.stripe_customer_id,
      return_url: `${returnBase}/app/settings`,
    });
    return json({ url: session.url });
  } catch (err) {
    console.error("create-portal-session failed:", err);
    const message = err instanceof Error ? err.message : "";
    if (/configuration/i.test(message)) {
      return json(
        { error: "Billing management isn't switched on yet. Please contact us to change your plan.", code: "portal_not_configured" },
        503,
      );
    }
    return json({ error: "Couldn't open billing. Please try again.", code: "portal_failed" }, 500);
  }
});
