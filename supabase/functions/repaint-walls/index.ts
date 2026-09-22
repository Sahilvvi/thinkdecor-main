// Repaints a room's walls (flat color or wallpaper) using the standalone
// ThinkDecor Repaint microservice — the same service the Android app calls
// via RepaintApiService.previewWalls. See repaint-floor/index.ts for the
// shared design notes (session reuse, why this is self-contained, the TLS
// requirement on REPAINT_API_BASE_URL); this function mirrors it exactly,
// just against the v1/walls endpoint and its own field set.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const REPAINT_API_BASE_URL = Deno.env.get("REPAINT_API_BASE_URL") ?? "";
const REPAINT_API_KEY = Deno.env.get("REPAINT_API_KEY") ?? "";

const BUCKET = "generations";
const MAX_INPUT_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  if (!REPAINT_API_BASE_URL || !REPAINT_API_KEY) {
    return json({ error: "Wall repaint isn't switched on yet.", code: "not_configured" }, 503);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return json({ error: "Please sign in again.", code: "unauthenticated" }, 401);
  }

  const asUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { data: { user } } = await asUser.auth.getUser();
  if (!user) {
    return json({ error: "Please sign in again.", code: "unauthenticated" }, 401);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request.", code: "bad_request" }, 400);
  }

  const {
    inputPath,
    sessionId,
    mode,
    color,
    wallpaper,
    wallpaperPath,
    rollWidthM,
    repeatHM,
    shadingStrength,
  } = body as {
    inputPath?: string;
    sessionId?: string;
    /** 'color' | 'wallpaper' — which of color/wallpaper below applies. */
    mode?: string;
    color?: string;
    /** Preset wallpaper key already known to the Repaint service's own catalogue. */
    wallpaper?: string;
    /** Bucket path of a wallpaper image the user uploaded, instead of a preset. */
    wallpaperPath?: string;
    rollWidthM?: number;
    repeatHM?: number;
    shadingStrength?: number;
  };

  if (!sessionId && !inputPath) {
    return json({ error: "Please choose a room photo first.", code: "bad_image" }, 400);
  }

  // ---- 1. check ownership before any credit is spent -------------------------
  for (const path of [inputPath, wallpaperPath]) {
    if (path && (!path.startsWith(`${user.id}/`) || path.includes(".."))) {
      return json({ error: "That photo couldn't be used. Please upload it again.", code: "bad_image" }, 400);
    }
  }

  let effectiveInputPath = inputPath;
  if (!effectiveInputPath && sessionId) {
    const { data: prior } = await asUser
      .from("generations")
      .select("input_image_url")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    effectiveInputPath = prior?.input_image_url ?? undefined;
  }
  if (!effectiveInputPath) {
    return json({ error: "That session has expired. Please upload the photo again.", code: "bad_image" }, 400);
  }

  let sourceBlob: Blob | null = null;
  if (inputPath) {
    const { data, error: downloadError } = await admin.storage.from(BUCKET).download(inputPath);
    if (downloadError || !data) {
      return json({ error: "That photo couldn't be found. Please upload it again.", code: "bad_image" }, 400);
    }
    if (data.size > MAX_INPUT_BYTES) {
      return json({ error: "That photo is over 10MB — please use a smaller one.", code: "image_too_large" }, 413);
    }
    if (data.type && !ALLOWED_TYPES.includes(data.type)) {
      return json({ error: "Please use a JPG, PNG or WebP photo.", code: "bad_image_type" }, 415);
    }
    sourceBlob = data;
  }

  let wallpaperBlob: Blob | null = null;
  if (wallpaperPath) {
    const { data, error: downloadError } = await admin.storage.from(BUCKET).download(wallpaperPath);
    if (downloadError || !data) {
      return json({ error: "That wallpaper couldn't be found. Please upload it again.", code: "bad_wallpaper" }, 400);
    }
    wallpaperBlob = data;
  }

  // ---- 2. spend -----------------------------------------------------------
  const { error: spendError } = await asUser.rpc("spend_credit");
  if (spendError) {
    if (/no credits remaining/i.test(spendError.message)) {
      return json({ error: "You're out of credits.", code: "out_of_credits" }, 402);
    }
    if (/rate limited/i.test(spendError.message)) {
      return json({ error: "Too many designs this hour — try again shortly.", code: "rate_limited" }, 429);
    }
    if (/suspended/i.test(spendError.message)) {
      return json({ error: "This account has been suspended.", code: "account_suspended" }, 403);
    }
    console.error("spend_credit failed:", spendError);
    return json({ error: "Couldn't reserve a credit. Please try again.", code: "spend_failed" }, 500);
  }

  try {
    // ---- 3. call the Repaint microservice -----------------------------------
    const form = new FormData();
    if (sourceBlob) form.append("image", sourceBlob, "room.jpg");
    if (mode) form.append("mode", mode);
    if (color) form.append("color", color);
    if (wallpaper) form.append("wallpaper", wallpaper);
    if (wallpaperBlob) form.append("wallpaperFile", wallpaperBlob, "wallpaper.jpg");
    if (rollWidthM != null) form.append("roll_width_m", String(rollWidthM));
    if (repeatHM != null) form.append("repeat_h_m", String(repeatHM));
    if (shadingStrength != null) form.append("shading_strength", String(shadingStrength));
    form.append("format", "jpeg");

    const upstreamHeaders: Record<string, string> = { "X-API-Key": REPAINT_API_KEY };
    if (sessionId) upstreamHeaders["X-Session-Id"] = sessionId;

    const base = REPAINT_API_BASE_URL.endsWith("/") ? REPAINT_API_BASE_URL : `${REPAINT_API_BASE_URL}/`;
    const repaintResponse = await fetch(`${base}v1/walls`, {
      method: "POST",
      headers: upstreamHeaders,
      body: form,
    });

    if (!repaintResponse.ok) {
      let message = `Repaint service returned ${repaintResponse.status}`;
      try {
        const errBody = await repaintResponse.json();
        message = errBody?.error?.message ?? message;
      } catch {
        // Body wasn't JSON — keep the generic message.
      }
      throw new Error(message);
    }

    const contentType = repaintResponse.headers.get("Content-Type") ?? "image/jpeg";
    const metaHeader = repaintResponse.headers.get("X-Repaint-Meta");
    const newSessionId = repaintResponse.headers.get("X-Session-Id") ?? sessionId ?? null;
    let meta: Record<string, unknown> | null = null;
    if (metaHeader) {
      try {
        meta = JSON.parse(metaHeader);
      } catch {
        console.warn("Couldn't parse X-Repaint-Meta header:", metaHeader);
      }
    }

    const imageBytes = new Uint8Array(await repaintResponse.arrayBuffer());

    // ---- 4. store + record ---------------------------------------------------
    const ext = contentType.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
    const outputPath = `${user.id}/out-${Date.now()}.${ext}`;
    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(outputPath, imageBytes, { contentType });
    if (uploadError) throw uploadError;

    const { data: generation, error: insertError } = await asUser
      .from("generations")
      .insert({
        user_id: user.id,
        input_image_url: effectiveInputPath,
        output_image_url: outputPath,
        kind: "repaint_walls",
        session_id: newSessionId,
        meta,
        status: "completed",
      })
      .select()
      .single();
    if (insertError) throw insertError;

    return json({ generation });
  } catch (err) {
    console.error("repaint-walls failed:", err);
    const { error: refundError } = await admin
      .from("credit_ledger")
      .insert({ user_id: user.id, delta: 1, reason: "refund" });
    if (refundError) console.error("REFUND FAILED — credit owed to", user.id, refundError);

    return json(
      { error: "That repaint didn't work — your credit has been refunded. Please try again.", code: "generation_failed" },
      502,
    );
  }
});
