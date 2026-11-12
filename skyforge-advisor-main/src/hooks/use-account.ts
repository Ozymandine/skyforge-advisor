import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

import { fetchPlayer } from "@/lib/hypixel.functions";
import { recordSnapshot } from "@/lib/history";
import { usernameSchema } from "@/lib/schemas";

const NAME_STORAGE = "sba.username";
const PROFILE_STORAGE = "sba.profileId";

type Account = { username: string; profileId: string };

const EMPTY: Account = { username: "", profileId: "" };

const listeners = new Set<() => void>();

function read(): Account {
  if (typeof window === "undefined") return EMPTY;
  return {
    username: localStorage.getItem(NAME_STORAGE) ?? "",
    profileId: localStorage.getItem(PROFILE_STORAGE) ?? "",
  };
}

export function useAccount() {
  const [account, setAccount] = useState<Account>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      localStorage.removeItem("sba.apiKey");
      sessionStorage.removeItem("sba.apiKey.session");
    } catch {
      // Storage may be restricted by the browser.
    }
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
    localStorage.setItem(NAME_STORAGE, merged.username);
    localStorage.setItem(PROFILE_STORAGE, merged.profileId);
    listeners.forEach((l) => l());
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem(NAME_STORAGE);
    localStorage.removeItem(PROFILE_STORAGE);
    listeners.forEach((l) => l());
  }, []);

  return {
    ...account,
    hydrated,
    connected: hydrated && !!account.username,
    save,
    clear,
  };
}

export function playerQueryOptions(username: string, profileId = "") {
  return {
    queryKey: ["player", username.toLowerCase(), profileId],
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: false,
    queryFn: () => fetchPlayer({ data: { username, ...(profileId ? { profileId } : {}) } }),
  };
}

export function useConnectPlayer() {
  const queryClient = useQueryClient();
  const { save } = useAccount();
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string>();

  async function connect(username: string) {
    if (connecting) return null;
    const parsed = usernameSchema.safeParse(username);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a Minecraft username.");
      return null;
    }
    setConnecting(true);
    setError(undefined);
    try {
      const current = read();
      const profileId =
        current.username.toLowerCase() === parsed.data.toLowerCase() ? current.profileId : "";
      const player = await queryClient.fetchQuery(playerQueryOptions(parsed.data, profileId));
      if (!player) {
        setError("SkyForge couldn't read that SkyBlock profile. Try again.");
        return null;
      }
      queryClient.setQueryData(playerQueryOptions(player.username, profileId).queryKey, player);
      save({ username: player.username, profileId });
      return player;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load your SkyBlock profile.");
      return null;
    } finally {
      setConnecting(false);
    }
  }

  return { connect, connecting, error, clearError: () => setError(undefined) };
}

/** Live profile data for the stored account. */
export function usePlayer() {
  const { username, profileId, connected } = useAccount();
  const query = useQuery({ ...playerQueryOptions(username, profileId), enabled: connected });

  // Record a daily local snapshot whenever fresh profile data arrives so the
  // Analytics page can chart real trends over time.
  const data = query.data;
  useEffect(() => {
    if (data) recordSnapshot(data);
  }, [data]);

  return { ...query, connected };
}
