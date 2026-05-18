import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Layer = Tables<'layers'>;
export type LayerInsert = TablesInsert<'layers'>;
export type LayerUpdate = TablesUpdate<'layers'>;

export function useLayers(projectId: string | undefined) {
  return useQuery({
    queryKey: ['layers', projectId],
    queryFn: async () => {
      if (!projectId || projectId === 'new') return [];
      
      const { data, error } = await supabase
        .from('layers')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data as Layer[];
    },
    enabled: !!projectId && projectId !== 'new',
  });
}

export function useCreateLayer() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (data: Omit<LayerInsert, 'user_id'>) => {
      if (!user) throw new Error('Not authenticated');

      const { data: layer, error } = await supabase
        .from('layers')
        .insert({ ...data, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return layer as Layer;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['layers', data.project_id] });
    },
  });
}

export function useUpdateLayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: LayerUpdate & { id: string }) => {
      const { data: layer, error } = await supabase
        .from('layers')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return layer as Layer;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['layers', data.project_id] });
    },
  });
}

export function useDeleteLayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const { error } = await supabase
        .from('layers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { projectId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['layers', data.projectId] });
    },
  });
}

export function useReorderLayers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, layerIds }: { projectId: string; layerIds: string[] }) => {
      // Update order_index for each layer
      const updates = layerIds.map((id, index) => 
        supabase
          .from('layers')
          .update({ order_index: index })
          .eq('id', id)
      );

      await Promise.all(updates);
      return { projectId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['layers', data.projectId] });
    },
  });
}
