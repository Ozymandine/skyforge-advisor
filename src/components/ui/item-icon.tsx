import { useState } from "react";
import { cn } from "@/lib/utils";

interface ItemIconProps {
  id?: string;
  name?: string;
  className?: string;
}

function getFurfSkyPath(id?: string, name?: string): string {
  const raw = (id || name || "").toLowerCase().trim();
  if (!raw) return "";

  // Map skill names/keys (e.g., "farming" or "FARMING" -> "farming_skill")
  const skillKeys = [
    "farming",
    "mining",
    "combat",
    "foraging",
    "fishing",
    "enchanting",
    "alchemy",
    "taming",
    "carpentry",
    "runecrafting",
    "social",
    "hunting",
  ];

  let cleaned = raw;
  if (skillKeys.includes(raw)) {
    cleaned = `${raw}_skill`;
  }

  // Convert to snake_case and strip non-filename characters
  cleaned = cleaned
    .replace(/\s+/g, "_")
    .replace(/^enchanted_/, "")
    .replace(/[^a-z0-9_]/g, "");

  return `/items/${cleaned}.png`;
}

export function ItemIcon({ id, name, className }: ItemIconProps) {
  const [hasError, setHasError] = useState(false);

  const localSrc = getFurfSkyPath(id, name);

  // Debug: Log whenever an ItemIcon renders
  if (!localSrc) {
    console.warn("[ItemIcon] Received empty id AND name props:", { id, name });
    return <div className={cn("size-7 rounded-md bg-secondary/30 shrink-0", className)} />;
  }

  if (hasError) {
    return (
      <div
        className={cn(
          "size-7 rounded-md border border-border/40 bg-secondary/20 shrink-0",
          className
        )}
      />
    );
  }

  return (
    <img
      src={localSrc}
      alt={name ?? id ?? "Item"}
      className={cn(
        "size-7 object-contain pixelated transition-transform duration-75 hover:scale-110 drop-shadow-sm shrink-0",
        className
      )}
      onError={() => {
        console.error(`[ItemIcon 404] File missing in public/items/: ${localSrc} (received id: "${id}", name: "${name}")`);
        setHasError(true);
      }}
    />
  );
}