/**
 * Cloudflare Turnstile site key. CAPTCHA stays off until it's set.
 *
 * Order matters when switching it on:
 *   1. set VITE_TURNSTILE_SITE_KEY, rebuild and deploy the site
 *   2. THEN enable CAPTCHA in Supabase (Authentication → Attack Protection)
 *      with the matching Turnstile secret key
 * The other way round, Supabase rejects sign-ins and sign-ups because the
 * live site isn't sending a token yet.
 */
export const CAPTCHA_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

export const CAPTCHA_ENABLED = !!CAPTCHA_SITE_KEY;
