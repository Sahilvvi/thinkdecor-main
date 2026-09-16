import { supabase } from '@/integrations/supabase/client';

export type StorageBucket = 'uploads' | 'textures' | 'exports' | 'thumbnails' | 'generations';

export async function uploadFile(
  bucket: StorageBucket,
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
  bucket: StorageBucket,
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
  bucket: StorageBucket,
  path: string
): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
