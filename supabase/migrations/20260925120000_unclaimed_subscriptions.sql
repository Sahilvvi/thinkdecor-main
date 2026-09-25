-- =====================================================================
-- Unclaimed subscriptions: don't silently drop entitlements
-- =====================================================================
-- Previously, if the webhook couldn't match a Stripe subscription to a
-- Supabase account (checkout wasn't signed in, or the email on the Stripe
-- customer doesn't match any account email), the subscription row was never
-- written at all — the customer paid, Stripe shows it, but nothing ever
-- appears on the site, with no way to recover it later.
--
-- Now such a row is written with user_id = null and the Stripe customer's
-- email recorded, so it can be claimed automatically the next time someone
-- with a matching account email calls sync-billing (see _shared/stripeSync.ts).

alter table public.subscriptions alter column user_id drop not null;
alter table public.subscriptions add column if not exists customer_email text;
alter table public.subscriptions add column if not exists stripe_customer_id text;

create index if not exists subscriptions_unclaimed_email_idx
  on public.subscriptions (customer_email)
  where user_id is null;
