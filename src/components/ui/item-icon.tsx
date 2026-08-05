import * as React from "react";
import { cn } from "@/lib/utils";

interface ItemIconProps {
  id?: string;
  name?: string;
  texturePath?: string;
  enchanted?: boolean;
  className?: string;
}

const ITEM_ALIASES: Record<string, string> = {
  // Utility & Sacks
  gift_compass: "compass",
  skyblock_menu: "nether_star",
  redstone_dust: "redstone",
  husbandry_sack: "husbandry_sack_1",
  gemstone_sack: "gemstone_sack_1",

  // Dragon Fragments
  unstable_fragment: "unstable_dragon_fragment",
  strong_fragment: "strong_dragon_fragment",
  wise_fragment: "wise_dragon_fragment",
  young_fragment: "young_dragon_fragment",
  superior_fragment: "superior_dragon_fragment",
  old_fragment: "old_dragon_fragment",
  protector_fragment: "protector_dragon_fragment",
  holy_fragment: "holy_dragon_fragment",

  // Accessories & Equipment
  petrified_oak_slab: "oak_slab",
  skeleton_talisman: "skeleton_talisman",
  ender_necklace: "ender_necklace",
  tarantula_ring: "tarantula_ring",
  tarantula_silk: "tarantula_silk",
  arack: "arack",
  primordial_eye: "primordial_eye",
};

function getTextureSources(id?: string, name?: string, texturePath?: string): string[] {
  if (texturePath) return [texturePath];

  const rawId = (id || "").toLowerCase().trim();
  const rawName = (name || "").toLowerCase().trim();

  if (!rawId && !rawName) return [];

  // Skills
  const skillKeys = [
    "farming", "mining", "combat", "foraging", "fishing",
    "enchanting", "alchemy", "taming", "carpentry", "runecrafting",
    "social", "hunting"
  ];
  if (skillKeys.includes(rawId)) {
    return [`/items/${rawId}_skill.png`];
  }

  // 1. Clean ID (Strip reforge prefixes & sack tier prefixes like 'beginner_')
  let cleanId = rawId
    .replace(/^(soft|sharp|heavy|heroic|spicy|godly|rapid|fabled|withered|rebound)_/, "")
    .replace(/^(beginner|small|medium|large|large_tier|greater)_/, "")
    .replace(/^enchanted_/, "")
    .replace(/^minecraft:/, "")
    .replace(/[^a-z0-9_]/g, "");

  const mappedId = ITEM_ALIASES[cleanId] || cleanId;

  // 2. Clean Name Variations (Handle apostrophes: "Arachne's" -> "arachne" vs "arachnes")
  const baseName = rawName.replace(/^(soft|sharp|heavy|heroic|spicy|godly|rapid|fabled|withered|rebound)\s+/i, "");
  
  // Variation A: Strip apostrophe ('s -> s)
  const slugWithS = baseName.replace(/'/g, "").replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
  // Variation B: Remove 's completely ('s -> "")
  const slugNoS = baseName.replace(/'s/g, "").replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");

  // Base fallback word (e.g. "Tarantula Ring" -> "ring")
  const baseType = slugNoS.split("_").pop() || "";

  return [
    // FurfSky variants
    `/items/${cleanId}.png`,
    `/items/${mappedId}.png`,
    `/items/${slugWithS}.png`,
    `/items/${slugNoS}.png`,
    
    // Vanilla Local Gallery variants
    `/vanilla/${mappedId}.png`,
    `/vanilla/${cleanId}.png`,
    `/vanilla/${slugNoS}.png`,
    `/vanilla/${baseType}.png`,
    
    // External CDN Fallbacks
    `https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/1.20.1/items/${mappedId}.png`,
    `https://mc-heads.net/item/${mappedId}`,
  ];
}

export function ItemIcon({ id, name, texturePath, enchanted, className }: ItemIconProps) {
  const [sourceIndex, setSourceIndex] = React.useState(0);
  const [status, setStatus] = React.useState<"loading" | "loaded" | "error">("loading");
  const [useCanvas, setUseCanvas] = React.useState(true);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  const sources = React.useMemo(() => getTextureSources(id, name, texturePath), [id, name, texturePath]);
  const currentSrc = sources[sourceIndex];

  React.useEffect(() => {
    setSourceIndex(0);
    setStatus("loading");
    setUseCanvas(true);
  }, [id, name, texturePath]);

  React.useEffect(() => {
    if (!currentSrc || !useCanvas) return;

    let animationFrameId: number;
    const img = new Image();

    if (currentSrc.startsWith("http")) {
      img.crossOrigin = "anonymous";
    }

    img.src = currentSrc;

    img.onload = () => {
      setStatus("loaded");
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      try {
        ctx.imageSmoothingEnabled = false;

        const frameSize = img.naturalWidth || 16;
        const totalFrames = Math.max(1, Math.floor(img.naturalHeight / frameSize));

        canvas.width = frameSize;
        canvas.height = frameSize;

        let currentFrame = 0;
        let lastTime = performance.now();
        const frameInterval = 100;

        const render = (now: number) => {
          if (totalFrames > 1 && now - lastTime >= frameInterval) {
            currentFrame = (currentFrame + 1) % totalFrames;
            lastTime = now;
          }

          ctx.clearRect(0, 0, frameSize, frameSize);
          ctx.drawImage(
            img,
            0,
            currentFrame * frameSize,
            frameSize,
            frameSize,
            0,
            0,
            frameSize,
            frameSize
          );

          if (totalFrames > 1) {
            animationFrameId = requestAnimationFrame(render);
          }
        };

        render(performance.now());
      } catch (err) {
        setUseCanvas(false);
      }
    };

    img.onerror = () => {
      if (sourceIndex + 1 < sources.length) {
        setSourceIndex((prev) => prev + 1);
      } else {
        setStatus("error");
      }
    };

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [currentSrc, sourceIndex, sources.length, useCanvas]);

  return (
    <div className={cn("relative inline-flex shrink-0 items-center justify-center overflow-hidden", className)}>
      {(status === "error" || !currentSrc) && (
        <div className="size-full rounded-md border border-border/40 bg-secondary/30 shrink-0 flex items-center justify-center font-mono text-[9px] text-muted-foreground/60">
          ?
        </div>
      )}

      {currentSrc && status !== "error" && (
        useCanvas ? (
          <canvas
            ref={canvasRef}
            className={cn(
              "size-full object-contain pixelated transition-transform duration-75 hover:scale-110 drop-shadow-sm shrink-0",
              status === "loading" && "opacity-0",
              status === "loaded" && "opacity-100",
              enchanted && "brightness-125 contrast-125 drop-shadow-[0_0_6px_rgba(168,85,247,0.7)]",
              className
            )}
          />
        ) : (
          <img
            src={currentSrc}
            alt={name ?? id ?? "SkyBlock Item"}
            loading="lazy"
            className={cn(
              "size-full object-contain pixelated transition-transform duration-75 hover:scale-110 drop-shadow-sm shrink-0",
              enchanted && "brightness-125 contrast-125 drop-shadow-[0_0_6px_rgba(168,85,247,0.7)]",
              className
            )}
            onLoad={() => setStatus("loaded")}
            onError={() => {
              if (sourceIndex + 1 < sources.length) {
                setSourceIndex((prev) => prev + 1);
                setUseCanvas(true);
              } else {
                setStatus("error");
              }
            }}
          />
        )
      )}
    </div>
  );
}