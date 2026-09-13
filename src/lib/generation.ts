import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { uploadFile } from '@/lib/storage';
import { TEMPLATES, roomLabel, templateByKey, type RoomType } from '@/lib/templates';

/**
 * Everything the app needs for credits and generations, in one place.
 *
 * Credits live in the append-only credit_ledger (see migration
 * 20260914090000_app_phase2.sql): signup +2, each generation -1, paid renewal
 * +20. credit_balance() is the source of truth; spend_credit() is the only way
 * to spend, and it refuses at zero, so the free limit holds server-side.
 */

export const FREE_SIGNUP_CREDITS = 2;

// src/integrations/supabase/types.ts is generated and predates the Phase 2
// migration, so it doesn't know the generations table or the credit RPCs yet.
// Use an untyped handle here instead of casting at every call site.
const db = supabase as unknown as SupabaseClient;

export type GenerationStatus = 'pending' | 'completed' | 'failed';

export interface Generation {
  id: string;
  user_id: string;
  input_image_url: string;
  output_image_url: string | null;
  template_key: string | null;
  room_type: RoomType | null;
  prompt: string | null;
  status: GenerationStatus;
  created_at: string;
}

export class OutOfCreditsError extends Error {
  constructor() {
    super('No credits remaining');
    this.name = 'OutOfCreditsError';
  }
}

/** A failure with a message that's safe to show the user as-is. */
export class GenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GenerationError';
  }
}

/** True when the Phase 2 migration hasn't been applied to this project yet. */
export function isSetupError(err: unknown): boolean {
  const e = err as { code?: string; message?: string } | null;
  if (!e) return false;
  return (
    ['42P01', '42703', '42883', 'PGRST202', 'PGRST204', 'PGRST205'].includes(e.code ?? '') ||
    /does not exist|could not find the .*(table|function|column)/i.test(e.message ?? '')
  );
}

const retryUnlessSetup = (count: number, err: unknown) => !isSetupError(err) && count < 2;

/* ------------------------------------------------------------------ */
/* Queries                                                             */
/* ------------------------------------------------------------------ */

export function useCreditBalance() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['credits', user?.id],
    enabled: !!user,
    retry: retryUnlessSetup,
    queryFn: async () => {
      const { data, error } = await db.rpc('credit_balance', { _user_id: user!.id });
      if (error) throw error;
      return Number(data ?? 0);
    },
  });
}

export function useGenerations(limit?: number) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['generations', user?.id, limit ?? 'all'],
    enabled: !!user,
    retry: retryUnlessSetup,
    queryFn: async () => {
      let query = db
        .from('generations')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (limit) query = query.limit(limit);

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Generation[];
    },
  });
}

export function useDeleteGeneration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // The stored input photo is left in place: regenerations share it, so
      // removing it here could break other entries in the library.
      const { error } = await db.from('generations').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['generations'] }),
  });
}

/* ------------------------------------------------------------------ */
/* Generating                                                          */
/* ------------------------------------------------------------------ */

export interface GenerateRequest {
  userId: string;
  /** A fresh File to upload, or the URL of a photo already uploaded (regenerate/refine). */
  image: File | string;
  templateKey: string;
  roomType: RoomType;
  prompt?: string;
  /** Increments on each regenerate of the same photo, so variations differ. */
  attempt?: number;
}

/**
 * Two generation paths:
 *  - Live: the `generate-redesign` edge function spends the credit, calls the
 *    image model, stores the result, and refunds the credit if the model
 *    fails. Switched on with VITE_LIVE_GENERATION=true once the function is
 *    deployed with its OPENAI_API_KEY secret.
 *  - Placeholder (default): returns a sample design after a short delay, so
 *    credits, history and the library all work before a model is connected.
 */
export const IS_PLACEHOLDER_GENERATOR = import.meta.env.VITE_LIVE_GENERATION !== 'true';

async function runGenerator(request: {
  inputUrl: string;
  templateKey: string;
  roomType: RoomType;
  prompt?: string;
  attempt: number;
}): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 2200));
  const pool = TEMPLATES.map((t) => t.image);
  const start = Math.max(0, TEMPLATES.findIndex((t) => t.key === request.templateKey));
  return pool[(start + request.attempt) % pool.length];
}

function safeFileName(name: string) {
  const cleaned = name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/^-+|-+$/g, '');
  return `${Date.now()}-${cleaned || 'room.jpg'}`;
}

/** supabase.functions.invoke hides a non-2xx JSON body in error.context. */
async function readFunctionError(error: unknown): Promise<{ error?: string; code?: string } | null> {
  const context = (error as { context?: Response } | null)?.context;
  if (context && typeof context.json === 'function') {
    try {
      return await context.json();
    } catch {
      return null;
    }
  }
  return null;
}

export async function generateRedesign({
  userId,
  image,
  templateKey,
  roomType,
  prompt,
  attempt = 0,
}: GenerateRequest): Promise<Generation> {
  // 1. The source photo — uploaded once, then reused for every refinement.
  const inputUrl =
    typeof image === 'string'
      ? image
      : await uploadFile('generations', userId, image, safeFileName(image.name));

  // Live: the edge function does spend → generate → store → record, and
  // refunds the credit server-side if the model fails.
  if (!IS_PLACEHOLDER_GENERATOR) {
    const template = templateByKey(templateKey);
    const { data, error } = await supabase.functions.invoke('generate-redesign', {
      body: {
        inputUrl,
        templateKey,
        roomType,
        roomLabel: roomLabel(roomType),
        stylePrompt: template?.prompt,
        prompt: prompt?.trim() || undefined,
      },
    });
    if (error) {
      const payload = await readFunctionError(error);
      if (payload?.code === 'out_of_credits') throw new OutOfCreditsError();
      throw new GenerationError(payload?.error ?? 'Generation failed. Please try again.');
    }
    return (data as { generation: Generation }).generation;
  }

  // 2. Spend a credit (placeholder path). The database refuses at zero.
  const { error: spendError } = await db.rpc('spend_credit');
  if (spendError) {
    if (/no credits remaining/i.test(spendError.message)) throw new OutOfCreditsError();
    throw spendError;
  }

  // 3. Generate.
  const outputUrl = await runGenerator({ inputUrl, templateKey, roomType, prompt, attempt });

  // 4. Record it in the library.
  const { data, error } = await db
    .from('generations')
    .insert({
      user_id: userId,
      input_image_url: inputUrl,
      output_image_url: outputUrl,
      template_key: templateKey,
      room_type: roomType,
      prompt: prompt?.trim() || null,
      status: 'completed',
    })
    .select()
    .single();

  if (error) throw error;
  return data as Generation;
}

export function useGenerate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateRedesign,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['credits'] });
      queryClient.invalidateQueries({ queryKey: ['generations'] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export async function downloadImage(url: string, fileName: string) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    // Cross-origin or offline — opening the image still lets them save it.
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
