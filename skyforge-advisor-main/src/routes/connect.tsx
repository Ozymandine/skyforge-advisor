// src/routes/connect.tsx
// BYOK connect flow: username first, then a one-click link to Hypixel's
// developer portal (auto-generates a key for logged-in accounts) and an
// inline paste field with live validation. The key is kept in this browser's
// session storage and sent only to our own server proxy for Hypixel calls.

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { IconExternalLink, IconKeyRound, IconCheckCircle2, IconAlertCircle } from "@/assets/icons";

import { PageHero, Panel } from "@/components/layout/app-shell";
import { useAccount, usePlayer } from "@/hooks/use-account";
import { DEVELOPER_DASHBOARD_URL } from "@/lib/constants";

export const Route = createFileRoute("/connect")({
  head: () => ({
    meta: [
      { title: "Connect — SkyForge" },
      {
        name: "description",
        content:
          "Connect your Hypixel profile: enter your username and optionally paste your own API key (BYOK). Your key stays in this browser's session and is sent only to our server to call Hypixel.",
      },
    ],
  }),
  component: Connect,
});

const GET_KEY_URL = DEVELOPER_DASHBOARD_URL;

function Connect() {
  const account = useAccount();
  const player = usePlayer();
  const navigate = useNavigate();

  const [username, setUsername] = useState(account.username);
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const connect = () => {
    setError(null);
    if (!username.trim()) {
      setError("Enter your Minecraft username first.");
      return;
    }
    setConnecting(true);
    // Save account state: if apiKey is blank, the server operator key pool is used.
    account.save({
      username: username.trim(),
      apiKey: apiKey.trim(),
      profileId: "",
    });
    setTimeout(() => {
      setConnecting(false);
      void navigate({ to: "/dashboard" });
    }, 300);
  };

  const keyValidShape = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    apiKey.trim(),
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHero
        eyebrow="Get started"
        title="Connect your profile"
        description="Enter your Minecraft username to instantly load your live SkyBlock profile, net worth, skills, and gear."
      />

      <Panel>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-foreground">
              Minecraft Username
            </label>
            <p className="mt-1 text-xs text-muted-foreground">
              Resolved instantly via Mojang's public API — zero password or login required.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") connect();
                }}
                placeholder="e.g. Technoblade, Deathstreeks..."
                className="w-full max-w-md rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base outline-none transition-colors focus:border-primary/50"
              />
              <button
                onClick={connect}
                disabled={connecting}
                className="rounded-xl border border-primary/40 bg-primary/20 px-6 py-3 text-sm font-semibold text-primary transition-all duration-75 ease-out hover:scale-[1.02] hover:bg-primary/30 active:scale-95 disabled:opacity-50"
              >
                {connecting ? "Connecting…" : "View Profile"}
              </button>
            </div>
          </div>

          {/* Advanced BYOK accordion */}
          <details className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground">
              Advanced: Use a custom Hypixel API key (Optional)
            </summary>
            <div className="mt-4 space-y-3 pt-2">
              <p className="text-xs text-muted-foreground">
                By default, requests are routed through the server's shared key pool. If you have
                your own registered application key from{" "}
                <a
                  href={GET_KEY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:opacity-80"
                >
                  developer.hypixel.net
                </a>
                , you can paste it here.
              </p>
              <input
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                type="password"
                placeholder="Paste optional private key"
                className="w-full max-w-md rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-mono text-xs outline-none transition-colors focus:border-primary/50"
              />
              {apiKey.trim() && (
                <p
                  className={`flex items-center gap-1.5 text-xs ${
                    keyValidShape ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {keyValidShape ? (
                    <>
                      <IconCheckCircle2 className="size-3.5" /> Valid key shape
                    </>
                  ) : (
                    <>
                      <IconAlertCircle className="size-3.5" /> Keys are UUID-shaped — check
                      formatting
                    </>
                  )}
                </p>
              )}
            </div>
          </details>
        </div>

        {error && (
          <p className="mt-6 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
            <IconAlertCircle className="size-4" /> {error}
          </p>
        )}

        {player.error && account.connected && (
          <p className="mt-6 flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2.5 text-xs text-amber-300">
            <IconAlertCircle className="size-4 shrink-0" />
            Last attempt failed: {(player.error as Error).message} — double-check the key or
            generate a new one.
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            onClick={connect}
            disabled={connecting}
            className="rounded-xl border border-primary/40 bg-primary/15 px-6 py-2.5 text-sm font-semibold text-primary transition-all duration-75 ease-out hover:scale-[1.02] hover:bg-primary/25 active:scale-95 disabled:opacity-50"
          >
            {connecting ? "Connecting…" : "Connect & view my dashboard"}
          </button>

          <p className="text-[11px] text-muted-foreground">
            Your key is stored in this browser's localStorage and used only to call the Hypixel API.{" "}
            <a href="/about" className="underline underline-offset-2 hover:text-foreground">
              How we handle data
            </a>
          </p>
        </div>
      </Panel>

      {account.connected && (
        <Panel className="border-emerald-500/30 bg-emerald-500/5">
          <p className="flex items-center gap-2 text-sm font-medium text-emerald-300">
            <IconCheckCircle2 className="size-4" /> Connected as {account.username}
          </p>
          <button
            onClick={() => {
              account.clear();
              setApiKey("");
              setUsername("");
            }}
            className="mt-3 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Disconnect and clear stored data
          </button>
        </Panel>
      )}
    </div>
  );
}
