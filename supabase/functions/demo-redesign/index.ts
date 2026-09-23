// The homepage's "Mantha" demo (src/components/premium/DesignGenerator.tsx) —
// the ONE public, unauthenticated generation endpoint, meant for an anonymous
// visitor to try once for free before signing up. No credit ledger, no
// storage write: the result is returned inline and never persisted.
//
// One-per-device enforcement: the client sends a deviceId (a random id it
// persists in localStorage). As a backstop against a visitor simply clearing
// storage, each IP gets at most IP_DAILY_LIMIT tries a day — a cap, not a
// one-try ban, so people sharing office Wi-Fi or a mobile carrier's IP
// aren't all locked out by the first visitor. The usage row is inserted
// BEFORE calling the model (so two tabs can't both get a free try) and
// deleted again if generation fails, so a failed attempt doesn't count.
//
// Deploy:  supabase functions deploy demo-redesign
// Secrets: reuses GEMINI_API_KEY / GEMINI_IMAGE_MODEL already set for
//          generate-redesign.
// Migration: 20260923060000_homepage_demo_usage.sql must be applied first.
//
// Self-contained (no ../_shared import), same convention as generate-redesign.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const MODEL = Deno.env.get("GEMINI_IMAGE_MODEL") ?? "gemini-2.5-flash-image";
const GEMINI_TIMEOUT_MS = 45_000;
const IP_DAILY_LIMIT = 3;

// Gemini's image model can play it safe on a vague instruction and return
// something only subtly different from the input (same walls, same layout,
// barely-changed lighting) — which reads to a visitor as "it didn't do
// anything." These are concrete enough that the model has no vague middle
// ground to fall back to when the visitor didn't type their own prompt.
const FALLBACK_STYLES = [
  "warm Scandinavian: pale oak flooring, off-white walls, linen and boucle textures",
  "moody dark academia: deep forest-green walls, brass fixtures, dark walnut furniture",
  "coastal Japandi: warm greige walls, woven natural textures, light bamboo accents",
  "modern minimalist: crisp white walls, black matte fixtures, polished concrete flooring",
  "mid-century modern: warm mustard and burnt-orange accents, teak furniture, terrazzo flooring",
];
function pickFallbackStyle(): string {
  return FALLBACK_STYLES[Math.floor(Math.random() * FALLBACK_STYLES.length)];
}
const MAX_INPUT_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

type GeminiImageResult =
  | { ok: true; b64: string; mimeType: string }
  | { ok: false; hardError?: string; refusalReason?: string };

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
    const parts: { inlineData?: { data?: string; mimeType?: string } }[] = candidate?.content?.parts ?? [];
    const imagePart = parts.find((p) => p.inlineData?.data);
    const b64 = imagePart?.inlineData?.data;
    if (typeof b64 === "string") {
      return { ok: true, b64, mimeType: imagePart?.inlineData?.mimeType || "image/png" };
    }
    const refusalReason = aiResult?.promptFeedback?.blockReason || candidate?.finishReason;
    console.error("demo-redesign: no image in response", { refusalReason });
    return { ok: false, refusalReason };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return { ok: false, hardError: "Image model timed out" };
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
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
    return json({ error: "Not switched on yet.", code: "not_configured" }, 503);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request.", code: "bad_request" }, 400);
  }

  const { deviceId, imageBase64, imageMimeType, prompt } = body as {
    deviceId?: string;
    imageBase64?: string;
    imageMimeType?: string;
    prompt?: string;
  };

  if (typeof deviceId !== "string" || deviceId.length < 8 || deviceId.length > 128) {
    return json({ error: "Missing device id.", code: "bad_request" }, 400);
  }
  if (typeof imageBase64 !== "string" || !imageBase64) {
    return json({ error: "Missing photo.", code: "bad_image" }, 400);
  }
  if (imageBase64.length > MAX_INPUT_BYTES * 1.4) {
    return json({ error: "That photo is over 10MB — please use a smaller one.", code: "image_too_large" }, 413);
  }
  const mimeType = imageMimeType && ALLOWED_TYPES.includes(imageMimeType) ? imageMimeType : "image/jpeg";

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const demoUsed = () =>
    json({ error: "You've already tried your free redesign — sign up for more.", code: "demo_used" }, 402);

  // TEMPORARY — set while the team is testing the demo, so a device/IP never
  // gets blocked. Unset (`supabase secrets unset DEMO_LIMIT_DISABLED`) to
  // restore the real one-per-device limit before this goes out to visitors.
  const limitDisabled = Deno.env.get("DEMO_LIMIT_DISABLED") === "true";

  if (!limitDisabled) {
    const { data: existing } = await admin
      .from("homepage_demo_usage")
      .select("device_id")
      .eq("device_id", deviceId)
      .maybeSingle();
    if (existing) return demoUsed();

    // No IP header means no backstop — never lump every such visitor together.
    if (ip) {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count } = await admin
        .from("homepage_demo_usage")
        .select("device_id", { count: "exact", head: true })
        .eq("ip", ip)
        .gt("used_at", since);
      if ((count ?? 0) >= IP_DAILY_LIMIT) return demoUsed();
    }
  }

  // Insert first — a slow/failed generation still spends the one free try,
  // same principle as generate-redesign spending a credit before calling
  // the model (there it refunds on failure; here there's nothing to refund,
  // this is a single anonymous try, not a paid balance).
  const { error: usageError } = await admin
    .from("homepage_demo_usage")
    .insert({ device_id: deviceId, ip: ip ?? "0.0.0.0" });
  if (usageError) {
    // A duplicate-key race (two tabs at once) reads as "already used," anything
    // else is a real failure.
    if (usageError.code === "23505") return demoUsed();
    console.error("demo-redesign: usage insert failed:", usageError);
    return json({ error: "Something went wrong. Please try again.", code: "usage_failed" }, 500);
  }

  try {
    const fullPrompt = [
      "Redesign this room as a photorealistic interior photograph.",
      prompt?.trim() ? `Requested changes: ${prompt.trim()}.` : `Style: ${pickFallbackStyle()}.`,
      "Keep the room's architecture, windows, doors, camera angle and perspective exactly the same, but the",
      "redesign itself must be clearly and obviously visible — change the wall color or finish and the",
      "flooring as part of the style, not just minor styling touches. The result should look like a",
      "different, real decorating choice, not a lightly retouched version of the original photo.",
    ].join(" ");

    let attempt = await callGeminiImage(fullPrompt, imageBase64, mimeType);
    if (!attempt.ok && attempt.refusalReason) {
      const softenedPrompt = `${fullPrompt} This is a professional interior-design photo-editing request for a legitimate home-renovation context.`;
      attempt = await callGeminiImage(softenedPrompt, imageBase64, mimeType);
    }
    if (!attempt.ok) {
      throw new Error(attempt.hardError ?? "Image model returned no image");
    }

    return json({ imageBase64: attempt.b64, mimeType: attempt.mimeType });
  } catch (err) {
    console.error("demo-redesign failed:", err);
    // Give the free try back — "please try again" below has to be true.
    const { error: releaseError } = await admin.from("homepage_demo_usage").delete().eq("device_id", deviceId);
    if (releaseError) console.error("demo-redesign: couldn't release the free try", releaseError);
    return json(
      { error: "That preview didn't work — please try again with a different photo.", code: "generation_failed" },
      502,
    );
  }
});
