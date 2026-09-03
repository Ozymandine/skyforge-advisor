import { Link } from "@tanstack/react-router";
import { IconKeyRound, IconLoader2 } from "@/assets/icons";
import type { ReactNode } from "react";

import { Panel } from "@/components/layout/app-shell";

export function ConnectPrompt({ what }: { what: string }) {
  return (
    <Panel className="text-center">
      <div
        aria-hidden="true"
        className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/30"
      >
        <IconKeyRound className="size-5" />
      </div>
      <h2 className="mt-4 text-xl font-semibold">Connect your Hypixel account</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Two steps: your username and a free API key (one click to generate). Takes about 30 seconds
        and unlocks {what}.
      </p>
      <Link
        to="/connect"
        aria-describedby="connect-prompt-detail"
        className="mt-5 inline-flex rounded-xl border border-primary/40 bg-primary/15 px-4 py-2 text-sm font-medium text-primary"
      >
        Connect now
      </Link>
      <p id="connect-prompt-detail" className="sr-only">
        Opens the connect page where you enter your Minecraft username and API key.
      </p>
    </Panel>
  );
}

export function LoadState({ children }: { children: ReactNode }) {
  return (
    <Panel
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-3 py-14 text-sm text-muted-foreground"
    >
      <IconLoader2 className="size-4 animate-spin text-primary" aria-hidden="true" />
      {children}
    </Panel>
  );
}

export function ErrorState({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : "Something went wrong";
  return (
    <Panel role="alert">
      <p className="eyebrow text-destructive">Hypixel API error</p>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
    </Panel>
  );
}
