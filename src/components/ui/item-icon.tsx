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
 * Maps raw Hypixel SkyBlock API IDs to exact texture filenames
 */
const ITEM_ALIASES: Record<string, string> = {
  // Dragon Fragments
  unstable_fragment: "unstable_dragon_fragment",
  strong_fragment: "strong_dragon_fragment",
  wise_fragment: "wise_dragon_fragment",
  young_fragment: "young_dragon_fragment",
  superior_fragment: "superior_dragon_fragment",
  old_fragment: "old_dragon_fragment",
  protector_fragment: "protector_dragon_fragment",
  holy_fragment: "holy_dragon_fragment",
  
  // Custom Skull / Head items mapped to vanilla or custom assets
  petrified_oak_slab: "oak_slab",
  skull_item: "skeleton_skull",
  
  // Common SkyBlock Material Re-mappings
  whipped_form: "whipped_cream",
  exp_bottle: "experience_bottle",
};

function getTextureSources(id?: string, name?: string, texturePath?: string): string[] {
  if (texturePath) return [texturePath];

  const rawId = (id || "").toLowerCase().trim();
  const rawName = (name || "").toLowerCase().trim();

  if (!rawId && !rawName) return [];

  // Skill Mappings
  const skillKeys = [
    "farming", "mining", "combat", "foraging", "fishing",
    "enchanting", "alchemy", "taming", "carpentry", "runecrafting",
    "social", "hunting"
  ];
  if (skillKeys.includes(rawId)) {
    return [`/items/${rawId}_skill.png`];
  }

  // Clean the ID
  let cleanId = rawId
    .replace(/^enchanted_/, "")
    .replace(/^minecraft:/, "")
    .replace(/[^a-z0-9_]/g, "");

  // Apply Alias Mapping if present
  if (ITEM_ALIASES[cleanId]) {
    cleanId = ITEM_ALIASES[cleanId];
  }

  // Fallback slug from name if ID is generic
  const nameSlug = rawName.replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");

  return [
    // 1. Primary: Local FurfSky asset by clean ID
    `/items/${cleanId}.png`,
    // 2. Primary Alt: Local FurfSky asset by display name slug
    `/items/${nameSlug}.png`,
    // 3. SkyArchive Public Asset CDN (Coverage for custom SkyBlock heads/items)
    `https://raw.githubusercontent.com/SkyCryptWebsite/SkyCryptWebsite/main/public/head/${rawId}`,
    // 4. PrismarineJS Official Vanilla 1.20 Minecraft Textures
    `https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/1.20.1/items/${cleanId}.png`,
    // 5. MC-Heads Fallback
    `https://mc-heads.net/item/${cleanId}`,
  ];
}

export function ItemIcon({ id, name, texturePath, enchanted, className }: ItemIconProps) {
  const [sourceIndex, setSourceIndex] = React.useState(0);
  const [status, setStatus] = React.useState<"loading" | "loaded" | "error">("loading");
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  const sources = React.useMemo(() => getTextureSources(id, name, texturePath), [id, name, texturePath]);
  const currentSrc = sources[sourceIndex];

  React.useEffect(() => {
    setSourceIndex(0);
    setStatus("loading");
  }, [id, name, texturePath]);

  React.useEffect(() => {
    if (!currentSrc) return;

    let animationFrameId: number;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = currentSrc;

    img.onload = () => {
      setStatus("loaded");
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.imageSmoothingEnabled = false;

      const frameSize = img.naturalWidth;
      const totalFrames = Math.max(1, Math.floor(img.naturalHeight / frameSize));

      canvas.width = frameSize;
      canvas.height = frameSize;

      let currentFrame = 0;
      let lastTime = performance.now();
      const frameInterval = 100; // ~10 FPS native Minecraft sprite animation

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
  }, [currentSrc, sourceIndex, sources.length]);

  return (
    <div className={cn("relative inline-flex shrink-0 items-center justify-center overflow-hidden", className)}>
      {(status === "error" || !currentSrc) && (
        <div className="size-full rounded-md border border-border/40 bg-secondary/30 shrink-0 flex items-center justify-center font-mono text-[9px] text-muted-foreground/60">
          ?
        </div>
      )}

      {currentSrc && status !== "error" && (
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
      )}
    </div>
  );
}