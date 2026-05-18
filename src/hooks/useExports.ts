import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

export type Export = Tables<'exports'>;
export type ExportInsert = TablesInsert<'exports'>;

export function useExports(projectId: string | undefined) {
  return useQuery({
    queryKey: ['exports', projectId],
    queryFn: async () => {
      if (!projectId || projectId === 'new') return [];
      
      const { data, error } = await supabase
        .from('exports')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Export[];
    },
    enabled: !!projectId && projectId !== 'new',
  });
}

export function useCreateExport() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (data: Omit<ExportInsert, 'user_id'>) => {
      if (!user) throw new Error('Not authenticated');

      const { data: exportRecord, error } = await supabase
        .from('exports')
        .insert({ ...data, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return exportRecord as Export;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['exports', data.project_id] });
    },
  });
}

export function useDeleteExport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const { error } = await supabase
        .from('exports')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { projectId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['exports', data.projectId] });
    },
  });
}
