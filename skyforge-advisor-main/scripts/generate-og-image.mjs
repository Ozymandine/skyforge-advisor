// scripts/generate-og-image.mjs
// Draws the social preview card (public/og-image.png) in a Minecraft style:
// pixel-block background, SKYFORGE wordmark, tagline and stat chips.
// Run once: node scripts/generate-og-image.mjs  (needs the pngjs dep? no — zero-dep encoder below)

import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const W = 1200;
const H = 630;
const root = fileURLToPath(new URL("..", import.meta.url));

// Minimal PNG encoder (truecolor RGBA, no filtering).
function encodePng(pixels, width, height) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter: none
    pixels.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = zlib.deflateSync(raw);

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
    const crcTable = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      crcTable[n] = c >>> 0;
    }
    let crc = 0xffffffff;
    for (const byte of body) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    crc = (crc ^ 0xffffffff) >>> 0;
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc);
    return Buffer.concat([len, body, crcBuf]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// Pixel-art 5x7 font for the characters we need.
const FONT = {
  S: ["11111", "10000", "10000", "01110", "00001", "00001", "11111"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01111"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  J: ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
  ",": ["00000", "00000", "00000", "00000", "01100", "00100", "01000"],
  "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
  "&": ["01100", "10010", "10010", "01100", "10101", "10010", "01101"],
  "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
};

function drawText(pixels, text, x, y, scale, color) {
  let cursor = x;
  for (const char of text.toUpperCase()) {
    const glyph = FONT[char] ?? FONT[" "];
    for (let gy = 0; gy < 7; gy++) {
      for (let gx = 0; gx < 5; gx++) {
        if (glyph[gy][gx] === "1") {
          for (let sy = 0; sy < scale; sy++) {
            for (let sx = 0; sx < scale; sx++) {
              const px = cursor + gx * scale + sx;
              const py = y + gy * scale + sy;
              if (px >= 0 && px < W && py >= 0 && py < H) {
                const idx = (py * W + px) * 4;
                pixels[idx] = color[0];
                pixels[idx + 1] = color[1];
                pixels[idx + 2] = color[2];
                pixels[idx + 3] = 255;
              }
            }
          }
        }
      }
    }
    cursor += 6 * scale;
  }
  return cursor;
}

// Build the image.
const pixels = Buffer.alloc(W * H * 4);

// Base: dark slate gradient.
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const t = y / H;
    const idx = (y * W + x) * 4;
    pixels[idx] = Math.round(5 + 8 * (1 - t));
    pixels[idx + 1] = Math.round(11 + 14 * (1 - t));
    pixels[idx + 2] = Math.round(20 + 18 * (1 - t));
    pixels[idx + 3] = 255;
  }
}

// Minecraft-style grass-block strip along the bottom (dirt with grass top).
const BLOCK = 24;
for (let bx = 0; bx * BLOCK < W; bx++) {
  for (let by = 0; by * BLOCK < 96; by++) {
    for (let px = 0; px < BLOCK; px++) {
      for (let py = 0; py < BLOCK; py++) {
        const x = bx * BLOCK + px;
        const y = H - 96 + by * BLOCK + py;
        if (x >= W || y >= H) continue;
        // deterministic pixel noise for texture
        const noise =
          ((bx * 73856093) ^ (by * 19349663) ^ (px * 83492791) ^ (py * 2971215073)) >>> 0;
        const shade = 0.85 + ((noise % 100) / 100) * 0.3;
        const grass = by === 0;
        const idx = (y * W + x) * 4;
        if (grass) {
          pixels[idx] = Math.round(70 * shade);
          pixels[idx + 1] = Math.round(160 * shade);
          pixels[idx + 2] = Math.round(80 * shade);
        } else {
          pixels[idx] = Math.round(120 * shade);
          pixels[idx + 1] = Math.round(85 * shade);
          pixels[idx + 2] = Math.round(58 * shade);
        }
      }
    }
  }
}

// Emerald glow top-right.
for (let y = 0; y < 300; y++) {
  for (let x = W - 420; x < W; x++) {
    const dx = x - (W - 140);
    const dy = y - 90;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 340) {
      const a = (1 - dist / 340) * 0.25;
      const idx = (y * W + x) * 4;
      pixels[idx] = Math.round(pixels[idx] * (1 - a) + 52 * a * 2.2);
      pixels[idx + 1] = Math.round(pixels[idx + 1] * (1 - a) + 211 * a * 2.2);
      pixels[idx + 2] = Math.round(pixels[idx + 2] * (1 - a) + 153 * a * 2.2);
    }
  }
}

// Wordmark + tagline + chips.
drawText(pixels, "SKYFORGE", 80, 110, 12, [52, 211, 153]);
drawText(pixels, "SKYBLOCK STATS - FLIPS - PROGRESSION", 80, 260, 5, [255, 255, 255]);
drawText(pixels, "NO LOGIN - YOUR KEY STAYS IN YOUR BROWSER", 80, 330, 4, [148, 163, 184]);
drawText(pixels, "POWERED BY THE HYPIXEL API + NEU DATA", 80, H - 140, 4, [148, 163, 184]);

const outDir = join(root, "public");
await mkdir(outDir, { recursive: true });
await writeFile(join(outDir, "og-image.png"), encodePng(pixels, W, H));
console.log(`Wrote public/og-image.png (${W}x${H})`);
