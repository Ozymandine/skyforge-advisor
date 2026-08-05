import * as React from "react";
import { cn } from "@/lib/utils";

interface ItemIconProps {
  id?: string;
  name?: string;
  texturePath?: string;
  enchanted?: boolean;
  className?: string;
}

function getTextureSources(id?: string, name?: string, texturePath?: string): string[] {
  if (texturePath) return [texturePath];

  const raw = (id || name || "").toLowerCase().trim();
  if (!raw) return [];

  const skillKeys = [
    "farming", "mining", "combat", "foraging", "fishing",
    "enchanting", "alchemy", "taming", "carpentry", "runecrafting",
    "social", "hunting"
  ];
  if (skillKeys.includes(raw)) {
    return [`/items/${raw}_skill.png`];
  }

  const cleanId = raw
    .replace(/\s+/g, "_")
    .replace(/^enchanted_/, "")
    .replace(/^minecraft:/, "")
    .replace(/[^a-z0-9_]/g, "");

  return [
    `/items/${cleanId}.png`,
    `https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/1.20.1/items/${cleanId}.png`,
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

      // Disable anti-aliasing for crisp pixelated rendering
      ctx.imageSmoothingEnabled = false;

      const frameSize = img.naturalWidth; // Standard frame size (16px)
      const totalFrames = Math.max(1, Math.floor(img.naturalHeight / frameSize));

      canvas.width = frameSize;
      canvas.height = frameSize;

      let currentFrame = 0;
      let lastTime = performance.now();
      const frameInterval = 100; // 100ms per frame (~10 FPS Minecraft animation speed)

      const render = (now: number) => {
        if (totalFrames > 1 && now - lastTime >= frameInterval) {
          currentFrame = (currentFrame + 1) % totalFrames;
          lastTime = now;
        }

        ctx.clearRect(0, 0, frameSize, frameSize);
        // Crop current frame: sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight
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
      {/* 1. Fallback placeholder if missing */}
      {(status === "error" || !currentSrc) && (
        <div className="size-full rounded-md border border-border/40 bg-secondary/30 shrink-0" />
      )}

      {/* 2. Canvas-rendered Texture */}
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