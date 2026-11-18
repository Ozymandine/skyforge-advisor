import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

import { fetchPlayer } from "@/lib/hypixel.functions";
import { recordSnapshot } from "@/lib/history";
import { usernameSchema } from "@/lib/schemas";
import {
  createDemoProfile,
  DEMO_PROFILE_ID,
  DEMO_SESSION_KEY,
  DEMO_USERNAME,
} from "@/lib/demo-profile";

const NAME_STORAGE = "sba.username";
const PROFILE_STORAGE = "sba.profileId";

type Account = { username: string; profileId: string; demo: boolean };

const EMPTY: Account = { username: "", profileId: "", demo: false };

const listeners = new Set<() => void>();

function read(): Account {
  if (typeof window === "undefined") return EMPTY;
  if (sessionStorage.getItem(DEMO_SESSION_KEY) === "true") {
    return { username: DEMO_USERNAME, profileId: DEMO_PROFILE_ID, demo: true };
  }
  return {
    username: localStorage.getItem(NAME_STORAGE) ?? "",
    profileId: localStorage.getItem(PROFILE_STORAGE) ?? "",
    demo: false,
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

  const save = useCallback((next: Partial<Pick<Account, "username" | "profileId">>) => {
    sessionStorage.removeItem(DEMO_SESSION_KEY);
    const current = read();
    const merged = { ...current, ...next };
    localStorage.setItem(NAME_STORAGE, merged.username);
    localStorage.setItem(PROFILE_STORAGE, merged.profileId);
    listeners.forEach((l) => l());
  }, []);

  const clear = useCallback(() => {
    sessionStorage.removeItem(DEMO_SESSION_KEY);
    localStorage.removeItem(NAME_STORAGE);
    localStorage.removeItem(PROFILE_STORAGE);
    listeners.forEach((l) => l());
  }, []);

  const enterDemo = useCallback(() => {
    sessionStorage.setItem(DEMO_SESSION_KEY, "true");
    listeners.forEach((listener) => listener());
  }, []);

  const exitDemo = useCallback(() => {
    sessionStorage.removeItem(DEMO_SESSION_KEY);
    listeners.forEach((listener) => listener());
  }, []);

  return {
    ...account,
    hydrated,
    connected: hydrated && !!account.username,
    save,
    clear,
    enterDemo,
    exitDemo,
  };
}

export function playerQueryOptions(username: string, profileId = "") {
  const demo = username === DEMO_USERNAME && profileId === DEMO_PROFILE_ID;
  return {
    queryKey: [demo ? "demo-player" : "player", username.toLowerCase(), profileId],
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: false,
    queryFn: async () => {
      if (demo) return createDemoProfile();
      return fetchPlayer({ data: { username, ...(profileId ? { profileId } : {}) } });
    },
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
        !current.demo && current.username.toLowerCase() === parsed.data.toLowerCase()
          ? current.profileId
          : "";
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

/** Live data for the stored account, or the explicitly selected sample profile. */
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
