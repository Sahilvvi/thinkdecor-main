// Redesigns, cleans up or replaces something in a room photo with OpenAI's
// image edit model — one shared endpoint, three `mode`s:
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
// Secrets: supabase secrets set OPENAI_API_KEY=sk-...
//          (optional) supabase secrets set OPENAI_IMAGE_MODEL=gpt-image-1
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
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";
const MODEL = Deno.env.get("OPENAI_IMAGE_MODEL") ?? "gpt-image-1";

const BUCKET = "generations";
const MAX_INPUT_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

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

// Mirrors ReplaceViewModel.kt's buildPrompt().
function replacePrompt(userPrompt: string | undefined): string {
  const instruction = userPrompt?.trim()
    ? `replace it with: ${userPrompt.trim()}`
    : "replace it with a single object that fits naturally with the rest of the room's style";
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

  if (!OPENAI_API_KEY) {
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

  const { inputPath, templateKey, roomType, roomLabel, stylePrompt, prompt, mode: rawMode } = body as {
    inputPath?: string;
    templateKey?: string;
    roomType?: string;
    roomLabel?: string;
    stylePrompt?: string;
    prompt?: string;
    mode?: string;
  };
  const mode: Mode = rawMode === "cleanup" || rawMode === "replace" ? rawMode : "redesign";

  // ---- 1. check the photo before any credit is spent ------------------------
  // Only ever read the caller's own uploads.
  if (typeof inputPath !== "string" || !inputPath.startsWith(`${user.id}/`) || inputPath.includes("..")) {
    return json({ error: "That photo couldn't be used. Please upload it again.", code: "bad_image" }, 400);
  }

  const { data: sourceBlob, error: downloadError } = await admin.storage.from(BUCKET).download(inputPath);
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
    const ext = (sourceBlob.type.split("/")[1] ?? "png").replace("jpeg", "jpg");

    const fullPrompt = mode === "cleanup"
      ? CLEANUP_PROMPT
      : mode === "replace"
        ? replacePrompt(prompt)
        : [
          `Redesign this ${roomLabel ?? "room"} as a photorealistic interior photograph.`,
          stylePrompt ? `Style: ${stylePrompt}.` : "",
          prompt ? `Requested changes: ${prompt}.` : "",
          "Keep the room's architecture, walls, windows, doors, camera angle and perspective exactly the same.",
        ].filter(Boolean).join(" ");

    const form = new FormData();
    form.append("model", MODEL);
    form.append("image", sourceBlob, `room.${ext}`);
    form.append("prompt", fullPrompt);
    form.append("size", "1536x1024");

    const aiResponse = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: form,
    });
    const aiResult = await aiResponse.json();
    if (!aiResponse.ok) {
      throw new Error(aiResult?.error?.message ?? `Image model returned ${aiResponse.status}`);
    }
    const b64 = aiResult?.data?.[0]?.b64_json;
    if (typeof b64 !== "string") throw new Error("Image model returned no image");

    // ---- 4. store + record -------------------------------------------------
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const outputPath = `${user.id}/out-${Date.now()}.png`;
    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(outputPath, bytes, { contentType: "image/png" });
    if (uploadError) throw uploadError;

    const { data: generation, error: insertError } = await asUser
      .from("generations")
      .insert({
        user_id: user.id,
        input_image_url: inputPath,
        output_image_url: outputPath,
        template_key: mode === "redesign" ? (templateKey ?? null) : null,
        room_type: mode === "redesign" ? (roomType ?? null) : null,
        prompt: mode === "replace" ? (prompt ?? null) : null,
        status: "completed",
        kind: mode,
      })
      .select()
      .single();
    if (insertError) throw insertError;

    return json({ generation });
  } catch (err) {
    console.error("generate-redesign failed:", err);
    const { error: refundError } = await admin
      .from("credit_ledger")
      .insert({ user_id: user.id, delta: 1, reason: "refund" });
    if (refundError) console.error("REFUND FAILED — credit owed to", user.id, refundError);

    return json(
      { error: "That design didn't work — your credit has been refunded. Please try again.", code: "generation_failed" },
      502,
    );
  }
});
