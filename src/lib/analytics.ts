import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

/**
 * One row per page load, feeding the admin Overview's visitor chart. A random
 * per-tab id (not a cookie, not a fingerprint) is enough to tell "one visitor
 * looked at 4 pages" from "4 visitors looked at 1 page each" without tracking
 * anyone across sessions or devices.
 */
function sessionId(): string {
  try {
    let id = sessionStorage.getItem('td_sid');
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem('td_sid', id);
    }
    return id;
  } catch {
    // Private browsing / storage blocked — a one-off id still lets this page
    // view count, it just won't be grouped with the visitor's other views.
    return crypto.randomUUID();
  }
}

/** Mounted once, at the app root — logs a row on every route change. Fire-and-forget: a failed insert never affects the visit itself. */
export function usePageViewTracking() {
  const location = useLocation();
  const { user } = useAuthStore();
  const sid = useRef<string>();
  if (!sid.current) sid.current = sessionId();

  useEffect(() => {
    supabase
      .from('page_views' as never)
      .insert({ path: location.pathname, user_id: user?.id ?? null, session_id: sid.current } as never)
      .then(() => {}, () => {});
  }, [location.pathname, user?.id]);
}
