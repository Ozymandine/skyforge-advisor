import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

import { PageHero, Panel } from "@/components/layout/app-shell";
import { useAccount, useConnectPlayer } from "@/hooks/use-account";

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
  const [draft, setDraft] = useState<string>();
  const { connect, connecting, error, clearError } = useConnectPlayer();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await connect(draft ?? account.username)) await navigate({ to: "/dashboard" });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHero title="Connect your profile" />

      <Panel>
        <form onSubmit={(event) => void submit(event)} className="space-y-4">
          <label htmlFor="connect-username" className="block text-sm font-semibold">
            Minecraft username
          </label>
          <div className="flex flex-wrap gap-3">
            <input
              id="connect-username"
              value={draft ?? account.username}
              onChange={(event) => {
                setDraft(event.target.value);
                clearError();
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
              clearError();
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
