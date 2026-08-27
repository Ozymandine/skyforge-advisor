"use client";

import React, { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { apply3DArmor } from "@/lib/skin-3d-armor";
import type { InventoryItem } from "@/lib/skyblock";

export type CharacterCanvasProps = {
  uuid?: string | undefined;
  username?: string | undefined;
  skinUrl?: string | undefined;
  armorItems?: InventoryItem[] | undefined;
  width?: number;
  height?: number;
  className?: string;
};

export function CharacterCanvas({
  uuid,
  username,
  skinUrl,
  armorItems = [],
  width = 150,
  height = 190,
  className,
}: CharacterCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!canvasRef.current || typeof window === "undefined") return;

    let viewer: any = null;
    let isMounted = true;

    async function initViewer() {
      try {
        const skinview3d = await import("skinview3d");

        if (!isMounted || !canvasRef.current) return;

        viewer = new skinview3d.SkinViewer({
          canvas: canvasRef.current,
          width,
          height,
        });

        // Camera setup & slow auto-rotation
        viewer.camera.position.set(0, 0, 56);
        viewer.autoRotate = true;
        viewer.autoRotateSpeed = 0.5;

        // Smooth walking animation
        viewer.animation = new skinview3d.WalkingAnimation();
        viewer.animation.speed = 0.4;

        // Build list of high-availability CORS skin URLs
        const skinUrls: string[] = [];
        if (skinUrl) skinUrls.push(skinUrl);
        if (uuid) {
          const cleanUuid = uuid.replace(/-/g, "");
          skinUrls.push(`https://crafatar.com/skins/${cleanUuid}`);
          skinUrls.push(`https://api.mineatar.io/skin/${cleanUuid}`);
        }
        if (username) {
          skinUrls.push(`https://minotar.net/skin/${username}`);
          skinUrls.push(`https://mc-heads.net/skin/${username}`);
        }
        skinUrls.push("https://crafatar.com/skins/853c80ef3c3749fdaa49938b607ad664"); // Steve fallback

        // Attempt loading skin with fallbacks
        let loaded = false;
        for (const url of skinUrls) {
          try {
            await viewer.loadSkin(url);
            loaded = true;
            break;
          } catch {
            // Try next skin provider
          }
        }

        // Attach true 3D armor onto the character mesh
        if (armorItems && armorItems.length > 0) {
          apply3DArmor(viewer, armorItems);
        }

        if (isMounted) {
          viewerRef.current = viewer;
          setIsLoading(!loaded);
        }
      } catch (err) {
        console.error("Failed to initialize 3D Character Canvas:", err);
        if (isMounted) setIsLoading(false);
      }
    }

    initViewer();

    return () => {
      isMounted = false;
      if (viewer) {
        viewer.dispose();
      }
      viewerRef.current = null;
    };
  }, [uuid, username, skinUrl, armorItems, width, height]);

  // Update armor dynamically if armorItems prop changes
  useEffect(() => {
    if (viewerRef.current && armorItems) {
      apply3DArmor(viewerRef.current, armorItems);
    }
  }, [armorItems]);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden select-none",
        className
      )}
    >
      {/* 3D WebGL Canvas */}
      <div className="relative cursor-grab active:cursor-grabbing">
        <canvas ref={canvasRef} className="block select-none" />

        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/40 backdrop-blur-sm">
            <Sparkles className="size-5 text-emerald-400 animate-spin" />
            <span className="font-mono text-[10px] text-white/70">Loading 3D Skin...</span>
          </div>
        )}
      </div>
    </div>
  );
}
