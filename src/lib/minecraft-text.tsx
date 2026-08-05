import React from "react";

// Official Minecraft Color Code Map (All with high-contrast text shadows)
const MC_COLORS: Record<string, string> = {
  "0": "text-[#000000] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]", // Black
  "1": "text-[#0000AA] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]", // Dark Blue
  "2": "text-[#00AA00] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]", // Dark Green
  "3": "text-[#00AAAA] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]", // Dark Aqua
  "4": "text-[#AA0000] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]", // Dark Red
  "5": "text-[#AA00AA] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]", // Dark Purple
  "6": "text-[#FFAA00] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] font-semibold", // Gold
  "7": "text-[#AAAAAA] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]", // Gray
  "8": "text-[#555555] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]", // Dark Gray
  "9": "text-[#5555FF] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]", // Blue
  a: "text-[#55FF55] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] font-semibold", // Green (+Stats)
  b: "text-[#55FFFF] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] font-semibold", // Aqua (+Mana)
  c: "text-[#FF5555] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] font-semibold", // Red (+Damage)
  d: "text-[#FF55FF] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]", // Light Purple
  e: "text-[#FFFF55] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] font-semibold", // Yellow
  f: "text-[#FFFFFF] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] font-semibold", // White
};

const MC_FORMATS: Record<string, string> = {
  l: "font-bold",
  m: "line-through",
  n: "underline",
  o: "italic",
};

/**
 * Clean up missing/broken Minecraft Unicode glyphs
 */
function cleanGlyphs(str: string): string {
  if (!str) return "";
  return str
    .replace(/[\u25A0\u25A1\uFFFD]/g, "✦")
    .replace(/\[\]/g, "[✦]")
    .replace(/Speed for/g, "✦ Speed for");
}

/**
 * Parses raw Minecraft lore strings containing section symbols (§)
 * into rich, color-graded React elements.
 */
export function RenderMinecraftLore({ text }: { text: string }) {
  if (!text) return null;

  const cleaned = cleanGlyphs(text);

  // If text contains section symbols §, parse them directly:
  if (cleaned.includes("§")) {
    const parts = cleaned.split(/§([0-9a-fk-or])/gi);
    const elements: React.ReactNode[] = [];
    let currentColor = MC_COLORS["7"];
    let currentFormat = "";

    for (let i = 0; i < parts.length; i++) {
      if (i === 0) {
        if (parts[i]) elements.push(<span key={i} className={currentColor}>{parts[i]}</span>);
        continue;
      }

      if (i % 2 === 1) {
        const code = parts[i]?.toLowerCase();
        const content = parts[i + 1];

        if (code && MC_COLORS[code]) {
          currentColor = MC_COLORS[code];
          currentFormat = "";
        } else if (code && MC_FORMATS[code]) {
          currentFormat += ` ${MC_FORMATS[code]}`;
        } else if (code === "r") {
          currentColor = MC_COLORS["7"];
          currentFormat = "";
        }

        if (content) {
          elements.push(
            <span key={i} className={`${currentColor} ${currentFormat}`}>
              {content}
            </span>
          );
        }
      }
    }
    return <>{elements}</>;
  }

  // AUTO-COLOR FALLBACK: For unformatted plain-text lore
  let colorClass = "text-slate-300";

  // Handle all SkyBlock stats
  if (/^(Damage|Strength|Crit Chance|Crit Damage|Health|Defense|Intelligence|Mining Speed|Mining Fortune|Breaking Power|Speed):/i.test(cleaned)) {
    if (cleaned.startsWith("Damage:") || cleaned.startsWith("Strength:")) colorClass = "text-[#FF5555] font-semibold"; // Red
    else if (cleaned.startsWith("Crit Chance:") || cleaned.startsWith("Crit Damage:")) colorClass = "text-[#5555FF] font-semibold"; // Blue
    else if (cleaned.startsWith("Health:") || cleaned.startsWith("Defense:")) colorClass = "text-[#55FF55] font-semibold"; // Green
    else if (cleaned.startsWith("Intelligence:") || cleaned.startsWith("Mana:")) colorClass = "text-[#55FFFF] font-semibold"; // Aqua
    else if (cleaned.startsWith("Mining Speed:") || cleaned.startsWith("Mining Fortune:") || cleaned.startsWith("Breaking Power:")) colorClass = "text-[#FFAA00] font-semibold"; // Gold
    else if (cleaned.startsWith("Speed:")) colorClass = "text-[#FFFFFF] font-semibold"; // White
  } 
  // Ability Headers
  else if (cleaned.startsWith("Ability:") || cleaned.startsWith("Shortbow:")) {
    colorClass = "text-[#FFAA00] font-bold";
  } 
  // Enchantment Lists
  else if (cleaned.includes("V,") || cleaned.includes("IV,") || cleaned.includes("III,") || cleaned.includes("Efficiency") || cleaned.includes("Fortune")) {
    colorClass = "text-[#5555FF] font-medium";
  }

  return <span className={`drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] ${colorClass}`}>{cleaned}</span>;
}