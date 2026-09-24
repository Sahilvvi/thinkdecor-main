// Turns a pasted Pinterest link into a real image the user can reference in a redesign.
// Pinterest (and pin.it short links) serve an og:image meta tag in the plain HTML response —
// no headless browser or JS rendering needed, which is exactly what keeps this reliable: it's
// reading the same tag Pinterest itself puts there for link previews, not scraping the page.
//
// Deploy: supabase functions deploy extract-pin-image
//
// Order of work:
//   1. check the caller is signed in
//   2. validate the URL is actually a Pinterest one (pinterest.<tld> or pin.it)
//   3. fetch the page HTML and pull out og:image (+ og:title for display)
//   4. download that image, check its type/size, store it under the caller's own path
// Every failure returns a specific `code` so the UI can show an exact reason, never a blank error.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const BUCKET = "generations";
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const FETCH_TIMEOUT_MS = 12_000;
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36";

const PINTEREST_HOST = /^(www\.|[a-z]{2}\.)?pinterest\.[a-z.]+$|^pin\.it$/i;

async function fetchWithTimeout(url: string, ms: number, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function metaContent(html: string, prop: string): string | undefined {
  // Handles both attribute orders — property="og:image" content="…" and content="…" property="og:image".
  const a = new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']`, "i").exec(html);
  if (a) return a[1];
  const b = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${prop}["']`, "i").exec(html);
  return b?.[1];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return json({ error: "Please sign in again.", code: "unauthenticated" }, 401);
  }
  const asUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } });
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const { data: { user } } = await asUser.auth.getUser();
  if (!user) return json({ error: "Please sign in again.", code: "unauthenticated" }, 401);

  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request.", code: "bad_request" }, 400);
  }

  const rawUrl = body.url?.trim();
  if (!rawUrl) return json({ error: "Paste a Pinterest link first.", code: "no_url" }, 400);

  let pinUrl: URL;
  try {
    pinUrl = new URL(rawUrl);
  } catch {
    return json({ error: "That doesn't look like a valid link.", code: "invalid_url" }, 400);
  }
  if (pinUrl.protocol !== "https:" && pinUrl.protocol !== "http:") {
    return json({ error: "That doesn't look like a valid link.", code: "invalid_url" }, 400);
  }
  if (!PINTEREST_HOST.test(pinUrl.hostname)) {
    return json({ error: "That's not a Pinterest link — paste a pinterest.com or pin.it URL.", code: "not_pinterest" }, 400);
  }

  // ---- fetch the pin page and read its og:image ----------------------------
  let pageHtml: string;
  let finalUrl = pinUrl.toString();
  try {
    const pageRes = await fetchWithTimeout(pinUrl.toString(), FETCH_TIMEOUT_MS, {
      headers: { "User-Agent": UA, Accept: "text/html" },
    });
    finalUrl = pageRes.url || finalUrl;
    if (!pageRes.ok) {
      return json({ error: "That pin couldn't be opened — it may be private or deleted.", code: "pin_unreachable" }, 422);
    }
    pageHtml = await pageRes.text();
  } catch (err) {
    const timedOut = err instanceof Error && err.name === "AbortError";
    return json(
      { error: timedOut ? "Pinterest took too long to respond — try again." : "Couldn't reach Pinterest right now.", code: timedOut ? "timeout" : "fetch_failed" },
      502,
    );
  }

  const ogImage = metaContent(pageHtml, "og:image");
  const ogTitle = metaContent(pageHtml, "og:title");
  if (!ogImage) {
    return json({ error: "Couldn't find an image on that pin. Try copying the link straight from the pin's Share button.", code: "no_image_found" }, 422);
  }

  // ---- download the actual image -------------------------------------------
  let imageBytes: Uint8Array;
  let contentType: string;
  try {
    const imgRes = await fetchWithTimeout(ogImage, FETCH_TIMEOUT_MS, { headers: { "User-Agent": UA, Referer: finalUrl } });
    if (!imgRes.ok) {
      return json({ error: "Couldn't download that pin's image.", code: "image_fetch_failed" }, 502);
    }
    contentType = (imgRes.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    const buf = new Uint8Array(await imgRes.arrayBuffer());
    if (buf.byteLength > MAX_IMAGE_BYTES) {
      return json({ error: "That pin's image is too large to use.", code: "image_too_large" }, 413);
    }
    if (!contentType.startsWith("image/")) {
      return json({ error: "That pin doesn't link to a usable image.", code: "bad_image_type" }, 415);
    }
    // Pinterest sometimes serves image/jpg or missing a clean type — normalise to something ALLOWED_TYPES recognises.
    if (!ALLOWED_TYPES.includes(contentType)) contentType = /png/.test(contentType) ? "image/png" : "image/jpeg";
    imageBytes = buf;
  } catch (err) {
    const timedOut = err instanceof Error && err.name === "AbortError";
    return json(
      { error: timedOut ? "That pin's image took too long to download." : "Couldn't download that pin's image.", code: timedOut ? "timeout" : "image_fetch_failed" },
      502,
    );
  }

  // ---- store it under the caller's own path ---------------------------------
  const ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
  const path = `${user.id}/pin-${Date.now()}.${ext}`;
  const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, imageBytes, { contentType });
  if (uploadError) {
    console.error("extract-pin-image: upload failed", uploadError);
    return json({ error: "Couldn't save that image. Please try again.", code: "upload_failed" }, 500);
  }

  return json({ path, title: ogTitle?.trim() || null, sourceUrl: finalUrl });
});
