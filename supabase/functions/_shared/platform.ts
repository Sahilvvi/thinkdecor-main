// Shared by generate-redesign, demo-redesign, create-checkout-session and super-admin.
// Reads the switches the super admin panel writes (app_settings) and records what every
// Gemini attempt cost (generation_events), so the panel shows real spend, not estimates typed in by hand.
//
// All reads are cached for a few seconds so a busy function does not hit the database on every request,
// while a change in the panel still reaches customers within ~10 seconds.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

type Admin = ReturnType<typeof createClient>;

export interface PlatformSettings {
  flags: { demo: boolean; signups: boolean; generation: boolean; checkout: boolean; maintenance: boolean };
  maintenance_text: string;
  ai: {
    model: string;
    fallback: string[];
    beautifier: string;
    kill_switch: boolean;
    daily_cap_gbp: number;
    cap_action: "demo" | "free" | "all";
    spike_pct: number;
    alert_to: string;
    usd_gbp: number;
    free_credits: number;
  };
  demo: { per_ip: number; per_device: number };
  security: { require_2fa: boolean; timeout_min: number; ip_allow: boolean; ips: string[] };
}

export const DEFAULT_SETTINGS: PlatformSettings = {
  flags: { demo: true, signups: true, generation: true, checkout: true, maintenance: false },
  maintenance_text: "Scheduled maintenance is under way. Designs in progress are saved.",
  ai: {
    model: "gemini-3.1-flash-lite-image",
    fallback: ["gemini-3.1-flash-lite-image", "gemini-3.1-flash-image", "gemini-2.5-flash-image"],
    beautifier: "",
    kill_switch: false,
    daily_cap_gbp: 50,
    cap_action: "demo",
    spike_pct: 60,
    alert_to: "",
    usd_gbp: 0.79,
    free_credits: 2,
  },
  demo: { per_ip: 1, per_device: 1 },
  security: { require_2fa: false, timeout_min: 30, ip_allow: false, ips: [] },
};

let settingsCache: { at: number; value: PlatformSettings } | null = null;

/** Every row merged over the defaults, so a missing or half-written setting never breaks generation. */
export async function loadSettings(admin: Admin, maxAgeMs = 8000): Promise<PlatformSettings> {
  if (settingsCache && Date.now() - settingsCache.at < maxAgeMs) return settingsCache.value;
  const value: PlatformSettings = structuredClone(DEFAULT_SETTINGS);
  try {
    const { data } = await admin.from("app_settings").select("key, value");
    for (const row of data ?? []) {
      const v = row.value as Record<string, unknown>;
      if (row.key === "flags") Object.assign(value.flags, v);
      else if (row.key === "maintenance_text" && typeof row.value === "string") value.maintenance_text = row.value;
      else if (row.key === "ai") Object.assign(value.ai, v);
      else if (row.key === "demo") Object.assign(value.demo, v);
      else if (row.key === "security") Object.assign(value.security, v);
    }
  } catch (e) {
    console.error("loadSettings failed, using defaults:", e);
  }
  settingsCache = { at: Date.now(), value };
  return value;
}

export function invalidateSettings() {
  settingsCache = null;
}

/** The image models to try, in order: the live model first, then the fallback order. */
export function imageModels(s: PlatformSettings, envFirst?: string | null): string[] {
  return [...new Set([envFirst ?? "", s.ai.model, ...s.ai.fallback].filter((m) => !!m))];
}

let spendCache: { at: number; value: number } | null = null;

/** Total Gemini spend since 00:00 UTC today, from the per-attempt log. Cached 30s. */
export async function todaySpendGbp(admin: Admin): Promise<number> {
  if (spendCache && Date.now() - spendCache.at < 30_000) return spendCache.value;
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  const { data } = await admin
    .from("generation_events")
    .select("cost_gbp")
    .gte("created_at", since.toISOString())
    .limit(20000);
  const value = (data ?? []).reduce((a, r) => a + Number(r.cost_gbp ?? 0), 0);
  spendCache = { at: Date.now(), value };
  return value;
}

export interface Block {
  code: string;
  message: string;
  status: number;
}

/**
 * Should this request be refused right now? `who` is the kind of caller:
 * "demo" (anonymous homepage demo), "free" (signed-in without a plan), "paid".
 */
export async function generationBlock(admin: Admin, s: PlatformSettings, who: "demo" | "free" | "paid"): Promise<Block | null> {
  if (s.ai.kill_switch) {
    return { code: "paused", message: "Mantha is paused for a few minutes. Please try again shortly.", status: 503 };
  }
  if (who === "demo" && !s.flags.demo) {
    return { code: "demo_off", message: "The free demo is switched off right now. Sign up to try Mantha.", status: 503 };
  }
  if (who !== "demo" && !s.flags.generation) {
    return { code: "paused", message: "Mantha is paused for a few minutes. Please try again shortly.", status: 503 };
  }
  if (s.ai.daily_cap_gbp > 0) {
    const spent = await todaySpendGbp(admin);
    if (spent >= s.ai.daily_cap_gbp) {
      const hit = s.ai.cap_action === "all" ||
        (s.ai.cap_action === "free" && who !== "paid") ||
        (s.ai.cap_action === "demo" && who === "demo");
      if (hit) {
        return { code: "paused", message: "Mantha is very busy today. Please try again tomorrow.", status: 503 };
      }
    }
  }
  return null;
}

interface PriceRow { input_usd_per_m: number; output_usd_per_m: number }
let priceCache: { at: number; map: Map<string, PriceRow> } | null = null;

async function prices(admin: Admin): Promise<Map<string, PriceRow>> {
  if (priceCache && Date.now() - priceCache.at < 60_000) return priceCache.map;
  const map = new Map<string, PriceRow>();
  const { data } = await admin.from("ai_pricing").select("model, input_usd_per_m, output_usd_per_m");
  for (const r of data ?? []) map.set(r.model, { input_usd_per_m: Number(r.input_usd_per_m), output_usd_per_m: Number(r.output_usd_per_m) });
  priceCache = { at: Date.now(), map };
  return map;
}

export function invalidatePrices() {
  priceCache = null;
}

/** Token counts to pounds, using the ai_pricing table and the USD to GBP rate in settings. */
export async function costGbp(admin: Admin, s: PlatformSettings, model: string, inputTokens: number, outputTokens: number): Promise<number> {
  const p = (await prices(admin)).get(model);
  if (!p) return 0;
  const usd = (inputTokens / 1e6) * p.input_usd_per_m + (outputTokens / 1e6) * p.output_usd_per_m;
  return +(usd * s.ai.usd_gbp).toFixed(6);
}

export interface AttemptLog {
  userId?: string | null;
  deviceId?: string | null;
  feature: "redesign" | "cleanup" | "replace" | "demo" | "label";
  model: string | null;
  ok: boolean;
  latencyMs: number;
  inputTokens?: number;
  outputTokens?: number;
  error?: string | null;
  generationId?: string | null;
  fallbackUsed?: boolean;
}

/** Best effort: a logging failure must never break a customer's design. */
export async function logAttempt(admin: Admin, s: PlatformSettings, a: AttemptLog) {
  try {
    const cost = a.model ? await costGbp(admin, s, a.model, a.inputTokens ?? 0, a.outputTokens ?? 0) : 0;
    await admin.from("generation_events").insert({
      user_id: a.userId ?? null,
      device_id: a.deviceId ?? null,
      feature: a.feature,
      model: a.model,
      status: a.ok ? "succeeded" : "failed",
      latency_ms: Math.round(a.latencyMs),
      input_tokens: a.inputTokens ?? null,
      output_tokens: a.outputTokens ?? null,
      cost_gbp: cost,
      error: a.error ? String(a.error).slice(0, 400) : null,
      generation_id: a.generationId ?? null,
      fallback_used: a.fallbackUsed ?? false,
    });
    spendCache = null;
  } catch (e) {
    console.error("logAttempt failed:", e);
  }
}
