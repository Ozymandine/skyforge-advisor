// src/lib/prefs.ts
// Client preference store: localStorage-backed toggles with a same-tab
// notification event so components can react without prop drilling.

export type PrefKey = "ticker" | "reducedMotion" | "textureFallback";

const KEYS: Record<PrefKey, string> = {
  ticker: "sba.ticker",
  reducedMotion: "sba.reducedMotion",
  textureFallback: "sba.textureFallback",
};

export const PREFS_EVENT = "skyforge-prefs";

export function getPref(key: PrefKey, fallback: boolean): boolean {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(KEYS[key]);
  if (raw === null) return fallback;
  return raw === "1";
}

export function setPref(key: PrefKey, value: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEYS[key], value ? "1" : "0");
  window.dispatchEvent(new CustomEvent(PREFS_EVENT, { detail: key }));
}

/** Subscribe to pref changes (same-tab via custom event, cross-tab via storage). */
export function onPrefsChange(listener: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (Object.values(KEYS).includes(e.key ?? "")) listener();
  };
  window.addEventListener(PREFS_EVENT, listener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(PREFS_EVENT, listener);
    window.removeEventListener("storage", onStorage);
  };
}
