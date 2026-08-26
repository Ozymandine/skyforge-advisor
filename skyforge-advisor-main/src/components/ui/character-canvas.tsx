"use client";

import React, { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { createArmorCompositedSkin } from "@/lib/skin-armor-compositor";
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
  width = 160,
  height = 200,
  className,
}: CharacterCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Determine skin source URL
  const baseSkin =
    skinUrl ||
    (uuid ? `https://mc-heads.net/skin/${uuid}` : null) ||
    (username ? `https://mc-heads.net/skin/${username}` : null) ||
    "https://mc-heads.net/skin/MHF_Steve";

  useEffect(() => {
    if (!canvasRef.current || typeof window === "undefined") return;

    let viewer: any = null;
    let isMounted = true;

    async function initViewer() {
      try {
        const skinview3d = await import("skinview3d");

        if (!isMounted || !canvasRef.current) return;

        // Composite equipped armor layers onto skin texture
        const finalSkin =
          armorItems && armorItems.length > 0
            ? await createArmorCompositedSkin(baseSkin, armorItems)
            : baseSkin;

        if (!isMounted || !canvasRef.current) return;

        viewer = new skinview3d.SkinViewer({
          canvas: canvasRef.current,
          width,
          height,
          skin: finalSkin,
        });

        // Set optimal camera angle and slow smooth auto-rotation
        viewer.camera.position.set(0, 0, 58);
        viewer.autoRotate = true;
        viewer.autoRotateSpeed = 0.5;

        // Gentle walking animation
        viewer.animation = new skinview3d.WalkingAnimation();
        viewer.animation.speed = 0.4;

        viewerRef.current = viewer;
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to initialize 3D Character Canvas:", err);
        setIsLoading(false);
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
  }, [baseSkin, armorItems, width, height]);

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
            <span className="font-mono text-[10px] text-white/70">Rendering 3D Armor...</span>
          </div>
        )}
      </div>
    </div>
  );
}
