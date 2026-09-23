// Names whatever's under the red mask a signed-in user just painted in
// Cleanup/Replace — a cheap, fast auxiliary call (no credit spent, no
// storage write) that runs automatically after a stroke so the user sees
// what Mantha detected before committing to a full generation.
//
// The client sends a *detection* copy of the photo — the mask drawn see-through
// (~40%) so the object underneath is still visible — plus the mask's bounding
// box. (The generation copy paints the mask solid red, which hides exactly the
// thing we're trying to name; naming from that one was the old failure mode.)
//
// Deploy:  supabase functions deploy label-mask-region
// Secrets: reuses GEMINI_API_KEY already set for generate-redesign;
//          (optional) GEMINI_LABEL_MODEL, tried first, then the fallbacks below.
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
// Tried in order — a retired/renamed/overloaded model shouldn't take detection down.
const MODELS = [
  ...new Set([
    Deno.env.get("GEMINI_LABEL_MODEL"),
    // Google has closed the 2.5 text models to new API keys ("no longer available
    // to new users"), which is what made detection fail every time. 3.x first;
    // the 2.5 ones stay last for older keys.
    "gemini-3.5-flash-lite",
    "gemini-3.6-flash",
    "gemini-flash-latest",
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
  ].filter((m): m is string => !!m)),
];
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const GEMINI_TIMEOUT_MS = 6_000;
const MAX_INPUT_BYTES = 10 * 1024 * 1024;

type Box = { x0: number; y0: number; x1: number; y1: number };

function describeBox(box: Box | undefined): string {
  if (!box) return "";
  const pct = (v: number) => Math.round(Math.max(0, Math.min(1, v)) * 100);
  const cx = (box.x0 + box.x1) / 2;
  const cy = (box.y0 + box.y1) / 2;
  const h = cx < 0.34 ? "left" : cx > 0.66 ? "right" : "centre";
  const v = cy < 0.34 ? "top" : cy > 0.66 ? "bottom" : "middle";
  return ` The highlight spans about ${pct(box.x0)}%-${pct(box.x1)}% across and ${pct(box.y0)}%-${pct(box.y1)}% down the photo, in the ${v}-${h}.`;
}

function labelPrompt(box: Box | undefined): string {
  return (
    "This is a photo of a room. Someone painted a see-through red highlight over one thing in it — " +
    "the object is still visible through the tint." + describeBox(box) +
    " In 1-4 words, name the object or surface the highlight sits on (e.g. 'floor lamp', " +
    "'grey sofa', 'wall art', 'wooden floor', 'curtains'). If it covers several things, name the " +
    "main one. Only if nothing identifiable is under it, reply 'that area'. Reply with just the " +
    "label — lowercase, no punctuation, no sentence."
  );
}

/** One model, one attempt. Throws with Google's own message so failures are diagnosable. */
// How to keep thinking to a minimum — Gemini 2.5 takes a token budget, 3.x a level,
// and a model that accepts neither gets the whole budget to think in.
const THINKING_VARIANTS: Record<string, unknown>[] = [
  { thinkingConfig: { thinkingLevel: "minimal" }, maxOutputTokens: 64, temperature: 0.2 },
  { thinkingConfig: { thinkingBudget: 0 }, maxOutputTokens: 64, temperature: 0.2 },
  { maxOutputTokens: 1024, temperature: 0.2 },
];

async function askModel(model: string, prompt: string, mimeType: string, image: string, variant: number): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType, data: image } }] }],
          // A 1-4 word label needs no reasoning.
          generationConfig: THINKING_VARIANTS[variant],
        }),
        signal: controller.signal,
      },
    );
    const result = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(result?.error?.message ?? `${model} returned ${res.status}`);
    const text = result?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text ?? "")
      .join("")
      .trim();
    if (!text) {
      throw new Error(`${model} returned no text (finishReason: ${result?.candidates?.[0]?.finishReason ?? result?.promptFeedback?.blockReason ?? "unknown"})`);
    }
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

function cleanLabel(raw: string): string {
  const first = raw.split("\n")[0] ?? raw;
  return first
    .trim()
    .toLowerCase()
    .replace(/^(the|a|an)\s+/, "")
    .replace(/^["'`.\s]+|["'`.\s]+$/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 40);
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

  const { maskedImage, mimeType: rawMimeType, box } = body as {
    maskedImage?: string;
    mimeType?: string;
    box?: Box;
  };
  const mimeType = rawMimeType && ALLOWED_TYPES.includes(rawMimeType) ? rawMimeType : "image/jpeg";
  if (typeof maskedImage !== "string" || !maskedImage) {
    return json({ error: "Missing photo.", code: "bad_image" }, 400);
  }
  // Rough sanity cap on the base64 payload — the client sends a ~768px copy,
  // this just guards the endpoint.
  if (maskedImage.length > MAX_INPUT_BYTES * 1.4) {
    return json({ error: "That photo is too large.", code: "image_too_large" }, 413);
  }
  const safeBox = box && [box.x0, box.y0, box.x1, box.y1].every((n) => typeof n === "number" && isFinite(n))
    ? box
    : undefined;
  const prompt = labelPrompt(safeBox);

  const failures: string[] = [];
  for (const model of MODELS) {
    for (let variant = 0; variant < THINKING_VARIANTS.length; variant++) {
      const started = Date.now();
      try {
        const raw = await askModel(model, prompt, mimeType, maskedImage, variant);
        const label = cleanLabel(raw);
        return json({ label: label || "that area", model, skipped: failures });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        failures.push(`${model}#${variant} ${Date.now() - started}ms: ${message.slice(0, 140)}`);
        // Same model, next thinking setting — but only if the setting is what it
        // objected to. Anything else (retired, overloaded, blocked) → next model.
        if (!/thinking|invalid argument/i.test(message)) break;
      }
    }
  }
  console.error("label-mask-region: every model failed", failures);
  return json({ error: "Couldn't detect that.", code: "label_failed", detail: failures.slice(0, 4) }, 502);
});
