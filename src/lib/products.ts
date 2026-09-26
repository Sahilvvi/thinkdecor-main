import { useQuery } from '@tanstack/react-query';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { RoomType } from '@/lib/templates';

// types.ts predates the products table (see 20260926000000_product_catalog.sql).
const db = supabase as unknown as SupabaseClient;

export type ProductCategory =
  | 'sofa' | 'bed' | 'chair' | 'coffee_table' | 'dining_table'
  | 'lamp' | 'rug' | 'storage' | 'decor' | 'other';

export const PRODUCT_CATEGORIES: { key: ProductCategory; label: string }[] = [
  { key: 'sofa', label: 'Sofas' },
  { key: 'bed', label: 'Beds' },
  { key: 'chair', label: 'Chairs' },
  { key: 'coffee_table', label: 'Coffee tables' },
  { key: 'dining_table', label: 'Dining tables' },
  { key: 'lamp', label: 'Lamps' },
  { key: 'rug', label: 'Rugs' },
  { key: 'storage', label: 'Storage' },
  { key: 'decor', label: 'Decor' },
  { key: 'other', label: 'Other' },
];

/** The most a single generation can bring in — Gemini's per-reference-image
 *  fidelity degrades as more pile into one call (see generate-redesign). */
export const MAX_PRODUCTS_PER_GENERATION = 3;

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  brand: string | null;
  price: number | null;
  currency: string;
  display_image_url: string;
  room_types: RoomType[];
}

/** The real-product catalog, filtered by room type when given. Public read —
 *  works signed out too, same as the Templates gallery. */
export function useProducts(roomType?: RoomType, category?: ProductCategory) {
  return useQuery({
    queryKey: ['products', roomType ?? 'all', category ?? 'all'],
    queryFn: async () => {
      let query = db
        .from('products')
        .select('id, name, category, brand, price, currency, display_image_url, room_types')
        .eq('active', true)
        .order('name');
      if (roomType) query = query.contains('room_types', [roomType]);
      if (category) query = query.eq('category', category);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Product[];
    },
  });
}

/* ------------------------------------------------------- admin CRUD ------------------------------------------------------- */
// RLS restricts insert/update/delete to admins (public.has_role) — these calls
// simply fail for anyone else, the same trust model as the rest of admin/*.

export interface AdminProduct extends Product {
  composite_image_url: string;
  source_retailer: string | null;
  active: boolean;
  created_at: string;
}

export async function listAllProducts(): Promise<AdminProduct[]> {
  const { data, error } = await db
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as AdminProduct[];
}

export interface ProductInput {
  name: string;
  category: ProductCategory;
  brand: string | null;
  price: number | null;
  currency: string;
  display_image_url: string;
  composite_image_url: string;
  room_types: RoomType[];
  active: boolean;
}

export async function createProduct(input: ProductInput) {
  const { error } = await db.from('products').insert({ ...input, source_retailer: 'manual' });
  if (error) throw error;
}

export async function updateProduct(id: string, input: ProductInput) {
  const { error } = await db.from('products').update({ ...input, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

export async function deleteProduct(id: string) {
  const { error } = await db.from('products').delete().eq('id', id);
  if (error) throw error;
}

const PRODUCT_MEDIA_BUCKET = 'product-media';
const PRODUCT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export class ProductImageError extends Error {}

/** Uploads a product photo to the public product-media bucket and returns its
 *  URL — mirrors src/lib/upload.ts's uploadImage, kept separate since it's a
 *  different bucket with admin-only write policies (see product_catalog migration). */
export async function uploadProductImage(file: File): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new ProductImageError('Use a JPG, PNG or WebP photo.');
  }
  if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
    throw new ProductImageError(`That image is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit is 5 MB.`);
  }
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const name = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from(PRODUCT_MEDIA_BUCKET)
    .upload(name, file, { cacheControl: '31536000', upsert: false });
  if (error) {
    if (/bucket not found/i.test(error.message)) {
      throw new ProductImageError('Product image storage is not set up yet — run the product_catalog migration.');
    }
    throw new ProductImageError(error.message);
  }
  const { data } = supabase.storage.from(PRODUCT_MEDIA_BUCKET).getPublicUrl(name);
  if (!data?.publicUrl) throw new ProductImageError('Upload succeeded but no public URL came back.');
  return data.publicUrl;
}
