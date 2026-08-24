import React from "react";

const MC_COLORS: Record<string, string> = {
  "0": "text-[#000000] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]",
  "1": "text-[#0000AA] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]",
  "2": "text-[#00AA00] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]",
  "3": "text-[#00AAAA] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]",
  "4": "text-[#AA0000] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]",
  "5": "text-[#AA00AA] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]",
  "6": "text-[#FFAA00] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] font-semibold",
  "7": "text-[#AAAAAA] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]",
  "8": "text-[#555555] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]",
  "9": "text-[#5555FF] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]",
  a: "text-[#55FF55] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] font-semibold",
  b: "text-[#55FFFF] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] font-semibold",
  c: "text-[#FF5555] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] font-semibold",
  d: "text-[#FF55FF] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]",
  e: "text-[#FFFF55] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] font-semibold",
  f: "text-[#FFFFFF] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] font-semibold",
};

const MC_FORMATS: Record<string, string> = {
  l: "font-bold",
  m: "line-through",
  n: "underline",
  o: "italic",
};

function cleanGlyphs(str: string): string {
  if (!str) return "";
  return str
    .replace(/[\u25A0\u25A1\uFFFD]/g, "✦")
    .replace(/\[\]/g, "[✦]")
    .replace(/Speed for/g, "✦ Speed for");
}

export function RenderMinecraftLore({ text }: { text: string }) {
  if (!text) return null;

  const cleaned = cleanGlyphs(text);

  // Direct Minecraft § Section Code Parsing
  if (cleaned.includes("§")) {
    const parts = cleaned.split(/§([0-9a-fk-or])/gi);
    const elements: React.ReactNode[] = [];
    let currentColor = MC_COLORS["7"];
    let currentFormat = "";

    for (let i = 0; i < parts.length; i++) {
      if (i === 0) {
        if (parts[i])
          elements.push(
            <span key={i} className={currentColor}>
              {parts[i]}
            </span>,
          );
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
            </span>,
          );
        }
      }
    }
    return <>{elements}</>;
  }

  // AUTO-COLOR FALLBACK: Split stat labels (White) from stat numbers (Colored)
  const statMatch = cleaned.match(/^([A-Za-z\s]+:)\s*(.+)$/);

  if (statMatch) {
    const label = statMatch[1] ?? "";
    const value = statMatch[2] ?? "";
    let valueColorClass = "text-slate-200";

    if (/^(Damage|Strength):/i.test(label)) {
      valueColorClass = "text-[#FF5555] font-semibold"; // Red
    } else if (/^(Crit Chance|Crit Damage):/i.test(label)) {
      valueColorClass = "text-[#5555FF] font-semibold"; // Blue
    } else if (/^(Health|Defense):/i.test(label)) {
      valueColorClass = "text-[#55FF55] font-semibold"; // Green
    } else if (/^(Intelligence|Mana):/i.test(label)) {
      valueColorClass = "text-[#55FFFF] font-semibold"; // Aqua
    } else if (/^(Mining Speed|Mining Fortune|Breaking Power):/i.test(label)) {
      valueColorClass = "text-[#FFAA00] font-semibold"; // Gold
    } else if (/^Speed:/i.test(label)) {
      valueColorClass = "text-[#FFFFFF] font-semibold"; // White
    }

    return (
      <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
        <span className="text-gray-200 font-normal">{label} </span>
        <span className={valueColorClass}>{value}</span>
      </span>
    );
  }

  // Non-stat lines (Enchantments / Abilities / Rarity)
  let generalColorClass = "text-slate-300";

  if (cleaned.startsWith("Ability:") || cleaned.startsWith("Shortbow:")) {
    generalColorClass = "text-[#FFAA00] font-bold";
  } else if (cleaned.includes("V,") || cleaned.includes("IV,") || cleaned.includes("III,")) {
    generalColorClass = "text-[#5555FF] font-medium";
  } else if (cleaned.endsWith("SWORD") || cleaned.endsWith("BOW") || cleaned.endsWith("RARE")) {
    generalColorClass = "text-[#FFAA00] font-bold tracking-wider";
  }

  return (
    <span className={`drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] ${generalColorClass}`}>
      {cleaned}
    </span>
  );
}
