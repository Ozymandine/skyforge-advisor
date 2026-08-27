// src/components/profile-share-card.tsx
// Shareable "SkyForge card": renders the profile's key stats as a polished
// card and exports it as a PNG for Discord/social sharing. Drawn on a canvas
// so the download needs no external libraries.

import { useMemo, useRef, useState } from "react";
import { Download, Share2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatFull } from "@/lib/skyblock";

export type ShareCardData = {
  username: string;
  uuid: string;
  profileName: string;
  skillAverage: number;
  netWorth: number;
  fairySouls: number;
  catacombsLevel: number | null;
  collectionsCount: number;
};

const W = 900;
const H = 420;

function drawCard(
  ctx: CanvasRenderingContext2D,
  data: ShareCardData,
  avatar: HTMLImageElement | null,
) {
  // Background: deep slate gradient with emerald glow.
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#050b14");
  bg.addColorStop(0.55, "#0a1220");
  bg.addColorStop(1, "#071018");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(W - 120, 60, 20, W - 120, 60, 380);
  glow.addColorStop(0, "rgba(52,211,153,0.22)");
  glow.addColorStop(1, "rgba(52,211,153,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Border.
  ctx.strokeStyle = "rgba(52,211,153,0.35)";
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, W - 2, H - 2);

  // Wordmark.
  ctx.font = "800 30px 'Space Grotesk', system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.fillText("S K Y F O R G E", 48, 62);

  // Avatar.
  if (avatar && avatar.complete && avatar.naturalWidth > 0) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(avatar, 48, 100, 128, 128);
    ctx.imageSmoothingEnabled = true;
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 2;
    ctx.strokeRect(48, 100, 128, 128);
  }

  // Username + profile.
  ctx.font = "700 52px 'Space Grotesk', system-ui, sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(data.username, 200, 152);
  ctx.font = "500 18px 'Space Grotesk', system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fillText(`${data.profileName} · Hypixel SkyBlock`, 202, 182);

  // Stat blocks.
  const stats: Array<[string, string]> = [
    ["Skill Average", data.skillAverage.toFixed(2)],
    ["Net Worth", formatFull(data.netWorth)],
    ["Fairy Souls", `${data.fairySouls}`],
    ["Catacombs", data.catacombsLevel !== null ? `${data.catacombsLevel}` : "—"],
  ];

  const blockW = (W - 96) / 4;
  stats.forEach(([label, value], i) => {
    const x = 48 + i * blockW;
    const y = 268;
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.beginPath();
    ctx.roundRect(x, y, blockW - 16, 100, 16);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = "600 13px 'Space Grotesk', system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.fillText(label.toUpperCase(), x + 18, y + 32);

    ctx.font = "700 30px 'Space Grotesk', system-ui, sans-serif";
    ctx.fillStyle = i === 1 ? "#34d399" : "#ffffff";
    ctx.fillText(value, x + 18, y + 72);
  });

  // Footer.
  ctx.font = "500 14px 'Space Grotesk', system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.fillText(`Generated ${new Date().toLocaleDateString()} · skyforge advisor`, 48, H - 34);
}

export function ProfileShareCard({ data }: { data: ShareCardData | null }) {
  const [open, setOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const avatarRef = useRef<HTMLImageElement | null>(null);

  const avatarUrl = useMemo(
    () => (data ? `https://mc-heads.net/avatar/${data.uuid}/128` : null),
    [data],
  );

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawCard(ctx, data, avatarRef.current);
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `skyforge-${data?.username.toLowerCase() ?? "profile"}.png`;
    a.click();
  };

  const shareText = data
    ? `${data.username} · Skill avg ${data.skillAverage.toFixed(2)} · Net worth ${formatFull(data.netWorth)}`
    : "";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-5 py-2.5 text-sm font-medium text-primary transition-all duration-75 ease-out hover:scale-[1.03] hover:bg-primary/25 active:scale-95"
      >
        <Share2 className="size-4" /> Profile card
      </button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
        }}
      >
        <DialogContent className="max-w-2xl border-white/10 bg-[#0E121B]/95 backdrop-blur-2xl">
          <DialogTitle className="text-lg font-semibold">Share your profile</DialogTitle>
          {data && (
            <div className="space-y-4">
              <canvas
                ref={(node) => {
                  canvasRef.current = node;
                  if (node && !avatarRef.current && avatarUrl) {
                    const img = new Image();
                    img.crossOrigin = "anonymous";
                    img.onload = () => {
                      avatarRef.current = img;
                      render();
                    };
                    img.src = avatarUrl;
                  }
                  render();
                }}
                width={W}
                height={H}
                className="w-full rounded-xl border border-white/10"
              />
              <div className="flex flex-wrap gap-2">
                <Button onClick={download} className="flex-1 gap-2">
                  <Download className="size-4" /> Download PNG
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10"
                  onClick={() => {
                    const url = `${window.location.origin}/profile/${encodeURIComponent(data.username)}`;
                    void navigator.clipboard.writeText(url).catch(() => {});
                  }}
                >
                  <Share2 className="size-4" /> Copy Public Link
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
