// src/routes/connect.tsx
// BYOK connect flow: username first, then a one-click link to Hypixel's
// developer portal (auto-generates a key for logged-in accounts) and an
// inline paste field with live validation. The key is stored only in the
// user's browser.

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ExternalLink, KeyRound, CheckCircle2, AlertCircle } from "lucide-react";

import { PageHero, Panel } from "@/components/layout/app-shell";
import { useAccount, usePlayer } from "@/hooks/use-account";

export const Route = createFileRoute("/connect")({
  head: () => ({
    meta: [
      { title: "Connect — SkyForge" },
      {
        name: "description",
        content:
          "Connect your Hypixel profile: enter your username and paste a free API key. Your key never leaves your browser.",
      },
    ],
  }),
  component: Connect,
});

const GET_KEY_URL = "https://developer.hypixel.net/api-key";

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
    if (!apiKey.trim()) {
      setError("Paste your API key — click the button above to get one in one click.");
      return;
    }
    setConnecting(true);
    // Save and let the next usePlayer query validate the key by loading data.
    account.save({
      username: username.trim(),
      apiKey: apiKey.trim(),
      profileId: "",
    });
    // If the key is bad, usePlayer will surface an error on the dashboard.
    setTimeout(() => {
      setConnecting(false);
      void navigate({ to: "/dashboard" });
    }, 400);
  };

  const keyValidShape = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    apiKey.trim(),
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHero
        eyebrow="Get started"
        title="Connect your profile"
        description="Two steps: your username, then a free API key. Your key is stored only in this browser and sent nowhere except Hypixel."
      />

      <Panel>
        <ol className="space-y-8">
          {/* Step 1 — username */}
          <li className="flex gap-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/15 text-sm font-bold text-primary">
              1
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">Your Minecraft username</p>
              <p className="mt-1 text-xs text-muted-foreground">
                We resolve it to a UUID via Mojang — no key needed for that.
              </p>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. Technoblade"
                className="mt-3 w-full max-w-sm rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary/50"
              />
            </div>
          </li>

          {/* Step 2 — key */}
          <li className="flex gap-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/15 text-sm font-bold text-primary">
              2
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">Get your free API key</p>
              <p className="mt-1 text-xs text-muted-foreground">
                One click — Hypixel's portal auto-generates a key when you're logged in with your
                Minecraft account. Copy it and paste below.
              </p>
              <a
                href={GET_KEY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/15 px-4 py-2.5 text-sm font-medium text-primary transition-all duration-75 ease-out hover:scale-[1.02] hover:bg-primary/25 active:scale-95"
              >
                <KeyRound className="size-4" />
                Get my API key
                <ExternalLink className="size-3.5 opacity-70" />
              </a>

              <div className="mt-4">
                <input
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  type="password"
                  placeholder="Paste your key (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)"
                  className="w-full max-w-md rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-mono text-sm outline-none transition-colors focus:border-primary/50"
                />
                {apiKey.trim() && (
                  <p
                    className={`mt-1.5 flex items-center gap-1.5 text-xs ${
                      keyValidShape ? "text-emerald-400" : "text-amber-400"
                    }`}
                  >
                    {keyValidShape ? (
                      <>
                        <CheckCircle2 className="size-3.5" /> Looks like a valid key format
                      </>
                    ) : (
                      <>
                        <AlertCircle className="size-3.5" /> Keys are UUID-shaped — double-check the
                        copy
                      </>
                    )}
                  </p>
                )}
              </div>
            </div>
          </li>
        </ol>

        {error && (
          <p className="mt-6 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
            <AlertCircle className="size-4" /> {error}
          </p>
        )}

        {player.error && account.connected && (
          <p className="mt-6 flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2.5 text-xs text-amber-300">
            <AlertCircle className="size-4 shrink-0" />
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
            <CheckCircle2 className="size-4" /> Connected as {account.username}
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
