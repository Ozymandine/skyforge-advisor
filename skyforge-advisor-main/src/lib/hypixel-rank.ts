// src/lib/hypixel-rank.ts
// Comprehensive Hypixel Rank Parsing & Formatting Engine:
// Parses VIP, VIP+, MVP, MVP+, MVP++ (SUPERSTAR), YOUTUBE, ADMIN, and Game Master
// with authentic Minecraft color codes and plus customization.

export type HypixelRankName =
  | "ADMIN"
  | "GAME_MASTER"
  | "YOUTUBER"
  | "SUPERSTAR" // MVP++
  | "MVP_PLUS"
  | "MVP"
  | "VIP_PLUS"
  | "VIP"
  | "NON";

export type FormattedRank = {
  name: HypixelRankName;
  tag: string; // e.g. "MVP++"
  prefix: string; // e.g. "[MVP++]"
  bracketColor: string; // hex or tailwind class
  tagColor: string; // color of main text
  plusColor?: string; // color of '+' symbols
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  fullTag: string; // Plaintext representation e.g. "[MVP++] Username"
};

export const MINECRAFT_COLORS: Record<string, string> = {
  BLACK: "#000000",
  DARK_BLUE: "#0000AA",
  DARK_GREEN: "#00AA00",
  DARK_AQUA: "#00AAAA",
  DARK_RED: "#AA0000",
  DARK_PURPLE: "#AA00AA",
  GOLD: "#FFAA00",
  GRAY: "#AAAAAA",
  DARK_GRAY: "#555555",
  BLUE: "#5555FF",
  GREEN: "#55FF55",
  AQUA: "#55FFFF",
  RED: "#FF5555",
  LIGHT_PURPLE: "#FF55FF",
  YELLOW: "#FFFF55",
  WHITE: "#FFFFFF",
};

export type RawHypixelPlayerData = {
  rank?: string | null | undefined;
  monthlyPackageRank?: string | null | undefined;
  newPackageRank?: string | null | undefined;
  packageRank?: string | null | undefined;
  prefix?: string | null | undefined;
  rankPlusColor?: string | null | undefined;
  monthlyRankColor?: string | null | undefined;
};

export function parseHypixelRank(playerData?: RawHypixelPlayerData | null | undefined): FormattedRank {
  if (!playerData) {
    return {
      name: "NON",
      tag: "",
      prefix: "",
      bracketColor: "#AAAAAA",
      tagColor: "#AAAAAA",
      badgeBg: "bg-white/5",
      badgeBorder: "border-white/10",
      badgeText: "text-neutral-400",
      fullTag: "",
    };
  }

  // 1. Staff / Special rank overrides
  if (playerData.rank === "ADMIN") {
    return {
      name: "ADMIN",
      tag: "ADMIN",
      prefix: "[ADMIN]",
      bracketColor: "#FF5555",
      tagColor: "#FF5555",
      badgeBg: "bg-red-500/20",
      badgeBorder: "border-red-500/40",
      badgeText: "text-red-400",
      fullTag: "[ADMIN]",
    };
  }

  if (playerData.rank === "GAME_MASTER" || playerData.rank === "MODERATOR") {
    return {
      name: "GAME_MASTER",
      tag: "GM",
      prefix: "[GM]",
      bracketColor: "#00AA00",
      tagColor: "#00AA00",
      badgeBg: "bg-emerald-600/20",
      badgeBorder: "border-emerald-600/40",
      badgeText: "text-emerald-400",
      fullTag: "[GM]",
    };
  }

  if (playerData.rank === "YOUTUBER") {
    return {
      name: "YOUTUBER",
      tag: "YOUTUBE",
      prefix: "[YOUTUBE]",
      bracketColor: "#FF5555",
      tagColor: "#FFFFFF",
      badgeBg: "bg-red-600/20",
      badgeBorder: "border-red-500/50",
      badgeText: "text-red-400",
      fullTag: "[YOUTUBE]",
    };
  }

  // 2. MVP++ (SUPERSTAR)
  if (playerData.monthlyPackageRank === "SUPERSTAR") {
    const plusColorName = playerData.rankPlusColor ?? "RED";
    const plusHex = MINECRAFT_COLORS[plusColorName] ?? "#FF5555";
    const isAquaPlus = playerData.monthlyRankColor === "AQUA";

    return {
      name: "SUPERSTAR",
      tag: "MVP++",
      prefix: "[MVP++]",
      bracketColor: isAquaPlus ? "#55FFFF" : "#FFAA00",
      tagColor: isAquaPlus ? "#55FFFF" : "#FFAA00",
      plusColor: plusHex,
      badgeBg: isAquaPlus ? "bg-cyan-500/15" : "bg-amber-500/15",
      badgeBorder: isAquaPlus ? "border-cyan-400/40" : "border-amber-400/40",
      badgeText: isAquaPlus ? "text-cyan-300" : "text-amber-300",
      fullTag: "[MVP++]",
    };
  }

  // 3. MVP+
  const rank = playerData.newPackageRank ?? playerData.packageRank;
  if (rank === "MVP_PLUS") {
    const plusColorName = playerData.rankPlusColor ?? "RED";
    const plusHex = MINECRAFT_COLORS[plusColorName] ?? "#FF5555";

    return {
      name: "MVP_PLUS",
      tag: "MVP+",
      prefix: "[MVP+]",
      bracketColor: "#55FFFF",
      tagColor: "#55FFFF",
      plusColor: plusHex,
      badgeBg: "bg-cyan-500/15",
      badgeBorder: "border-cyan-500/30",
      badgeText: "text-cyan-300",
      fullTag: "[MVP+]",
    };
  }

  // 4. MVP
  if (rank === "MVP") {
    return {
      name: "MVP",
      tag: "MVP",
      prefix: "[MVP]",
      bracketColor: "#55FFFF",
      tagColor: "#55FFFF",
      badgeBg: "bg-cyan-500/10",
      badgeBorder: "border-cyan-500/25",
      badgeText: "text-cyan-300",
      fullTag: "[MVP]",
    };
  }

  // 5. VIP+
  if (rank === "VIP_PLUS") {
    return {
      name: "VIP_PLUS",
      tag: "VIP+",
      prefix: "[VIP+]",
      bracketColor: "#55FF55",
      tagColor: "#55FF55",
      plusColor: "#FFAA00",
      badgeBg: "bg-emerald-500/15",
      badgeBorder: "border-emerald-500/30",
      badgeText: "text-emerald-300",
      fullTag: "[VIP+]",
    };
  }

  // 6. VIP
  if (rank === "VIP") {
    return {
      name: "VIP",
      tag: "VIP",
      prefix: "[VIP]",
      bracketColor: "#55FF55",
      tagColor: "#55FF55",
      badgeBg: "bg-emerald-500/10",
      badgeBorder: "border-emerald-500/25",
      badgeText: "text-emerald-300",
      fullTag: "[VIP]",
    };
  }

  // Non-donator (Default)
  return {
    name: "NON",
    tag: "",
    prefix: "",
    bracketColor: "#AAAAAA",
    tagColor: "#AAAAAA",
    badgeBg: "bg-white/5",
    badgeBorder: "border-white/10",
    badgeText: "text-neutral-400",
    fullTag: "",
  };
}
