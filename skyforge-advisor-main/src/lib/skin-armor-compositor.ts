// src/lib/skin-armor-compositor.ts
// Real-time WebGL Minecraft Skin & Armor Texture Compositor:
// Renders authentic 3D armor layers (Helmet, Chestplate, Leggings, Boots)
// with SkyBlock color palettes (Necron, Storm, Maxor, Goldor, Crimson, Aurora, Divan, etc.)
// directly onto the 64x64 skin canvas for skinview3d.

import type { InventoryItem } from "@/lib/skyblock";

export type ArmorPalette = {
  primary: string;
  secondary: string;
  highlight: string;
  dark: string;
};

// Known SkyBlock & Vanilla Armor Palettes
const ARMOR_PALETTES: Record<string, ArmorPalette> = {
  necron: {
    primary: "#9B2323",
    secondary: "#731818",
    highlight: "#C93636",
    dark: "#450D0D",
  },
  crimson: {
    primary: "#8A1C1C",
    secondary: "#611212",
    highlight: "#B82C2C",
    dark: "#3B0808",
  },
  storm: {
    primary: "#1C7A9B",
    secondary: "#125773",
    highlight: "#2DB3E0",
    dark: "#0B3245",
  },
  aurora: {
    primary: "#288A96",
    secondary: "#185E66",
    highlight: "#3EC4D6",
    dark: "#0E3940",
  },
  maxor: {
    primary: "#7B229B",
    secondary: "#5A1473",
    highlight: "#B239E0",
    dark: "#360A47",
  },
  goldor: {
    primary: "#42474A",
    secondary: "#2E3234",
    highlight: "#60686C",
    dark: "#1A1D1E",
  },
  terror: {
    primary: "#242526",
    secondary: "#18191A",
    highlight: "#3E4042",
    dark: "#0D0E0E",
  },
  divan: {
    primary: "#D4AF37",
    secondary: "#AA8C2C",
    highlight: "#F5D061",
    dark: "#6B581B",
  },
  superior: {
    primary: "#D9A426",
    secondary: "#A67B17",
    highlight: "#F7C952",
    dark: "#694C0A",
  },
  shadow_assassin: {
    primary: "#18141F",
    secondary: "#100D14",
    highlight: "#2E283B",
    dark: "#08060A",
  },
  frozen_blaze: {
    primary: "#54B8E0",
    secondary: "#3A8FA8",
    highlight: "#8AE0FF",
    dark: "#20556B",
  },
  diamond: {
    primary: "#4BEDD7",
    secondary: "#33B8A5",
    highlight: "#80FFF0",
    dark: "#1C7366",
  },
  perfect: {
    primary: "#4BEDD7",
    secondary: "#33B8A5",
    highlight: "#80FFF0",
    dark: "#1C7366",
  },
  netherite: {
    primary: "#3D383C",
    secondary: "#2B272A",
    highlight: "#595358",
    dark: "#181517",
  },
  iron: {
    primary: "#D8D8D8",
    secondary: "#A8A8A8",
    highlight: "#FFFFFF",
    dark: "#686868",
  },
  gold: {
    primary: "#E8C838",
    secondary: "#B89820",
    highlight: "#FCE870",
    dark: "#786010",
  },
  leather: {
    primary: "#8B542E",
    secondary: "#663B1D",
    highlight: "#B57343",
    dark: "#3B200E",
  },
};

function getPaletteForItem(item: InventoryItem | null | undefined): ArmorPalette {
  if (!item) return ARMOR_PALETTES["iron"]!;
  const name = item.name.toLowerCase();

  for (const [key, palette] of Object.entries(ARMOR_PALETTES)) {
    if (name.includes(key.replace(/_/g, " ")) || name.includes(key)) {
      return palette;
    }
  }

  // Check generic material keywords
  if (name.includes("dragon")) return ARMOR_PALETTES["superior"]!;
  if (name.includes("wither")) return ARMOR_PALETTES["necron"]!;
  if (name.includes("diamond")) return ARMOR_PALETTES["diamond"]!;
  if (name.includes("gold")) return ARMOR_PALETTES["gold"]!;
  if (name.includes("iron")) return ARMOR_PALETTES["iron"]!;
  if (name.includes("netherite")) return ARMOR_PALETTES["netherite"]!;

  return ARMOR_PALETTES["diamond"]!;
}

/**
 * Composites 3D Armor Layers onto the Minecraft 64x64 skin canvas.
 */
export async function createArmorCompositedSkin(
  baseSkinUrl: string,
  armorItems: InventoryItem[] = []
): Promise<string> {
  if (typeof window === "undefined") return baseSkinUrl;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(baseSkinUrl);
          return;
        }

        // Draw base skin
        ctx.drawImage(img, 0, 0, 64, 64);

        // Find equipped items
        const helmet = armorItems.find(
          (i) =>
            i.slot === 3 ||
            i.name.toLowerCase().includes("helmet") ||
            i.name.toLowerCase().includes("crown") ||
            i.name.toLowerCase().includes("head") ||
            i.name.toLowerCase().includes("goggles") ||
            i.name.toLowerCase().includes("mask")
        );
        const chestplate = armorItems.find(
          (i) =>
            i.slot === 2 ||
            i.name.toLowerCase().includes("chestplate") ||
            i.name.toLowerCase().includes("tunic") ||
            i.name.toLowerCase().includes("jacket") ||
            i.name.toLowerCase().includes("cloak")
        );
        const leggings = armorItems.find(
          (i) =>
            i.slot === 1 ||
            i.name.toLowerCase().includes("leggings") ||
            i.name.toLowerCase().includes("pants")
        );
        const boots = armorItems.find(
          (i) =>
            i.slot === 0 ||
            i.name.toLowerCase().includes("boots") ||
            i.name.toLowerCase().includes("shoes")
        );

        // 1. HELMET (Hat Layer: x=32, y=0, w=32, h=16)
        if (helmet) {
          const pal = getPaletteForItem(helmet);
          // Crown top & sides
          ctx.fillStyle = pal.primary;
          ctx.fillRect(32, 0, 32, 8); // Top & Bottom of Hat
          ctx.fillRect(32, 8, 32, 8); // Front, Back, Left, Right of Hat

          // Trim & Noseguard highlights
          ctx.fillStyle = pal.highlight;
          ctx.fillRect(40, 9, 8, 2); // Forehead rim
          ctx.fillRect(43, 11, 2, 3); // Nose guard
          ctx.fillRect(32, 9, 8, 2); // Right cheek rim
          ctx.fillRect(48, 9, 8, 2); // Left cheek rim

          // Shading
          ctx.fillStyle = pal.dark;
          ctx.fillRect(40, 8, 8, 1);
          ctx.fillRect(32, 14, 32, 2);
        }

        // 2. CHESTPLATE (Jacket & Sleeve Layers)
        if (chestplate) {
          const pal = getPaletteForItem(chestplate);

          // Body Jacket (x=16, y=32, w=24, h=16)
          ctx.fillStyle = pal.primary;
          ctx.fillRect(16, 32, 24, 16);

          // Breastplate highlights
          ctx.fillStyle = pal.highlight;
          ctx.fillRect(20, 36, 8, 3); // Chest crest
          ctx.fillRect(22, 39, 4, 4); // Core plate
          ctx.fillRect(20, 32, 8, 2); // Neck rim

          // Shoulder Pauldrons (Right Sleeve: x=40, y=32, Left Sleeve: x=48, y=48)
          ctx.fillStyle = pal.primary;
          ctx.fillRect(40, 32, 16, 16);
          ctx.fillRect(48, 48, 16, 16);

          ctx.fillStyle = pal.highlight;
          ctx.fillRect(44, 32, 4, 3); // Right pauldron
          ctx.fillRect(52, 48, 4, 3); // Left pauldron

          // Shading & borders
          ctx.fillStyle = pal.dark;
          ctx.fillRect(20, 46, 8, 2); // Lower waist trim
          ctx.fillRect(40, 46, 8, 2);
          ctx.fillRect(48, 62, 8, 2);
        }

        // 3. LEGGINGS (Pants Layer: Right=0,32, Left=0,48)
        if (leggings) {
          const pal = getPaletteForItem(leggings);

          // Right Leg Pants (x=0, y=32, w=16, h=12)
          ctx.fillStyle = pal.primary;
          ctx.fillRect(0, 32, 16, 11);

          // Left Leg Pants (x=0, y=48, w=16, h=12)
          ctx.fillRect(0, 48, 16, 11);

          // Knee guard highlights
          ctx.fillStyle = pal.highlight;
          ctx.fillRect(4, 37, 4, 3); // Right knee
          ctx.fillRect(4, 53, 4, 3); // Left knee

          // Shading
          ctx.fillStyle = pal.dark;
          ctx.fillRect(0, 42, 16, 1);
          ctx.fillRect(0, 58, 16, 1);
        }

        // 4. BOOTS (Feet base & lower pants)
        if (boots) {
          const pal = getPaletteForItem(boots);

          // Right Boot (x=0, y=43, w=16, h=5)
          ctx.fillStyle = pal.primary;
          ctx.fillRect(0, 43, 16, 5);

          // Left Boot (x=0, y=59, w=16, h=5)
          ctx.fillRect(0, 59, 16, 5);

          // Boot Toe & Rim Highlights
          ctx.fillStyle = pal.highlight;
          ctx.fillRect(4, 45, 4, 3);
          ctx.fillRect(4, 61, 4, 3);

          // Sole Shading
          ctx.fillStyle = pal.dark;
          ctx.fillRect(0, 47, 16, 1);
          ctx.fillRect(0, 63, 16, 1);
        }

        resolve(canvas.toDataURL("image/png"));
      } catch (err) {
        console.error("Failed to composite armor onto skin:", err);
        resolve(baseSkinUrl);
      }
    };

    img.onerror = () => {
      resolve(baseSkinUrl);
    };

    img.src = baseSkinUrl;
  });
}
