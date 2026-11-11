import { useEffect, useRef, useState } from "react";
import type { SkinViewer } from "skinview3d";

export function PlayerModel({ uuid, username }: { uuid: string; username: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [loadedUuid, setLoadedUuid] = useState<string | null>(null);
  const ready = loadedUuid === uuid;

  useEffect(() => {
    let viewer: SkinViewer | undefined;
    let cancelled = false;

    async function load() {
      try {
        const { SkinViewer } = await import("skinview3d");
        if (cancelled || !canvas.current) return;

        viewer = new SkinViewer({
          canvas: canvas.current,
          width: 200,
          height: 234,
          pixelRatio: 1,
          zoom: 0.85,
        });
        viewer.controls.enablePan = false;
        viewer.controls.enableZoom = false;
        await viewer.loadSkin(`https://mc-heads.net/skin/${encodeURIComponent(uuid)}`);
        if (!cancelled) setLoadedUuid(uuid);
      } catch {
        viewer?.dispose();
        viewer = undefined;
      }
    }

    void load();
    return () => {
      cancelled = true;
      viewer?.dispose();
    };
  }, [uuid]);

  return (
    <div className="relative my-4 grid h-[234px] place-items-center overflow-hidden rounded-2xl bg-primary/10">
      {!ready && (
        <img
          src={`https://visage.surgeplay.com/full/256/${encodeURIComponent(uuid)}`}
          alt={`${username}'s Minecraft skin`}
          className="h-[210px] max-w-full object-contain"
        />
      )}
      <canvas
        ref={canvas}
        role="img"
        aria-label={`3D Minecraft model of ${username}. Drag to rotate.`}
        aria-hidden={!ready}
        className={ready ? "absolute touch-none" : "absolute invisible"}
      />
    </div>
  );
}
