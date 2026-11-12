import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PageHero, Panel } from "@/components/layout/app-shell";
import { Switch } from "@/components/ui/switch";
import { getPref, onPrefsChange, setPref } from "@/lib/prefs";
import {
  accentOptions,
  clockThemes,
  getSceneTheme,
  getTheme,
  onThemeChange,
  setSceneTheme,
  setTheme as setThemeStored,
} from "@/lib/theme";
import { usePlayer, useAccount } from "@/hooks/use-account";
import { formatFull } from "@/lib/skyblock";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — SkyBlock Assistant" },
      {
        name: "description",
        content: "Choose your SkyBlock profile and tune the interface.",
      },
      { property: "og:title", content: "Settings — SkyBlock Assistant" },
      {
        property: "og:description",
        content: "Manage your SkyBlock profile, theme and sync preferences.",
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
  const [textureFallback, setTextureFallback] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [ticker, setTicker] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [scene, setScene] = useState(getSceneTheme);

  useEffect(() => setScene(getSceneTheme()), []);
  useEffect(() => onThemeChange(setTheme), []);

  function updateScene(next: typeof scene) {
    setScene(next);
    setSceneTheme(next);
  }

  useEffect(() => {
    setTextureFallback(getPref("textureFallback", true));
    setReducedMotion(getPref("reducedMotion", false));
    setTicker(getPref("ticker", false));
    setTheme(getTheme());
    return onPrefsChange(() => {
      setTextureFallback(getPref("textureFallback", true));
      setReducedMotion(getPref("reducedMotion", false));
      setTicker(getPref("ticker", false));
    });
  }, []);
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHero title="Settings" />

      <Panel>
        <h2 className="text-xl font-semibold">Hypixel connection</h2>
        <Row
          title="Minecraft username"
          description={account.username || "Choose a profile by username."}
        >
          <div className="flex gap-2">
            <Link
              to="/connect"
              className="rounded-xl bg-primary/15 px-4 py-2 text-sm font-medium text-primary"
            >
              {account.connected ? "Change profile" : "Connect profile"}
            </Link>
            {account.connected && (
              <button
                type="button"
                onClick={account.clear}
                className="rounded-xl border border-border px-4 py-2 text-sm"
              >
                Disconnect
              </button>
            )}
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
            {player.data?.lastSave ? new Date(player.data.lastSave).toLocaleString() : "—"}
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
        <Row title="Theme" description="Choose a time of day.">
          <select
            value={theme}
            aria-label="Theme"
            onChange={(e) => {
              setTheme(e.target.value);
              setThemeStored(e.target.value);
            }}
            className="rounded-xl border border-input bg-secondary/40 px-4 py-2 text-sm outline-none"
          >
            {clockThemes.map(({ id, label }) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
            <option value="solid">Solid night</option>
            <option value="system">System</option>
          </select>
        </Row>
        <Row title="Accent" description="Choose the color for highlights and the home banner.">
          <select
            aria-label="Accent"
            value={scene.accent}
            onChange={(e) =>
              updateScene({ ...scene, accent: e.target.value as typeof scene.accent })
            }
            className="rounded-xl border border-input bg-secondary px-4 py-2 text-sm"
          >
            {accentOptions.map((accent) => (
              <option key={accent} value={accent}>
                {accent}
              </option>
            ))}
          </select>
        </Row>
        <Row title="Panel opacity" description="Control how much scenery shows through the glass.">
          <div className="flex items-center gap-3">
            <input
              aria-label="Panel opacity"
              type="range"
              min={65}
              max={95}
              value={scene.opacity}
              disabled={theme === "solid"}
              onChange={(e) => updateScene({ ...scene, opacity: Number(e.target.value) })}
              className="accent-primary"
            />
            <span className="text-sm tabular-nums">{theme === "solid" ? 100 : scene.opacity}%</span>
          </div>
        </Row>
        <Row title="Scenic background" description="Show the blurred SkyBlock landscape.">
          <Switch
            aria-label="Scenic background"
            checked={scene.scenery}
            onCheckedChange={(scenery) => updateScene({ ...scene, scenery })}
          />
        </Row>
        <Row
          title="Economy ticker"
          description="Show the live market ticker strip at the top of every page."
        >
          <Switch
            checked={ticker}
            onCheckedChange={(v) => {
              setTicker(v);
              setPref("ticker", v);
            }}
          />
        </Row>
        <Row
          title="Texture pack fallback"
          description="Render vanilla textures when a custom pack asset is missing."
        >
          <Switch
            checked={textureFallback}
            onCheckedChange={(v) => {
              setTextureFallback(v);
              setPref("textureFallback", v);
            }}
          />
        </Row>
        <Row title="Reduced motion" description="Disable panel and chart transitions.">
          <Switch
            checked={reducedMotion}
            onCheckedChange={(v) => {
              setReducedMotion(v);
              setPref("reducedMotion", v);
            }}
          />
        </Row>
      </Panel>
    </div>
  );
}
