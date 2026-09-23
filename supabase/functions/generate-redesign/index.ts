// Redesigns, cleans up or replaces something in a room photo with Google's
// Gemini image model — one shared endpoint, three `mode`s:
//   - "redesign" (default): a full-room restyle from a template/prompt.
//   - "cleanup": erase whatever's under a painted red mask.
//   - "replace": swap whatever's under a painted red mask for something else.
// Cleanup/Replace mirror the Android app's proven approach exactly (see
// CleanupViewModel.kt's REMOVE_PROMPT and ReplaceViewModel.kt's
// buildPrompt()): the model has no separate mask input, so the mask is
// baked into the photo itself as a solid red overlay client-side (see
// src/components/app/MaskCanvas.tsx), and the prompt just tells the model
// red means "edit here," not "paint it red."
//
// Deploy:  supabase functions deploy generate-redesign
// Secrets: supabase secrets set GEMINI_API_KEY=...
//          (optional) supabase secrets set GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
// Then set VITE_LIVE_GENERATION=true in the site's .env and rebuild.
//
// Self-contained (no ../_shared import) so it also deploys from the Supabase
// dashboard's function editor.
//
// Order of work, all server-side so the browser can't skip a step:
//   1. check the caller is signed in and the photo is their own, under 10 MB
//   2. spend one credit — spend_credit() refuses at zero and past the hourly cap
//   3. call the model
//   4. store the result in the private bucket and record it in `generations`
// If 3 or 4 fails, the credit is refunded.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const MODEL = Deno.env.get("GEMINI_IMAGE_MODEL") ?? "gemini-2.5-flash-image";

/** Chunked to avoid blowing the call stack on a 10MB image (spreading a huge
 *  array straight into String.fromCharCode's arguments can overflow). */
function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

const BUCKET = "generations";
const MAX_INPUT_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
// Big photos regularly take 20s+; with one refusal retry this stays well under the 150s edge limit.
const GEMINI_TIMEOUT_MS = 45_000;

type GeminiImageResult =
  | { ok: true; b64: string; mimeType: string }
  | { ok: false; hardError?: string; refusalReason?: string; textPart?: string };

/**
 * One call to the image model. Refusals show up two different ways in
 * Gemini's response — a top-level promptFeedback.blockReason (input
 * rejected outright) or a per-candidate finishReason like IMAGE_SAFETY/
 * PROHIBITED_CONTENT/RECITATION (generation started but the output was
 * filtered) — both are surfaced here so the caller can decide whether to
 * retry, and everything Google gave us is logged so a refusal is
 * diagnosable from the Supabase function logs alone.
 */
async function callGeminiImage(fullPrompt: string, inputB64: string, inputMimeType: string): Promise<GeminiImageResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);
  try {
    const aiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: fullPrompt },
              { inlineData: { mimeType: inputMimeType, data: inputB64 } },
            ],
          }],
          generationConfig: { responseModalities: ["IMAGE"] },
        }),
        signal: controller.signal,
      },
    );
    const aiResult = await aiResponse.json();
    if (!aiResponse.ok) {
      return { ok: false, hardError: aiResult?.error?.message ?? `Image model returned ${aiResponse.status}` };
    }
    const candidate = aiResult?.candidates?.[0];
    const parts: { inlineData?: { data?: string; mimeType?: string }; text?: string }[] =
      candidate?.content?.parts ?? [];
    const imagePart = parts.find((p) => p.inlineData?.data);
    const b64 = imagePart?.inlineData?.data;
    if (typeof b64 === "string") {
      return { ok: true, b64, mimeType: imagePart?.inlineData?.mimeType || "image/png" };
    }
    const blockReason = aiResult?.promptFeedback?.blockReason;
    const finishReason = candidate?.finishReason;
    const textPart = parts.find((p) => typeof p.text === "string")?.text;
    console.error("generate-redesign: no image in response", {
      blockReason,
      finishReason,
      safetyRatings: candidate?.safetyRatings ?? aiResult?.promptFeedback?.safetyRatings,
      textPart,
    });
    return { ok: false, refusalReason: blockReason || finishReason, textPart };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return { ok: false, hardError: "Image model timed out" };
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

type Mode = "redesign" | "cleanup" | "replace";

// Fixed prompt, word-for-word from CleanupViewModel.kt's REMOVE_PROMPT —
// Cleanup only ever removes, so this isn't user-editable.
const CLEANUP_PROMPT =
  "This photo has one or more areas marked with a solid red highlight. Treat the red " +
  "highlight strictly as a location marker for editing, not as a color or design " +
  "element: remove everything under each marked area completely and fill it back in " +
  "naturally so it blends with the surrounding lighting, perspective, and materials. " +
  "Make sure no red tint remains anywhere in the final image, and keep every other " +
  "part of the photo exactly as it was.";

// Mirrors ReplaceViewModel.kt's buildPrompt(). detectedLabel is Mantha's own
// label-mask-region guess at what's under the mask (see MaskEditFlow.tsx) —
// naming it explicitly grounds the edit instead of just pointing at "the
// area," so the model is less likely to touch anything beyond that object.
function replacePrompt(userPrompt: string | undefined, detectedLabel: string | undefined): string {
  const subject = detectedLabel?.trim() ? `the ${detectedLabel.trim()}` : "it";
  const instruction = userPrompt?.trim()
    ? `replace ${subject} with: ${userPrompt.trim()}`
    : `replace ${subject} with a single object that fits naturally with the rest of the room's style`;
  return "This photo has an area marked with a solid red highlight. Treat the red highlight " +
    `strictly as a location marker for editing, not as a color or design element: ${instruction}. ` +
    "Match the surrounding lighting, perspective, and materials so the edit blends in, make sure " +
    "no red tint remains anywhere in the final image, and keep every other part of the photo " +
    "exactly as it was.";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  if (!GEMINI_API_KEY) {
    return json({ error: "Generation isn't switched on yet.", code: "not_configured" }, 503);
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

  const { inputPath, maskedPath, templateKey, roomType, roomLabel, stylePrompt, prompt, detectedLabel, mode: rawMode } = body as {
    inputPath?: string;
    /** Cleanup/Replace: the red-marked copy the model edits. inputPath stays the clean "before". */
    maskedPath?: string;
    templateKey?: string;
    roomType?: string;
    roomLabel?: string;
    stylePrompt?: string;
    prompt?: string;
    detectedLabel?: string;
    mode?: string;
  };
  const mode: Mode = rawMode === "cleanup" || rawMode === "replace" ? rawMode : "redesign";

  // ---- 1. check the photo before any credit is spent ------------------------
  // Only ever read the caller's own uploads.
  const ownPath = (p: unknown): p is string =>
    typeof p === "string" && p.startsWith(`${user.id}/`) && !p.includes("..");
  if (!ownPath(inputPath) || (maskedPath !== undefined && !ownPath(maskedPath))) {
    return json({ error: "That photo couldn't be used. Please upload it again.", code: "bad_image" }, 400);
  }
  // The model edits the red-marked copy when there is one (older clients sent
  // only a masked inputPath, which still works).
  const modelPath = mode !== "redesign" && maskedPath ? maskedPath : inputPath;

  const { data: sourceBlob, error: downloadError } = await admin.storage.from(BUCKET).download(modelPath);
  if (downloadError || !sourceBlob) {
    return json({ error: "That photo couldn't be found. Please upload it again.", code: "bad_image" }, 400);
  }
  if (sourceBlob.size > MAX_INPUT_BYTES) {
    return json({ error: "That photo is over 10MB — please use a smaller one.", code: "image_too_large" }, 413);
  }
  if (sourceBlob.type && !ALLOWED_TYPES.includes(sourceBlob.type)) {
    return json({ error: "Please use a JPG, PNG or WebP photo.", code: "bad_image_type" }, 415);
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
    // ---- 3. generate ------------------------------------------------------
    const fullPrompt = mode === "cleanup"
      ? CLEANUP_PROMPT
      : mode === "replace"
        ? replacePrompt(prompt, detectedLabel)
        : [
          `Redesign this ${roomLabel ?? "room"} as a photorealistic interior photograph.`,
          stylePrompt ? `Style: ${stylePrompt}.` : "",
          prompt ? `Requested changes: ${prompt}.` : "",
          "Keep the room's architecture, windows, doors, camera angle and perspective exactly the same, but the",
          "redesign itself must be clearly and obviously visible — change the wall color or finish and the",
          "flooring as part of the style, not just minor styling touches.",
        ].filter(Boolean).join(" ");

    const inputMimeType = sourceBlob.type || "image/png";
    const inputB64 = toBase64(new Uint8Array(await sourceBlob.arrayBuffer()));

    let attempt = await callGeminiImage(fullPrompt, inputB64, inputMimeType);
    if (!attempt.ok && attempt.refusalReason) {
      // A meaningful share of Gemini 2.5 Flash Image refusals on ordinary
      // interior photos are false positives — one retry with a neutral
      // framing clause recovers most of them without changing what the
      // user actually asked for.
      console.error("generate-redesign: refused, retrying with softened framing", {
        refusalReason: attempt.refusalReason,
      });
      const softenedPrompt = `${fullPrompt} This is a professional interior-design photo-editing request for a legitimate home-renovation context.`;
      attempt = await callGeminiImage(softenedPrompt, inputB64, inputMimeType);
    }
    if (!attempt.ok) {
      throw new Error(
        attempt.hardError ??
          (attempt.refusalReason
            ? `Image model refused the request: ${attempt.refusalReason}`
            : attempt.textPart
              ? `Image model returned text instead of an image: ${attempt.textPart.slice(0, 200)}`
              : "Image model returned no image"),
      );
    }
    const { b64 } = attempt;
    const outputMimeType = attempt.mimeType;
    const outputExt = outputMimeType.split("/")[1]?.replace("jpeg", "jpg") ?? "png";

    // ---- 4. store + record -------------------------------------------------
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const outputPath = `${user.id}/out-${Date.now()}.${outputExt}`;
    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(outputPath, bytes, { contentType: outputMimeType });
    if (uploadError) throw uploadError;

    const { data: generation, error: insertError } = await asUser
      .from("generations")
      .insert({
        user_id: user.id,
        input_image_url: inputPath,
        output_image_url: outputPath,
        template_key: mode === "redesign" ? (templateKey ?? null) : null,
        room_type: mode === "redesign" ? (roomType ?? null) : null,
        // Cleanup has no user prompt (fixed instruction); redesign and replace both do.
        prompt: mode === "cleanup" ? null : (prompt ?? null),
        status: "completed",
        kind: mode,
      })
      .select()
      .single();
    if (insertError) throw insertError;

    // The red-marked copy was only an instruction for the model. Best effort.
    if (modelPath !== inputPath) {
      const { error: removeError } = await admin.storage.from(BUCKET).remove([modelPath]);
      if (removeError) console.error("generate-redesign: couldn't remove masked copy", removeError);
    }

    return json({ generation });
  } catch (err) {
    console.error("generate-redesign failed:", err);
    const { error: refundError } = await admin
      .from("credit_ledger")
      .insert({ user_id: user.id, delta: 1, reason: "refund" });
    if (refundError) console.error("REFUND FAILED — credit owed to", user.id, refundError);

    const message = err instanceof Error ? err.message : "";
    const refused = /refused the request|returned text instead of an image/.test(message);
    const timedOut = /timed out/.test(message);
    return json(
      {
        error: refused
          ? "Mantha's safety filters blocked that edit — your credit has been refunded. Try painting a smaller area or a different photo."
          : timedOut
            ? "That took too long — your credit has been refunded. Please try again."
            : "That design didn't work — your credit has been refunded. Please try again.",
        code: refused ? "model_refused" : timedOut ? "model_timeout" : "generation_failed",
      },
      502,
    );
  }
});
