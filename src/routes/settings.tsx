import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { PageHero, Panel } from "@/components/layout/app-shell";
import { Switch } from "@/components/ui/switch";
import { profile, profiles } from "@/data/mock";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — SkyBlock Assistant" },
      {
        name: "description",
        content: "API key management, theme adjustments, texture fallbacks and profile sync.",
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
  const [apiKey, setApiKey] = useState("d4f1-••••-••••-9c21");
  const [autoSync, setAutoSync] = useState(true);
  const [textureFallback, setTextureFallback] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [active, setActive] = useState(profile.profileName);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHero
        eyebrow="Profile"
        title="Settings"
        description="Manage your API access, appearance, texture fallbacks and profile syncing."
      />

      <Panel>
        <h2 className="text-xl font-semibold">API access</h2>
        <Row title="Hypixel API key" description="Used for live profile, bazaar and auction data.">
          <input
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-64 rounded-xl border border-input bg-secondary/40 px-4 py-2 font-mono text-sm outline-none"
          />
        </Row>
        <Row title="Auto refresh" description="Re-fetch profile data every 60 seconds.">
          <Switch checked={autoSync} onCheckedChange={setAutoSync} />
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

      <Panel>
        <h2 className="text-xl font-semibold">Profile sync</h2>
        <Row title="Active profile" description="Which SkyBlock profile the app reads from.">
          <select
            value={active}
            onChange={(e) => setActive(e.target.value)}
            className="rounded-xl border border-input bg-secondary/40 px-4 py-2 text-sm outline-none"
          >
            {profiles.map((p) => (
              <option key={p.name}>{p.name}</option>
            ))}
          </select>
        </Row>
        <Row title="Last sync" description={`${profile.username} · ${active}`}>
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" />
            {profile.syncedAt}
          </span>
        </Row>
      </Panel>
    </div>
  );
}
