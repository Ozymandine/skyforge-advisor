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
  const local = [resolved.src, `/items/${id}.png`, `/items/${name}.png`, `/vanilla/${id}.png`, `/vanilla/${name}.png`].filter(Boolean) as string[];
  const remote = id ? [`https://raw.githubusercontent.com/SkyCryptWebsite/SkyCryptWebsite/main/public/head/${id}`, `https://mc-heads.net/item/${id}`] : [];
  return [...new Set([...local, ...remote])];
}

export function ItemIcon({ id, name, texturePath, enchanted, className, item, debug = false }: ItemIconProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
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
  const [useCanvas, setUseCanvas] = React.useState(false);
  const currentSrc = sources[sourceIndex];

  React.useEffect(() => {
    setSourceIndex(0);
    setStatus("loading");
    setUseCanvas(false);
  }, [sources.join("|")]);

  React.useEffect(() => {
    if (!currentSrc) return;
    let animationFrameId = 0;
    let cancelled = false;

    if (imageCache.get(currentSrc)) {
      setStatus("loaded");
    }

    const image = new Image();
    if (currentSrc.startsWith("http")) image.crossOrigin = "anonymous";
    image.onload = () => {
      if (cancelled) return;
      imageCache.set(currentSrc, true);
      setStatus("loaded");

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) {
        setUseCanvas(false);
        return;
      }

      try {
        ctx.imageSmoothingEnabled = false;

        const frameSize = image.naturalWidth || 16;
        const totalFrames = Math.max(1, Math.floor(image.naturalHeight / frameSize));
        canvas.width = frameSize;
        canvas.height = frameSize;

        let currentFrame = 0;
        let lastTime = performance.now();
        const frameInterval = 100;

        const render = (now: number) => {
          if (cancelled) return;

          if (totalFrames > 1 && now - lastTime >= frameInterval) {
            currentFrame = (currentFrame + 1) % totalFrames;
            lastTime = now;
          }

          ctx.clearRect(0, 0, frameSize, frameSize);
          ctx.drawImage(image, 0, currentFrame * frameSize, frameSize, frameSize, 0, 0, frameSize, frameSize);

          if (totalFrames > 1) {
            animationFrameId = requestAnimationFrame(render);
          }
        };

        setUseCanvas(totalFrames > 1);
        render(performance.now());
      } catch {
        setUseCanvas(false);
      }
    };
    image.onerror = () => {
      if (cancelled) return;
      imageCache.set(currentSrc, false);
      if (sourceIndex + 1 < sources.length) setSourceIndex((index) => index + 1);
      else setStatus("error");
    };
    image.src = currentSrc;

    return () => {
      cancelled = true;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [currentSrc, sourceIndex, sources.length]);

  return (
    <div className={cn("relative inline-flex shrink-0 items-center justify-center overflow-hidden", className)} title={debug && status === "error" ? `Missing Texture\nID: ${resolvedItem.id}\nName: ${resolvedItem.name}\nAttempted: ${sources.join(", ")}` : undefined}>
      {status === "error" || !currentSrc ? (
        <div className="size-full rounded-md border border-border/40 bg-secondary/30 flex items-center justify-center font-mono text-[9px] text-muted-foreground/60">{debug ? "Missing Texture" : "?"}</div>
      ) : (
        <>
          <canvas
            ref={canvasRef}
            aria-label={normalizedName}
            className={cn("size-full object-contain pixelated transition-transform duration-75 hover:scale-110 drop-shadow-sm", (!useCanvas || status === "loading") && "hidden", enchanted && "brightness-125 contrast-125 drop-shadow-[0_0_6px_rgba(168,85,247,0.7)]", className)}
          />
          <img src={currentSrc} alt={normalizedName} loading="lazy" className={cn("size-full object-contain pixelated transition-transform duration-75 hover:scale-110 drop-shadow-sm", (useCanvas || status === "loading") && "hidden", enchanted && "brightness-125 contrast-125 drop-shadow-[0_0_6px_rgba(168,85,247,0.7)]", className)} />
        </>
      )}
    </div>
  );
}
