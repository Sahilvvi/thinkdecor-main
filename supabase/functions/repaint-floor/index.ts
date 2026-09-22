// Repaints a room's floor using the standalone ThinkDecor Repaint microservice
// — the same service the Android app calls via RepaintApiService.previewFloor.
// Unlike generate-redesign's OpenAI call, this one does real perspective-
// correct texture tiling from the room's actual geometry, not a generative
// re-imagining of the whole photo.
//
// Deploy:  supabase functions deploy repaint-floor
// Secrets: supabase secrets set REPAINT_API_BASE_URL=https://... REPAINT_API_KEY=...
// The upstream host must present a certificate Deno's fetch will trust —
// there is no client-side escape hatch here like the Android app's dev-only
// trust-all TrustManager, and there shouldn't be one in a public function.
//
// Self-contained (no ../_shared import), same reason as generate-redesign: it
// also deploys from the Supabase dashboard's function editor.
//
// Order of work, all server-side so the browser can't skip a step or forge a
// credits-charged number:
//   1. check the caller owns the photo/texture (or the session) referenced
//   2. spend one credit — spend_credit() refuses at zero and past the hourly cap
//   3. call the Repaint service (multipart in, raw image + X-Repaint-Meta out)
//   4. store the result in the private bucket and record it in `generations`
// If 3 or 4 fails, the credit is refunded.
//
// The caller may omit the room photo entirely and pass only `sessionId` — the
// Repaint service caches the uploaded photo for a session, so trying a second
// texture doesn't need a re-upload. When that happens we look up the photo
// path from the row that started the session, so `input_image_url` (not
// null) still records the real source photo instead of an empty placeholder.

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
    return json({ error: "Floor repaint isn't switched on yet.", code: "not_configured" }, 503);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return json({ error: "Please sign in again.", code: "unauthenticated" }, 401);
  }

  // Acting as the user means RLS and auth.uid() apply exactly as in the browser.
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
    texture,
    texturePath,
    tileM,
    rotDeg,
    shadingStrength,
    specGain,
  } = body as {
    inputPath?: string;
    sessionId?: string;
    /** Preset texture key already known to the Repaint service's own catalogue. */
    texture?: string;
    /** Bucket path of a texture image the user uploaded, instead of a preset. */
    texturePath?: string;
    tileM?: number;
    rotDeg?: number;
    shadingStrength?: number;
    specGain?: number;
  };

  if (!sessionId && !inputPath) {
    return json({ error: "Please choose a room photo first.", code: "bad_image" }, 400);
  }

  // ---- 1. check ownership before any credit is spent -------------------------
  // Only ever read the caller's own uploads.
  for (const path of [inputPath, texturePath]) {
    if (path && (!path.startsWith(`${user.id}/`) || path.includes(".."))) {
      return json({ error: "That photo couldn't be used. Please upload it again.", code: "bad_image" }, 400);
    }
  }

  // Resolve the photo to send: a fresh upload, or the one that started this session.
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
  // A session already has the room photo cached server-side, so only fetch it
  // again here when this call is actually attaching a new one.
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

  let textureBlob: Blob | null = null;
  if (texturePath) {
    const { data, error: downloadError } = await admin.storage.from(BUCKET).download(texturePath);
    if (downloadError || !data) {
      return json({ error: "That texture couldn't be found. Please upload it again.", code: "bad_texture" }, 400);
    }
    textureBlob = data;
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
    if (texture) form.append("texture", texture);
    if (textureBlob) form.append("textureFile", textureBlob, "texture.jpg");
    if (tileM != null) form.append("tile_m", String(tileM));
    if (rotDeg != null) form.append("rot_deg", String(rotDeg));
    if (shadingStrength != null) form.append("shading_strength", String(shadingStrength));
    if (specGain != null) form.append("spec_gain", String(specGain));
    form.append("format", "jpeg");

    const upstreamHeaders: Record<string, string> = { "X-API-Key": REPAINT_API_KEY };
    if (sessionId) upstreamHeaders["X-Session-Id"] = sessionId;

    const base = REPAINT_API_BASE_URL.endsWith("/") ? REPAINT_API_BASE_URL : `${REPAINT_API_BASE_URL}/`;
    const repaintResponse = await fetch(`${base}v1/floor`, {
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
        kind: "repaint_floor",
        session_id: newSessionId,
        meta,
        status: "completed",
      })
      .select()
      .single();
    if (insertError) throw insertError;

    return json({ generation });
  } catch (err) {
    console.error("repaint-floor failed:", err);
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
