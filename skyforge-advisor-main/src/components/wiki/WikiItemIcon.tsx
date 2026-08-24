import {
  BookOpen,
  CircleHelp,
  Gem,
  Map,
  Shield,
  Sparkles,
  Swords,
  UserRound,
  WandSparkles,
  Zap,
  Pickaxe,
  Wheat,
  Fish,
  Hammer,
  FlaskConical,
  Coins,
  Skull,
  Compass,
  Trophy,
  Crown,
} from "lucide-react";

import { ItemIcon } from "@/components/ui/item-icon";
import { cn } from "@/lib/utils";

export interface WikiItemIconProps {
  id?: string;
  name: string;
  category: string;
  icon?: string;
  material?: string;
  className?: string;
}

type IconComponent = React.ComponentType<{
  className?: string;
}>;

/* ============================================================================
 * CATEGORY ICONS
 * ========================================================================== */

const CATEGORY_ICON_MAP: Record<string, IconComponent> = {
  stats: Zap,
  skills: Sparkles,
  collections: Gem,
  weapons: Swords,
  armor: Shield,
  pets: Sparkles,
  accessories: Gem,
  locations: Map,
  npcs: UserRound,
  mobs: Skull,
  enchanting: WandSparkles,
  reforging: WandSparkles,
  potions: FlaskConical,
  minions: Pickaxe,
  slayer: Swords,
  "tutorials & guides": BookOpen,
};

/* ============================================================================
 * VIRTUAL PAGE ICONS
 * ========================================================================== */

function getVirtualPageIcon(id: string, category: string): IconComponent | null {
  const normalizedId = id.trim().toUpperCase();
  const normalizedCategory = category.trim().toLowerCase();

  if (normalizedId.startsWith("WIKI_STAT_GROUP_")) {
    return getStatIcon(normalizedId);
  }

  if (normalizedId.startsWith("WIKI_SKILL_")) {
    return getSkillIcon(normalizedId);
  }

  if (normalizedId.startsWith("WIKI_LOCATION_")) {
    return getLocationIcon(normalizedId);
  }

  if (normalizedId.startsWith("WIKI_GUIDE_")) {
    return BookOpen;
  }

  if (normalizedCategory === "npcs") {
    return UserRound;
  }

  if (normalizedCategory === "mobs") {
    return Skull;
  }

  return null;
}

/* ============================================================================
 * STAT ICONS
 * ========================================================================== */

function getStatIcon(id: string): IconComponent {
  if (id.includes("COMBAT")) return Swords;
  if (id.includes("MINING")) return Pickaxe;
  if (id.includes("FARMING")) return Wheat;
  if (id.includes("FORAGING")) return Wheat;
  if (id.includes("FISHING")) return Fish;
  if (id.includes("HUNTING")) return CrosshairIcon;
  if (id.includes("WISDOM")) return Sparkles;
  if (id.includes("RIFT")) return Compass;
  if (id.includes("MISC")) return Gem;

  return Zap;
}

/* ============================================================================
 * SKILL ICONS
 * ========================================================================== */

function getSkillIcon(id: string): IconComponent {
  if (id.includes("COMBAT")) return Swords;
  if (id.includes("MINING")) return Pickaxe;
  if (id.includes("FARMING")) return Wheat;
  if (id.includes("FISHING")) return Fish;
  if (id.includes("FORAGING")) return Wheat;
  if (id.includes("ENCHANTING")) return WandSparkles;
  if (id.includes("ALCHEMY")) return FlaskConical;
  if (id.includes("TAMING")) return Crown;
  if (id.includes("CARPENTRY")) return Hammer;
  if (id.includes("RUNECRAFTING")) return Gem;
  if (id.includes("SOCIAL")) return UserRound;
  if (id.includes("HUNTING")) return CrosshairIcon;

  return Sparkles;
}

/* ============================================================================
 * LOCATION ICONS
 * ========================================================================== */

function getLocationIcon(id: string): IconComponent {
  if (id.includes("PRIVATE_ISLAND")) return Crown;
  if (id.includes("DUNGEON") || id.includes("CATACOMBS")) {
    return Skull;
  }
  if (id.includes("CRIMSON_ISLE")) return FlameIcon;
  if (id.includes("CRYSTAL_HOLLOWS")) return Gem;
  if (id.includes("DWARVEN_MINES")) return Pickaxe;
  if (id.includes("GOLD_MINE")) return Coins;
  if (id.includes("MUSHROOM_DESERT")) return Wheat;
  if (id.includes("BARN") || id.includes("GARDEN")) {
    return Wheat;
  }
  if (id.includes("THE_END")) return Sparkles;
  if (id.includes("SPIDER")) return Skull;
  if (id.includes("RIFT")) return Compass;

  return Map;
}

/* ============================================================================
 * FALLBACK ICONS
 * ========================================================================== */

function CrosshairIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
    </svg>
  );
}

function FlameIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 22c4.2 0 7-2.8 7-6.8 0-3.5-2-6.1-5-8.7.2 2.2-.5 3.6-1.7 4.7-.1-3.2-1.5-5.8-4.2-8.2.2 3.3-2.1 5.8-2.1 9.4C6 18.9 8.7 22 12 22Z" />
    </svg>
  );
}

/* ============================================================================
 * COMPONENT
 * ========================================================================== */

export function WikiItemIcon({ id, name, category, icon, material, className }: WikiItemIconProps) {
  const normalizedCategory = category.trim().toLowerCase();
  const normalizedId = id?.trim().toUpperCase() ?? "";

  const virtualIcon = getVirtualPageIcon(normalizedId, normalizedCategory);

  const CategoryIcon = virtualIcon ?? CATEGORY_ICON_MAP[normalizedCategory] ?? CircleHelp;

  /*
   * Virtual pages are not real Minecraft items.
   * They should keep their semantic Wiki icon.
   */
  if (virtualIcon) {
    return (
      <div
        className={cn(
          "flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl",
          "border border-border/60 bg-muted/50",
          "transition-all duration-200",
          "group-hover:border-primary/30 group-hover:bg-primary/5",
          className,
        )}
      >
        <CategoryIcon className="size-7 text-muted-foreground" />
      </div>
    );
  }

  /*
   * Real SkyBlock items go through the existing ItemIcon
   * component. This is important because ItemIcon already
   * knows how the project resolves Minecraft/SkyBlock textures.
   */
  return (
    <div
      className={cn(
        "flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl",
        "border border-border/60 bg-muted/50",
        "transition-all duration-200",
        "group-hover:border-primary/30 group-hover:bg-primary/5",
        className,
      )}
    >
      <ItemIcon
        id={normalizedId}
        name={name}
        {...(material !== undefined ? { material } : {})}
        {...(icon !== undefined ? { icon } : {})}
        className="size-10"
      />
    </div>
  );
}
