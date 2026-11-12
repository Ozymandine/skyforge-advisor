import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

type IconProps = ComponentPropsWithoutRef<"span">;
const frame =
  "inline-flex size-[22px] shrink-0 items-center justify-center align-middle leading-none";

function spriteIcon(texture: string) {
  return function SpriteIcon({ className, "aria-label": label, ...props }: IconProps) {
    return (
      <span
        data-ui-icon
        className={cn(frame, className)}
        aria-label={label}
        role={label ? "img" : undefined}
        aria-hidden={label ? undefined : true}
        {...props}
      >
        <img
          src={`/vanilla/${texture}.png`}
          alt=""
          width={22}
          height={22}
          className="block size-full object-contain [image-rendering:pixelated]"
        />
      </span>
    );
  };
}

function symbolIcon(symbol: string) {
  return function SymbolIcon({ className, "aria-label": label, ...props }: IconProps) {
    return (
      <span
        data-ui-icon
        className={cn(frame, className)}
        aria-label={label}
        role={label ? "img" : undefined}
        aria-hidden={label ? undefined : true}
        {...props}
      >
        {symbol}
      </span>
    );
  };
}

function chevron(rotation: string) {
  return function Chevron({ className, ...props }: IconProps) {
    return (
      <span data-ui-icon className={cn(frame, className)} aria-hidden="true" {...props}>
        <span className={cn("size-[42%] border-b border-r border-current", rotation)} />
      </span>
    );
  };
}

export function IconLoader2({ className, ...props }: IconProps) {
  return (
    <span data-ui-icon className={cn(frame, className)} aria-hidden="true" {...props}>
      <span className="size-[80%] rounded-full border-2 border-current border-t-transparent" />
    </span>
  );
}

export const IconCoin = spriteIcon("gold_nugget");
export const IconCoins = spriteIcon("gold_ingot");
export const IconBot = spriteIcon("command_block");
export const IconSparkles = spriteIcon("glowstone_dust");
export const IconSwords = spriteIcon("iron_sword");
export const IconShield = spriteIcon("shield");
export const IconShieldCheck = spriteIcon("shield");
export const IconShieldAlert = spriteIcon("shield");
export const IconZap = spriteIcon("redstone_torch");
export const IconTarget = spriteIcon("target");
export const IconTrendingUp = spriteIcon("emerald");
export const IconTrendingDown = spriteIcon("redstone");
export const IconHistory = spriteIcon("clock");
export const IconAward = spriteIcon("golden_helmet");
export const IconCrosshair = spriteIcon("target");
export const IconSliders = spriteIcon("comparator");
export const IconCompass = spriteIcon("compass");
export const IconBoxes = spriteIcon("chest");
export const IconKeyRound = spriteIcon("tripwire_hook");
export const IconLayoutDashboard = spriteIcon("compass");
export const IconLineChart = spriteIcon("map");
export const IconLock = spriteIcon("iron_door");
export const IconGem = spriteIcon("diamond");
export const IconBookOpen = spriteIcon("book");
export const IconTag = spriteIcon("name_tag");
export const IconStore = spriteIcon("gold_ingot");
export const IconMapPin = spriteIcon("filled_map");
export const IconScrollText = spriteIcon("paper");
export const IconTrophy = spriteIcon("golden_helmet");
export const IconBarChart3 = spriteIcon("map");
export const IconScale = spriteIcon("comparator");
export const IconGavel = spriteIcon("anvil");
export const IconTrash2 = spriteIcon("cauldron");
export const IconCalculator = spriteIcon("comparator");
export const IconHammer = spriteIcon("anvil");
export const IconHammer2 = spriteIcon("anvil");
export const IconShoppingCart = spriteIcon("minecart");
export const IconPickaxe = spriteIcon("iron_pickaxe");
export const IconWheat = spriteIcon("wheat");
export const IconFlaskConical = spriteIcon("glass_bottle");
export const IconHeart = spriteIcon("glistering_melon_slice");
export const IconFish = spriteIcon("cod");
export const IconFlame = spriteIcon("fire_charge");
export const IconMoon = spriteIcon("clock");
export const IconSprout = spriteIcon("oak_sapling");
export const IconSkull = spriteIcon("skeleton_skull");
export const IconCrown = spriteIcon("golden_helmet");
export const IconBellRing = spriteIcon("bell");
export const IconHourglass = spriteIcon("clock");
export const IconClock = spriteIcon("clock");
export const IconPin = spriteIcon("redstone_torch");
export const IconUserCheck = spriteIcon("player_head");
export const IconBell = spriteIcon("bell");
export const IconMap = spriteIcon("filled_map");
export const IconUserRound = spriteIcon("player_head");
export const IconWandSparkles = spriteIcon("blaze_rod");
export const IconCalendar = spriteIcon("clock");
export const IconGauge = spriteIcon("compass");
export const IconSettings = spriteIcon("redstone");
export const IconSun = spriteIcon("glowstone_dust");
export const IconUser = spriteIcon("player_head");
export const IconFilter = spriteIcon("hopper");
export const IconSlidersHorizontal = spriteIcon("comparator");
export const IconDog = spriteIcon("wolf_spawn_egg");
export const IconRadio = spriteIcon("note_block");
export const IconLayers = spriteIcon("bookshelf");
export const IconSword = spriteIcon("iron_sword");
export const IconSearch = spriteIcon("spyglass");

export const IconStar = symbolIcon("☆");
export const IconCircleCheck = symbolIcon("✓");
export const IconCircle = symbolIcon("○");
export const IconXCircle = symbolIcon("×");
export const IconInfoCircle = symbolIcon("i");
export const IconAlertCircle = symbolIcon("!");
export const IconCheckCircle2 = symbolIcon("✓");
export const IconAlertTriangle = symbolIcon("!");
export const IconRefresh = symbolIcon("↻");
export const IconExternalLink = symbolIcon("↗");
export const IconRefreshCw = symbolIcon("↻");
export const IconArrowRight = symbolIcon("→");
export const IconArrowLeft = symbolIcon("←");
export const IconArrowUp = symbolIcon("↑");
export const IconRotateCcw = symbolIcon("↶");
export const IconArrowDown = symbolIcon("↓");
export const IconVolume2 = symbolIcon("♪");
export const IconVolumeX = symbolIcon("×");
export const IconCircleCheck2 = symbolIcon("✓");
export const IconPlus = symbolIcon("+");
export const IconX = symbolIcon("×");
export const IconMenu = symbolIcon("☰");
export const IconPlay = symbolIcon("▶");
export const IconPanelLeft = symbolIcon("☰");
export const IconPanelLeftClose = symbolIcon("←");
export const IconPanelLeftOpen = symbolIcon("→");
export const IconCircleHelp = symbolIcon("?");
export const IconCheck = symbolIcon("✓");
export const IconMoreHorizontal = symbolIcon("⋯");
export const IconCopy = symbolIcon("▣");
export const IconShare2 = symbolIcon("↗");
export const IconDownload = symbolIcon("↓");
export const IconArrowUpRight = symbolIcon("↗");
export const IconMinus = symbolIcon("−");
export const IconGripVertical = symbolIcon("⋮");

export const IconChevronRight = chevron("-rotate-45");
export const IconChevronDown = chevron("rotate-45");
export const IconChevronUp = chevron("-rotate-[135deg]");
export const IconChevronLeft = chevron("rotate-[135deg]");
