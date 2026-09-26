// Prompt-driven product suggestions: given the free text someone typed in
// Create or Replace ("a green velvet sofa and a jute rug"), figures out
// which catalog categories they're describing, searches the local catalog
// for matches first (free), and — only when a category comes up short —
// tops it up with a live OpenWeb Ninja search (see import-products) so the
// picker never sits empty just because nothing was imported yet.
//
// Deploy:  supabase functions deploy search-products
// Secrets: RAPIDAPI_KEY, plus the SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
//          every project already has.
//
// Any signed-in user can call this (unlike import-products, which is
// admin-only) — it's read-mostly, and the live-search fallback is capped
// hard (one small request per detected category, only when the local
// catalog is thin) to keep it cheap against the free-tier request quota.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Ordered so more specific phrases ("dining table") are checked before the
// generic ones ("table") that would otherwise swallow them.
const CATEGORY_KEYWORDS: [string, string[]][] = [
  ["dining_table", ["dining table", "dining set", "kitchen table"]],
  ["coffee_table", ["coffee table", "side table", "console table"]],
  ["sofa", ["sofa", "couch", "loveseat", "settee", "sectional"]],
  ["bed", ["bed frame", "headboard", " bed", "bed."]],
  ["chair", ["armchair", "accent chair", "recliner", "chair"]],
  ["lamp", ["lamp", "lighting", "light fixture"]],
  ["rug", ["rug", "carpet"]],
  ["storage", ["bookshelf", "bookcase", "shelving", "shelf", "cabinet", "wardrobe", "dresser", "storage"]],
  ["decor", ["vase", "wall art", "artwork", "mirror", "cushion", "curtain", "plant pot", "decor"]],
  ["coffee_table", ["table"]],
];

const MIN_LOCAL_MATCHES = 4;
const LIVE_TOPUP_LIMIT = 6;
const MAX_CATEGORIES = 2;
const MAX_TOTAL_RESULTS = 14;

function detectCategories(promptLower: string): string[] {
  const found: string[] = [];
  for (const [category, keywords] of CATEGORY_KEYWORDS) {
    if (found.includes(category)) continue;
    if (keywords.some((k) => promptLower.includes(k))) found.push(category);
    if (found.length >= MAX_CATEGORIES) break;
  }
  return found;
}

interface ShoppingProduct {
  product_id?: string;
  product_title?: string;
  price?: string;
  product_page_url?: string;
  product_photos?: string[];
  store_name?: string;
}

function parsePrice(price?: string): number | null {
  if (!price) return null;
  const n = Number(price.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
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

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return json({ error: "Please sign in again." }, 401);
  }
  const { data: { user } } = await admin.auth.getUser(authHeader.replace("Bearer ", ""));
  if (!user) return json({ error: "Please sign in again." }, 401);

  let body: { prompt?: string; roomType?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  const promptLower = String(body.prompt ?? "").toLowerCase().trim();
  const roomType = typeof body.roomType === "string" ? body.roomType : undefined;

  if (promptLower.length < 4) return json({ products: [] });

  const categories = detectCategories(promptLower);
  if (categories.length === 0) return json({ products: [] });

  const columns = "id, name, category, brand, price, currency, display_image_url, room_types";
  const all: Record<string, unknown>[] = [];
  const seenIds = new Set<string>();

  const rapidApiKey = Deno.env.get("RAPIDAPI_KEY");

  for (const category of categories) {
    let query = admin.from("products").select(columns).eq("category", category).eq("active", true);
    if (roomType) query = query.contains("room_types", [roomType]);
    const { data: local } = await query.limit(8);
    for (const row of local ?? []) {
      const id = row.id as string;
      if (!seenIds.has(id)) { seenIds.add(id); all.push(row); }
    }

    const localCount = (local ?? []).length;
    if (localCount >= MIN_LOCAL_MATCHES || !rapidApiKey) continue;

    // Thin on that category locally — top it up with one small live search.
    // Use the specific keyword that matched, not the whole freeform prompt,
    // so results stay on-topic (searching the raw sentence returns nothing
    // useful most of the time).
    const keyword = CATEGORY_KEYWORDS.find(([c]) => c === category)?.[1][0]?.trim() ?? category;
    try {
      const url = new URL("https://real-time-e-commerce-data.p.rapidapi.com/google-shopping/search");
      url.searchParams.set("q", keyword);
      url.searchParams.set("limit", String(LIVE_TOPUP_LIMIT));
      url.searchParams.set("country", "us");
      const res = await fetch(url, {
        headers: {
          "X-RapidAPI-Key": rapidApiKey,
          "X-RapidAPI-Host": "real-time-e-commerce-data.p.rapidapi.com",
        },
      });
      if (!res.ok) continue;
      const payload = await res.json();
      const products: ShoppingProduct[] = payload?.data?.products ?? [];

      const skus = products.map((p) => p.product_id).filter((s): s is string => !!s);
      const { data: existing } = skus.length
        ? await admin.from("products").select("id, source_sku").eq("source_retailer", "google_shopping").in("source_sku", skus)
        : { data: [] as { id: string; source_sku: string }[] };
      const existingBySku = new Map((existing ?? []).map((r) => [r.source_sku, r.id]));

      const newRows = products
        .map((p) => {
          const image = p.product_photos?.[0];
          const name = p.product_title?.trim();
          if (!image || !name || !p.product_id || existingBySku.has(p.product_id)) return null;
          return {
            name,
            category,
            brand: p.store_name ?? null,
            price: parsePrice(p.price),
            currency: "USD",
            display_image_url: image,
            composite_image_url: image,
            source_retailer: "google_shopping",
            source_sku: p.product_id,
            source_url: p.product_page_url ?? null,
            room_types: roomType ? [roomType] : [],
            active: true,
          };
        })
        .filter((r): r is NonNullable<typeof r> => r !== null);

      if (newRows.length > 0) {
        const { data: inserted } = await admin.from("products").insert(newRows).select(columns);
        for (const row of inserted ?? []) {
          const id = row.id as string;
          if (!seenIds.has(id)) { seenIds.add(id); all.push(row); }
        }
      }
      // Already-imported matches for this SKU set still count as "found" —
      // pull them in too, since they just weren't tagged for this room yet.
      if (existingBySku.size > 0) {
        const { data: already } = await admin.from("products").select(columns).in("id", [...existingBySku.values()]);
        for (const row of already ?? []) {
          const id = row.id as string;
          if (!seenIds.has(id)) { seenIds.add(id); all.push(row); }
        }
      }
    } catch {
      // A flaky live search shouldn't break the whole suggestion — local
      // results (if any) still come back.
    }
  }

  return json({ products: all.slice(0, MAX_TOTAL_RESULTS) });
});
