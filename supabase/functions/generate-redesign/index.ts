// Redesigns a room photo with OpenAI's image edit model.
//
// Deploy:  supabase functions deploy generate-redesign
// Secrets: supabase secrets set OPENAI_API_KEY=sk-...
//          (optional) supabase secrets set OPENAI_IMAGE_MODEL=gpt-image-1
// Then set VITE_LIVE_GENERATION=true in the site's .env and rebuild.
//
// Order of work, all server-side so the browser can't skip a step:
//   1. check the caller is signed in and the photo is their own upload
//   2. spend one credit (spend_credit refuses at zero)
//   3. call the model
//   4. store the result and record it in `generations`
// If 3 or 4 fails, the credit is refunded.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/catalog.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";
const MODEL = Deno.env.get("OPENAI_IMAGE_MODEL") ?? "gpt-image-1";

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

  const { inputUrl, templateKey, roomType, roomLabel, stylePrompt, prompt } = body as {
    inputUrl?: string;
    templateKey?: string;
    roomType?: string;
    roomLabel?: string;
    stylePrompt?: string;
    prompt?: string;
  };

  // Only ever generate from the caller's own uploads — never fetch an arbitrary URL.
  const allowedPrefix = `${SUPABASE_URL}/storage/v1/object/public/generations/${user.id}/`;
  if (typeof inputUrl !== "string" || !inputUrl.startsWith(allowedPrefix)) {
    return json({ error: "That photo couldn't be used. Please upload it again.", code: "bad_image" }, 400);
  }

  // ---- 2. spend -----------------------------------------------------------
  const { error: spendError } = await asUser.rpc("spend_credit");
  if (spendError) {
    if (/no credits remaining/i.test(spendError.message)) {
      return json({ error: "You're out of credits.", code: "out_of_credits" }, 402);
    }
    console.error("spend_credit failed:", spendError);
    return json({ error: "Couldn't reserve a credit. Please try again.", code: "spend_failed" }, 500);
  }

  try {
    // ---- 3. generate ------------------------------------------------------
    const source = await fetch(inputUrl);
    if (!source.ok) throw new Error(`Could not read source image (${source.status})`);
    const sourceBlob = await source.blob();
    const ext = (sourceBlob.type.split("/")[1] ?? "png").replace("jpeg", "jpg");

    const fullPrompt = [
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
    const path = `${user.id}/out-${Date.now()}.png`;
    const { error: uploadError } = await admin.storage
      .from("generations")
      .upload(path, bytes, { contentType: "image/png" });
    if (uploadError) throw uploadError;

    const outputUrl = admin.storage.from("generations").getPublicUrl(path).data.publicUrl;

    const { data: generation, error: insertError } = await asUser
      .from("generations")
      .insert({
        user_id: user.id,
        input_image_url: inputUrl,
        output_image_url: outputUrl,
        template_key: templateKey ?? null,
        room_type: roomType ?? null,
        prompt: prompt ?? null,
        status: "completed",
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
