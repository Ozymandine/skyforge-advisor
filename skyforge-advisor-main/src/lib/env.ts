// src/lib/env.ts
// Centralized, validated access to server environment.
// Boot-time validation: invalid operator keys are dropped with a warning
// instead of failing silently at request time.

import { z } from "zod";

const uuidKey = z
  .string()
  .trim()
  .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

const envSchema = z.object({
  HYPIXEL_API_KEY: z.string().optional(),
  CF_ACCOUNT_ID: z.string().trim().min(1).optional(),
  CF_KV_NAMESPACE: z.string().trim().min(1).optional(),
  CF_KV_TOKEN: z.string().trim().min(1).optional(),
  SUPABASE_URL: z.string().trim().url().optional(),
  SUPABASE_ANON_KEY: z.string().trim().min(20).optional(),
  PUBLIC_API_ORIGINS: z.string().optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

let cached: AppEnv | null = null;

export function getEnv(): AppEnv {
  if (cached) return cached;
  const parsed = envSchema.safeParse({
    HYPIXEL_API_KEY: process.env["HYPIXEL_API_KEY"],
    CF_ACCOUNT_ID: process.env["CF_ACCOUNT_ID"],
    CF_KV_NAMESPACE: process.env["CF_KV_NAMESPACE"],
    CF_KV_TOKEN: process.env["CF_KV_TOKEN"],
    SUPABASE_URL: process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"],
    SUPABASE_ANON_KEY:
      process.env["SUPABASE_ANON_KEY"] ?? process.env["VITE_SUPABASE_ANON_KEY"],
    PUBLIC_API_ORIGINS: process.env["PUBLIC_API_ORIGINS"],
  });
  if (!parsed.success) {
    console.warn(
      "Invalid environment:",
      parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
    );
    cached = {};
    return cached;
  }
  cached = parsed.data;
  return cached;
}

/** Valid operator keys only — malformed entries are dropped with a warning. */
export function getValidOperatorKeys(): string[] {
  const raw = (getEnv().HYPIXEL_API_KEY ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  const valid = raw.filter((k) => uuidKey.safeParse(k).success);
  if (valid.length !== raw.length) {
    console.warn(
      `Dropped ${raw.length - valid.length} malformed HYPIXEL_API_KEY entr${raw.length - valid.length === 1 ? "y" : "ies"} (expected UUID shape)`,
    );
  }
  return valid;
}

/** For tests: reset the cached env. */
export function __resetEnvCache(): void {
  cached = null;
}

/** Supabase is configured when URL + publishable/anon key are present. */
export function supabaseConfigured(): boolean {
  const env = getEnv();
  return Boolean(env.SUPABASE_URL && env.SUPABASE_ANON_KEY);
}
