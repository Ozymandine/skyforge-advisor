import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PageHero, Panel } from "@/components/layout/app-shell";
import { Switch } from "@/components/ui/switch";
import { usePlayer, useAccount } from "@/hooks/use-account";
import { formatFull } from "@/lib/skyblock";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — SkyBlock Assistant" },
      {
        name: "description",
        content: "Connect your Hypixel API key, pick a profile and tune the interface.",
      },
      { property: "og:title", content: "Settings — SkyBlock Assistant" },
      {
        property: "og:description",
        content: "Manage your Hypixel API key, theme and sync preferences.",
      },
    ],
  }),
  component: Settings,
});

function Row({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border py-5 last:border-0">
      <div className="max-w-md">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

function Settings() {
  const account = useAccount();
  const player = usePlayer();
  const [key, setKey] = useState("");
  const [name, setName] = useState("");
  const [textureFallback, setTextureFallback] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (account.hydrated) {
      setKey(account.apiKey);
      setName(account.username);
    }
  }, [account.hydrated, account.apiKey, account.username]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHero
        eyebrow="Profile"
        title="Settings"
        description="Connect the Hypixel API, choose your SkyBlock profile and tune the interface."
      />

      <Panel>
        <h2 className="text-xl font-semibold">Hypixel connection</h2>
        <p className="mt-2 text-xs text-muted-foreground">
          Generate a key with <span className="font-mono">/api new</span> on mc.hypixel.net, or at
          developer.hypixel.net. It is stored only in this browser and used to call Hypixel
          directly.
        </p>
        <Row title="Minecraft username" description="The account whose profiles will be loaded.">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Steve"
            className="w-64 rounded-xl border border-input bg-secondary/40 px-4 py-2 text-sm outline-none"
          />
        </Row>
        <Row title="Hypixel API key" description="Used for live profile, skills and inventory data.">
          <input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            type="password"
            placeholder="00000000-0000-0000-0000-000000000000"
            className="w-64 rounded-xl border border-input bg-secondary/40 px-4 py-2 font-mono text-sm outline-none"
          />
        </Row>
        <Row title="Save connection" description="Validates the key by loading your profile.">
          <div className="flex gap-2">
            <button
              onClick={() => account.save({ apiKey: key, username: name, profileId: "" })}
              className="rounded-xl border border-primary/40 bg-primary/15 px-4 py-2 text-sm font-medium text-primary"
            >
              Connect
            </button>
            <button
              onClick={() => {
                account.clear();
                setKey("");
                setName("");
              }}
              className="rounded-xl border border-border bg-secondary/40 px-4 py-2 text-sm"
            >
              Disconnect
            </button>
          </div>
        </Row>
        <Row
          title="Connection status"
          description={
            player.error instanceof Error
              ? player.error.message
              : account.connected
                ? "Live data is flowing from the Hypixel API."
                : "Not connected — pages fall back to a connect prompt."
          }
        >
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <span
              className={`size-1.5 rounded-full ${
                player.data ? "bg-primary" : player.error ? "bg-destructive" : "bg-muted-foreground"
              }`}
            />
            {player.isFetching ? "Syncing…" : player.data ? "Connected" : "Offline"}
          </span>
        </Row>
      </Panel>

      <Panel>
        <h2 className="text-xl font-semibold">Profile sync</h2>
        <Row title="Active profile" description="Which SkyBlock profile the app reads from.">
          <select
            value={account.profileId || player.data?.activeProfileId || ""}
            onChange={(e) => account.save({ profileId: e.target.value })}
            disabled={!player.data}
            className="rounded-xl border border-input bg-secondary/40 px-4 py-2 text-sm outline-none"
          >
            {(player.data?.profiles ?? []).map((p) => (
              <option key={p.profileId} value={p.profileId}>
                {p.cuteName} · {p.gameMode} · {p.members} member{p.members > 1 ? "s" : ""}
              </option>
            ))}
            {!player.data && <option value="">Connect to list profiles</option>}
          </select>
        </Row>
        <Row
          title="Last save"
          description={
            player.data ? `${player.data.username} · ${player.data.uuid}` : "No profile loaded"
          }
        >
          <span className="text-sm text-muted-foreground">
            {player.data?.lastSave
              ? new Date(player.data.lastSave).toLocaleString()
              : "—"}
          </span>
        </Row>
        <Row title="Purse & bank" description="Coins currently held on this profile.">
          <span className="font-mono text-sm text-muted-foreground">
            {player.data
              ? `${formatFull(player.data.purse)} · ${
                  player.data.bank === null ? "bank hidden" : formatFull(player.data.bank)
                }`
              : "—"}
          </span>
        </Row>
      </Panel>

      <Panel>
        <h2 className="text-xl font-semibold">Appearance</h2>
        <Row title="Theme" description="Dark glass is the default and only tuned theme.">
          <select className="rounded-xl border border-input bg-secondary/40 px-4 py-2 text-sm outline-none">
            <option>Dark glass</option>
            <option>Dark solid</option>
            <option>System</option>
          </select>
        </Row>
        <Row
          title="Texture pack fallback"
          description="Render vanilla textures when a custom pack asset is missing."
        >
          <Switch checked={textureFallback} onCheckedChange={setTextureFallback} />
        </Row>
        <Row title="Reduced motion" description="Disable panel and chart transitions.">
          <Switch checked={reducedMotion} onCheckedChange={setReducedMotion} />
        </Row>
      </Panel>
    </div>
  );
}
