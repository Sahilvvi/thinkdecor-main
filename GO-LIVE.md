# ThinkDecor — go live on thinkdecor.app (Hostinger)

Everything that could be done without your API keys is done.
**Two secrets and one file upload left.**

---

## ⚠️ Read this first

Supabase now holds **LIVE** Stripe price IDs, but `STRIPE_SECRET_KEY` is
still your **TEST** key. That combination cannot work — Stripe will reject
a live price presented with a test key ("No such price").

So checkout is intentionally broken **right now** and stays broken until
you do step 1. Nothing is publicly deployed yet, so no customer sees this.

---

## 1. Two secrets — Supabase → Edge Functions → Secrets

Adding a secret redeploys the functions automatically. Nothing to run.

**STRIPE_SECRET_KEY**
Stripe → Developers → API keys (make sure you are in **Live mode**,
no "Sandbox" banner) → Secret key → Reveal
Value starts `sk_live_`

**STRIPE_WEBHOOK_SECRET**
Stripe → Workbench → Webhooks → **thinkdecor-live** → Signing secret →
click the eye icon
Value starts `whsec_`

> Both must come from LIVE mode. A live key with a test webhook secret
> fails signature verification on every event.

---

## 2. Upload to Hostinger

Use **`thinkdecor-live.zip`** from the project root.

1. hPanel → Files → **File Manager**
2. Open **`public_html`**
3. **Delete everything currently in there** — stale old assets are the
   classic cause of "works for me, blank page for them"
4. Upload `thinkdecor-live.zip`
5. Right-click → **Extract** into `public_html`
6. Delete the zip

**Then confirm `.htaccess` is there.** File Manager hides dotfiles —
enable "Show hidden files". Without it, every route except the homepage
404s on refresh. It is the most important file in the zip.

**SSL:** hPanel → Websites → SSL → issued, and "Force HTTPS" on.

---

## 3. Supabase production settings

**Authentication → URL Configuration**
- Site URL: `https://thinkdecor.app`
- Redirect URLs: add `https://thinkdecor.app/**`

Otherwise password resets email people a localhost link.

**Authentication → Providers → Email**
- Create your admin account at `/admin` first
- Then turn **OFF** "Allow new users to sign up"
- Anyone who can sign in can read every customer lead. Do not skip this.

---

## 4. Verify, in this order

1. `https://thinkdecor.app/pricing` — visit directly and **refresh**.
   404 here means `.htaccess` didn't upload.
2. `/`, `/blog`, `/contact`, `/terms`, `/privacy`, `/refunds`
3. Devtools console — Supabase errors mean the env baked into the build
   is wrong, which needs a rebuild, not a settings change
4. Contact form → submit → confirm it appears in `/admin/leads`
5. **Start free** → must ask for **email only, no card fields**
6. Buy **Personal** with your own card → check Stripe → Payments, then
   Supabase `payments`, `credit_ledger`, `subscriptions`
7. **Refund yourself** from Stripe. Cheapest full end-to-end test there is.

Failures show up in Stripe → Workbench → Webhooks → thinkdecor-live →
**Event deliveries**, with the response body. First place to look.

---

## 5. After launch

- Google Search Console → submit `https://thinkdecor.app/sitemap.xml`
- Stripe → Settings → Public details: support email, business address,
  refund policy URL `https://thinkdecor.app/refunds`
  (incomplete details are a common cause of held payouts)
- Stripe → Settings → Customer emails: turn on receipts for payments
  and refunds
- Meta Pixel is embedded — confirm events land in Events Manager

---

## Redeploying later

```
npm run build
```
Zip the **contents** of `dist/`, then repeat step 2. Always clear
`public_html` first.

`VITE_*` values are baked in at **build time**. Changing `.env` means
rebuilding.

---

## Done for you

### Stripe — LIVE mode
- 8 products, 11 prices, all amounts verified against the preview panel
- Webhook `thinkdecor-live` → Supabase, 6 events, Active

| Product | Price |
|---|---|
| Early access (free) | £0/month |
| Personal | £29/mo · £290/yr |
| Studio | £89/mo · £890/yr |
| Scale | £249/mo · £2490/yr |
| Top-up 10 | £10 one-off |
| Top-up 50 | £39 one-off |
| Top-up 200 | £129 one-off |
| Top-up 500 | £279 one-off |

### Supabase
- 13 tables in project THINK (`xgeywhbuvpbbzhldtbxj`)
- Both edge functions deployed; Verify JWT **off** on the webhook
- 11 live price secrets + `SITE_URL=https://thinkdecor.app`
- `.env` repointed to the correct project

### Site
- Terms, Privacy, Refund pages written, routed, linked in the footer
- Top-up 10 wired into the pricing page and the checkout function
- `.htaccess`: HTTPS + apex redirect, SPA routing, cache headers
- `index.html` set to never cache (prevents blank page after deploy)
- Sitemap trimmed to live routes; robots.txt blocks /admin and /app
- Production bundle verified to contain no secrets

### Still recommended
- Roll the `sk_test_` key that appeared in your screenshot
