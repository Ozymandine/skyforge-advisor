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
const skills = new Set([
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
]);

function sourcesFor(item: SkyBlockItem): string[] {
  const resolved = resolveItemTexture(item);
  const local = [resolved.src, ...(resolved.candidates ?? []), "/vanilla/barrier.png"].filter(
    Boolean,
  ) as string[];
  return [...new Set(local.filter((src) => !src.startsWith("http")))];
}

function sheetInfo(
  src: string,
  image: HTMLImageElement,
): { frameSize: number; columns: number; rows: number } | null {
  if (!src.startsWith("/items/") || src.includes("_model")) return null;
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  if (width >= 8 && width <= 64 && height > width && height % width === 0 && height / width <= 32)
    return { frameSize: width, columns: 1, rows: height / width };
  if (height >= 8 && height <= 64 && width > height && width % height === 0 && width / height <= 32)
    return { frameSize: height, columns: width / height, rows: 1 };
  if (width === height && width >= 64 && width % 16 === 0 && width / 16 >= 4)
    return { frameSize: 16, columns: width / 16, rows: height / 16 };
  return null;
}

function shouldSkipImage(src: string, image: HTMLImageElement): boolean {
  if (!src.startsWith("/items/")) return false;
  if (src.includes("_model")) return true;
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  if (!width || !height) return true;
  if (sheetInfo(src, image)) return false;
  return width > height * 1.5;
}

export function ItemIcon({
  id,
  name,
  texturePath,
  enchanted,
  className,
  item,
  debug = false,
}: ItemIconProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const normalizedId = normalizeItemKey(item?.id ?? id ?? "");
  const normalizedName = item?.name ?? name ?? id ?? "SkyBlock Item";
  const resolvedItem: SkyBlockItem = React.useMemo(
    () =>
      item ?? {
        id: normalizedId,
        name: normalizedName,
        ...(texturePath ? { texture: texturePath } : {}),
        ...(enchanted !== undefined ? { enchanted } : {}),
      },
    [enchanted, item, normalizedId, normalizedName, texturePath],
  );
  const sources = React.useMemo(() => {
    if (skills.has(normalizedId)) return [`/items/${normalizedId}_skill.png`];
    return sourcesFor(resolvedItem);
  }, [normalizedId, resolvedItem]);
  const sourceSignature = React.useMemo(() => sources.join("|"), [sources]);
  const [sourceIndex, setSourceIndex] = React.useState(0);
  const [status, setStatus] = React.useState<"loading" | "loaded" | "error">("loading");
  const [useCanvas, setUseCanvas] = React.useState(false);
  const currentSrc = sources[sourceIndex];

  React.useEffect(() => {
    setSourceIndex(0);
    setStatus("loading");
    setUseCanvas(false);
  }, [sourceSignature]);

  React.useEffect(() => {
    if (!currentSrc) return;
    let animationFrameId = 0;
    let cancelled = false;

    const cached = imageCache.get(currentSrc);
    if (cached === false) {
      if (sourceIndex + 1 < sources.length) setSourceIndex((index) => index + 1);
      else setStatus("error");
      return;
    }
    const image = new Image();
    if (currentSrc.startsWith("http")) image.crossOrigin = "anonymous";
    image.onload = () => {
      if (cancelled) return;
      if (shouldSkipImage(currentSrc, image)) {
        imageCache.set(currentSrc, false);
        if (sourceIndex + 1 < sources.length) setSourceIndex((index) => index + 1);
        else setStatus("error");
        return;
      }

      const canvas = canvasRef.current;
      const sheet = sheetInfo(currentSrc, image);
      if (!sheet) {
        setUseCanvas(false);
        imageCache.set(currentSrc, true);
        setStatus("loaded");
        return;
      }

      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) {
        imageCache.set(currentSrc, false);
        if (sourceIndex + 1 < sources.length) setSourceIndex((index) => index + 1);
        else setStatus("error");
        return;
      }

      try {
        ctx.imageSmoothingEnabled = false;

        const frameSize = sheet.frameSize;
        const totalFrames = sheet.columns * sheet.rows;
        canvas.width = frameSize;
        canvas.height = frameSize;

        let currentFrame = 0;
        let lastTime = performance.now();
        const frameInterval = 100;

        const render = (now: number) => {
          if (cancelled) return;

          if (totalFrames > 1 && sheet && now - lastTime >= frameInterval) {
            currentFrame = (currentFrame + 1) % totalFrames;
            lastTime = now;
          }

          ctx.clearRect(0, 0, frameSize, frameSize);
          const column = sheet ? currentFrame % sheet.columns : 0;
          const row = sheet ? Math.floor(currentFrame / sheet.columns) : 0;
          ctx.drawImage(
            image,
            column * frameSize,
            row * frameSize,
            frameSize,
            frameSize,
            0,
            0,
            frameSize,
            frameSize,
          );

          if (totalFrames > 1) {
            animationFrameId = requestAnimationFrame(render);
          }
        };

        setUseCanvas(Boolean(sheet));
        render(performance.now());
      } catch {
        setUseCanvas(false);
      }
      imageCache.set(currentSrc, true);
      setStatus("loaded");
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
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden",
        className,
      )}
      title={
        debug && status === "error"
          ? `Missing Texture\nID: ${resolvedItem.id}\nName: ${resolvedItem.name}\nAttempted: ${sources.join(", ")}`
          : undefined
      }
    >
      {status === "error" || !currentSrc ? (
        <img
          src="/vanilla/barrier.png"
          alt={normalizedName}
          className="size-full object-contain pixelated opacity-70"
        />
      ) : (
        <>
          <canvas
            ref={canvasRef}
            aria-label={normalizedName}
            className={cn(
              "size-full object-contain pixelated transition-transform duration-75 hover:scale-110 drop-shadow-sm",
              (!useCanvas || status === "loading") && "hidden",
              enchanted && "brightness-125 contrast-125 drop-shadow-[0_0_6px_rgba(168,85,247,0.7)]",
              className,
            )}
          />
          <img
            src={currentSrc}
            alt={normalizedName}
            loading="lazy"
            className={cn(
              "size-full object-contain pixelated transition-transform duration-75 hover:scale-110 drop-shadow-sm",
              (useCanvas || status === "loading") && "hidden",
              enchanted && "brightness-125 contrast-125 drop-shadow-[0_0_6px_rgba(168,85,247,0.7)]",
              className,
            )}
          />
        </>
      )}
    </div>
  );
}
