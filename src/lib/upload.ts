import { supabase } from '@/integrations/supabase/client';

const BUCKET = 'blog-media';
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

export class UploadError extends Error {}

/**
 * Upload an image to the public blog-media bucket and return its URL.
 *
 * Filenames are randomised — using the original name would let two articles
 * with a "cover.jpg" overwrite each other, and would leak local file paths.
 */
export async function uploadImage(file: File): Promise<string> {
  if (!ALLOWED.includes(file.type)) {
    throw new UploadError('That file type is not supported. Use JPG, PNG, WebP, AVIF or GIF.');
  }
  if (file.size > MAX_BYTES) {
    throw new UploadError(
      `That image is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is 5 MB — compress it first.`,
    );
  }

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const name = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(name, file, { cacheControl: '31536000', upsert: false });

  if (error) {
    if (/bucket not found/i.test(error.message)) {
      throw new UploadError(
        'Image storage is not set up yet — run the blog_media_bucket migration in Supabase.',
      );
    }
    throw new UploadError(error.message);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(name);
  if (!data?.publicUrl) throw new UploadError('Upload succeeded but no public URL came back.');
  return data.publicUrl;
}

const AVATAR_BUCKET = 'avatars';
const AVATAR_MAX_BYTES = 3 * 1024 * 1024; // 3 MB — a profile photo, not a room photo

/**
 * Upload a profile photo to the user's own folder in the avatars bucket
 * (RLS only lets `${userId}/…` be written by that same user — see
 * supabase/migrations/20260922030000_profile_avatar.sql) and return its
 * public URL. `upsert: true` + a fixed filename means re-uploading just
 * replaces the old photo instead of littering the bucket with orphans.
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  if (!ALLOWED.includes(file.type)) {
    throw new UploadError('That file type is not supported. Use JPG, PNG, WebP, AVIF or GIF.');
  }
  if (file.size > AVATAR_MAX_BYTES) {
    throw new UploadError(
      `That image is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is 3 MB — compress it first.`,
    );
  }

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const path = `${userId}/avatar.${ext}`;

  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: true });

  if (error) {
    if (/bucket not found/i.test(error.message)) {
      throw new UploadError('Avatars aren\'t set up yet — run the profile_avatar migration in Supabase.');
    }
    throw new UploadError(error.message);
  }

  // Cache-bust: the path is stable (upsert), so without this the browser
  // would keep showing the old photo under the same URL after a re-upload.
  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) throw new UploadError('Upload succeeded but no public URL came back.');
  return `${data.publicUrl}?v=${Date.now()}`;
}
