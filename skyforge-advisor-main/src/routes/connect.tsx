import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";

import { PageHero, Panel } from "@/components/layout/app-shell";
import { playerQueryOptions, useAccount } from "@/hooks/use-account";
import { usernameSchema } from "@/lib/schemas";

export const Route = createFileRoute("/connect")({
  head: () => ({
    meta: [
      { title: "Connect — SkyForge" },
      {
        name: "description",
        content: "Connect your SkyBlock profile with your Minecraft username.",
      },
    ],
  }),
  component: Connect,
});

function Connect() {
  const account = useAccount();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<string>();
  const [error, setError] = useState<string>();
  const [connecting, setConnecting] = useState(false);

  async function connect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (connecting) return;
    const name = usernameSchema.safeParse(draft ?? account.username);
    if (!name.success) {
      setError(name.error.issues[0]?.message ?? "Enter a Minecraft username.");
      return;
    }
    setConnecting(true);
    setError(undefined);
    try {
      const player = await queryClient.fetchQuery(playerQueryOptions(name.data));
      if (!player) {
        setError("SkyForge couldn't read that SkyBlock profile. Try again.");
        return;
      }
      account.save({ username: name.data, profileId: "" });
      await navigate({ to: "/dashboard" });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load your SkyBlock profile.");
    } finally {
      setConnecting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHero
        eyebrow="SkyBlock"
        title="Connect your profile"
        description="Enter your Minecraft Java username to load your SkyBlock stats, gear, and progression."
      />

      <Panel>
        <form onSubmit={(event) => void connect(event)} className="space-y-4">
          <label htmlFor="connect-username" className="block text-sm font-semibold">
            Minecraft username
          </label>
          <div className="flex flex-wrap gap-3">
            <input
              id="connect-username"
              value={draft ?? account.username}
              onChange={(event) => {
                setDraft(event.target.value);
                setError(undefined);
              }}
              placeholder="e.g. Deathstreeks"
              autoComplete="username"
              autoCapitalize="off"
              spellCheck={false}
              maxLength={16}
              disabled={connecting}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "connect-error" : undefined}
              className="min-w-0 flex-[1_1_14rem] rounded-xl border border-input bg-secondary/60 px-4 py-3 text-base outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={connecting}
              className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground hover:brightness-110 disabled:opacity-60"
            >
              {connecting ? "Loading profile…" : "Connect profile"}
            </button>
          </div>
          {error && (
            <p id="connect-error" role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            Your selection is saved in this browser.{" "}
            <Link to="/about" className="underline underline-offset-2">
              How we handle data
            </Link>
          </p>
        </form>
      </Panel>

      {account.connected && (
        <Panel className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm">Saved profile: {account.username}</p>
          <button
            type="button"
            disabled={connecting}
            onClick={() => {
              account.clear();
              setDraft("");
              setError(undefined);
            }}
            className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Disconnect
          </button>
        </Panel>
      )}
    </div>
  );
}
