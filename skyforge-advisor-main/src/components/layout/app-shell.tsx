import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Menu,
  X,
  Bell,
  Swords,
  BookOpen,
  Boxes,
  Compass,
  Coins,
  Gauge,
  Hammer,
  KeyRound,
  LayoutDashboard,
  LineChart,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  Search,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  ChevronDown,
  Check,
  Sun,
  Moon,
  User,
  Calendar,
  Bot,
  Skull,
  Sprout,
  Trophy,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

import headerVideo from "@/assets/skyblock-header.mp4";
import { usePlayer, useAccount } from "@/hooks/use-account";
import {
  fetchBazaar,
  fetchAuctions,
  fetchItemIndex,
  fetchApiHealth,
} from "@/lib/hypixel.functions";
import { markAllRead, useNotificationFeed } from "@/hooks/use-notification-feed";
import { applyTheme, getTheme, onThemeChange, setTheme as setThemeStored } from "@/lib/theme";
import { getPref, onPrefsChange } from "@/lib/prefs";
import { formatNumber, type BazaarProduct } from "@/lib/skyblock";
import { RankBadge } from "@/components/ui/rank-badge";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const nav = [
  {
    group: "Overview",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    group: "Progression",
    items: [
      { to: "/skills", label: "Skills", icon: Sparkles },
      { to: "/collections", label: "Collections", icon: Compass },
      { to: "/inventory", label: "Inventory", icon: Boxes },
    ],
  },
  {
    group: "Economy",
    items: [
      { to: "/bazaar", label: "Bazaar", icon: TrendingUp },
      { to: "/auction-house", label: "Auction House", icon: Hammer },
    ],
  },
  {
    group: "Tools",
    items: [
      { to: "/leaderboards", label: "Leaderboards", icon: Trophy },
      { to: "/calendar", label: "Calendar", icon: Calendar },
      { to: "/analytics", label: "Analytics", icon: LineChart },
      { to: "/wiki", label: "Wiki", icon: BookOpen },
    ],
  },
  {
    group: "Profile",
    items: [
      { to: "/notifications", label: "Notifications", icon: Bell },
      { to: "/settings", label: "Settings", icon: Settings },
    ],
  },
] as const;

function PlayerHeadAvatar({
  uuid,
  name,
  size = 36,
  className,
}: {
  uuid?: string | undefined;
  name?: string | undefined;
  size?: number | undefined;
  className?: string | undefined;
}) {
  const [failed, setFailed] = useState(false);
  const identifier = uuid || name;
  const initials = (name || "SB").slice(0, 2).toUpperCase();

  if (!identifier || failed) {
    return (
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 font-mono text-xs font-bold",
          className,
        )}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-emerald-500/25 bg-emerald-500/15",
        className,
      )}
    >
      <img
        src={`https://mc-heads.net/avatar/${encodeURIComponent(identifier)}/${size}`}
        alt={name || "Player avatar"}
        loading="lazy"
        onError={() => setFailed(true)}
        className="size-full object-cover"
      />
    </div>
  );
}

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const account = useAccount();
  const player = usePlayer();
  const profiles = player.data?.profiles ?? [];
  const activeProfile = profiles.find(
    (p) => p.profileId === (account.profileId || player.data?.activeProfileId),
  );

  return (
    <aside
      className={cn(
        "sticky top-0 z-30 hidden h-screen shrink-0 flex-col border-r border-white/10 bg-[#0B0E14] lg:flex transition-all duration-300 ease-in-out",
        collapsed ? "w-[68px]" : "w-[204px]",
      )}
    >
      {/* Centered Wordmark */}
      <div className="flex flex-col items-center justify-center px-3 pt-5 pb-2.5 transition-all duration-300">
        {!collapsed ? (
          <span className="font-pixel inline-block bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text font-black text-[23px] tracking-[0.18em] text-transparent select-none drop-shadow-[0_4px_22px_rgba(52,211,153,0.5)]">
            SKYFORGE
          </span>
        ) : (
          <span className="font-pixel inline-block bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text font-black text-lg tracking-wider text-transparent select-none drop-shadow-[0_2px_14px_rgba(52,211,153,0.5)]">
            SF
          </span>
        )}
      </div>

      {/* Big Pill Toggle Button */}
      <div className="px-3 pb-1.5">
        <button
          onClick={onToggle}
          aria-label="Toggle sidebar"
          className="flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] py-1.5 text-muted-foreground transition-all duration-150 hover:transition-none hover:bg-white/15 hover:text-foreground hover:border-white/20 active:bg-white/20 cursor-pointer"
        >
          {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 pt-2 pb-3 space-y-3">
        {nav.map((section) => (
          <div key={section.group} className="space-y-0.5">
            {!collapsed && (
              <p className="eyebrow px-2.5 text-[10px] font-bold uppercase tracking-wider text-white/35 pb-1">
                {section.group}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    title={item.label}
                    className={cn(
                      "group relative flex h-9 items-center gap-2.5 rounded-xl px-2.5 text-[15px] font-medium text-white/70 select-none cursor-pointer transition-all duration-150 border border-transparent will-change-transform",
                      "hover:transition-none hover:bg-white/[0.08] hover:text-white hover:border-white/10 hover:translate-x-0.5",
                      "active:scale-[0.98] active:bg-white/[0.15]",
                      collapsed && "justify-center px-0 hover:translate-x-0",
                    )}
                    activeProps={{
                      className:
                        "bg-white/[0.12] text-white border-l-2 border-emerald-400 font-semibold shadow-sm ring-1 ring-white/10 hover:translate-x-0",
                    }}
                  >
                    <item.icon className="size-4.5 shrink-0 text-white/55 group-hover:text-white group-hover:transition-none transition-colors duration-150" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom Profile Selector Card */}
      <div className="border-t border-white/10 p-2.5">
        {player.data ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full text-left outline-none">
              <div
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] p-1.5 transition-all duration-150 hover:transition-none hover:bg-white/[0.09] hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 active:scale-[0.98] cursor-pointer will-change-transform",
                  collapsed && "justify-center p-1.5",
                )}
              >
                <PlayerHeadAvatar
                  uuid={player.data.uuid}
                  name={player.data.username || account.username}
                  size={26}
                  className="size-6.5 shrink-0 rounded-lg"
                />
                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <RankBadge rankData={player.data.hypixelPlayer} size="sm" />
                      <p className="truncate text-xs font-bold text-foreground">
                        {player.data.username}
                      </p>
                    </div>
                    <p className="flex items-center gap-1 text-[9.5px] text-muted-foreground font-mono">
                      <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="truncate">{activeProfile ? activeProfile.cuteName : "Profile"}</span>
                    </p>
                  </div>
                )}
                {!collapsed && (
                  <ChevronDown className="size-3 text-muted-foreground shrink-0 ml-auto" />
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              side={collapsed ? "right" : "top"}
              className="mb-2 w-64 border-white/10 bg-[#0E121B]/95 backdrop-blur-2xl p-2 shadow-2xl"
            >
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Select Active Profile
              </div>
              {profiles.map((p) => (
                <DropdownMenuItem
                  key={p.profileId}
                  onSelect={() => account.save({ profileId: p.profileId })}
                  className="flex items-center justify-between py-2 px-2.5 rounded-lg cursor-pointer hover:bg-white/10"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground">{p.cuteName}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">
                      {p.gameMode || "Standard"} profile · {p.members} member
                      {p.members > 1 ? "s" : ""}
                    </p>
                  </div>
                  {activeProfile?.profileId === p.profileId && (
                    <Check className="size-4 text-emerald-400 shrink-0" />
                  )}
                </DropdownMenuItem>
              ))}
              <div className="my-1 border-t border-white/10" />
              <DropdownMenuItem asChild className="cursor-pointer py-2 px-2.5 rounded-lg hover:bg-white/10">
                <Link to="/connect" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-white">
                  <KeyRound className="size-3.5 text-primary" /> Switch / Reconnect Account
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link
            to="/connect"
            title="Connect Account"
            className={cn(
              "flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] p-2 text-xs font-semibold text-white/80 transition-all hover:bg-white/[0.08] hover:border-emerald-500/40 hover:text-white",
              collapsed && "justify-center p-2",
            )}
          >
            <KeyRound className="size-4 shrink-0 text-emerald-400" />
            {!collapsed && <span className="truncate text-xs">Connect Account</span>}
          </Link>
        )}
      </div>
    </aside>
  );
}

/** Live economy ticker — top bazaar flips + ending-soon BIN flips. */
function EconomyTicker() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(getPref("ticker", false));
    return onPrefsChange(() => setEnabled(getPref("ticker", false)));
  }, []);

  if (!enabled) return null;

  return <TickerContent />;
}

function TickerContent() {
  const bazaar = useQuery({
    queryKey: ["bazaar"],
    queryFn: () => fetchBazaar(),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
  const auctions = useQuery({
    queryKey: ["auctions"],
    queryFn: () => fetchAuctions(),
    staleTime: 60_000,
    refetchInterval: 180_000,
  });

  const entries = [
    ...(bazaar.data?.products ?? []).slice(0, 8).map((p) => ({
      key: `bz-${p.id}`,
      label: p.name,
      value: `+${formatNumber(p.profitPerHour)}/hr`,
      up: true,
    })),
    ...(auctions.data?.entries ?? [])
      .filter((a) => a.profit > 0)
      .slice(0, 8)
      .map((a) => ({
        key: `ah-${a.uuid}`,
        label: a.name,
        value: `+${formatNumber(a.profit)} flip`,
        up: true,
      })),
  ];

  if (entries.length === 0) return null;

  // Duplicate the track so the marquee loops seamlessly.
  const loop = [...entries, ...entries];

  return (
    <div className="relative overflow-x-hidden overflow-y-hidden border-b border-white/10 bg-black/30 backdrop-blur-md">
      <div className="ticker-track py-1.5">
        {loop.map((entry, i) => (
          <span
            key={`${entry.key}-${i}`}
            className="flex shrink-0 items-center gap-2 px-5 text-[11px] text-muted-foreground"
          >
            <span className="size-1 rounded-full bg-emerald-400" />
            <span className="font-medium text-foreground/80">{entry.label}</span>
            <span
              className={cn(
                "font-mono font-semibold",
                entry.up ? "text-emerald-400" : "text-danger",
              )}
            >
              {entry.value}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

const THEME_STORAGE = "theme";

function Header({
  onOpenSearch,
  onOpenNav,
  onCycleThemeRef,
}: {
  onOpenSearch: () => void;
  onOpenNav: () => void;
  onCycleThemeRef: React.RefObject<(() => void) | null>;
}) {
  const account = useAccount();
  const player = usePlayer();
  const feed = useNotificationFeed();
  const [theme, setTheme] = useState<string>("dark");

  const profiles = player.data?.profiles ?? [];
  const activeProfile = profiles.find(
    (p) => p.profileId === (account.profileId || player.data?.activeProfileId),
  );

  useEffect(() => {
    setTheme(getTheme());
    applyTheme(getTheme());
    return onThemeChange(setTheme);
  }, []);

  const cycleTheme = () => {
    const order = ["dark", "solid", "light", "system"];
    const next = order[(order.indexOf(theme) + 1) % order.length]!;
    setThemeState(next);
  };

  const setThemeState = (next: string) => {
    setTheme(next);
    setThemeStored(next);
  };

  // Expose theme cycling to the command palette.
  useEffect(() => {
    onCycleThemeRef.current = cycleTheme;
    return () => {
      onCycleThemeRef.current = null;
    };
  });

  const themeIcon =
    theme === "light" ? (
      <Moon className="size-4 text-indigo-400" />
    ) : theme === "solid" ? (
      <Sun className="size-4 text-slate-300" />
    ) : (
      <Sun className="size-4 text-amber-400" />
    );

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0B0E14]">
      <div className="flex items-center gap-4 px-4 py-3 sm:px-6">
        <button
          onClick={onOpenSearch}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-muted-foreground transition-none hover:border-white/20 hover:bg-white/10 active:opacity-80 sm:max-w-xl"
        >
          <Search className="size-4 shrink-0" />
          <span className="truncate">Search or type a command...</span>
          <kbd className="ml-auto hidden rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:block">
            ⌘K
          </kbd>
        </button>

        <div className="ml-auto flex items-center gap-2.5">
          {/* Top-Right Profile Link (Connected) OR Connect Button (Not Connected) */}
          {player.data ? (
            <Link
              to="/profile/$username"
              params={{ username: player.data.username }}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 transition-all duration-150 hover:bg-white/[0.1] hover:border-white/20 active:scale-[0.99] cursor-pointer"
            >
              <PlayerHeadAvatar
                uuid={player.data.uuid}
                name={player.data.username || account.username}
                size={24}
                className="size-6 rounded-lg"
              />
              <div className="hidden sm:flex items-center gap-1.5">
                <RankBadge rankData={player.data.hypixelPlayer} size="sm" />
                <span className="truncate text-xs font-bold text-foreground max-w-[100px]">
                  {player.data.username}
                </span>
              </div>
            </Link>
          ) : (
            <Link
              to="/connect"
              className="flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/20 px-3.5 py-2 text-xs font-bold text-primary transition-all duration-150 hover:bg-primary/30 hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/10"
            >
              <KeyRound className="size-3.5" /> Connect
            </Link>
          )}

          {/* Mobile Nav Toggle */}
          <button
            onClick={onOpenNav}
            aria-label="Open navigation"
            className="rounded-lg p-2 text-muted-foreground transition-none hover:bg-white/10 hover:text-foreground active:opacity-75 lg:hidden"
          >
            <Menu className="size-4" />
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => player.refetch()}
            aria-label="Refresh data"
            className="rounded-lg p-2 text-muted-foreground transition-none hover:bg-white/10 hover:text-foreground active:opacity-75"
          >
            <RefreshCw className={cn("size-4", player.isFetching && "animate-spin")} />
          </button>

          {/* Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="relative rounded-lg p-2 text-muted-foreground transition-none hover:bg-white/10 hover:text-foreground active:opacity-75 outline-none">
              <Bell className="size-4" />
              {feed.unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-emerald-400 text-[9px] font-bold text-black ring-2 ring-background">
                  {feed.unreadCount > 9 ? "9+" : feed.unreadCount}
                </span>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 border-white/10 bg-[#0E121B] p-3 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2 px-1">
                <span className="text-xs font-bold text-foreground">
                  Notifications{feed.unreadCount > 0 ? ` (${feed.unreadCount})` : ""}
                </span>
                <button
                  onClick={markAllRead}
                  disabled={feed.unreadCount === 0}
                  className="text-[10px] font-medium text-emerald-400 hover:underline disabled:opacity-40 disabled:no-underline"
                >
                  Mark all read
                </button>
              </div>
              <div className="mt-2 max-h-80 space-y-1.5 overflow-y-auto">
                {feed.items.slice(0, 8).map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      "rounded-xl p-2.5 transition-none text-left",
                      n.unread
                        ? "bg-emerald-500/10 border border-emerald-500/20"
                        : "hover:bg-white/5",
                    )}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                      <span className="min-w-0 truncate">{n.title}</span>
                      <span className="ml-2 shrink-0 text-[10px] font-normal text-muted-foreground">
                        {n.time}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground leading-snug">
                      {n.body}
                    </p>
                  </div>
                ))}
                {feed.items.length === 0 && (
                  <p className="px-1 py-4 text-center text-[11px] text-muted-foreground">
                    No notifications yet. Alerts appear as your profile syncs.
                  </p>
                )}
              </div>
              <Link
                to="/notifications"
                className="mt-2 block rounded-lg border border-white/10 bg-white/5 py-2 text-center text-[11px] font-medium text-muted-foreground transition-none hover:bg-white/10 hover:text-foreground"
              >
                View all notifications
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle Button */}
          <button
            onClick={cycleTheme}
            aria-label="Toggle Theme"
            className="rounded-lg p-2 text-muted-foreground transition-none hover:bg-white/10 hover:text-foreground active:opacity-75"
            title={`Theme: ${theme} (click to change)`}
          >
            {themeIcon}
          </button>

          {/* Settings Link */}
          <Link
            to="/settings"
            aria-label="Settings"
            className="rounded-lg p-2 text-muted-foreground transition-none hover:bg-white/10 hover:text-foreground active:opacity-75"
          >
            <Settings className="size-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [search, setSearch] = useState("");
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const player = usePlayer();
  const account = useAccount();
  const cycleThemeRef = useRef<(() => void) | null>(null);

  // Item + market indexes for the command palette (shared query keys —
  // free if the wiki/bazaar pages already fetched them). Uses the lightweight
  // search index, not the full item payload.
  const itemsQuery = useQuery({
    queryKey: ["item-index"],
    queryFn: () => fetchItemIndex(),
    staleTime: 10 * 60_000,
    enabled: open,
  });
  const bazaarQuery = useQuery({
    queryKey: ["bazaar"],
    queryFn: () => fetchBazaar(),
    staleTime: 60_000,
    enabled: open,
  });

  const paletteItems = useMemo<{
    wiki: Array<{ id: string; name: string; rarity: string }>;
    markets: BazaarProduct[];
  }>(() => {
    const q = search.trim().toLowerCase();
    if (q.length < 2) return { wiki: [], markets: [] };
    const matches = (text: string) => text.toLowerCase().includes(q);
    const wiki = (itemsQuery.data ?? [])
      .filter((i) => matches(i.name) || matches(i.id))
      .slice(0, 6);
    const markets = (bazaarQuery.data?.products ?? [])
      .filter((p) => matches(p.name) || matches(p.id))
      .slice(0, 5);
    return { wiki, markets };
  }, [search, itemsQuery.data, bazaarQuery.data]);

  // Close the mobile nav whenever the route changes.
  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Live Video Background: Dedicated GPU layer with crisp solid vignette */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/favicon.ico"
          suppressHydrationWarning
          className="size-full object-cover gpu-layer opacity-60"
        >
          <source src={headerVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[#0c1017]/85" />
      </div>

      <div className="flex">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
        <div className="min-w-0 flex-1">
          <EconomyTicker />
          <Header
            onOpenSearch={() => setOpen(true)}
            onOpenNav={() => setNavOpen(true)}
            onCycleThemeRef={cycleThemeRef}
          />
          <main key={pathname} className="animate-page-in px-4 pb-24 pt-6 sm:px-8 md:pb-16">
            {children}
          </main>

          {/* Footer: provenance + live API health */}
          <footer className="border-t border-white/10 px-4 py-5 sm:px-8 pb-20 md:pb-5">
            <FooterContent />
          </footer>
        </div>
      </div>

      {/* Mobile Floating Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#0B0E14]/90 p-2 backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-around">
          <Link
            to="/dashboard"
            className="flex flex-col items-center gap-1 rounded-xl p-1.5 text-white/60 transition-none hover:text-white"
            activeProps={{ className: "text-emerald-400 font-bold" }}
          >
            <LayoutDashboard className="size-4" />
            <span className="text-[10px]">Dashboard</span>
          </Link>
          <Link
            to="/advisor"
            className="flex flex-col items-center gap-1 rounded-xl p-1.5 text-white/60 transition-none hover:text-white"
            activeProps={{ className: "text-sky-400 font-bold" }}
          >
            <Bot className="size-4" />
            <span className="text-[10px]">Advisor</span>
          </Link>
          <Link
            to="/simulator"
            className="flex flex-col items-center gap-1 rounded-xl p-1.5 text-white/60 transition-none hover:text-white"
            activeProps={{ className: "text-amber-400 font-bold" }}
          >
            <Swords className="size-4" />
            <span className="text-[10px]">Damage</span>
          </Link>
          <Link
            to="/flips"
            className="flex flex-col items-center gap-1 rounded-xl p-1.5 text-white/60 transition-none hover:text-white"
            activeProps={{ className: "text-emerald-400 font-bold" }}
          >
            <Target className="size-4" />
            <span className="text-[10px]">Flips</span>
          </Link>
          <button
            onClick={() => setNavOpen(true)}
            className="flex flex-col items-center gap-1 rounded-xl p-1.5 text-white/60 transition-none hover:text-white"
          >
            <Menu className="size-4" />
            <span className="text-[10px]">Menu</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {navOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setNavOpen(false)}
          />
          <nav className="absolute left-0 top-0 h-full w-[280px] overflow-y-auto border-r border-white/10 bg-[#0E121B]/95 p-5 backdrop-blur-2xl">
            <div className="flex items-center justify-between">
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text font-black text-xl tracking-[0.18em] text-transparent select-none">
                SKYFORGE
              </span>
              <button
                onClick={() => setNavOpen(false)}
                aria-label="Close navigation"
                className="rounded-lg p-2 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-6">
              {nav.map((section) => (
                <div key={section.group} className="mb-4">
                  <p className="eyebrow px-3 pb-1.5">{section.group}</p>
                  <ul className="space-y-0.5">
                    {section.items.map((item) => (
                      <li key={item.to}>
                        <Link
                          to={item.to}
                          onClick={() => setNavOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-white/70 transition-none hover:bg-white/[0.14] hover:text-white active:bg-white/[0.22]"
                        >
                          <item.icon className="size-4 shrink-0 text-white/60" />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </nav>
        </div>
      )}

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search pages, wiki items or bazaar markets..."
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {paletteItems.markets.length > 0 && (
            <CommandGroup heading="Bazaar markets">
              {paletteItems.markets.map((p) => (
                <CommandItem
                  key={p.id}
                  value={`bazaar ${p.name} ${p.id}`}
                  onSelect={() => {
                    setOpen(false);
                    setSearch("");
                    void navigate({ to: "/bazaar" });
                  }}
                  className="flex items-center gap-2"
                >
                  <TrendingUp className="size-4 text-emerald-400" />
                  <span className="min-w-0 flex-1 truncate">{p.name}</span>
                  <span className="shrink-0 font-mono text-[10px] text-emerald-400">
                    +{formatNumber(p.profitPerHour)}/hr
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {paletteItems.wiki.length > 0 && (
            <CommandGroup heading="Wiki items">
              {paletteItems.wiki.map((i) => (
                <CommandItem
                  key={i.id}
                  value={`wiki ${i.name} ${i.id}`}
                  onSelect={() => {
                    setOpen(false);
                    setSearch("");
                    void navigate({ to: "/wiki/$itemId", params: { itemId: i.id } });
                  }}
                  className="flex items-center gap-2"
                >
                  <BookOpen className="size-4 text-sky-400" />
                  <span className="min-w-0 flex-1 truncate">{i.name}</span>
                  <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                    {i.rarity}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandGroup heading="Navigation & Tools">
            {nav.map((section) =>
              section.items.map((item) => (
                <CommandItem
                  key={item.to}
                  value={`page ${item.label} ${item.to}`}
                  onSelect={() => {
                    setOpen(false);
                    setSearch("");
                    void navigate({ to: item.to });
                  }}
                  className="flex items-center gap-2"
                >
                  <item.icon className="size-4 text-emerald-400" />
                  <span>{item.label}</span>
                </CommandItem>
              ))
            )}
          </CommandGroup>

          <CommandGroup heading="Quick actions">
            {search.trim().length >= 3 && (
              <CommandItem
                value={`view profile ${search}`}
                onSelect={() => {
                  account.save({ username: search.trim(), profileId: "" });
                  setOpen(false);
                  setSearch("");
                  void navigate({ to: "/dashboard" });
                }}
                className="flex gap-2"
              >
                <User className="size-4 text-emerald-400" /> View profile:{" "}
                <span className="font-semibold">{search.trim()}</span>
              </CommandItem>
            )}
            <CommandItem
              value="connect profile api key"
              onSelect={() => {
                setOpen(false);
                setSearch("");
                void navigate({ to: "/connect" });
              }}
              className="flex gap-2"
            >
              <KeyRound className="size-4" /> Connect a profile (API key)
            </CommandItem>
            <CommandItem
              value="refresh profile"
              onSelect={() => {
                player.refetch();
                setOpen(false);
              }}
              className="flex gap-2"
            >
              <RefreshCw className="size-4" /> Refresh profile data
            </CommandItem>
            <CommandItem
              value="toggle theme"
              onSelect={() => {
                cycleThemeRef.current?.();
                setOpen(false);
              }}
              className="flex gap-2"
            >
              <Sun className="size-4" /> Cycle theme
            </CommandItem>
            <CommandItem value="top bazaar flip" asChild>
              <Link to="/bazaar" onClick={() => setOpen(false)} className="flex gap-2">
                <TrendingUp className="size-4" /> View top Bazaar flips
              </Link>
            </CommandItem>
            <CommandItem value="best auction flip" asChild>
              <Link to="/auction-house" onClick={() => setOpen(false)} className="flex gap-2">
                <Hammer className="size-4" /> View best auction flips
              </Link>
            </CommandItem>
          </CommandGroup>

          {nav.map((section) => (
            <CommandGroup key={section.group} heading={section.group}>
              {section.items.map((item) => (
                <CommandItem key={item.to} value={item.label} asChild>
                  <Link to={item.to} onClick={() => setOpen(false)} className="flex gap-2">
                    <item.icon className="size-4" />
                    {item.label}
                  </Link>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </div>
  );
}

/** Data-provenance footer: sources, health indicator, trust links. */
function FooterContent() {
  const health = useQuery({
    queryKey: ["api-health"],
    queryFn: () => fetchApiHealth(),
    staleTime: 60_000,
  });

  const profileApi = health.data?.profileApi ?? "ok";
  const healthLabel =
    profileApi === "ok" ? "Operational" : profileApi === "degraded" ? "Degraded" : "No shared key";

  return (
    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-[11px] text-muted-foreground">
      <p>
        Data:{" "}
        <a
          href="https://api.hypixel.net"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground"
        >
          Hypixel API
        </a>{" "}
        ·{" "}
        <a
          href="https://github.com/NotEnoughUpdates/NotEnoughUpdates-REPO"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground"
        >
          NEU dataset
        </a>
      </p>

      <div className="flex flex-wrap items-center gap-4">
        <span className="flex items-center gap-1.5">
          Profile API
          <span
            className={cn(
              "size-1.5 rounded-full",
              profileApi === "ok"
                ? "bg-emerald-400"
                : profileApi === "degraded"
                  ? "bg-amber-400"
                  : "bg-zinc-500",
            )}
          />
          {healthLabel}
        </span>
        <Link to="/about" className="hover:text-foreground">
          About & data
        </Link>
        <Link to="/connect" className="hover:text-foreground">
          Connect
        </Link>
      </div>
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="font-pixel mt-2 text-4xl font-semibold tracking-wide sm:text-5xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{description}</p>
      </div>
      {actions}
    </div>
  );
}

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section
      className={cn(
        "panel-card rounded-3xl p-6 shadow-xl transition-all duration-75 ease-out hover:border-emerald-500/35 hover:shadow-2xl hover:shadow-emerald-500/[0.06]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function StatTile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="group relative px-6 py-5 transition-all duration-75 ease-out hover:bg-white/[0.04] cursor-pointer">
      <p className="eyebrow group-hover:text-emerald-400/90 transition-colors duration-75">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground group-hover:text-emerald-300 transition-colors duration-75">{value}</p>
      <p className="mt-2 text-xs text-muted-foreground group-hover:text-white/80 transition-colors duration-75">{sub}</p>
    </div>
  );
}

export function StatRow({ stats }: { stats: { label: string; value: string; sub: string }[] }) {
  return (
    <div className="grid grid-cols-1 divide-y divide-white/10 rounded-3xl border border-white/10 bg-slate-950/75 backdrop-blur-xl shadow-2xl sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x lg:divide-white/10 overflow-hidden">
      {stats.map((s) => (
        <StatTile key={s.label} {...s} />
      ))}
    </div>
  );
}

export function ProgressBar({
  pct,
  tone = "emerald",
}: {
  pct: number;
  tone?: "emerald" | "gold" | "danger";
}) {
  const toneClass = tone === "gold" ? "bg-gold" : tone === "danger" ? "bg-danger" : "bg-emerald";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10 backdrop-blur-sm">
      <div
        className={cn("h-full rounded-full transition-all duration-300 shadow-sm", toneClass)}
        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
      />
    </div>
  );
}

const rarityClass: Record<string, string> = {
  MYTHIC: "text-mythic border-mythic/40 bg-mythic/10 backdrop-blur-sm",
  LEGENDARY: "text-legendary border-legendary/40 bg-legendary/10 backdrop-blur-sm",
  EPIC: "text-epic border-epic/40 bg-epic/10 backdrop-blur-sm",
  RARE: "text-rare border-rare/40 bg-rare/10 backdrop-blur-sm",
};

export function RarityTag({ rarity }: { rarity: string }) {
  return (
    <span
      className={cn(
        "rounded-md border px-1.5 py-0.5 text-[10px] font-semibold tracking-widest",
        rarityClass[rarity] ?? "text-muted-foreground border-white/10 bg-white/5 backdrop-blur-sm",
      )}
    >
      {rarity}
    </span>
  );
}

export function Chip({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-md transition-all duration-75 ease-out hover:scale-[1.04] hover:bg-white/10 hover:text-foreground active:scale-95",
        active && "border-primary/40 bg-primary/20 text-primary font-semibold shadow-sm",
      )}
    >
      {children}
    </button>
  );
}
