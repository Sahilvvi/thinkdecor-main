import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  GenerationError, OutOfCreditsError, RateLimitError, readFunctionError, safeFileName,
  type Generation,
} from '@/lib/generation';

/**
 * Floor and wallpaper/color repaint — calls the repaint-floor / repaint-walls
 * edge functions, which proxy to the same Repaint microservice the Android
 * app uses (see supabase/functions/repaint-floor/index.ts for the full
 * request/response contract). Unlike generate-redesign's whole-room style
 * transfer, this does perspective-correct texture tiling from the room's
 * actual geometry, so it needs a texture/wallpaper image rather than a text
 * prompt.
 *
 * Both edge functions accept `sessionId` to reuse an already-uploaded room
 * photo across several tries (a second texture, a different color) without
 * asking the browser to re-upload it — pass the previous result's
 * `session_id` back in to continue that session.
 */

const BUCKET = 'generations';

async function uploadToBucket(userId: string, file: File): Promise<string> {
  const path = `${userId}/${safeFileName(file.name)}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type || undefined });
  if (error) throw error;
  return path;
}

/** Resolves an edge-function error into the same typed errors generation.ts throws. */
async function throwTyped(error: unknown): Promise<never> {
  const payload = await readFunctionError(error);
  if (payload?.code === 'out_of_credits') throw new OutOfCreditsError();
  if (payload?.code === 'rate_limited') throw new RateLimitError();
  throw new GenerationError(payload?.error ?? 'That repaint failed. Please try again.');
}

/* ------------------------------------------------------------------ */
/* Floor                                                               */
/* ------------------------------------------------------------------ */

export interface RepaintFloorRequest {
  userId: string;
  /** A fresh room photo to upload, or the bucket path of one already stored. */
  image: File | string;
  /** A fresh texture photo to upload, or the bucket path of one already stored. */
  texture: File | string;
  tileM?: number;
  rotDeg?: number;
  shadingStrength?: number;
  specGain?: number;
  /** Continue an existing session — lets `image` be omitted on the next call. */
  sessionId?: string;
}

export async function repaintFloor({
  userId, image, texture, tileM, rotDeg, shadingStrength, specGain, sessionId,
}: RepaintFloorRequest): Promise<Generation> {
  const inputPath = typeof image === 'string' ? image : await uploadToBucket(userId, image);
  const texturePath = typeof texture === 'string' ? texture : await uploadToBucket(userId, texture);

  const { data, error } = await supabase.functions.invoke('repaint-floor', {
    body: {
      inputPath: typeof image === 'string' && sessionId ? undefined : inputPath,
      texturePath,
      tileM, rotDeg, shadingStrength, specGain, sessionId,
    },
  });
  if (error) return throwTyped(error);
  return (data as { generation: Generation }).generation;
}

export function useRepaintFloor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: repaintFloor,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['credits'] });
      queryClient.invalidateQueries({ queryKey: ['generations'] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Walls                                                               */
/* ------------------------------------------------------------------ */

export type WallMode = 'color' | 'wallpaper';

export interface RepaintWallsRequest {
  userId: string;
  image: File | string;
  mode: WallMode;
  /** Required when mode is 'color' — any CSS color the microservice accepts (e.g. a hex string). */
  color?: string;
  /** Required when mode is 'wallpaper' — a fresh upload, or the bucket path of one already stored. */
  wallpaper?: File | string;
  rollWidthM?: number;
  repeatHM?: number;
  shadingStrength?: number;
  sessionId?: string;
}

export async function repaintWalls({
  userId, image, mode, color, wallpaper, rollWidthM, repeatHM, shadingStrength, sessionId,
}: RepaintWallsRequest): Promise<Generation> {
  const inputPath = typeof image === 'string' ? image : await uploadToBucket(userId, image);
  const wallpaperPath =
    mode === 'wallpaper' && wallpaper
      ? typeof wallpaper === 'string' ? wallpaper : await uploadToBucket(userId, wallpaper)
      : undefined;

  const { data, error } = await supabase.functions.invoke('repaint-walls', {
    body: {
      inputPath: typeof image === 'string' && sessionId ? undefined : inputPath,
      mode,
      color: mode === 'color' ? color : undefined,
      wallpaperPath,
      rollWidthM, repeatHM, shadingStrength, sessionId,
    },
  });
  if (error) return throwTyped(error);
  return (data as { generation: Generation }).generation;
}

export function useRepaintWalls() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: repaintWalls,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['credits'] });
      queryClient.invalidateQueries({ queryKey: ['generations'] });
    },
  });
}
