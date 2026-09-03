// src/lib/user-store.server.ts
// Per-user persistence backed by Supabase, with graceful fallback to the
// existing global file/KV store when Supabase is not configured.
// owner_id = stable per-browser client id (validated UUID), sent explicitly
// by the browser until Supabase Auth UI lands.

import { z } from "zod";

import {
  getAlertRules as getGlobalAlertRules,
  saveAlertRules as saveGlobalAlertRules,
  type AlertRule,
} from "./market-history.server";
import { getSupabaseServer } from "./supabase";
import { supabaseConfigured } from "./env";

export const ownerIdSchema = z.string().trim().uuid();

function ownerOrNull(ownerId: string): string | null {
  const parsed = ownerIdSchema.safeParse(ownerId);
  return parsed.success ? parsed.data : null;
}

export async function getUserAlertRules(ownerId: string): Promise<AlertRule[]> {
  const owner = ownerOrNull(ownerId);
  if (!owner) return [];
  const sb = getSupabaseServer();
  if (!sb || !supabaseConfigured()) return getGlobalAlertRules();
  try {
    const { data, error } = await sb
      .from("user_alert_rules")
      .select("rule_id,item_id,item_name,direction,threshold")
      .eq("owner_id", owner)
      .limit(100);
    if (error || !data) return getGlobalAlertRules();
    return data.map((r) => ({
      id: String(r.rule_id).slice(0, 128),
      itemId: String(r.item_id).slice(0, 64),
      itemName: String(r.item_name).slice(0, 128),
      direction: r.direction === "above" ? ("above" as const) : ("below" as const),
      threshold: Number(r.threshold) || 0,
    }));
  } catch {
    return getGlobalAlertRules();
  }
}

export async function saveUserAlertRules(
  ownerId: string,
  rules: AlertRule[],
): Promise<{ ok: boolean; persisted: "supabase" | "fallback" }> {
  const owner = ownerOrNull(ownerId);
  if (!owner) return { ok: false, persisted: "fallback" };
  const sb = getSupabaseServer();
  if (!sb || !supabaseConfigured()) {
    saveGlobalAlertRules(rules);
    return { ok: true, persisted: "fallback" };
  }
  try {
    // Replace-all for this owner (rules are small, max 100).
    const { error: delError } = await sb
      .from("user_alert_rules")
      .delete()
      .eq("owner_id", owner);
    if (delError) throw delError;
    if (rules.length) {
      const rows = rules.slice(0, 100).map((r) => ({
        owner_id: owner,
        rule_id: r.id,
        item_id: r.itemId,
        item_name: r.itemName,
        direction: r.direction,
        threshold: r.threshold,
      }));
      const { error: insError } = await sb.from("user_alert_rules").insert(rows);
      if (insError) throw insError;
    }
    return { ok: true, persisted: "supabase" };
  } catch (err) {
    console.warn("Supabase alert save failed, using fallback:", err);
    saveGlobalAlertRules(rules);
    return { ok: true, persisted: "fallback" };
  }
}

export async function getUserWebhookStatus(
  ownerId: string,
): Promise<{ configured: boolean; hint: string | null }> {
  const owner = ownerOrNull(ownerId);
  if (!owner) return { configured: false, hint: null };
  const sb = getSupabaseServer();
  if (!sb || !supabaseConfigured()) {
    // Fallback can't scope per-user — report unconfigured to avoid leaking.
    return { configured: false, hint: null };
  }
  try {
    const { data } = await sb
      .from("user_webhooks")
      .select("url")
      .eq("owner_id", owner)
      .maybeSingle();
    const url = typeof data?.url === "string" ? data.url : null;
    if (!url) return { configured: false, hint: null };
    const tail = url.split("/").slice(-2).join("/");
    return { configured: true, hint: tail ? `…/${tail.slice(-12)}` : null };
  } catch {
    return { configured: false, hint: null };
  }
}

export async function saveUserWebhook(
  ownerId: string,
  url: string,
): Promise<{ ok: boolean; persisted: "supabase" | "fallback" | "none" }> {
  const owner = ownerOrNull(ownerId);
  if (!owner) return { ok: false, persisted: "none" };
  const trimmed = url.trim().slice(0, 500);
  const sb = getSupabaseServer();
  if (!sb || !supabaseConfigured()) return { ok: true, persisted: "none" };
  try {
    if (!trimmed) {
      await sb.from("user_webhooks").delete().eq("owner_id", owner);
      return { ok: true, persisted: "supabase" };
    }
    if (!/^https:\/\/(discord|discordapp)\.com\/api\/webhooks\//.test(trimmed)) {
      return { ok: false, persisted: "none" };
    }
    const { error } = await sb.from("user_webhooks").upsert({
      owner_id: owner,
      url: trimmed,
      failures: 0,
    });
    if (error) throw error;
    return { ok: true, persisted: "supabase" };
  } catch (err) {
    console.warn("Supabase webhook save failed:", err);
    return { ok: false, persisted: "none" };
  }
}
