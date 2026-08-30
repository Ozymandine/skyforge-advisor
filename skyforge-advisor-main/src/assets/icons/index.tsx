import { createIcon } from "@/components/ui/icon";

/* ============================================================================
 * CORE UI ICONS
 * ========================================================================== */

export const IconCoin = createIcon(
  "Coin",
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v12M6 12h12" strokeLinecap="round" />
  </>,
);

export const IconCoins = createIcon(
  "Coins",
  <>
    <circle cx="8" cy="8" r="6" />
    <circle cx="16" cy="16" r="6" />
    <text
      x="8"
      y="11"
      textAnchor="middle"
      fontSize="6"
      fontFamily="Georgia, serif"
      fontWeight="bold"
      fill="currentColor"
    >
      ₵
    </text>
    <text
      x="16"
      y="19"
      textAnchor="middle"
      fontSize="6"
      fontFamily="Georgia, serif"
      fontWeight="bold"
      fill="currentColor"
    >
      ₵
    </text>
  </>,
);

export const IconBot = createIcon(
  "Bot",
  <>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M6 8h4M14 8h4" strokeLinecap="round" />
    <line x1="6" y1="12" x2="6.01" y2="12" />
    <line x1="18" y1="12" x2="18.01" y2="12" />
    <path d="M8 16h8" strokeLinecap="round" />
  </>,
);

export const IconSparkles = createIcon(
  "Sparkles",
  <>
    <path d="M12 3v1M12 20v1M3 12h1M20 12h1" strokeLinecap="round" strokeWidth="2" />
    <path d="M5 5l1 1M18 18l1 1M5 19l1-1M18 6l1-1" strokeLinecap="round" strokeWidth="2" />
    <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.3" />
  </>,
);

export const IconSwords = createIcon(
  "Swords",
  <>
    <path d="M10 6L6 10" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    <path d="M14 14l4-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    <path d="M6 10l-2-2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    <path d="M14 14l2 2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    <path d="M10 6l4 4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    <path d="M14 14l-4-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </>,
);

export const IconShield = createIcon(
  "Shield",
  <>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </>,
);

export const IconShieldCheck = createIcon(
  "ShieldCheck",
  <>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
  </>,
);

export const IconShieldAlert = createIcon(
  "ShieldAlert",
  <>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </>,
);

export const IconZap = createIcon(
  "Zap",
  <path
    d="M13 2L3 14h9l-1 8 10-17h-9l1-8z"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
  />,
);

export const IconTarget = createIcon(
  "Target",
  <>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </>,
);

export const IconTrendingUp = createIcon(
  "TrendingUp",
  <>
    <path d="M16 7l-8 8 4 4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    <circle cx="8" cy="15" r="2" fill="currentColor" />
  </>,
);

export const IconTrendingDown = createIcon(
  "TrendingDown",
  <>
    <path d="M8 17l8-8-4-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    <circle cx="16" cy="9" r="2" fill="currentColor" />
  </>,
);

export const IconHistory = createIcon(
  "History",
  <>
    <circle cx="12" cy="12" r="10" />
    <polyline
      points="12 6 12 12 16 14"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </>,
);

export const IconAward = createIcon(
  "Award",
  <>
    <circle cx="12" cy="8" r="7" />
    <path d="M9 21h6" />
    <path d="M12 17v-5" />
  </>,
);

export const IconCrosshair = createIcon(
  "Crosshair",
  <>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="4" x2="12" y2="8" />
    <line x1="12" y1="16" x2="12" y2="20" />
    <line x1="4" y1="12" x2="8" y2="12" />
    <line x1="16" y1="12" x2="20" y2="12" />
  </>,
);

export const IconSliders = createIcon(
  "Sliders",
  <>
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" strokeWidth="4" strokeLinecap="round" />
    <line x1="9" y1="8" x2="15" y2="8" strokeWidth="4" strokeLinecap="round" />
    <line x1="17" y1="16" x2="23" y2="16" strokeWidth="4" strokeLinecap="round" />
  </>,
);

export const IconCompass = createIcon(
  "Compass",
  <>
    <circle cx="12" cy="12" r="10" />
    <polygon points="12 2 13.5 6 12 10 10.5 6 12 2" />
    <polygon points="12 22 13.5 18 12 14 10.5 18 12 22" />
    <polygon points="2 12 6 10.5 10 12 6 13.5 2 12" />
    <polygon points="22 12 18 10.5 14 12 18 13.5 22 12" />
  </>,
);

export const IconBoxes = createIcon(
  "Boxes",
  <>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <path d="M3.27 6.96L12 12.01l8.73-5.05" />
    <path d="M12 22.08V12" />
  </>,
);

export const IconKeyRound = createIcon(
  "KeyRound",
  <>
    <circle cx="12" cy="16" r="4" />
    <path d="M12 12v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4" />
    <path d="M16 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
  </>,
);

export const IconLayoutDashboard = createIcon(
  "LayoutDashboard",
  <>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </>,
);

export const IconLineChart = createIcon(
  "LineChart",
  <>
    <path d="M3 21v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4" strokeLinecap="round" />
    <path
      d="M9 18l3-6 3 3 4-8"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      fill="none"
    />
  </>,
);

export const IconStar = createIcon(
  "Star",
  <>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.2" />
  </>,
);

export const IconLock = createIcon(
  "Lock",
  <>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    <circle cx="12" cy="16" r="1" fill="currentColor" />
  </>,
);

export const IconCircleCheck = createIcon(
  "CircleCheck",
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
  </>,
);

export const IconCircle = createIcon("Circle", <circle cx="12" cy="12" r="10" />);

export const IconXCircle = createIcon(
  "XCircle",
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M9 9l6 6M15 9l-6 6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </>,
);

export const IconInfoCircle = createIcon(
  "InfoCircle",
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </>,
);

export const IconAlertCircle = createIcon(
  "AlertCircle",
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4M12 16h.01" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
  </>,
);

export const IconCheckCircle2 = createIcon(
  "CheckCircle2",
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
  </>,
);

export const IconAlertTriangle = createIcon(
  "AlertTriangle",
  <>
    <path d="M12 2L2 22h20L12 2z" />
    <path d="M12 9v4M12 17h.01" strokeLinecap="round" strokeWidth="2" />
  </>,
);

export const IconRefresh = createIcon(
  "Refresh",
  <>
    <path d="M4 4v4h4M20 20v-4h-4" strokeLinecap="round" strokeWidth="2" />
    <path d="M20 4a10 10 0 1 1-10 10" />
    <path d="M16 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
  </>,
);

export const IconExternalLink = createIcon(
  "ExternalLink",
  <>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <path d="M15 3h6v6" />
    <path d="M10 14L21 3" strokeLinecap="round" strokeWidth="2" />
  </>,
);

export const IconChevronRight = createIcon(
  "ChevronRight",
  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />,
);

export const IconChevronDown = createIcon(
  "ChevronDown",
  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />,
);

export const IconSearch = createIcon(
  "Search",
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="M16 16l5 5" strokeLinecap="round" />
    <path d="M8 11h6M11 8v6" strokeLinecap="round" strokeWidth="1" opacity="0.3" />
  </>,
);

export const IconRefreshCw = createIcon(
  "RefreshCw",
  <>
    <path d="M21 12a9 9 0 0 1-9 9c-2.52 0-4.93-1-6.74-2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M21 12a9 9 0 0 0-9-9c-2.52 0-4.93 1-6.74 2.74L3 16" />
    <path d="M21 21v-5h-5" />
  </>,
);

export const IconArrowRight = createIcon(
  "ArrowRight",
  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />,
);

export const IconArrowLeft = createIcon(
  "ArrowLeft",
  <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />,
);

export const IconArrowUp = createIcon(
  "ArrowUp",
  <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />,
);

export const IconRotateCcw = createIcon(
  "RotateCcw",
  <>
    <path d="M1 4v6h6" />
    <path d="M23 20v-6h-6" />
    <path d="M20 20a15 15 0 0 0-28-28" />
  </>,
);

export const IconArrowDown = createIcon(
  "ArrowDown",
  <path d="M12 5v14M19 12l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />,
);

export const IconChevronUp = createIcon(
  "ChevronUp",
  <path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />,
);

export const IconChevronLeft = createIcon(
  "ChevronLeft",
  <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />,
);

export const IconGem = createIcon(
  "Gem",
  <>
    <path d="M6 3h12l4 6-10 13L2 9Z" />
    <path d="M11 3v10" />
    <path d="M7 9h10" />
    <path d="M9 13h6" />
  </>,
);

export const IconBookOpen = createIcon(
  "BookOpen",
  <>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </>,
);

export const IconTag = createIcon(
  "Tag",
  <>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </>,
);

export const IconStore = createIcon(
  "Store",
  <>
    <path d="M20 21v-8a2 2 0 0 0-2-2h-12a2 2 0 0 0-2 2v8" />
    <path d="M2 21h20" />
    <path d="M6 15v-4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4" />
    <path d="M12 3v9" />
  </>,
);

export const IconMapPin = createIcon(
  "MapPin",
  <>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </>,
);

export const IconScrollText = createIcon(
  "ScrollText",
  <>
    <path d="M19 17V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3" />
    <path d="M8 15h8" />
    <path d="M8 19h6" />
    <path d="M8 11h12" />
  </>,
);

export const IconTrophy = createIcon(
  "Trophy",
  <>
    <path d="M6 9a6 6 0 0 1 12 0H6z" />
    <path d="M12 9v10" />
    <path d="M4 15h16" />
    <path d="M8 5h8" strokeLinecap="round" />
    <path d="M10 3v2M14 3v2" strokeLinecap="round" />
  </>,
);

export const IconBarChart3 = createIcon(
  "BarChart3",
  <>
    <path d="M3 3v18h18" strokeLinecap="round" />
    <rect x="7" y="13" width="3" height="5" rx="0.5" />
    <rect x="12" y="8" width="3" height="10" rx="0.5" />
    <rect x="17" y="15" width="3" height="3" rx="0.5" />
  </>,
);

export const IconVolume2 = createIcon(
  "Volume2",
  <>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </>,
);

export const IconVolumeX = createIcon(
  "VolumeX",
  <>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </>,
);

export const IconScale = createIcon(
  "Scale",
  <>
    <path d="M19 3H5" />
    <path d="M21 12H7" />
    <path d="M21 21H3" />
    <path d="M16 7l-4 4" />
    <path d="M20 21l-4-4" />
  </>,
);

export const IconCircleCheck2 = createIcon(
  "CircleCheck2",
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
  </>,
);

export const IconPlus = createIcon(
  "Plus",
  <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />,
);

export const IconX = createIcon(
  "X",
  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />,
);

export const IconGavel = createIcon(
  "Gavel",
  <>
    <path d="M14.5 3.5L12 6l-4 4 6 6 4-4-6-6z" />
    <path d="M17 13l4-4" />
    <path d="M9 21l-4-4" />
    <path d="M13 17l-4-4" />
  </>,
);

export const IconTrash2 = createIcon(
  "Trash2",
  <>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </>,
);

export const IconCalculator = createIcon(
  "Calculator",
  <>
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <path d="M17 2v20" />
    <path d="M5 14h14" />
    <path d="M5 10h14" />
    <path d="M5 6h14" />
  </>,
);

export const IconHammer = createIcon(
  "Hammer",
  <>
    <path d="M15 12l-10 10" />
    <path d="M12 15v6l3-3" />
    <path d="M9.5 9.5l5 5" />
  </>,
);

export const IconHammer2 = createIcon(
  "Hammer2",
  <>
    <path d="M15 12l-10 10" />
    <path d="M12 15v6l3-3" />
    <path d="M9.5 9.5l5 5" />
  </>,
);

export const IconShoppingCart = createIcon(
  "ShoppingCart",
  <>
    <circle cx="9" cy="21" r="1" fill="currentColor" />
    <circle cx="20" cy="21" r="1" fill="currentColor" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </>,
);

export const IconPickaxe = createIcon(
  "Pickaxe",
  <>
    <path
      d="M10.5 20.5L3 13l8-8 7.5 7.5L3 21l9-9"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <path d="M13.5 6.5l4 4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </>,
);

export const IconWheat = createIcon(
  "Wheat",
  <>
    <path d="M12 2v20" />
    <path d="M9 6h6" />
    <path d="M8 10h8" />
    <path d="M7 14h10" />
    <path d="M6 18h12" />
  </>,
);

export const IconFlaskConical = createIcon(
  "FlaskConical",
  <>
    <path d="M10 2v7.31" />
    <path d="M14 2v7.31" />
    <path d="M10 9.31a4.94 4.94 0 0 0-1.17 2.69 5 5 0 0 1-4 3.47" />
    <path d="M14 9.31a4.94 4.94 0 0 1 1.17 2.69 5 5 0 0 0 4 3.47" />
    <path d="M8.5 15.31h7" />
  </>,
);

export const IconHeart = createIcon(
  "Heart",
  <>
    <path
      d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </>,
);

export const IconFish = createIcon(
  "Fish",
  <>
    <path
      d="M2 16s9-15 20-4C14 25 8 23 2 16z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <path
      d="M16 8c0 4-4 8-8 8s-8-4-8-8 4-8 8-8 8 4 8 8"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      strokeDasharray="4,4"
    />
  </>,
);

export const IconFlame = createIcon(
  "Flame",
  <>
    <path d="M8.5 14.5A2.5 2.5 0 0 1 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 1 2.5 2.5z" />
  </>,
);

export const IconMoon = createIcon("Moon", <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />);

export const IconSprout = createIcon(
  "Sprout",
  <>
    <path d="M12 22v-6l-4-4 8-8 4 4v6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 16l4 4" strokeLinecap="round" />
    <path d="M8 16l-4 4" strokeLinecap="round" />
  </>,
);

export const IconSkull = createIcon(
  "Skull",
  <>
    <path d="M12 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16z" />
    <circle cx="9" cy="10" r="1.5" fill="currentColor" />
    <circle cx="15" cy="10" r="1.5" fill="currentColor" />
    <path d="M9 15h6" strokeLinecap="round" />
    <path d="M11 13h2M13 13h2" strokeLinecap="round" strokeWidth="1" opacity="0.5" />
  </>,
);

export const IconCrown = createIcon(
  "Crown",
  <>
    <path
      d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </>,
);

export const IconBellRing = createIcon(
  "BellRing",
  <>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </>,
);

export const IconMenu = createIcon(
  "Menu",
  <>
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </>,
);

export const IconPlay = createIcon("Play", <polygon points="5 3 19 12 5 21 5 3" />);

export const IconPanelLeft = createIcon(
  "PanelLeft",
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="9" y1="3" x2="9" y2="21" />
    <line x1="15" y1="3" x2="15" y2="21" />
  </>,
);

export const IconHourglass = createIcon(
  "Hourglass",
  <>
    <path d="M6 4h16" />
    <path d="M6 20h16" />
    <path d="M10 4l-2 8 4 8-2 8" />
    <path d="M14 4l2 8-4 8 2 8" />
  </>,
);

export const IconClock = createIcon(
  "Clock",
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </>,
);

export const IconLoader2 = createIcon(
  "Loader2",
  <>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    <path d="M21 12a9 9 0 1 1-6.219 8.56" />
  </>,
);

export const IconPin = createIcon(
  "Pin",
  <>
    <path d="M12 17v5" />
    <path d="M9 10a3 3 0 0 1 6 0v5" />
    <path d="M15 7a1 1 0 0 1 1 1v2.5" />
  </>,
);

export const IconUserCheck = createIcon(
  "UserCheck",
  <>
    <circle cx="12" cy="8" r="5" />
    <path d="M4 21c0-3.5 2.5-6.5 6-6.5s6 3 6 6.5" />
    <path d="M16 14l2 2 4-4" />
  </>,
);

export const IconBell = createIcon(
  "Bell",
  <>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </>,
);

export const IconMap = createIcon(
  "Map",
  <>
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
    <line x1="9" y1="3" x2="9" y2="21" />
    <line x1="15" y1="6" x2="15" y2="18" />
  </>,
);

export const IconUserRound = createIcon(
  "UserRound",
  <>
    <circle cx="12" cy="8" r="5" />
    <path d="M20 21a8 8 0 0 0-16 0" />
  </>,
);

export const IconWandSparkles = createIcon(
  "WandSparkles",
  <>
    <path d="M12 3v10" />
    <path d="M8 8h8" />
    <path d="M12 13a4 4 0 0 1 0 8H7" />
    <path d="m16 6 2 2" />
    <path d="m18 4-2 2" />
    <path d="m16 16 2 2" />
    <path d="m18 18-2 2" />
  </>,
);

export const IconCircleHelp = createIcon(
  "CircleHelp",
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </>,
);

export const IconCalendar = createIcon(
  "Calendar",
  <>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </>,
);

export const IconCheck = createIcon(
  "Check",
  <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />,
);

export const IconGauge = createIcon(
  "Gauge",
  <>
    <path d="M12 2a10 10 0 1 0 10 10" />
    <path d="M12 6v6" />
  </>,
);

export const IconPanelLeftClose = createIcon(
  "PanelLeftClose",
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="9" y1="3" x2="9" y2="21" />
    <line x1="15" y1="3" x2="15" y2="21" />
    <line x1="12" y1="8" x2="12" y2="16" strokeWidth="3" strokeLinecap="round" />
  </>,
);

export const IconPanelLeftOpen = createIcon(
  "PanelLeftOpen",
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="9" y1="3" x2="9" y2="21" />
    <line x1="15" y1="3" x2="15" y2="21" />
    <line x1="6" y1="12" x2="6.01" y2="12" strokeWidth="3" />
  </>,
);

export const IconSettings = createIcon(
  "Settings",
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </>,
);

export const IconSun = createIcon(
  "Sun",
  <>
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </>,
);

export const IconUser = createIcon(
  "User",
  <>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </>,
);

export const IconMoreHorizontal = createIcon(
  "MoreHorizontal",
  <>
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="19" cy="12" r="1" fill="currentColor" />
    <circle cx="5" cy="12" r="1" fill="currentColor" />
  </>,
);

export const IconFilter = createIcon(
  "Filter",
  <>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </>,
);

export const IconSlidersHorizontal = createIcon(
  "SlidersHorizontal",
  <>
    <line x1="21" y1="4" x2="3" y2="4" />
    <line x1="21" y1="12" x2="3" y2="12" />
    <line x1="21" y1="20" x2="3" y2="20" />
    <line x1="7" y1="6" x2="7" y2="2" strokeWidth="4" strokeLinecap="round" />
    <line x1="15" y1="14" x2="15" y2="10" strokeWidth="4" strokeLinecap="round" />
    <line x1="11" y1="22" x2="11" y2="18" strokeWidth="4" strokeLinecap="round" />
  </>,
);

export const IconCopy = createIcon(
  "Copy",
  <>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </>,
);

export const IconDog = createIcon(
  "Dog",
  <>
    <path d="M12 2c-4.2 0-7.2 3-7.2 6.5 0 1.7 0.8 3.2 2 4.1" />
    <path d="M19 10V8a2 2 0 0 0-2-2h-1" />
    <path d="M15 10V8a2 2 0 0 0-2-2h-1" />
    <path d="M4 16v-2.5c0-1.5 2-2.5 4-2.5s4 1 4 2.5V16" />
    <path d="M8.5 14h7" />
    <path d="M9 10h1" />
    <path d="M14 10h1" />
  </>,
);

export const IconRadio = createIcon(
  "Radio",
  <>
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.03 0 3.9 0.7 5.26 1.84" />
    <path d="M15.54 15.54a8 8 0 0 0-7.08-7.08" />
  </>,
);

export const IconLayers = createIcon(
  "Layers",
  <>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </>,
);

export const IconShare2 = createIcon(
  "Share2",
  <>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </>,
);

export const IconDownload = createIcon(
  "Download",
  <>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline
      points="7 10 12 15 17 10"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <line
      x1="12"
      y1="15"
      x2="12"
      y2="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </>,
);

export const IconSword = createIcon(
  "Sword",
  <>
    <polyline
      points="14.5 17.5 3 6 3 3 6 3 17.5 14.5 17.5 17.5 20 20 15 17.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <line x1="5" y1="6" x2="5.01" y2="6" />
    <line x1="15" y1="19" x2="15.01" y2="19" />
  </>,
);

export const IconArrowUpRight = createIcon(
  "ArrowUpRight",
  <>
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="17 7 7 7 7 17" />
  </>,
);

export const IconMinus = createIcon(
  "Minus",
  <line
    x1="5"
    y1="12"
    x2="19"
    y2="12"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
  />,
);

export const IconGripVertical = createIcon(
  "GripVertical",
  <>
    <circle cx="9" cy="6" r="1.5" />
    <circle cx="9" cy="12" r="1.5" />
    <circle cx="9" cy="18" r="1.5" />
  </>,
);
