import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SiteFlags {
  flags: { demo: boolean; signups: boolean; generation: boolean; checkout: boolean; maintenance: boolean };
  maintenance_text: string;
}

let cache: { at: number; value: SiteFlags | null } | null = null;

/** The switches and banner text set in the super admin panel. Public by design: it exposes nothing else. */
async function load(): Promise<SiteFlags | null> {
  if (cache && Date.now() - cache.at < 30_000) return cache.value;
  try {
    const { data } = await supabase.rpc('public_site_flags' as never);
    cache = { at: Date.now(), value: (data as unknown as SiteFlags) ?? null };
  } catch {
    cache = { at: Date.now(), value: null };
  }
  return cache.value;
}

/** Re-checks every minute, so a switch flipped in the panel reaches open tabs without a reload. */
export function useSiteFlags(): SiteFlags | null {
  const [value, setValue] = useState<SiteFlags | null>(cache?.value ?? null);
  useEffect(() => {
    let alive = true;
    const run = () => load().then((v) => alive && setValue(v));
    run();
    const id = setInterval(run, 60_000);
    return () => { alive = false; clearInterval(id); };
  }, []);
  return value;
}
