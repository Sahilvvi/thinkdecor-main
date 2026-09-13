# Stripe setup — ThinkDecor

Everything is built. These are the steps that connect it to your Stripe account.
Do it all in **Test mode** first; the toggle is top-right in the Stripe dashboard.

---

## 1. Create the products

Stripe → **Product catalogue** → **Add product**. Create six.

### Free tier (one recurring £0 price)

| Product              | Price      |
|----------------------|------------|
| Early access (free)  | £0 / month |

Create it exactly like a paid product, but set the amount to **0**:

1. **Add product** → name `Early access (free)`
2. Pricing model **Standard**, price **0.00 GBP**
3. Billing period **Monthly**, type **Recurring**
4. Save, then copy the `price_...` id

Stripe fully supports £0 recurring prices. Because the amount is zero,
Checkout is told not to collect a card at all (`payment_method_collection:
"if_required"`), so signing up is just an email address.

### Paid subscriptions (each needs BOTH a monthly and a yearly price)

| Product   | Monthly | Yearly  |
|-----------|---------|---------|
| Personal  | £29     | £290    |
| Studio    | £89     | £890    |
| Scale     | £249    | £2490   |

Add the monthly price first, then **Add another price** for the yearly one.
Set billing period to Monthly / Yearly and currency to GBP.

### One-off credit packs (price type: **One-off**)

| Product     | Price |
|-------------|-------|
| Top-up 50   | £39   |
| Top-up 200  | £129  |
| Top-up 500  | £279  |

Copy every **price ID** (starts with `price_`). You need nine — one free,
six subscription (three products × monthly and yearly), two… three packs.

> Changing these amounts later means updating them in Stripe **and** in
> `src/lib/billing.ts`, which only controls what the page displays.
> Stripe is what actually charges.

---

## 2. Set the secrets

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx
supabase secrets set SITE_URL=http://localhost:8080     # your domain in production

supabase secrets set STRIPE_PRICE_FREE=price_xxx           # the £0 recurring price
supabase secrets set STRIPE_PRICE_ACCESS_MONTHLY=price_xxx
supabase secrets set STRIPE_PRICE_ACCESS_YEARLY=price_xxx
supabase secrets set STRIPE_PRICE_STUDIO_MONTHLY=price_xxx
supabase secrets set STRIPE_PRICE_STUDIO_YEARLY=price_xxx
supabase secrets set STRIPE_PRICE_SCALE_MONTHLY=price_xxx
supabase secrets set STRIPE_PRICE_SCALE_YEARLY=price_xxx
supabase secrets set STRIPE_PRICE_PACK_50=price_xxx
supabase secrets set STRIPE_PRICE_PACK_200=price_xxx
supabase secrets set STRIPE_PRICE_PACK_500=price_xxx
```

`STRIPE_SECRET_KEY` is a **secret key** — it must never appear in the frontend,
in `.env`, or anywhere the browser can read. Only Supabase secrets.

---

## 3. Run the migration

Supabase → SQL Editor → paste and run:
`supabase/migrations/20260808150000_stripe_billing.sql`

Creates `billing_customers`, `subscriptions`, `credit_ledger`, `payments`,
`stripe_events`.

---

## 4. Deploy the functions

```bash
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook --no-verify-jwt
```

`--no-verify-jwt` on the webhook is **required** — Stripe can't send a Supabase
JWT. Authenticity comes from the signature check instead.

---

## 5. Register the webhook

Stripe → **Developers** → **Webhooks** → **Add endpoint**

**URL:** `https://<your-project-ref>.supabase.co/functions/v1/stripe-webhook`

**Events to send:**
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

Copy the **signing secret** (`whsec_...`) and set it:

```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
```

Then redeploy the webhook so it picks the secret up:
```bash
supabase functions deploy stripe-webhook --no-verify-jwt
```

---

## 6. Test it

Go to `/pricing`, pick a plan, and use Stripe's test card:

```
Card    4242 4242 4242 4242
Expiry  any future date
CVC     any 3 digits
```

### Test the free tier separately

Click **Start free** on the pricing page. Checkout should ask only for an
email — **no card fields at all**. If it asks for a card, the price is not
actually £0; check the amount in Stripe.

After completing it:
- Stripe → Customers shows a new customer with an active £0 subscription
- Supabase → `subscriptions` has a row with `plan_key = 'free'`
- Supabase → `credit_ledger` has a +3 grant

Free subscriptions still raise a £0 invoice which Stripe marks paid
automatically, and that `invoice.paid` event is what grants the 3 credits —
the same path as every paid plan, so renewals top up too.

### Test a paid plan

Then check:
- Stripe → Payments shows the charge
- Supabase → `payments` has a row
- Supabase → `credit_ledger` has the credit grant
- Supabase → `subscriptions` has the subscription (for plan purchases)

Stripe → Webhooks → your endpoint shows delivery attempts and the response
body if something failed. That's the first place to look when it doesn't work.

---

## 7. Going live

1. Flip the dashboard to **Live mode** and recreate the six products
   (test and live catalogues are entirely separate).
2. Re-set every secret with the `sk_live_` key and the live `price_` IDs.
3. Add a live webhook endpoint and set the new `whsec_`.
4. Set `SITE_URL` to `https://thinkdecor.app`.
5. Stripe → Settings → Public details: fill in a support email, refund policy
   and business address. Missing details are a common cause of payouts being
   held.

---

## How the money is protected

- The browser only ever sends a product **key** (`"studio"`), never an amount.
  The edge function resolves the real Stripe price server-side, so a tampered
  request can't buy a £249 plan for £1.
- The webhook verifies Stripe's signature against the raw request body before
  trusting anything in it.
- Every processed event ID is recorded in `stripe_events`, and credit grants
  are keyed on a unique reference — so Stripe's retries can't double-credit
  an account.
- Credits are an append-only ledger, not a mutable number. A bad grant can be
  traced and reversed rather than silently corrupting a balance.
- No table in this system is client-writable. Entitlements are granted only by
  the webhook, using the service role key.
