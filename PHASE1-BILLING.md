# Phase 1 billing — 69p first month, then £4.99/month

**STATUS: LIVE AND VERIFIED** (10 Aug 2026)

End-to-end tested against live Stripe. A real `cs_live_` checkout session
renders:

| Line | Amount |
|---|---|
| Subtotal | £4.99 |
| Phase 1 first month 69p | −£4.30 |
| **Total due today** | **£0.69** |
| Then | £4.99 / month from next month |

### Live IDs

```
Product   prod_V2iu3Epcqha2Bp     ThinkDecor
Price     price_1U2dSb3VDtlDocoykkbprRnU     £4.99/month GBP
Coupon    XOqxmFnb                £4.30 off, duration: once
```

Both Supabase secrets are set (`STRIPE_PRICE_PHASE1`,
`STRIPE_COUPON_FIRST_MONTH`) and `create-checkout-session` is deployed.

> The `GO-LIVE.md` warning about a test key with live prices is **resolved** —
> a live price resolved successfully with the configured secret key, which
> could not happen with an `sk_test_` key.

---

## What changed in the code

| File | Change |
|---|---|
| `src/lib/billing.ts` | New single `phase1` plan — £4.99/mo, `introPrice: 0.69`, 20 credits. The old Free/Personal/Studio/Scale plans and all four credit packs are still in the file but flagged `hidden: true`. Nothing was deleted. |
| `src/pages/Pricing.tsx` | Rebuilt as one centred offer card. Interval toggle and credit-packs section removed from the view. FAQ rewritten. |
| `supabase/functions/_shared/catalog.ts` | Added the `phase1` entry (`STRIPE_PRICE_PHASE1`) and a new optional `couponEnv` field. `resolvePrice` now returns the coupon, and warns rather than failing if it is missing. |
| `supabase/functions/create-checkout-session/index.ts` | Applies `discounts: [{ coupon }]` when a coupon is configured. |
| `supabase/functions/stripe-webhook/index.ts` | **No change needed** — verified the Phase 1 flow works through it as-is. |
| `supabase/functions/create-checkout-session/index.bundled.ts` | **New.** Flattened single-file build with the catalogue inlined, because the Supabase dashboard editor deploys one file only. This is what is currently live. |

> ⚠️ **Two copies now exist.** `index.ts` + `_shared/catalog.ts` is the source
> of truth for CLI deploys; `index.bundled.ts` is what was deployed via the
> dashboard. They are identical in behaviour today. If you edit one, edit the
> other, or standardise on `supabase functions deploy` and delete the bundle.

---

## 1. Stripe — Live mode ✅ DONE

*Recorded for reference / recreating in another account.*

Check the top-right toggle says **Live**, not Sandbox.

### The price

Product catalogue → **Add product**

- Name: `ThinkDecor`
- Pricing model: **Standard**
- Price: **4.99 GBP**
- Billing period: **Monthly**, type **Recurring**

Save, then copy the `price_...` ID.

### The first-month coupon

Product catalogue → **Coupons** → **New**

- Type: **Amount off**
- Amount: **4.30 GBP**
- Duration: **Once**

Copy the coupon ID.

> Stripe has no "make the first month cost X" option. The discount has to be
> the *difference*: 4.99 − 0.69 = **4.30**. Applied once, so month one bills
> 69p and every month after bills the full £4.99.
>
> If you ever change the £4.99, the coupon amount must change with it or the
> intro price silently drifts.

---

## 2. Supabase — Edge Functions → Secrets ✅ DONE

```
STRIPE_PRICE_PHASE1        = price_...     # the £4.99/month price
STRIPE_COUPON_FIRST_MONTH  = <coupon id>   # the £4.30-off coupon
```

Adding a secret redeploys the functions automatically.

### Also confirm

`GO-LIVE.md` flagged this as unresolved and it will break every checkout if
still true:

```
STRIPE_SECRET_KEY = sk_live_...    # must be LIVE, not sk_test_
```

A live price presented with a test key fails with "No such price".

---

## 3. Deploy the changed function ✅ DONE

Deployed via the Supabase dashboard code editor (`index.bundled.ts`).
For future changes from a machine with the CLI:

```bash
supabase functions deploy create-checkout-session
```

The webhook is unchanged and did not need redeploying.

---

## 4. Test — remaining

The checkout session and its amounts are verified. What is **not** yet tested
is what happens *after* a real payment, because that needs an actual card:

Go to `/pricing`, click **Start for 69p** and complete it with a real card,
then check:

- Stripe → Payments — a 69p charge
- Supabase `subscriptions` — a row with `plan_key = 'phase1'`
- Supabase `credit_ledger` — a **+20** grant, reason `plan_renewal`
- Supabase `payments` — a row

Then refund yourself from Stripe. Cheapest full end-to-end test there is.

If nothing happens, look at Stripe → Workbench → Webhooks → **Event
deliveries** first — it shows the response body from the failing handler.

---

## Notes

**Promotion codes are now off for this plan.** Stripe rejects `discounts` and
`allow_promotion_codes` together, so the automatic intro coupon wins. That is
the right trade while 69p is the entire pitch on the page, but it does mean a
customer cannot type a promo code at checkout. If you later want manual codes
back, the intro discount has to move to a trial-based model instead.

**Credits are 20/month.** Set in two places that must stay in sync:
`src/lib/billing.ts` (display) and `supabase/functions/_shared/catalog.ts`
(what the webhook actually grants).

**The homepage is still the old copy.** The TD Phase 1 doc rewrites it
around "upload a photo → redesign → calculate paint/flooring", and it still
talks about phone scanning, ±1.2 cm survey accuracy and CAD export. Worth
doing before this goes in front of customers, since the pricing page now
promises a different product than the homepage describes.
