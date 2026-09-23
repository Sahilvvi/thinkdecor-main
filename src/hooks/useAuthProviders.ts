import { useEffect, useState } from 'react';

export interface AuthProviders {
  google: boolean;
  apple: boolean;
  /** False until the project's auth settings have been read (or failed to). */
  loaded: boolean;
}

// One request per page load, shared by the sign-in and sign-up screens.
let cached: Promise<Pick<AuthProviders, 'google' | 'apple'>> | null = null;

function readEnabledProviders() {
  if (!cached) {
    const base = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
    cached = fetch(`${base}/auth/v1/settings`, { headers: { apikey: key ?? '' } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((s: { external?: Record<string, boolean> }) => ({
        google: !!s.external?.google,
        apple: !!s.external?.apple,
      }))
      // If the settings can't be read, show only email sign-in: a button that
      // fails when tapped is worse than a button that isn't there.
      .catch(() => ({ google: false, apple: false }));
  }
  return cached;
}

/**
 * Which social sign-in providers the Supabase project actually has switched on.
 * Sign-in and sign-up used to always show Google and Apple buttons; with those
 * providers disabled, tapping either produced an error. Turn a provider on in
 * the Supabase dashboard and its button appears here without a code change.
 */
export function useAuthProviders(): AuthProviders {
  const [state, setState] = useState<AuthProviders>({ google: false, apple: false, loaded: false });
  useEffect(() => {
    let live = true;
    readEnabledProviders().then((p) => { if (live) setState({ ...p, loaded: true }); });
    return () => { live = false; };
  }, []);
  return state;
}
