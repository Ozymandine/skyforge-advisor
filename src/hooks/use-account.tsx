// src/hooks/use-account.tsx
import { useState, useEffect, createContext, useContext } from "react";
import { fetchPlayer } from "@/lib/hypixel.functions";

interface AccountContextType {
  username: string;
  profileId: string;
  data: any;
  loading: boolean;
  error: string | null;
  hydrated: boolean;
  connected: boolean;
  setUsername: (name: string) => void;
  save: (payload: { username: string; profileId?: string }) => void;
  clear: () => void;
  refresh: () => void;
  refetch: () => void;
  isFetching: boolean;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

const STORAGE_USER = "skyblock_user";
const STORAGE_PROFILE = "skyblock_profile_id";

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsernameState] = useState("");
  const [profileId, setProfileIdState] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setUsernameState(localStorage.getItem(STORAGE_USER) || "");
    setProfileIdState(localStorage.getItem(STORAGE_PROFILE) || "");
    setHydrated(true);
  }, []);

  const setUsername = (name: string) => {
    localStorage.setItem(STORAGE_USER, name);
    setUsernameState(name);
  };

  const clear = () => {
    localStorage.removeItem(STORAGE_USER);
    localStorage.removeItem(STORAGE_PROFILE);
    setUsernameState("");
    setProfileIdState("");
    setData(null);
    setError(null);
  };

  const loadData = async (override?: { username: string; profileId: string }) => {
    const currentUsername = override?.username ?? username;
    const currentProfileId = override?.profileId ?? profileId;

    if (!currentUsername) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetchPlayer({
        username: currentUsername,
        profileId: currentProfileId || undefined,
      });
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch profile");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const save = ({
    username: newUsername,
    profileId: newProfileId = "",
  }: {
    username: string;
    profileId?: string;
  }) => {
    localStorage.setItem(STORAGE_USER, newUsername);
    localStorage.setItem(STORAGE_PROFILE, newProfileId);
    setUsernameState(newUsername);
    setProfileIdState(newProfileId);
    loadData({ username: newUsername, profileId: newProfileId });
  };

  useEffect(() => {
    if (!hydrated) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, profileId, hydrated]);

  return (
    <AccountContext.Provider
      value={{
        username,
        profileId,
        data,
        loading,
        error,
        hydrated,
        connected: Boolean(data),
        setUsername,
        save,
        clear,
        refresh: loadData,
        refetch: loadData,
        isFetching: loading,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error("useAccount must be used within an AccountProvider");
  }
  return context;
}

export function usePlayer() {
  return useAccount();
}