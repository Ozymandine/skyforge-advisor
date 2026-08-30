import { type SVGProps } from "react";
import { cn } from "@/lib/utils";

export interface IconProps extends SVGProps<SVGSVGElement> {
  /** Icon size variant */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  /** Semantic color variant */
  color?: "default" | "primary" | "muted" | "destructive" | "success";
  /** Stroke width variant */
  strokeWidth?: "default" | "bold";
  /** Aria label for accessibility when icon stands alone */
  "aria-label"?: string;
}

/**
 * Base Icon wrapper — applies sizing, color, and stroke width from design tokens.
 * All custom icons should be used through this component.
 */
export function Icon({
  children,
  className,
  size = "md",
  color = "default",
  strokeWidth = "default",
  "aria-label": ariaLabel,
  ...props
}: IconProps) {
  const sizeClasses = {
    xs: "w-[14px] h-[14px]",
    sm: "w-[18px] h-[18px]",
    md: "w-[22px] h-[22px]",
    lg: "w-[28px] h-[28px]",
    xl: "w-[36px] h-[36px]",
    "2xl": "w-[48px] h-[48px]",
  };

  const colorClasses = {
    default: "text-muted-foreground",
    primary: "text-gold-foil",
    muted: "text-muted-foreground",
    destructive: "text-oxblood-bright",
    success: "text-antique-emerald-bright",
  };

  const strokeClasses = {
    default: "[&>*:not([stroke-width])]:stroke-[1.5]",
    bold: "[&>*:not([stroke-width])]:stroke-[2]",
  };

  return (
    <svg
      aria-hidden={!ariaLabel}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      className={cn(
        "inline-block flex-shrink-0",
        "stroke-current fill-none",
        sizeClasses[size],
        colorClasses[color],
        strokeClasses[strokeWidth],
        className,
      )}
      {...props}
    >
      {children}
    </svg>
  );
}

/**
 * Icon component factory — creates a typed icon component from SVG path data.
 */
export function createIcon<S extends SVGProps<SVGSVGElement>>(
  name: string,
  paths: React.ReactNode,
  defaultProps?: Partial<IconProps>,
) {
  const Component = ({ className, ...props }: S) => (
    <Icon className={className} {...defaultProps} {...props}>
      {paths}
    </Icon>
  );
  Component.displayName = `Icon${name}`;
  return Component;
}

/* ============================================================================
 * RE-EXPORTS: All custom SVG icons from src/assets/icons/index.tsx
 * ========================================================================== */

export {
  // Core UI
  IconChevronDown,
  IconChevronRight,
  IconChevronUp,
  IconChevronLeft,
  IconX,
  IconCheck,
  IconCircle,
  IconCircleCheck,
  IconCircleCheck2,
  IconPlus,
  IconMinus,
  IconLoader2,
  IconSearch,
  IconMoreHorizontal,
  IconSlidersHorizontal,
  IconExternalLink,

  // Navigation / Layout
  IconPanelLeft,
  IconPanelLeftOpen,
  IconPanelLeftClose,
  IconLayoutDashboard,
  IconMenu,
  IconSettings,

  // Actions
  IconArrowRight,
  IconArrowLeft,
  IconArrowUp,
  IconArrowDown,
  IconArrowUpRight,
  IconRefreshCw,
  IconRotateCcw,
  IconCopy,
  IconPin,
  IconShare2,
  IconDownload,
  IconTrash2,

  // Status / Feedback
  IconAlertCircle,
  IconAlertTriangle,
  IconCheckCircle2,
  IconInfoCircle,
  IconXCircle,
  IconCircleHelp,
  IconBell,
  IconBellRing,
  IconHistory,

  // Gaming / SkyBlock Specific
  IconCoin,
  IconCoins,
  IconCrown,
  IconBot,
  IconSparkles,
  IconSwords,
  IconShield,
  IconShieldCheck,
  IconShieldAlert,
  IconZap,
  IconTarget,
  IconTrendingUp,
  IconTrendingDown,
  IconHammer,
  IconHammer2,
  IconKeyRound,
  IconLock,
  IconAward,
  IconTrophy,
  IconSkull,
  IconFlame,
  IconCrosshair,
  IconWheat,
  IconFish,
  IconFlaskConical,
  IconPickaxe,
  IconShoppingCart,
  IconStore,
  IconTag,
  IconMapPin,
  IconScrollText,
  IconMap,
  IconUserRound,
  IconWandSparkles,
  IconGavel,
  IconUser,
  IconUserCheck,
  IconCalendar,
  IconClock,
  IconHourglass,
  IconMoon,
  IconHeart,
  IconScale,
  IconBarChart3,
  IconGauge,
  IconSprout,
  IconSliders,
  IconCalculator,
  IconCompass,
  IconGripVertical,
  IconLineChart,
  IconStar,
  IconSun,
  IconPlay,
  IconDog,
  IconRadio,
  IconLayers,
  IconSword,
  IconGem,
  IconBookOpen,
  IconBoxes,
} from "@/assets/icons/index";
