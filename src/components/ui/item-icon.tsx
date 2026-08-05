import * as React from "react";
import { cn } from "@/lib/utils";

interface ItemIconProps {
  id?: string;
  name?: string;
  texturePath?: string;
  enchanted?: boolean;
  className?: string;
}

/**
 * Generates an ordered array of texture sources:
 * 1. Direct/Explicit texturePath or Local FurfSky assets (/items/...)
 * 2. PrismarineJS CDN (Vanilla Minecraft 1.20 textures)
 * 3. MC-Heads CDN fallback
 */
function getTextureSources(id?: string, name?: string, texturePath?: string): string[] {
  if (texturePath) return [texturePath];

  const raw = (id || name || "").toLowerCase().trim();
  if (!raw) return [];

  // Skill mappings
  const skillKeys = [
    "farming", "mining", "combat", "foraging", "fishing",
    "enchanting", "alchemy", "taming", "carpentry", "runecrafting",
    "social", "hunting"
  ];
  if (skillKeys.includes(raw)) {
    return [`/items/${raw}_skill.png`];
  }

  // Clean IDs
  const cleanId = raw
    .replace(/\s+/g, "_")
    .replace(/^enchanted_/, "")
    .replace(/^minecraft:/, "")
    .replace(/[^a-z0-9_]/g, "");

  return [
    // Primary: Local FurfSky PNG in /public/items/
    `/items/${cleanId}.png`,
    // Secondary: PrismarineJS Official Vanilla 1.20 Item Textures
    `https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/1.20.1/items/${cleanId}.png`,
    // Tertiary: MC-Heads Fallback
    `https://mc-heads.net/item/${cleanId}`,
  ];
}

export function ItemIcon({ id, name, texturePath, enchanted, className }: ItemIconProps) {
  const [sourceIndex, setSourceIndex] = React.useState(0);
  const [status, setStatus] = React.useState<"loading" | "loaded" | "error">("loading");

  const sources = React.useMemo(() => getTextureSources(id, name, texturePath), [id, name, texturePath]);
  const currentSrc = sources[sourceIndex];

  // Reset state if inputs change
  React.useEffect(() => {
    setSourceIndex(0);
    setStatus("loading");
  }, [id, name, texturePath]);

  const handleError = () => {
    if (sourceIndex + 1 < sources.length) {
      // Try next CDN fallback in pipeline
      setSourceIndex((prev) => prev + 1);
    } else {
      // Exhausted all sources
      setStatus("error");
    }
  };

  return (
    <div className={cn("relative inline-flex shrink-0 items-center justify-center", className)}>
      {/* 1. Fallback placeholder if all texture sources fail */}
      {(status === "error" || !currentSrc) && (
        <div className="size-full rounded-md border border-border/40 bg-secondary/30 shrink-0" />
      )}

      {/* 2. Dynamic Image Loader */}
      {currentSrc && status !== "error" && (
        <img
          key={currentSrc}
          src={currentSrc}
          alt={name ?? id ?? "SkyBlock Item"}
          loading="lazy"
          className={cn(
            "size-7 object-contain pixelated transition-transform duration-75 hover:scale-110 drop-shadow-sm shrink-0",
            status === "loading" && "opacity-0",
            status === "loaded" && "opacity-100",
            enchanted && "brightness-125 contrast-125 drop-shadow-[0_0_6px_rgba(168,85,247,0.7)]",
            className
          )}
          onLoad={() => setStatus("loaded")}
          onError={handleError}
        />
      )}
    </div>
  );
}