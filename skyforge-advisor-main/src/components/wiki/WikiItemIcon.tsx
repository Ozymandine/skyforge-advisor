import {
  IconBookOpen,
  IconCircleHelp,
  IconGem,
  IconMap,
  IconShield,
  IconSparkles,
  IconSwords,
  IconUserRound,
  IconWandSparkles,
  IconZap,
  IconPickaxe,
  IconWheat,
  IconFish,
  IconHammer,
  IconFlaskConical,
  IconCoins,
  IconSkull,
  IconCompass,
  IconTrophy,
  IconCrown,
  IconFlame,
  IconCrosshair,
} from "@/components/ui/icon";

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
  stats: IconZap,
  skills: IconSparkles,
  collections: IconGem,
  weapons: IconSwords,
  armor: IconShield,
  pets: IconSparkles,
  accessories: IconGem,
  locations: IconMap,
  npcs: IconUserRound,
  mobs: IconSkull,
  enchanting: IconWandSparkles,
  reforging: IconWandSparkles,
  potions: IconFlaskConical,
  minions: IconPickaxe,
  slayer: IconSwords,
  "tutorials & guides": IconBookOpen,
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
    return IconBookOpen;
  }

  if (normalizedCategory === "npcs") {
    return IconUserRound;
  }

  if (normalizedCategory === "mobs") {
    return IconSkull;
  }

  return null;
}

/* ============================================================================
 * STAT ICONS
 * ========================================================================== */

function getStatIcon(id: string): IconComponent {
  if (id.includes("COMBAT")) return IconSwords;
  if (id.includes("MINING")) return IconPickaxe;
  if (id.includes("FARMING")) return IconWheat;
  if (id.includes("FORAGING")) return IconWheat;
  if (id.includes("FISHING")) return IconFish;
  if (id.includes("HUNTING")) return IconCrosshair;
  if (id.includes("WISDOM")) return IconSparkles;
  if (id.includes("RIFT")) return IconCompass;
  if (id.includes("MISC")) return IconGem;

  return IconZap;
}

/* ============================================================================
 * SKILL ICONS
 * ========================================================================== */

function getSkillIcon(id: string): IconComponent {
  if (id.includes("COMBAT")) return IconSwords;
  if (id.includes("MINING")) return IconPickaxe;
  if (id.includes("FARMING")) return IconWheat;
  if (id.includes("FISHING")) return IconFish;
  if (id.includes("FORAGING")) return IconWheat;
  if (id.includes("ENCHANTING")) return IconWandSparkles;
  if (id.includes("ALCHEMY")) return IconFlaskConical;
  if (id.includes("TAMING")) return IconCrown;
  if (id.includes("CARPENTRY")) return IconHammer;
  if (id.includes("RUNECRAFTING")) return IconGem;
  if (id.includes("SOCIAL")) return IconUserRound;
  if (id.includes("HUNTING")) return IconCrosshair;

  return IconSparkles;
}

/* ============================================================================
 * LOCATION ICONS
 * ========================================================================== */

function getLocationIcon(id: string): IconComponent {
  if (id.includes("PRIVATE_ISLAND")) return IconCrown;
  if (id.includes("DUNGEON") || id.includes("CATACOMBS")) {
    return IconSkull;
  }
  if (id.includes("CRIMSON_ISLE")) return IconFlame;
  if (id.includes("CRYSTAL_HOLLOWS")) return IconGem;
  if (id.includes("DWARVEN_MINES")) return IconPickaxe;
  if (id.includes("GOLD_MINE")) return IconCoins;
  if (id.includes("MUSHROOM_DESERT")) return IconWheat;
  if (id.includes("BARN") || id.includes("GARDEN")) {
    return IconWheat;
  }
  if (id.includes("THE_END")) return IconSparkles;
  if (id.includes("SPIDER")) return IconSkull;
  if (id.includes("RIFT")) return IconCompass;

  return IconMap;
}

/* ============================================================================
 * COMPONENT
 * ========================================================================== */

export function WikiItemIcon({ id, name, category, icon, material, className }: WikiItemIconProps) {
  const normalizedCategory = category.trim().toLowerCase();
  const normalizedId = id?.trim().toUpperCase() ?? "";

  const virtualIcon = getVirtualPageIcon(normalizedId, normalizedCategory);

  const CategoryIcon = virtualIcon ?? CATEGORY_ICON_MAP[normalizedCategory] ?? IconCircleHelp;

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
