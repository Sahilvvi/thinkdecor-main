// create-checkout-session — creates a Stripe Checkout Session (hosted).
//
// FLATTENED BUILD. The Supabase dashboard editor deploys a single file, so the
// _shared/catalog.ts import is inlined here. Keep this in sync with
// ../_shared/catalog.ts and ./index.ts, which remain the source of truth for
// CLI deploys (`supabase functions deploy create-checkout-session`).
//
// The browser only ever sends a product KEY — never an amount. This function
// resolves the real Stripe price server-side, so the charge cannot be altered
// from the client.

import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

/* ------------------------------------------------------------------ *
 *  Catalogue (inlined from _shared/catalog.ts)
 * ------------------------------------------------------------------ */

interface PlanEntry {
  kind: "subscription";
  monthlyEnv: string;
  yearlyEnv: string;
  credits: number;
  name: string;
  free?: boolean;
  /** Stripe coupon applied to the first invoice only. */
  couponEnv?: string;
}

interface PackEntry {
  kind: "payment";
  priceEnv: string;
  credits: number;
  name: string;
}

const CATALOG: Record<string, PlanEntry | PackEntry> = {
  // ---- Phase 1: the only product currently on sale --------------------
  // £4.99/month recurring. The coupon knocks £4.30 off the first invoice
  // only, so month one costs 69p and every month after is £4.99.
  phase1: {
    kind: "subscription",
    monthlyEnv: "STRIPE_PRICE_PHASE1",
    yearlyEnv: "STRIPE_PRICE_PHASE1",
    couponEnv: "STRIPE_COUPON_FIRST_MONTH",
    credits: 20,
    name: "ThinkDecor",
  },

  free: {
    kind: "subscription",
    monthlyEnv: "STRIPE_PRICE_FREE",
    yearlyEnv: "STRIPE_PRICE_FREE",
    credits: 3,
    name: "Early access (free)",
    free: true,
  },
  access: {
    kind: "subscription",
    monthlyEnv: "STRIPE_PRICE_ACCESS_MONTHLY",
    yearlyEnv: "STRIPE_PRICE_ACCESS_YEARLY",
    credits: 25,
    name: "Early access",
  },
  studio: {
    kind: "subscription",
    monthlyEnv: "STRIPE_PRICE_STUDIO_MONTHLY",
    yearlyEnv: "STRIPE_PRICE_STUDIO_YEARLY",
    credits: 120,
    name: "Studio",
  },
  scale: {
    kind: "subscription",
    monthlyEnv: "STRIPE_PRICE_SCALE_MONTHLY",
    yearlyEnv: "STRIPE_PRICE_SCALE_YEARLY",
    credits: 500,
    name: "Scale",
  },
  pack_10: { kind: "payment", priceEnv: "STRIPE_PRICE_PACK_10", credits: 10, name: "Top-up 10" },
  pack_50: { kind: "payment", priceEnv: "STRIPE_PRICE_PACK_50", credits: 50, name: "Top-up 50" },
  pack_200: { kind: "payment", priceEnv: "STRIPE_PRICE_PACK_200", credits: 200, name: "Top-up 200" },
  pack_500: { kind: "payment", priceEnv: "STRIPE_PRICE_PACK_500", credits: 500, name: "Top-up 500" },
};

function resolvePrice(key: string, interval?: string) {
  const entry = CATALOG[key];
  if (!entry) return null;

  const envName =
    entry.kind === "subscription"
      ? interval === "year"
        ? entry.yearlyEnv
        : entry.monthlyEnv
      : entry.priceEnv;

  const priceId = Deno.env.get(envName);
  if (!priceId) {
    console.error(`Missing env ${envName} for product "${key}"`);
    return null;
  }

  // An intro coupon is optional. If the secret is absent the customer simply
  // pays full price — better than failing the checkout outright.
  let couponId: string | undefined;
  if (entry.kind === "subscription" && entry.couponEnv) {
    couponId = Deno.env.get(entry.couponEnv) || undefined;
    if (!couponId) {
      console.warn(`Missing env ${entry.couponEnv} for "${key}" — charging full price.`);
    }
  }

  return { entry, priceId, couponId, mode: entry.kind };
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/* ------------------------------------------------------------------ *
 *  Handler
 * ------------------------------------------------------------------ */

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

const SITE_URL = Deno.env.get("SITE_URL") ?? "https://thinkdecor.app";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    if (!Deno.env.get("STRIPE_SECRET_KEY")) {
      return json({ error: "Billing is not configured yet." }, 503);
    }

    const { productKey, interval, promoCode } = await req.json();
    if (typeof productKey !== "string") {
      return json({ error: "Missing productKey" }, 400);
    }

    const resolved = resolvePrice(productKey, interval);
    if (!resolved) {
      return json({ error: "Unknown or unconfigured product" }, 400);
    }
    const { entry, priceId, couponId, mode } = resolved;
    const isFree = entry.kind === "subscription" && entry.free === true;

    // ---- affiliate / influencer promo codes --------------------------------
    // A code typed by the customer or carried in a link (e.g. ?ref=INFLUENCER10)
    // looks up a live Stripe promotion code. If it resolves, it REPLACES the
    // automatic intro coupon for this session — Stripe won't apply two
    // discounts at once, so the influencer code wins over the standard 69p
    // offer for that checkout. An unknown/typo'd code is ignored rather than
    // failing checkout; the customer just gets the standard offer.
    let promoDiscount: { promotion_code: string } | undefined;
    if (!isFree && typeof promoCode === "string" && promoCode.trim()) {
      try {
        const found = await stripe.promotionCodes.list({
          code: promoCode.trim().toUpperCase(),
          active: true,
          limit: 1,
        });
        if (found.data[0]) {
          promoDiscount = { promotion_code: found.data[0].id };
        } else {
          console.warn(`Promo code "${promoCode}" not found or inactive — using default pricing.`);
        }
      } catch (e) {
        console.error("Promo code lookup failed:", e);
      }
    }

    // ---- identify the buyer if they happen to be signed in ----------------
    let userId: string | null = null;
    let email: string | undefined;

    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const admin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      );
      const { data } = await admin.auth.getUser(authHeader.replace("Bearer ", ""));
      if (data?.user) {
        userId = data.user.id;
        email = data.user.email ?? undefined;
      }
    }

    // ---- reuse an existing Stripe customer where we can --------------------
    let customerId: string | undefined;
    if (userId) {
      const admin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      );
      const { data } = await admin
        .from("billing_customers")
        .select("stripe_customer_id")
        .eq("user_id", userId)
        .maybeSingle();
      customerId = data?.stripe_customer_id ?? undefined;
    }

    const session = await stripe.checkout.sessions.create({
      mode: mode === "subscription" ? "subscription" : "payment",
      line_items: [{ price: priceId, quantity: 1 }],

      // Sign-in on this site is for the blog/CMS only — never a paying
      // customer. Seeding Checkout with a signed-in admin's address would
      // prefill (and lock) the wrong email, so we never pass `customer` or
      // `customer_email`. Stripe collects the address fresh every time.
      ...(mode === "payment" ? { customer_creation: "always" as const } : {}),

      // Carried through to the webhook on both the session and the
      // subscription, so entitlements can be granted without guessing.
      metadata: {
        product_key: productKey,
        credits: String(entry.credits),
        user_id: userId ?? "",
      },
      ...(mode === "subscription"
        ? {
            subscription_data: {
              metadata: {
                product_key: productKey,
                credits: String(entry.credits),
                user_id: userId ?? "",
              },
            },
          }
        : {}),

      // A £0 subscription must not demand a card — asking for one is the
      // fastest way to kill free signups.
      //
      // Stripe rejects `discounts` and `allow_promotion_codes` together, so
      // only one discount path can win per session:
      //   1. A resolved influencer/affiliate promo code, if one came through.
      //   2. Otherwise, the automatic 69p intro coupon.
      //   3. Otherwise, the manual promo-code box on Checkout itself.
      ...(isFree
        ? { payment_method_collection: "if_required" as const }
        : promoDiscount
        ? { discounts: [promoDiscount] }
        : couponId
        ? { discounts: [{ coupon: couponId }] }
        : { allow_promotion_codes: true }),

      // Collect the customer's name (comes with the billing address block)
      // and their phone number, alongside the email Checkout always takes.
      billing_address_collection: "required" as const,
      phone_number_collection: { enabled: true },

      automatic_tax: { enabled: false },

      success_url: `${SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/pricing?checkout=cancelled`,
    });

    return json({ url: session.url, id: session.id });
  } catch (err) {
    console.error("create-checkout-session failed:", err);
    return json({ error: "Could not start checkout. Please try again." }, 500);
  }
});
