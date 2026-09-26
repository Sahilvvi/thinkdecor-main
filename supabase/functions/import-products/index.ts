// Pulls real products into the catalog from OpenWeb Ninja's Real-Time
// E-commerce Data API (Google Shopping search, which aggregates Wayfair,
// Amazon, Walmart, Home Depot, Costco and more under one endpoint — see
// supabase/migrations/20260926000000_product_catalog.sql for why).
//
// Deploy:  supabase functions deploy import-products
// Secrets: RAPIDAPI_KEY (RapidAPI key for the "Real-Time E-commerce Data" API)
//          beyond the SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY every project has.
//
// The caller must already hold the admin role — checked here, server-side,
// same pattern as admin-users. Self-contained (no ../_shared import) so it
// also deploys from the Supabase dashboard's function editor.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CATEGORIES = [
  "sofa", "bed", "chair", "coffee_table", "dining_table",
  "lamp", "rug", "storage", "decor", "other",
] as const;

const CURRENCY_BY_COUNTRY: Record<string, string> = { us: "USD", gb: "GBP", ca: "CAD", au: "AUD" };

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

  const rapidApiKey = Deno.env.get("RAPIDAPI_KEY");
  if (!rapidApiKey) {
    return json({ error: "RAPIDAPI_KEY is not configured on the server." }, 500);
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return json({ error: "Please sign in again." }, 401);
  }

  const { data: { user: caller } } = await admin.auth.getUser(authHeader.replace("Bearer ", ""));
  if (!caller) {
    return json({ error: "Please sign in again." }, 401);
  }

  const { data: callerRole } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", caller.id)
    .eq("role", "admin")
    .maybeSingle();

  if (!callerRole) {
    return json({ error: "This account does not have admin access." }, 403);
  }

  let body: { category?: string; query?: string; roomTypes?: string[]; limit?: number; country?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  const category = String(body.category ?? "");
  const query = String(body.query ?? "").trim();
  const roomTypes = Array.isArray(body.roomTypes) ? body.roomTypes.filter((r) => typeof r === "string") : [];
  const limit = Math.min(Math.max(Number(body.limit) || 20, 1), 40);
  const country = (body.country ?? "us").toLowerCase();

  if (!CATEGORIES.includes(category as typeof CATEGORIES[number])) {
    return json({ error: `category must be one of: ${CATEGORIES.join(", ")}` }, 400);
  }
  if (!query) {
    return json({ error: "A search query is required (e.g. \"sofa\")." }, 400);
  }

  const url = new URL("https://real-time-e-commerce-data.p.rapidapi.com/google-shopping/search");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("country", country);

  let apiData: { products?: ShoppingProduct[] };
  try {
    const res = await fetch(url, {
      headers: {
        "X-RapidAPI-Key": rapidApiKey,
        "X-RapidAPI-Host": "real-time-e-commerce-data.p.rapidapi.com",
      },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return json({ error: `Product search failed (${res.status}): ${text.slice(0, 300)}` }, 502);
    }
    const payload = await res.json();
    apiData = payload?.data ?? {};
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Couldn't reach the product search API." }, 502);
  }

  const products = apiData.products ?? [];
  const currency = CURRENCY_BY_COUNTRY[country] ?? "USD";

  const rows = products
    .map((p) => {
      const image = p.product_photos?.[0];
      const name = p.product_title?.trim();
      if (!image || !name || !p.product_id) return null;
      return {
        name,
        category,
        brand: p.store_name ?? null,
        price: parsePrice(p.price),
        currency,
        display_image_url: image,
        composite_image_url: image,
        source_retailer: "google_shopping",
        source_sku: p.product_id,
        source_url: p.product_page_url ?? null,
        room_types: roomTypes,
        active: true,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  if (rows.length === 0) {
    return json({ imported: 0, message: "No usable products came back for that search." });
  }

  // products_source_sku_uniq is a partial unique index (where source_sku is
  // not null), which plain PostgREST upsert can't target via ON CONFLICT —
  // so dedupe by hand instead: drop anything already ingested from this SKU.
  const skus = rows.map((r) => r.source_sku);
  const { data: existing, error: existingErr } = await admin
    .from("products")
    .select("source_sku")
    .eq("source_retailer", "google_shopping")
    .in("source_sku", skus);
  if (existingErr) return json({ error: existingErr.message }, 500);

  const alreadyImported = new Set((existing ?? []).map((r) => r.source_sku));
  const newRows = rows.filter((r) => !alreadyImported.has(r.source_sku));

  if (newRows.length === 0) {
    return json({ imported: 0, message: "Every result from that search is already in the catalog." });
  }

  const { error } = await admin.from("products").insert(newRows);
  if (error) return json({ error: error.message }, 500);

  return json({ imported: newRows.length });
});
