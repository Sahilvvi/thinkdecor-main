import { useQuery } from '@tanstack/react-query';
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
