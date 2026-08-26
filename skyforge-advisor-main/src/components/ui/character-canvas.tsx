"use client";

import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type CharacterCanvasProps = {
  uuid?: string | undefined;
  username?: string | undefined;
  skinUrl?: string | undefined;
  width?: number;
  height?: number;
  className?: string;
  autoRotate?: boolean;
  animated?: boolean;
};

export function CharacterCanvas({
  uuid,
  username,
  skinUrl,
  width = 280,
  height = 360,
  className,
  autoRotate = true,
  animated = true,
}: CharacterCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(animated);
  const [isRotating, setIsRotating] = useState(autoRotate);
  const [isLoading, setIsLoading] = useState(true);

  // Determine skin source URL
  const resolvedSkin =
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

        viewer = new skinview3d.SkinViewer({
          canvas: canvasRef.current,
          width,
          height,
          skin: resolvedSkin,
        });

        viewer.camera.position.set(0, 0, 60);
        viewer.autoRotate = isRotating;
        viewer.autoRotateSpeed = 1.2;

        if (isPlaying) {
          viewer.animation = new skinview3d.WalkingAnimation();
          viewer.animation.speed = 0.6;
        }

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
  }, [resolvedSkin, width, height]);

  // Handle animation toggle
  const toggleAnimation = async () => {
    if (!viewerRef.current) return;
    const skinview3d = await import("skinview3d");
    if (isPlaying) {
      viewerRef.current.animation = null;
      setIsPlaying(false);
    } else {
      viewerRef.current.animation = new skinview3d.WalkingAnimation();
      viewerRef.current.animation.speed = 0.6;
      setIsPlaying(true);
    }
  };

  // Handle rotation toggle
  const toggleRotation = () => {
    if (!viewerRef.current) return;
    viewerRef.current.autoRotate = !isRotating;
    setIsRotating(!isRotating);
  };

  // Reset camera view
  const resetCamera = () => {
    if (!viewerRef.current) return;
    viewerRef.current.camera.position.set(0, 0, 60);
    viewerRef.current.camera.lookAt(0, 0, 0);
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/40 p-2 shadow-2xl backdrop-blur-md overflow-hidden",
        className
      )}
    >
      {/* Background Ambience Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-black/60 pointer-events-none" />

      {/* 3D WebGL Canvas */}
      <div className="relative cursor-grab active:cursor-grabbing">
        <canvas ref={canvasRef} className="block select-none" />

        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 backdrop-blur-sm">
            <Sparkles className="size-6 text-emerald-400 animate-spin" />
            <span className="font-mono text-xs text-white/70">Rendering 3D Model...</span>
          </div>
        )}
      </div>

      {/* Floating Interactive Controls */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-1 rounded-xl border border-white/10 bg-black/80 px-2.5 py-1.5 backdrop-blur-md opacity-90 transition-none">
        <div className="flex items-center gap-1">
          <button
            onClick={toggleAnimation}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-white/80 transition-none hover:bg-white/10 hover:text-white"
            title={isPlaying ? "Pause walking animation" : "Play walking animation"}
          >
            {isPlaying ? <Pause className="size-3 text-emerald-400" /> : <Play className="size-3 text-white/60" />}
            <span>{isPlaying ? "Walk" : "Static"}</span>
          </button>

          <button
            onClick={toggleRotation}
            className={cn(
              "flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold transition-none hover:bg-white/10",
              isRotating ? "text-emerald-400" : "text-white/60"
            )}
            title="Toggle 360° Auto-Rotate"
          >
            <span>Rotate</span>
          </button>
        </div>

        <button
          onClick={resetCamera}
          className="rounded-lg p-1 text-white/60 transition-none hover:bg-white/10 hover:text-white"
          title="Reset Camera View"
        >
          <RotateCcw className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
