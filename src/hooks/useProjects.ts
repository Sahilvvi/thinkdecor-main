import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Project = Tables<'projects'>;
export type ProjectInsert = TablesInsert<'projects'>;
export type ProjectUpdate = TablesUpdate<'projects'>;

export function useProjects() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as Project[];
    },
    enabled: !!user,
  });
}

export function useProject(projectId: string | undefined) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId || projectId === 'new') return null;
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .maybeSingle();

      if (error) throw error;
      return data as Project | null;
    },
    enabled: !!user && !!projectId && projectId !== 'new',
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (data: Omit<ProjectInsert, 'user_id'>) => {
      if (!user) throw new Error('Not authenticated');

      const { data: project, error } = await supabase
        .from('projects')
        .insert({ ...data, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return project as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: ProjectUpdate & { id: string }) => {
      const { data: project, error } = await supabase
        .from('projects')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return project as Project;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', data.id] });
    },
  });
}

export function useDuplicateProject() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (projectId: string) => {
      if (!user) throw new Error('Not authenticated');

      // Get original project
      const { data: original, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (fetchError) throw fetchError;

      // Create duplicate
      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          title: `${original.title} (Copy)`,
          base_image_url: original.base_image_url,
          thumbnail_url: original.thumbnail_url,
          canvas_width: original.canvas_width,
          canvas_height: original.canvas_height,
        })
        .select()
        .single();

      if (error) throw error;

      // Duplicate layers
      const { data: layers } = await supabase
        .from('layers')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index');

      if (layers && layers.length > 0) {
        await supabase.from('layers').insert(
          layers.map((layer) => ({
            project_id: project.id,
            user_id: user.id,
            name: layer.name,
            texture_url: layer.texture_url,
            order_index: layer.order_index,
            visible: layer.visible,
            opacity: layer.opacity,
            blend_mode: layer.blend_mode,
            scale: layer.scale,
            rotation: layer.rotation,
            offset_x: layer.offset_x,
            offset_y: layer.offset_y,
            tile: layer.tile,
            flip_x: layer.flip_x,
            flip_y: layer.flip_y,
          }))
        );
      }

      return project as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
