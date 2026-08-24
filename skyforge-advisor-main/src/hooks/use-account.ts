import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

import { fetchPlayer } from "@/lib/hypixel.functions";
import { recordSnapshot } from "@/lib/history";

const KEY_STORAGE = "sba.apiKey";
const NAME_STORAGE = "sba.username";
const PROFILE_STORAGE = "sba.profileId";

type Account = { apiKey: string; username: string; profileId: string };

const EMPTY: Account = { apiKey: "", username: "", profileId: "" };

const listeners = new Set<() => void>();

function read(): Account {
  if (typeof window === "undefined") return EMPTY;
  return {
    apiKey: localStorage.getItem(KEY_STORAGE) ?? "",
    username: localStorage.getItem(NAME_STORAGE) ?? "",
    profileId: localStorage.getItem(PROFILE_STORAGE) ?? "",
  };
}

/** API key + username stored locally in this browser (never sent anywhere but Hypixel). */
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
    const merged = { ...read(), ...next };
    localStorage.setItem(KEY_STORAGE, merged.apiKey);
    localStorage.setItem(NAME_STORAGE, merged.username);
    localStorage.setItem(PROFILE_STORAGE, merged.profileId);
    listeners.forEach((l) => l());
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem(KEY_STORAGE);
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
    refetchInterval: 5 * 60_000,
    refetchOnWindowFocus: true,
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
