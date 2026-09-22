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

/* ------------------------------------------------------------------ */
/* Overview analytics — visitors, signups, generations, revenue         */
/* ------------------------------------------------------------------ */

export interface OverviewStats {
  visitors7d: number;
  pageViews7d: number;
  signupsTotal: number;
  signups7d: number;
  generationsTotal: number;
  generationsByKind: { kind: string; count: number }[];
  revenuePenceTotal: number;
  activeSubscriptions: number;
  openTickets: number;
  dailyViews: { day: string; count: number }[];
}

const DAY_MS = 24 * 60 * 60 * 1000;
const dayKey = (iso: string) => iso.slice(0, 10);

export function useOverviewStats() {
  return useQuery({
    queryKey: ['admin-overview'],
    queryFn: async (): Promise<OverviewStats> => {
      const since7d = new Date(Date.now() - 7 * DAY_MS).toISOString();

      const [views, profiles, generations, payments, subs, tickets] = await Promise.all([
        db.from('page_views').select('session_id, created_at').gte('created_at', since7d),
        db.from('profiles').select('created_at'),
        db.from('generations').select('kind, created_at'),
        db.from('payments').select('amount_total').eq('status', 'paid'),
        db.from('subscriptions').select('status').eq('status', 'active'),
        db.from('support_tickets').select('status').eq('status', 'open'),
      ]);

      const viewRows = (views.data ?? []) as { session_id: string | null; created_at: string }[];
      const profileRows = (profiles.data ?? []) as { created_at: string }[];
      const genRows = (generations.data ?? []) as { kind: string | null; created_at: string }[];
      const paymentRows = (payments.data ?? []) as { amount_total: number | null }[];

      const uniqueSessions = new Set(viewRows.map((v) => v.session_id ?? '')).size;
      const signups7d = profileRows.filter((p) => p.created_at >= since7d).length;

      const kindCounts = new Map<string, number>();
      genRows.forEach((g) => {
        const kind = g.kind ?? 'redesign';
        kindCounts.set(kind, (kindCounts.get(kind) ?? 0) + 1);
      });

      const dailyMap = new Map<string, number>();
      viewRows.forEach((v) => {
        const day = dayKey(v.created_at);
        dailyMap.set(day, (dailyMap.get(day) ?? 0) + 1);
      });
      const dailyViews = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(Date.now() - (6 - i) * DAY_MS);
        const key = d.toISOString().slice(0, 10);
        return { day: key, count: dailyMap.get(key) ?? 0 };
      });

      return {
        visitors7d: uniqueSessions,
        pageViews7d: viewRows.length,
        signupsTotal: profileRows.length,
        signups7d,
        generationsTotal: genRows.length,
        generationsByKind: Array.from(kindCounts, ([kind, count]) => ({ kind, count })),
        revenuePenceTotal: paymentRows.reduce((sum, p) => sum + (p.amount_total ?? 0), 0),
        activeSubscriptions: subs.data?.length ?? 0,
        openTickets: tickets.data?.length ?? 0,
        dailyViews,
      };
    },
  });
}
