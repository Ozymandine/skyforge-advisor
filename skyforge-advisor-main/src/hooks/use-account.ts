import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

import { fetchPlayer } from "@/lib/hypixel.functions";
import { recordSnapshot } from "@/lib/history";

const KEY_STORAGE = "sba.apiKey.session";
const NAME_STORAGE = "sba.username";
const PROFILE_STORAGE = "sba.profileId";

type Account = { apiKey: string; username: string; profileId: string };

const EMPTY: Account = { apiKey: "", username: "", profileId: "" };

const listeners = new Set<() => void>();

function readKey(): string {
  if (typeof window === "undefined") return "";
  // API keys live in sessionStorage (per-tab, cleared on close) — never in
  // persistent localStorage — and are only POSTed to first-party server
  // functions that proxy Hypixel. Migrate any legacy localStorage key once.
  try {
    const legacy = localStorage.getItem("sba.apiKey");
    if (legacy) {
      localStorage.removeItem("sba.apiKey");
      if (!sessionStorage.getItem(KEY_STORAGE)) {
        sessionStorage.setItem(KEY_STORAGE, legacy);
      }
    }
  } catch {
    // Storage unavailable (private mode) — fall through.
  }
  try {
    return sessionStorage.getItem(KEY_STORAGE) ?? "";
  } catch {
    return "";
  }
}

function read(): Account {
  if (typeof window === "undefined") return EMPTY;
  return {
    apiKey: readKey(),
    username: localStorage.getItem(NAME_STORAGE) ?? "",
    profileId: localStorage.getItem(PROFILE_STORAGE) ?? "",
  };
}

/** API key is session-scoped; username/profile are local. Key is POSTed only to our own server proxy. */
export function useAccount() {
  const [account, setAccount] = useState<Account>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setAccount(read());
    setHydrated(true);
    const sync = () => setAccount(read());
    listeners.add(sync);
    window.addEventListener("storage", sync);
    return () => {
      listeners.delete(sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const save = useCallback((next: Partial<Account>) => {
    const current = read();
    const merged = { ...current, ...next };
    try {
      if (next.apiKey !== undefined) sessionStorage.setItem(KEY_STORAGE, merged.apiKey);
    } catch {
      // ignore quota/private-mode errors
    }
    localStorage.setItem(NAME_STORAGE, merged.username);
    localStorage.setItem(PROFILE_STORAGE, merged.profileId);
    listeners.forEach((l) => l());
  }, []);

  const clear = useCallback(() => {
    try {
      sessionStorage.removeItem(KEY_STORAGE);
    } catch {
      // ignore
    }
    localStorage.removeItem(NAME_STORAGE);
    localStorage.removeItem(PROFILE_STORAGE);
    listeners.forEach((l) => l());
  }, []);

  return {
    ...account,
    hydrated,
    // Username-only connection: profile data flows via the server's shared
    // key pool when the user hasn't supplied their own API key (BYOK).
    connected: hydrated && !!account.username,
    save,
    clear,
  };
}

/** Live profile data for the stored account. */
export function usePlayer() {
  const { apiKey, username, profileId, connected } = useAccount();

  const query = useQuery({
    queryKey: ["player", username, profileId],
    enabled: connected,
    staleTime: 60_000,
    // Keep the connected profile fresh in the background (Hypixel updates
    // profile data as the player plays; economy pages poll faster).
    // Window-focus refetch OFF: multi-tab focus storms were multiplying
    // shared-pool Hypixel load. Interval polling is enough.
    refetchInterval: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: false,
    queryFn: () =>
      fetchPlayer({
        data: { apiKey, username, ...(profileId ? { profileId } : {}) },
      }),
  });

  // Record a daily local snapshot whenever fresh profile data arrives so the
  // Analytics page can chart real trends over time.
  const data = query.data;
  useEffect(() => {
    if (data) recordSnapshot(data);
  }, [data]);

  return { ...query, connected };
}
