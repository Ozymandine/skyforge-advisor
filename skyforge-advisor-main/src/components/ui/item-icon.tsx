import * as React from "react";
import { cn } from "@/lib/utils";
import { normalizeItemKey, resolveItemTexture } from "@/lib/items/resolver";
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

type HeadFace = {
  position: string;
  transform: string;
};

const minecraftHeadFaces: HeadFace[] = [
  { position: "14.285714% 14.285714%", transform: "translateZ(7px)" },
  {
    position: "42.857143% 14.285714%",
    transform: "rotateY(180deg) translateZ(7px)",
  },
  {
    position: "0 14.285714%",
    transform: "rotateY(90deg) translateZ(7px)",
  },
  {
    position: "28.571429% 14.285714%",
    transform: "rotateY(-90deg) translateZ(7px)",
  },
  {
    position: "14.285714% 0",
    transform: "rotateX(90deg) translateZ(7px)",
  },
  {
    position: "28.571429% 0",
    transform: "rotateX(-90deg) translateZ(7px)",
  },
];

function sourcesFor(item: SkyBlockItem): string[] {
  const { texture, ...itemWithoutTexture } = item;

  const resolved = resolveItemTexture(itemWithoutTexture);
  const barrier = "/vanilla/barrier.png";

  // User preference: when texture-pack fallback is off, skip vanilla
  // fallback textures and let the icon fall through to the SVG placeholder.
  const fallbackEnabled =
    typeof window === "undefined" || window.localStorage.getItem("sba.textureFallback") !== "0";

  const registered = [resolved.src, ...(resolved.candidates ?? [])].filter(
    (src): src is string => Boolean(src) && src !== barrier,
  );

  const hasItemSpecificSprite = ["exact-id", "alias", "registry"].includes(resolved.source);

  const ordered = hasItemSpecificSprite
    ? [...registered, ...(fallbackEnabled ? [texture] : [])]
    : [texture, ...registered].filter((src) => fallbackEnabled || src !== texture);

  return [
    ...new Set([
      ...ordered.filter((src): src is string => Boolean(src)),
      ...(fallbackEnabled ? [barrier] : []),
    ]),
  ];
}

function isMinecraftSkin(src: string): boolean {
  return /^https:\/\/textures\.minecraft\.net\/texture\/[a-f0-9]+\/?$/i.test(src);
}

function isCompactorHeadAtlas(src: string, image: HTMLImageElement): boolean {
  return (
    /^\/items\/[a-z0-9_]*compactor[a-z0-9_]*\.png$/i.test(src) &&
    image.naturalWidth === 64 &&
    image.naturalHeight === 64
  );
}

function sheetInfo(
  src: string,
  image: HTMLImageElement,
): {
  frameSize: number;
  columns: number;
  rows: number;
} | null {
  if (!src.startsWith("/items/") || src.includes("_model")) {
    return null;
  }

  const width = image.naturalWidth;
  const height = image.naturalHeight;

  if (width >= 8 && width <= 64 && height > width && height % width === 0 && height / width <= 32) {
    return {
      frameSize: width,
      columns: 1,
      rows: height / width,
    };
  }

  if (
    height >= 8 &&
    height <= 64 &&
    width > height &&
    width % height === 0 &&
    width / height <= 32
  ) {
    return {
      frameSize: height,
      columns: width / height,
      rows: 1,
    };
  }

  return null;
}

function shouldSkipImage(src: string, image: HTMLImageElement): boolean {
  if (!src.startsWith("/items/")) {
    return false;
  }

  if (src.includes("_model")) {
    return true;
  }

  const width = image.naturalWidth;
  const height = image.naturalHeight;

  if (!width || !height) {
    return true;
  }

  if (sheetInfo(src, image)) {
    return false;
  }

  return width > height * 1.5;
}

function MinecraftHead({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const faceStyle: React.CSSProperties = {
    backgroundImage: `url("${src}")`,
    backgroundSize: "800% 800%",
    imageRendering: "pixelated",
  };

  return (
    <span
      role="img"
      aria-label={alt}
      className={cn("relative block size-full", className)}
      style={{ perspective: "48px" }}
    >
      <span
        className="absolute inset-[17%] block"
        style={{
          transform: "rotateX(-24deg) rotateY(38deg)",
          transformStyle: "preserve-3d",
        }}
      >
        {minecraftHeadFaces.map((face) => (
          <span
            key={face.transform}
            className="absolute inset-0 block"
            style={{
              ...faceStyle,
              backgroundPosition: face.position,
              transform: face.transform,
            }}
          />
        ))}
      </span>
    </span>
  );
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

  const resolvedItem = React.useMemo<SkyBlockItem>(
    () =>
      item ?? {
        id: normalizedId,
        name: normalizedName,
        ...(texturePath ? { texture: texturePath } : {}),
        ...(enchanted !== undefined ? { enchanted } : {}),
      },
    [enchanted, item, normalizedId, normalizedName, texturePath],
  );

  const sources = React.useMemo(() => sourcesFor(resolvedItem), [resolvedItem]);

  const sourceSignature = React.useMemo(() => sources.join("|"), [sources]);

  const [sourceIndex, setSourceIndex] = React.useState(0);

  const [status, setStatus] = React.useState<"loading" | "loaded" | "error">("loading");

  const [useCanvas, setUseCanvas] = React.useState(false);

  const [useMinecraftHead, setUseMinecraftHead] = React.useState(false);

  const currentSrc = sources[sourceIndex];

  const shouldGlint = Boolean(enchanted) || normalizedId.startsWith("enchantment_");

  React.useEffect(() => {
    setSourceIndex(0);
    setStatus("loading");
    setUseCanvas(false);
    setUseMinecraftHead(false);
  }, [sourceSignature]);

  React.useEffect(() => {
    if (!currentSrc) {
      setStatus("error");
      return;
    }

    let cancelled = false;
    let animationFrameId = 0;

    const cached = imageCache.get(currentSrc);

    if (cached === false) {
      if (sourceIndex + 1 < sources.length) {
        setSourceIndex((index) => index + 1);
      } else {
        setStatus("error");
      }

      return;
    }

    const image = new Image();

    image.onload = () => {
      if (cancelled) {
        return;
      }

      if (shouldSkipImage(currentSrc, image)) {
        imageCache.set(currentSrc, false);

        if (sourceIndex + 1 < sources.length) {
          setSourceIndex((index) => index + 1);
        } else {
          setStatus("error");
        }

        return;
      }

      const rendersAsHead = isMinecraftSkin(currentSrc) || isCompactorHeadAtlas(currentSrc, image);

      setUseMinecraftHead(rendersAsHead);

      const sheet = sheetInfo(currentSrc, image);

      if (!sheet) {
        setUseCanvas(false);
        imageCache.set(currentSrc, true);
        setStatus("loaded");
        return;
      }

      const canvas = canvasRef.current;

      if (!canvas) {
        imageCache.set(currentSrc, false);

        if (sourceIndex + 1 < sources.length) {
          setSourceIndex((index) => index + 1);
        } else {
          setStatus("error");
        }

        return;
      }

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        imageCache.set(currentSrc, false);

        if (sourceIndex + 1 < sources.length) {
          setSourceIndex((index) => index + 1);
        } else {
          setStatus("error");
        }

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
          if (cancelled) {
            return;
          }

          if (totalFrames > 1 && now - lastTime >= frameInterval) {
            currentFrame = (currentFrame + 1) % totalFrames;

            lastTime = now;
          }

          ctx.clearRect(0, 0, frameSize, frameSize);

          const column = currentFrame % sheet.columns;

          const row = Math.floor(currentFrame / sheet.columns);

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

        setUseCanvas(true);
        render(performance.now());
        imageCache.set(currentSrc, true);
        setStatus("loaded");
      } catch {
        setUseCanvas(false);
        imageCache.set(currentSrc, true);
        setStatus("loaded");
      }
    };

    image.onerror = () => {
      if (cancelled) {
        return;
      }

      imageCache.set(currentSrc, false);

      if (sourceIndex + 1 < sources.length) {
        setSourceIndex((index) => index + 1);
      } else {
        setStatus("error");
      }
    };

    image.src = currentSrc;

    return () => {
      cancelled = true;

      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [currentSrc, sourceIndex, sources.length]);

  const visualClassName = cn(
    "size-full object-contain pixelated",
    "transition-transform duration-75",
    "hover:scale-110 drop-shadow-sm",
    shouldGlint && "brightness-125 contrast-125 drop-shadow-[0_0_6px_rgba(168,85,247,0.7)]",
  );

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0",
        "items-center justify-center",
        "overflow-hidden",
        className,
      )}
      title={
        debug && status === "error"
          ? `Missing Texture\nID: ${resolvedItem.id}\nName: ${resolvedItem.name}\nAttempted: ${sources.join(", ")}`
          : undefined
      }
    >
      {status === "error" || !currentSrc ? (
        <span
          aria-label={normalizedName}
          className={cn(
            "flex items-center justify-center rounded-sm border border-white/10 bg-white/5 text-white/30",
            visualClassName,
          )}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="size-1/2"
            aria-hidden="true"
          >
            {/* Simple 3D-cube silhouette: generic "unknown item" marker */}
            <path d="M12 2 21 7v10l-9 5-9-5V7l9-5Z" strokeLinejoin="round" />
            <path d="M3.3 7.3 12 12l8.7-4.7M12 12v10" strokeLinejoin="round" />
          </svg>
        </span>
      ) : (
        <>
          <canvas
            ref={canvasRef}
            aria-label={normalizedName}
            className={cn(visualClassName, (!useCanvas || status === "loading") && "hidden")}
          />

          {useMinecraftHead ? (
            <MinecraftHead
              src={currentSrc}
              alt={normalizedName}
              className={cn(visualClassName, (useCanvas || status === "loading") && "hidden")}
            />
          ) : (
            <img
              src={currentSrc}
              alt={normalizedName}
              loading="lazy"
              className={cn(visualClassName, (useCanvas || status === "loading") && "hidden")}
            />
          )}
        </>
      )}
    </div>
  );
}
