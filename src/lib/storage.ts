import { supabase } from '@/integrations/supabase/client';

export async function uploadFile(
  bucket: 'uploads' | 'textures' | 'exports' | 'thumbnails',
  userId: string,
  file: File,
  fileName?: string
): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const finalFileName = fileName || `${Date.now()}.${fileExt}`;
  const filePath = `${userId}/${finalFileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}

export async function deleteFile(
  bucket: 'uploads' | 'textures' | 'exports' | 'thumbnails',
  userId: string,
  fileName: string
): Promise<void> {
  const filePath = `${userId}/${fileName}`;
  
  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);

  if (error) throw error;
}

export function getPublicUrl(
  bucket: 'uploads' | 'textures' | 'exports' | 'thumbnails',
  path: string
): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
