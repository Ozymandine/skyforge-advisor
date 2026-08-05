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
 * Maps Hypixel SkyBlock Item IDs & Display Names to your exact local /public/items/*.png filenames
 */
const ITEM_ALIASES: Record<string, string> = {
  // Sacks & Utility
  husbandry_sack: "backpack_brown",
  beginner_husbandry_sack: "backpack_brown",
  small_husbandry_sack: "backpack_brown",
  medium_husbandry_sack: "backpack_brown",
  large_husbandry_sack: "backpack_brown",
  gemstone_sack: "backpack_gray",
  sack_of_sacks: "sack_of_sacks",
  gift_compass: "royal_compass",
  skyblock_menu: "skyblock_menu",
  redstone_dust: "redstone_rune",

  // Collections & Specific Items
  lushlilac: "double_plant",
  lush_lilac: "double_plant",
  lilac: "double_plant",
  double_plant: "double_plant",
  end_stone: "endstone",
  endstone: "endstone",
  fig_log: "toil_log",
  figlog: "toil_log",
  lapis_lazuli: "lapis_crystal",
  lapis: "lapis_crystal",
  ink_sack_4: "lapis_crystal",
  slimeball: "compact_ooze",
  slime_ball: "compact_ooze",

  // Weapons & Tools
  aote: "aspect_of_the_end",
  aspect_of_the_end: "aspect_of_the_end",
  aotv: "aspect_of_the_void",
  aspect_of_the_void: "aspect_of_the_void",
  aotd: "aspect_of_the_dragons",
  aspect_of_the_dragons: "aspect_of_the_dragons",
  hyperion: "hyperion",
  valkyrie: "valkyrie",
  scylla: "scylla",
  astraea: "astraea",
  terminator: "terminator",
  juju_shortbow: "juju_shortbow",
  artisanal_shortbow: "artisanal_shortbow",
  dragon_shortbow: "dragon_shortbow",
  livid_dagger: "livid_dagger",
  shadow_fury: "shadow_fury",
  giant_sword: "giant_sword",
  dark_claymore: "dark_claymore",

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
  petrified_oak_slab: "hardened_wood",
  skeleton_talisman: "skeleton_talisman",
  ender_necklace: "ender_monocle",
  tarantula_ring: "tarantula_talisman",
  tarantula_silk: "tarantula_silk",
  arack: "spider_sword",
  primordial_eye: "gazing_pearl",
  shriveled_bracelet: "adaptive_belt",
};

const REFORGES_REGEX = /^(gentle|odd|fast|fair|epic|sharp|heroic|spicy|legendary|dirty|filded|salty|treacherous|deadly|fine|grand|hasty|neat|rapid|unreal|awkward|rich|clean|fierce|heavy|mythic|pure|smart|titanic|wise|bizarre|demonic|forceful|hurtful|keen|strong|unpleasant|zealous|godly|soft|fabled|withered|rebound|very)_/gi;

function getTextureSources(id?: string, name?: string, texturePath?: string): string[] {
  if (texturePath) return [texturePath];

  const rawId = (id || "").toLowerCase().trim();
  const rawName = (name || "").toLowerCase().trim();

  if (!rawId && !rawName) return [];

  // Skill Icons
  const skillKeys = [
    "farming", "mining", "combat", "foraging", "fishing",
    "enchanting", "alchemy", "taming", "carpentry", "runecrafting",
    "social", "hunting"
  ];
  if (skillKeys.includes(rawId)) {
    return [`/items/${rawId}_skill.png`];
  }

  // 1. Clean ID
  let cleanId = rawId
    .replace(REFORGES_REGEX, "")
    .replace(/^(beginner|small|medium|large|large_tier|greater)_/, "")
    .replace(/^enchanted_/, "")
    .replace(/^minecraft:/, "")
    .replace(/[^a-z0-9_]/g, "");

  const mappedId = ITEM_ALIASES[cleanId] || cleanId;

  // 2. Name Slugs
  const baseName = rawName.replace(REFORGES_REGEX, "");
  const slugWithS = baseName.replace(/'/g, "").replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
  const slugNoS = baseName.replace(/'s/g, "").replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
  const baseType = slugNoS.split("_").pop() || "";

  return [
    // 1. Local FurfSky Textures (Primary target folder)
    `/items/${cleanId}.png`,
    `/items/${mappedId}.png`,
    `/items/${slugWithS}.png`,
    `/items/${slugNoS}.png`,

    // 2. Local Vanilla Fallbacks
    `/vanilla/${mappedId}.png`,
    `/vanilla/${cleanId}.png`,
    `/vanilla/${slugNoS}.png`,
    `/vanilla/${baseType}.png`,

    // 3. SkyCrypt Public Heads Repository (Custom Player Skulls)
    `https://raw.githubusercontent.com/SkyCryptWebsite/SkyCryptWebsite/main/public/head/${cleanId}`,

    // 4. External CDN Fallbacks
    `https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/1.20.1/items/${mappedId}.png`,
    `https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/1.20.1/items/${baseType}.png`,
    `https://mc-heads.net/item/${mappedId}`,
  ];
}

export function ItemIcon({ id, name, texturePath, enchanted, className }: ItemIconProps) {
  const [sourceIndex, setSourceIndex] = React.useState(0);
  const [status, setStatus] = React.useState<"loading" | "loaded" | "error">("loading");
  const [useCanvas, setUseCanvas] = React.useState(true);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  const sources = React.useMemo(() => getTextureSources(id, name, texturePath), [id, name, texturePath]);
  
  // Ensure sourceIndex stays bounded if sources array changes
  const currentIndex = Math.min(sourceIndex, sources.length - 1);
  const currentSrc = sources[currentIndex];

  // Reset state when props change
  React.useLayoutEffect(() => {
    setSourceIndex(0);
    setStatus("loading");
    setUseCanvas(true);
  }, [id, name, texturePath]);

  React.useEffect(() => {
    if (!currentSrc) return;

    let animationFrameId: number;
    const img = new Image();

    if (currentSrc.startsWith("http")) {
      img.crossOrigin = "anonymous";
    }

    img.src = currentSrc;

    img.onload = () => {
      setStatus("loaded");

      if (!useCanvas) return;

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
      if (currentIndex + 1 < sources.length) {
        setSourceIndex(currentIndex + 1);
        setUseCanvas(true);
      } else {
        setStatus("error");
      }
    };

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [currentSrc, currentIndex, sources.length, useCanvas]);

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
              if (currentIndex + 1 < sources.length) {
                setSourceIndex(currentIndex + 1);
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