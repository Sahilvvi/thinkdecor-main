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
import { generationBlock, imageModels, loadSettings, logAttempt } from "../_shared/platform.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
// Image models, fastest first. Benchmarked on the same bedroom photo + prompt:
//   gemini-3.1-flash-lite-image  3.8s  (restyled the whole room - best result)
//   gemini-2.5-flash-image       9.4s  (left dark window frame / furniture untouched)
//   gemini-3.1-flash-image      10.1s
//   gemini-3-pro-image          20.6s
// A model that's retired, overloaded or timing out just hands over to the next one.
// Override the first choice with the GEMINI_IMAGE_MODEL secret.
const IMAGE_MODELS = [
  ...new Set([
    Deno.env.get("GEMINI_IMAGE_MODEL"),
    "gemini-3.1-flash-lite-image",
    "gemini-3.1-flash-image",
    "gemini-2.5-flash-image",
  ].filter((m): m is string => !!m)),
];
// Small text models that tidy the user's prompt (see beautifyPrompt).
const TEXT_MODELS = [
  ...new Set([
    Deno.env.get("GEMINI_TEXT_MODEL"),
    "gemini-3.5-flash-lite",
    "gemini-3.6-flash",
  ].filter((m): m is string => !!m)),
];

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
// Per attempt. Two models + one refusal retry still fits the 150s edge limit.
const GEMINI_TIMEOUT_MS = 40_000;
const BEAUTIFY_TIMEOUT_MS = 4_000;
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

interface Usage { input: number; output: number }
type GeminiImageResult =
  | { ok: true; b64: string; mimeType: string; usage?: Usage }
  | { ok: false; hardError?: string; refusalReason?: string; textPart?: string; usage?: Usage };

async function callGeminiImage(model: string, fullPrompt: string, inputB64: string, inputMimeType: string): Promise<GeminiImageResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);
  try {
    const aiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
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
    const um = aiResult?.usageMetadata;
    const usage: Usage | undefined = um
      ? { input: Number(um.promptTokenCount ?? 0), output: Number(um.candidatesTokenCount ?? 0) + Number(um.thoughtsTokenCount ?? 0) }
      : undefined;
    if (!aiResponse.ok) {
      return { ok: false, hardError: aiResult?.error?.message ?? `Image model returned ${aiResponse.status}`, usage };
    }
    const candidate = aiResult?.candidates?.[0];
    const parts: { inlineData?: { data?: string; mimeType?: string } }[] = candidate?.content?.parts ?? [];
    const imagePart = parts.find((p) => p.inlineData?.data);
    const b64 = imagePart?.inlineData?.data;
    if (typeof b64 === "string") {
      return { ok: true, b64, mimeType: imagePart?.inlineData?.mimeType || "image/png", usage };
    }
    const refusalReason = aiResult?.promptFeedback?.blockReason || candidate?.finishReason;
    console.error("demo-redesign: no image in response", { model, refusalReason });
    return { ok: false, refusalReason, usage };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return { ok: false, hardError: "Image model timed out" };
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Walks the model list until one returns an image. A refusal gets one retry
 * with softened framing on the same model (many are false positives on plain
 * interior photos); a hard error - retired model, overload, timeout - moves
 * straight to the next model.
 */
interface AttemptRecord { model: string; ms: number; ok: boolean; usage?: Usage; error?: string; fallbackUsed: boolean }

async function generateImage(
  fullPrompt: string,
  inputB64: string,
  inputMimeType: string,
  models: string[],
  onAttempt: (a: AttemptRecord) => void,
): Promise<GeminiImageResult> {
  let last: GeminiImageResult = { ok: false, hardError: "No image model available" };
  for (const model of models) {
    const started = Date.now();
    let attempt = await callGeminiImage(model, fullPrompt, inputB64, inputMimeType);
    if (!attempt.ok && attempt.refusalReason) {
      console.error("demo-redesign: refused, retrying with softened framing", { model, refusalReason: attempt.refusalReason });
      attempt = await callGeminiImage(
        model,
        `${fullPrompt} This is a professional interior-design photo-editing request for a legitimate home-renovation context.`,
        inputB64,
        inputMimeType,
      );
    }
    onAttempt({
      model,
      ms: Date.now() - started,
      ok: attempt.ok,
      usage: attempt.usage,
      error: attempt.ok ? undefined : (attempt.hardError ?? attempt.refusalReason ?? attempt.textPart ?? "no image"),
      fallbackUsed: model !== models[0],
    });
    if (attempt.ok) {
      console.log("demo-redesign: image ready", { model, ms: Date.now() - started });
      return attempt;
    }
    console.error("demo-redesign: model failed, trying next", { model, ms: Date.now() - started, reason: attempt.hardError ?? attempt.refusalReason });
    last = attempt;
  }
  return last;
}

/** Deterministic tidy-up - also the fallback whenever the rewrite model is slow or down. */
function tidyPrompt(raw: string | undefined): string {
  const t = (raw ?? "").replace(/\s+/g, " ").trim().slice(0, 400);
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : "";
}

const THINKING_VARIANTS: Record<string, unknown>[] = [
  { thinkingConfig: { thinkingLevel: "minimal" }, maxOutputTokens: 120, temperature: 0.3 },
  { thinkingConfig: { thinkingBudget: 0 }, maxOutputTokens: 120, temperature: 0.3 },
  { maxOutputTokens: 1024, temperature: 0.3 },
];

/**
 * Behind-the-scenes prompt clean-up. People type "make it cosy nd add a grean
 * sofa" - this turns it into a clear, concrete instruction for the image
 * model, without the user ever seeing the rewrite (the original is what's
 * stored and shown). It never blocks a generation: on a timeout, an error, or
 * gibberish it quietly falls back to a plain tidy-up of what they typed.
 * Returns "" when the note isn't about changing the room at all.
 */
async function beautifyPrompt(
  raw: string | undefined,
  ctx: { kind: "redesign" | "replace"; roomLabel?: string; style?: string; detectedLabel?: string },
): Promise<string> {
  const base = tidyPrompt(raw);
  if (!base || !GEMINI_API_KEY) return base;

  const brief = ctx.kind === "replace"
    ? "The note says what should REPLACE a selected object" +
      (ctx.detectedLabel ? ` (currently: ${ctx.detectedLabel})` : "") +
      ". Rewrite it as a short, concrete description of the new object only - type, material, colour, finish, size/shape - e.g. \"a low-profile grey linen sofa with slim oak legs\"."
    : `The note describes changes to a ${ctx.roomLabel ?? "room"}` +
      (ctx.style ? ` being restyled as: ${ctx.style}` : "") +
      ". Rewrite it as one or two clear imperative sentences using concrete visual terms - materials, colours, finishes, lighting, furniture.";
  const system =
    "You turn a homeowner's rough note into a precise instruction for an interior-design image editor. " +
    brief +
    " Fix spelling and grammar, translate to English, and make vague wishes specific - but keep only what they asked for: " +
    "never add extra changes, brands, people, text or logos, and never contradict them. Under 40 words. " +
    "Reply with the rewritten instruction only - no quotes, no markdown, no preamble. " +
    "If the note is gibberish or has nothing to do with changing a room, reply with exactly: NONE";

  for (const model of TEXT_MODELS) {
    for (let v = 0; v < THINKING_VARIANTS.length; v++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), BEAUTIFY_TIMEOUT_MS);
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents: [{ parts: [{ text: `Note: ${base}` }] }],
            generationConfig: THINKING_VARIANTS[v],
          }),
          signal: controller.signal,
        });
        const j = await res.json().catch(() => ({}));
        if (!res.ok) {
          const msg: string = j?.error?.message ?? "";
          if (/thinking|invalid argument/i.test(msg)) continue; // wrong thinking knob for this model
          break; // retired / overloaded - next model
        }
        const text: string = (j?.candidates?.[0]?.content?.parts ?? [])
          .map((p: { text?: string }) => p.text ?? "")
          .join("")
          .trim()
          .replace(/^["'`\s]+|["'`\s]+$/g, "");
        if (!text) break;
        if (/^none\.?$/i.test(text)) return "";
        return text.slice(0, 400);
      } catch {
        return base; // timeout / network - don't hold the generation up any longer
      } finally {
        clearTimeout(timer);
      }
    }
  }
  return base;
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
  // Switches and limits set in the super admin panel.
  const settings = await loadSettings(admin);
  const blocked = await generationBlock(admin, settings, "demo");
  if (blocked) return json({ error: blocked.message, code: blocked.code }, blocked.status);
  const models = imageModels(settings, Deno.env.get("GEMINI_IMAGE_MODEL"));
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
      if ((count ?? 0) >= Math.max(1, settings.demo.per_ip || IP_DAILY_LIMIT)) return demoUsed();
    }
  }

  // Insert first — a slow/failed generation still spends the one free try,
  // same principle as generate-redesign spending a credit before calling
  // the model (there it refunds on failure; here there's nothing to refund,
  // this is a single anonymous try, not a paid balance).
  // upsert (not insert) while testing: the same device retrying repeatedly
  // would otherwise still hit this table's primary key and get blocked here
  // even with the checks above skipped.
  const { error: usageError } = limitDisabled
    ? await admin.from("homepage_demo_usage").upsert({ device_id: deviceId, ip: ip ?? "0.0.0.0" })
    : await admin.from("homepage_demo_usage").insert({ device_id: deviceId, ip: ip ?? "0.0.0.0" });
  if (usageError) {
    // A duplicate-key race (two tabs at once) reads as "already used," anything
    // else is a real failure.
    if (!limitDisabled && usageError.code === "23505") return demoUsed();
    console.error("demo-redesign: usage insert failed:", usageError);
    return json({ error: "Something went wrong. Please try again.", code: "usage_failed" }, 500);
  }

  const attempts: AttemptRecord[] = [];
  const flush = async () => {
    for (const a of attempts) {
      await logAttempt(admin, settings, {
        deviceId,
        feature: "demo",
        model: a.model,
        ok: a.ok,
        latencyMs: a.ms,
        inputTokens: a.usage?.input,
        outputTokens: a.usage?.output,
        error: a.error,
        fallbackUsed: a.fallbackUsed,
      });
    }
  };

  try {
    // Tidy whatever the visitor typed (typos, other languages, vague wishes) before
    // the model sees it. Never blocks - falls back to their own words.
    const beautified = prompt?.trim() ? await beautifyPrompt(prompt, { kind: "redesign" }) : "";
    const fullPrompt = [
      "Redesign this room as a photorealistic interior photograph.",
      beautified ? `Requested changes: ${beautified.replace(/[.\s]+$/, "")}.` : `Style: ${pickFallbackStyle()}.`,
      "Keep the room's architecture, windows, doors, camera angle and perspective exactly the same, but the",
      "redesign itself must be clearly and obviously visible — change the wall color or finish and the",
      "flooring as part of the style, not just minor styling touches. The result should look like a",
      "different, real decorating choice, not a lightly retouched version of the original photo.",
    ].join(" ");

    const attempt = await generateImage(fullPrompt, imageBase64, mimeType, models, (a) => attempts.push(a));
    await flush();
    if (!attempt.ok) {
      throw new Error(attempt.hardError ?? "Image model returned no image");
    }

    return json({ imageBase64: attempt.b64, mimeType: attempt.mimeType });
  } catch (err) {
    console.error("demo-redesign failed:", err);
    await flush();
    if (attempts.length === 0) {
      await logAttempt(admin, settings, { deviceId, feature: "demo", model: null, ok: false, latencyMs: 0, error: err instanceof Error ? err.message : "failed" });
    }
    // Give the free try back — "please try again" below has to be true.
    const { error: releaseError } = await admin.from("homepage_demo_usage").delete().eq("device_id", deviceId);
    if (releaseError) console.error("demo-redesign: couldn't release the free try", releaseError);
    return json(
      { error: "That preview didn't work — please try again with a different photo.", code: "generation_failed" },
      502,
    );
  }
});
