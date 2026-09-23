import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

const db = supabase as unknown as SupabaseClient;

/* ------------------------------------------------------------------ */
/* Accounts — list/promote/demote/ban via the admin-users edge function */
/* ------------------------------------------------------------------ */

export interface AdminUserRow {
  id: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  plan: string;
  isAdmin: boolean;
  bannedAt: string | null;
  createdAt: string;
  lastSignInAt: string | null;
}

async function callAdminUsers<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke('admin-users', { body });
  if (error) {
    const context = (error as { context?: Response }).context;
    let message = error.message;
    try {
      const payload = context ? await context.json() : null;
      if (payload?.error) message = payload.error;
    } catch {
      // fall through with the original message
    }
    throw new Error(message);
  }
  if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
  return data as T;
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: () => callAdminUsers<{ users: AdminUserRow[] }>({ action: 'list' }).then((r) => r.users),
  });
}

export function useAdminUserAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ action, userId }: { action: 'promote' | 'demote' | 'ban' | 'unban'; userId: string }) =>
      callAdminUsers({ action, userId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}

/** Give someone admin access by email — promotes an existing account, or emails an invite. */
export function useInviteAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email: string) => callAdminUsers<{ ok: true; status: 'promoted' | 'invited' }>({ action: 'invite', email }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}

/* ------------------------------------------------------------------ */
/* Overview analytics — visitors, signups, generations, revenue         */
/* ------------------------------------------------------------------ */

export type OverviewRange = '7d' | '30d' | 'all';

export interface OverviewStats {
  /** Unique visitors / page views / signups / designs inside the chosen range. */
  visitors: number;
  pageViews: number;
  signups: number;
  generations: number;
  signupsTotal: number;
  generationsTotal: number;
  generationsByKind: { kind: string; count: number }[];
  revenuePenceTotal: number;
  activeSubscriptions: number;
  openTickets: number;
  /** One entry per day - the last 7 days, or the last 30 for the 30-day and all-time views. */
  dailyViews: { day: string; count: number }[];
}

/**
 * Counted in the database (admin_overview_stats). This used to download every
 * row and count in the browser, which PostgREST silently caps at 1,000 - so
 * page views read 1000 when the real number was 1030.
 */
export function useOverviewStats(range: OverviewRange = '7d') {
  return useQuery({
    queryKey: ['admin-overview', range],
    refetchInterval: 60_000,
    queryFn: async (): Promise<OverviewStats> => {
      const days = range === '7d' ? 7 : range === '30d' ? 30 : null;
      const { data, error } = await db.rpc('admin_overview_stats', { p_days: days });
      if (error) throw error;
      const r = data as Record<string, unknown>;
      const num = (v: unknown) => Number(v ?? 0);
      return {
        visitors: num(r.visitors),
        pageViews: num(r.pageViews),
        signups: num(r.signups),
        generations: num(r.generations),
        signupsTotal: num(r.signupsTotal),
        generationsTotal: num(r.generationsTotal),
        generationsByKind: ((r.generationsByKind as { kind: string; count: number }[]) ?? []).map((k) => ({ kind: k.kind, count: num(k.count) })),
        revenuePenceTotal: num(r.revenuePence),
        activeSubscriptions: num(r.activeSubscriptions),
        openTickets: num(r.openTickets),
        dailyViews: ((r.dailyViews as { day: string; count: number }[]) ?? []).map((d) => ({ day: d.day, count: num(d.count) })),
      };
    },
  });
}
