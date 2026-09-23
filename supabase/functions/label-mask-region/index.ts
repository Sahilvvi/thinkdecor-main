// Names whatever's under the red mask a signed-in user just painted in
// Cleanup/Replace — a cheap, fast auxiliary call (no credit spent, no
// storage write) that runs automatically after a stroke so the user sees
// what Mantha detected before committing to a full generation.
//
// Deploy:  supabase functions deploy label-mask-region
// Secrets: reuses GEMINI_API_KEY already set for generate-redesign;
//          (optional) GEMINI_LABEL_MODEL, defaults to gemini-2.5-flash.
//
// Self-contained (no ../_shared import) so it also deploys from the
// Supabase dashboard's function editor, same convention as generate-redesign.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
// A text model, not the image model: naming an object is a text answer, and
// the image model sometimes replies with an image (or nothing) instead.
const MODEL = Deno.env.get("GEMINI_LABEL_MODEL") ?? "gemini-2.5-flash";
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const GEMINI_TIMEOUT_MS = 12_000;
const MAX_INPUT_BYTES = 10 * 1024 * 1024;

const LABEL_PROMPT =
  "This photo has an area marked with a solid red highlight. In 3-5 words, name only the " +
  "object or surface under the highlight (e.g. 'floor lamp', 'accent rug', 'wall art'). If " +
  "nothing identifiable is under it, reply 'that area'. Reply with just the label — no " +
  "punctuation, no extra sentence.";

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
    return json({ error: "Not switched on yet.", code: "not_configured" }, 503);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return json({ error: "Please sign in again.", code: "unauthenticated" }, 401);
  }

  const asUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
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

  const { maskedImage, mimeType: rawMimeType } = body as { maskedImage?: string; mimeType?: string };
  const mimeType = rawMimeType && ALLOWED_TYPES.includes(rawMimeType) ? rawMimeType : "image/png";
  if (typeof maskedImage !== "string" || !maskedImage) {
    return json({ error: "Missing photo.", code: "bad_image" }, 400);
  }
  // Rough sanity cap on the base64 payload — real limit is enforced upstream
  // by MaskCanvas's MAX_DIMENSION downscale, this just guards the endpoint.
  if (maskedImage.length > MAX_INPUT_BYTES * 1.4) {
    return json({ error: "That photo is too large.", code: "image_too_large" }, 413);
  }

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
              { text: LABEL_PROMPT },
              { inlineData: { mimeType, data: maskedImage } },
            ],
          }],
          // A 3-5 word label needs no reasoning — thinking only adds latency.
          generationConfig: { thinkingConfig: { thinkingBudget: 0 }, maxOutputTokens: 20 },
        }),
        signal: controller.signal,
      },
    );
    const aiResult = await aiResponse.json();
    if (!aiResponse.ok) {
      throw new Error(aiResult?.error?.message ?? `Label model returned ${aiResponse.status}`);
    }
    const textPart = aiResult?.candidates?.[0]?.content?.parts?.find(
      (p: { text?: string }) => typeof p.text === "string",
    )?.text;
    const label = (textPart ?? "that area")
      .trim()
      .replace(/^["'.]+|["'.]+$/g, "")
      .slice(0, 40);
    return json({ label: label || "that area" });
  } catch (err) {
    const timedOut = err instanceof Error && err.name === "AbortError";
    console.error("label-mask-region failed:", err);
    return json(
      { error: timedOut ? "Detection timed out." : "Couldn't detect that.", code: "label_failed" },
      502,
    );
  } finally {
    clearTimeout(timeout);
  }
});
