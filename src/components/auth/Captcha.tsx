import { useEffect, useRef } from 'react';
import { CAPTCHA_SITE_KEY } from '@/lib/captcha';

interface TurnstileApi {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptLoading: Promise<void> | null = null;

function loadTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (!scriptLoading) {
    scriptLoading = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => {
        scriptLoading = null;
        reject(new Error('Turnstile failed to load'));
      };
      document.head.appendChild(script);
    });
  }
  return scriptLoading;
}

/**
 * Cloudflare Turnstile challenge. Renders nothing until VITE_TURNSTILE_SITE_KEY
 * is set. Tokens are single-use, so bump `resetKey` after every submit attempt
 * to get a fresh one.
 */
export function Captcha({
  onToken,
  resetKey = 0,
}: {
  onToken: (token: string | null) => void;
  resetKey?: number;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;

  useEffect(() => {
    if (!CAPTCHA_SITE_KEY) return;
    let widgetId: string | undefined;
    let cancelled = false;
    onTokenRef.current(null);

    loadTurnstile()
      .then(() => {
        if (cancelled || !hostRef.current || !window.turnstile) return;
        widgetId = window.turnstile.render(hostRef.current, {
          sitekey: CAPTCHA_SITE_KEY,
          theme: 'light',
          callback: (token: string) => onTokenRef.current(token),
          'expired-callback': () => onTokenRef.current(null),
          'error-callback': () => onTokenRef.current(null),
        });
      })
      .catch(() => onTokenRef.current(null));

    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [resetKey]);

  if (!CAPTCHA_SITE_KEY) return null;
  return <div ref={hostRef} className="flex min-h-[65px] justify-center" />;
}
