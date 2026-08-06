import * as React from "react";
import { cn } from "@/lib/utils";
import { resolveItemTexture, normalizeItemKey } from "@/lib/items/resolver";
import type { SkyBlockItem } from "@/lib/items/types";

interface ItemIconProps {
  id?: string;
  name?: string;
  texturePath?: string;
  enchanted?: boolean;
  className?: string;
  item?: SkyBlockItem;
  debug?: boolean;
}

const imageCache = new Map<string, boolean>();
const skills = new Set(["farming", "mining", "combat", "foraging", "fishing", "enchanting", "alchemy", "taming", "carpentry", "runecrafting", "social", "hunting"]);

function sourcesFor(item: SkyBlockItem): string[] {
  const resolved = resolveItemTexture(item);
  const id = normalizeItemKey(item.id);
  const name = normalizeItemKey(item.name);
  const alias = resolved.src?.startsWith("/items/") ? resolved.src : undefined;
  const local = [alias, `/items/${id}.png`, `/items/${name}.png`, `/vanilla/${id}.png`, `/vanilla/${name}.png`].filter(Boolean) as string[];
  const remote = id ? [`https://raw.githubusercontent.com/SkyCryptWebsite/SkyCryptWebsite/main/public/head/${id}`, `https://mc-heads.net/item/${id}`] : [];
  return [...new Set([...local, ...remote])];
}

export function ItemIcon({ id, name, texturePath, enchanted, className, item, debug = false }: ItemIconProps) {
  const normalizedId = normalizeItemKey(item?.id ?? id ?? "");
  const normalizedName = item?.name ?? name ?? id ?? "SkyBlock Item";
  const resolvedItem: SkyBlockItem = item ?? {
    id: normalizedId,
    name: normalizedName,
    ...(texturePath ? { texture: texturePath } : {}),
    ...(enchanted !== undefined ? { enchanted } : {}),
  };
  const sources = React.useMemo(() => {
    if (skills.has(normalizedId)) return [`/items/${normalizedId}_skill.png`];
    return sourcesFor(resolvedItem);
  }, [normalizedId, normalizedName, texturePath, item?.id, item?.name, item?.texture]);
  const [sourceIndex, setSourceIndex] = React.useState(0);
  const [status, setStatus] = React.useState<"loading" | "loaded" | "error">("loading");
  const currentSrc = sources[sourceIndex];

  React.useEffect(() => {
    setSourceIndex(0);
    setStatus("loading");
  }, [sources.join("|")]);

  React.useEffect(() => {
    if (!currentSrc) return;
    if (imageCache.get(currentSrc)) {
      setStatus("loaded");
      return;
    }
    const image = new Image();
    if (currentSrc.startsWith("http")) image.crossOrigin = "anonymous";
    image.onload = () => {
      imageCache.set(currentSrc, true);
      setStatus("loaded");
    };
    image.onerror = () => {
      imageCache.set(currentSrc, false);
      if (sourceIndex + 1 < sources.length) setSourceIndex((index) => index + 1);
      else setStatus("error");
    };
    image.src = currentSrc;
  }, [currentSrc, sourceIndex, sources.length]);

  return (
    <div className={cn("relative inline-flex shrink-0 items-center justify-center overflow-hidden", className)} title={debug && status === "error" ? `Missing Texture\nID: ${resolvedItem.id}\nName: ${resolvedItem.name}\nAttempted: ${sources.join(", ")}` : undefined}>
      {status === "error" || !currentSrc ? (
        <div className="size-full rounded-md border border-border/40 bg-secondary/30 flex items-center justify-center font-mono text-[9px] text-muted-foreground/60">{debug ? "Missing Texture" : "?"}</div>
      ) : (
        <img src={currentSrc} alt={normalizedName} loading="lazy" className={cn("size-full object-contain pixelated transition-transform duration-75 hover:scale-110 drop-shadow-sm", status === "loading" && "opacity-0", enchanted && "brightness-125 contrast-125 drop-shadow-[0_0_6px_rgba(168,85,247,0.7)]", className)} />
      )}
    </div>
  );
}
