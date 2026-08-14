import { supabase } from '@/integrations/supabase/client';
import type { Interval } from '@/lib/billing';

export class CheckoutError extends Error {
  /** 'not_deployed' | 'not_configured' | 'timeout' | 'network' | 'server' */
  kind: string;
  detail?: string;
  constructor(kind: string, message: string, detail?: string) {
    super(message);
    this.kind = kind;
    this.detail = detail;
  }
}

const TIMEOUT_MS = 15000;

/**
 * Starts hosted Stripe Checkout.
 *
 * The browser only ever sends a product KEY — never an amount. The edge
 * function resolves the real Stripe price, so the charge cannot be altered
 * from the client.
 *
 * Every failure path below is deliberately loud: a silent dead button on a
 * pricing page is the most expensive bug this file could have.
 */
export async function startCheckout(productKey: string, interval?: Interval, promoCode?: string) {
  const invoke = supabase.functions.invoke('create-checkout-session', {
    body: { productKey, interval, promoCode },
  });

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new CheckoutError('timeout', 'Checkout timed out. Please try again.')),
      TIMEOUT_MS,
    ),
  );

  let res: Awaited<typeof invoke>;
  try {
    res = await Promise.race([invoke, timeout]);
  } catch (e) {
    if (e instanceof CheckoutError) throw e;
    console.error('[checkout] network failure:', e);
    throw new CheckoutError('network', 'Could not reach the payment service.', String(e));
  }

  const { data, error } = res;

  if (error) {
    // supabase-js attaches the raw Response on FunctionsHttpError.
    const status = (error as { context?: Response }).context?.status;
    console.error('[checkout] invoke failed', { status, error });

    if (status === 404) {
      throw new CheckoutError(
        'not_deployed',
        'Payments are not switched on yet.',
        'The create-checkout-session edge function has not been deployed. See STRIPE-SETUP.md step 4.',
      );
    }
    if (status === 503) {
      throw new CheckoutError(
        'not_configured',
        'Payments are not switched on yet.',
        'STRIPE_SECRET_KEY is not set on the Supabase project. See STRIPE-SETUP.md step 2.',
      );
    }
    throw new CheckoutError(
      'server',
      'Could not start checkout.',
      error.message ?? 'Unknown error from create-checkout-session.',
    );
  }

  if (data?.error) {
    console.error('[checkout] function returned an error:', data.error);
    throw new CheckoutError('server', 'Could not start checkout.', String(data.error));
  }

  if (!data?.url) {
    console.error('[checkout] no url in response:', data);
    throw new CheckoutError(
      'server',
      'Checkout did not return a payment link.',
      'Usually a missing STRIPE_PRICE_* secret for this product. See STRIPE-SETUP.md step 2.',
    );
  }

  // Full navigation, not a new tab — popup blockers eat window.open here.
  window.location.href = data.url as string;
}
