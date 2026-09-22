import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import type { Tables } from '@/integrations/supabase/types';

export type Profile = Tables<'profiles'>;

export function useProfile() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!user,
  });
}

/**
 * The name to greet someone by. Falls back from the profile row to the signup
 * metadata to the email prefix, so a greeting never renders blank — including
 * in the moment before the profile query resolves.
 */
export function useDisplayName() {
  const { user } = useAuthStore();
  const { data: profile } = useProfile();

  const metaName = (user?.user_metadata as { name?: string } | undefined)?.name;
  const full = profile?.name?.trim() || metaName?.trim() || user?.email?.split('@')[0] || 'there';

  return {
    fullName: full,
    firstName: full.split(/\s+/)[0],
    initial: full.charAt(0).toUpperCase(),
    email: user?.email ?? '',
  };
}

export function useIsAdmin() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['isAdmin', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) return false;
      return !!data;
    },
    enabled: !!user,
  });
}

// types.ts predates the Phase 2 migration (profiles.phone) and never included
// the Stripe billing tables, so these hooks use an untyped handle.
const db = supabase as unknown as SupabaseClient;

export function useUpdateProfile() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (changes: { name?: string; phone?: string | null; avatar_url?: string | null }) => {
      if (!user) throw new Error('Not signed in');
      const { error } = await db.from('profiles').update(changes).eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  });
}

export interface Subscription {
  id: string;
  status: string;
  plan_key: string | null;
  interval: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

export const isActiveSubscription = (s?: Subscription | null) =>
  !!s && ['active', 'trialing'].includes(s.status);

/** The user's most recent Stripe subscription row, written by the stripe-webhook function. */
export function useSubscription(options: { refetchInterval?: number | false } = {}) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['subscription', user?.id],
    enabled: !!user,
    refetchInterval: options.refetchInterval,
    queryFn: async () => {
      const { data, error } = await db
        .from('subscriptions')
        .select('id, status, plan_key, interval, current_period_end, cancel_at_period_end')
        .eq('user_id', user!.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as Subscription | null;
    },
  });
}

// Plan limits
export const PLAN_LIMITS = {
  free: {
    maxProjects: 5,
    maxLayersPerProject: 10,
    maxExportResolution: '1x',
  },
  pro: {
    maxProjects: Infinity,
    maxLayersPerProject: Infinity,
    maxExportResolution: '4x',
  },
} as const;

export function usePlanLimits() {
  const { data: profile } = useProfile();
  
  const plan = profile?.plan || 'free';
  return PLAN_LIMITS[plan];
}
