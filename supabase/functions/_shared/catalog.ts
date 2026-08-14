// Server-side product catalogue.
//
// Price IDs live ONLY here and in Stripe. The browser sends a key like
// "studio" or "pack_200"; it never sends an amount. That is what stops a
// tampered request from buying a £249 plan for £1.

export interface PlanEntry {
  kind: "subscription";
  monthlyEnv: string;
  yearlyEnv: string;
  credits: number;
  name: string;
  /** £0 price — Checkout must not ask for a card. */
  free?: boolean;
  /**
   * Env var holding a Stripe coupon ID applied to the first invoice only.
   * Phase 1 uses this to make month one 69p instead of £4.99.
   */
  couponEnv?: string;
}

export interface PackEntry {
  kind: "payment";
  priceEnv: string;
  credits: number;
  name: string;
}

export const CATALOG: Record<string, PlanEntry | PackEntry> = {
  // ---- Phase 1: the only product currently on sale --------------------
  // £4.99/month recurring. The coupon knocks £4.30 off the first invoice
  // only, so month one costs 69p and every month after is £4.99.
  phase1: {
    kind: "subscription",
    monthlyEnv: "STRIPE_PRICE_PHASE1",
    // No yearly price is sold in Phase 1 — fall back to the monthly one so
    // a stray interval=year request cannot resolve to nothing.
    yearlyEnv: "STRIPE_PRICE_PHASE1",
    couponEnv: "STRIPE_COUPON_FIRST_MONTH",
    credits: 20,
    name: "ThinkDecor",
  },

  free: {
    kind: "subscription",
    // One £0/month price. Yearly falls back to the same price on purpose:
    // there is no such thing as a cheaper free.
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
  pack_10: {
    kind: "payment",
    priceEnv: "STRIPE_PRICE_PACK_10",
    credits: 10,
    name: "Top-up 10",
  },
  pack_50: {
    kind: "payment",
    priceEnv: "STRIPE_PRICE_PACK_50",
    credits: 50,
    name: "Top-up 50",
  },
  pack_200: {
    kind: "payment",
    priceEnv: "STRIPE_PRICE_PACK_200",
    credits: 200,
    name: "Top-up 200",
  },
  pack_500: {
    kind: "payment",
    priceEnv: "STRIPE_PRICE_PACK_500",
    credits: 500,
    name: "Top-up 500",
  },
};

export function resolvePrice(key: string, interval?: string) {
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
      console.warn(
        `Missing env ${entry.couponEnv} for "${key}" — charging full price.`,
      );
    }
  }

  return { entry, priceId, couponId, mode: entry.kind };
}

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};
