import { useState } from "react";
import { cn } from "@/lib/utils";

interface ItemIconProps {
  id: string; // e.g. "GOLD_INGOT" or "Sugar Cane"
  name: string;
  className?: string;
}

export function ItemIcon({ id, name, className }: ItemIconProps) {
  const [failedLocal, setFailedLocal] = useState(false);
  const [failedCdn, setFailedCdn] = useState(false);

  // Clean and normalize ID to lowercase snake_case
  const cleanId = (id ?? name ?? "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/^enchanted_/, "");

  // 1. Local path: matches public/items/gold_ingot.png
  const localSrc = `/items/${cleanId}.png`;
  
  // 2. CDN Fallback: SkyCrypt API
  const cdnSrc = `https://sky.shiiyu.moe/resources/img/skyblock/${cleanId}.png`;

  if (failedCdn) return null;

  return (
    <img
      src={failedLocal ? cdnSrc : localSrc}
      alt={name}
      className={cn(
        "size-7 object-contain pixelated transition-transform duration-75 hover:scale-110 drop-shadow-sm shrink-0",
        className
      )}
      onError={(e) => {
        // Debugging log to inspect broken paths in Browser Console (F12)
        console.warn(`[ItemIcon] Failed to load local image: ${localSrc}, falling back to CDN...`);
        if (!failedLocal) {
          setFailedLocal(true);
        } else {
          setFailedCdn(true);
        }
      }}
    />
  );
}