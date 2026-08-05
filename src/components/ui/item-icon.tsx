import { useState } from "react";
import { cn } from "@/lib/utils";

interface ItemIconProps {
  id?: string;
  name?: string;
  className?: string;
}

/**
 * Normalizes SkyBlock IDs and item names to match FurfSky PNG filenames inside public/items/
 */
function getFurfSkyPath(id?: string, name?: string): string {
  let raw = (id || name || "").toLowerCase().trim();

  // If it's a skill key like "farming", "mining", map to "farming_skill"
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
  if (skillKeys.includes(raw)) {
    raw = `${raw}_skill`;
  }

  // Format to snake_case and strip invalid filename characters
  const cleanId = raw
    .replace(/\s+/g, "_")
    .replace(/^enchanted_/, "")
    .replace(/[^a-z0-9_]/g, "");

  return `/items/${cleanId}.png`;
}

export function ItemIcon({ id, name, className }: ItemIconProps) {
  const [hasError, setHasError] = useState(false);

  const localSrc = getFurfSkyPath(id, name);

  if (hasError) {
    // If the local texture isn't present in FurfSky, display a clean placeholder slot
    return (
      <div
        className={cn(
          "size-7 rounded-md border border-border/40 bg-secondary/30 shrink-0",
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
        // Log exact missing FurfSky file to F12 Console for easy mapping
        console.warn(`[ItemIcon] Missing FurfSky PNG: ${localSrc}`);
        setHasError(true);
      }}
    />
  );
}