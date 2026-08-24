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
import { formatNumber, type BazaarProduct } from "@/lib/skyblock";
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
    group: "General",
    items: [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    group: "Progression",
    items: [
      { to: "/skills", label: "Skills & Dungeons", icon: Sparkles },
      { to: "/collections", label: "Collections", icon: Compass },
      { to: "/inventory", label: "Inventory, Pets & Accessories", icon: Boxes },
    ],
  },
  {
    group: "Economy",
    items: [
      { to: "/bazaar", label: "Bazaar", icon: TrendingUp },
      { to: "/auction-house", label: "Auction House", icon: Hammer },
      { to: "/flips", label: "Flip Accuracy", icon: Target },
      { to: "/net-worth", label: "Net Worth", icon: Coins },
    ],
  },
  {
    group: "Tools",
    items: [
      { to: "/advisor", label: "Advisor", icon: Gauge },
      { to: "/compare", label: "Compare Profiles", icon: Swords },
      { to: "/crafting", label: "Crafting Calculator", icon: Hammer },
      { to: "/goals", label: "Goals", icon: Target },
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
        "sticky top-0 z-30 hidden h-screen shrink-0 flex-col border-r border-white/10 bg-sidebar/40 backdrop-blur-xl lg:flex",
        collapsed ? "w-[86px]" : "w-[276px]",
      )}
    >
      {/* Large Centered Custom Gradient Wordmark */}
      <div className="flex flex-col items-center justify-center px-4 pt-7 pb-4">
        {!collapsed ? (
          <div className="w-full text-center">
            <span className="inline-block bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text font-black text-3xl tracking-[0.18em] text-transparent select-none drop-shadow-[0_2px_20px_rgba(52,211,153,0.45)]">
              SKYFORGE
            </span>
          </div>
        ) : (
          <div className="flex w-full justify-center">
            <span className="bg-gradient-to-br from-emerald-400 to-teal-300 bg-clip-text font-black text-2xl text-transparent select-none">
              SF
            </span>
          </div>
        )}
      </div>

      <div className="px-4">
        <button
          onClick={onToggle}
          aria-label="Toggle sidebar"
          className="flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 py-2.5 text-muted-foreground backdrop-blur-md transition-all duration-75 ease-out hover:scale-[1.02] hover:bg-white/15 hover:text-foreground active:scale-95"
        >
          {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
        </button>
      </div>

      <nav className="scroll-slim mt-6 flex-1 overflow-y-auto px-3 pb-4">
        {nav.map((section) => (
          <div key={section.group} className="mb-5">
            {!collapsed && <p className="eyebrow px-3 pb-2">{section.group}</p>}
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    title={item.label}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-all duration-75 ease-out hover:scale-[1.02] hover:bg-white/10 hover:text-foreground active:scale-95",
                      collapsed && "justify-center px-0",
                    )}
                    activeProps={{
                      className:
                        "bg-white/15 text-foreground ring-1 ring-white/20 font-medium backdrop-blur-md shadow-sm",
                    }}
                  >
                    <item.icon className="size-4 shrink-0 transition-transform duration-75" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Unified Bottom-Left Profile Switcher */}
      <div className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full text-left outline-none">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md transition-all duration-75 hover:bg-white/10 hover:border-emerald-500/30">
              {!collapsed ? (
                <>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 font-mono text-xs font-bold">
                      {(player.data?.username || account.username || "SB")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-foreground">
                        {player.data?.username ?? (account.username || "Not connected")}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            player.data ? "bg-emerald-400" : "bg-amber-400",
                          )}
                        />
                        {activeProfile
                          ? `${activeProfile.cuteName}`
                          : player.data
                            ? "Add API key"
                            : "Tap to connect"}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                </>
              ) : (
                <div className="flex w-full justify-center">
                  <span
                    className={cn(
                      "size-2.5 rounded-full",
                      player.data ? "bg-emerald-400" : "bg-amber-400",
                    )}
                  />
                </div>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            side="top"
            className="mb-2 w-64 border-white/10 bg-[#0E121B]/95 backdrop-blur-2xl"
          >
            {!player.data ? (
              <DropdownMenuItem asChild className="cursor-pointer py-2.5">
                <Link to="/connect" className="flex items-center gap-2 text-xs">
                  <KeyRound className="size-3.5 text-primary" /> Connect your profile
                </Link>
              </DropdownMenuItem>
            ) : (
              <>
                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Select Active Profile
                </div>
                {profiles.map((p) => (
                  <DropdownMenuItem
                    key={p.profileId}
                    onSelect={() => account.save({ profileId: p.profileId })}
                    className="flex items-center justify-between py-2.5 cursor-pointer"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground">{p.cuteName}</p>
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
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

/** Live economy ticker — top bazaar flips + ending-soon BIN flips. */
function EconomyTicker() {
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

function applyTheme(theme: string) {
  const root = document.documentElement;
  root.classList.remove("dark", "light", "theme-solid");
  if (theme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.add(prefersDark ? "dark" : "light");
  } else {
    root.classList.add(theme === "light" ? "light" : "dark");
  }
  if (theme === "solid") root.classList.add("theme-solid");
}

function Header({
  onOpenSearch,
  onOpenNav,
  onCycleThemeRef,
}: {
  onOpenSearch: () => void;
  onOpenNav: () => void;
  onCycleThemeRef: React.RefObject<(() => void) | null>;
}) {
  const player = usePlayer();
  const feed = useNotificationFeed();
  const [theme, setTheme] = useState<string>("dark");

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE) ?? "dark";
    setTheme(stored);
    applyTheme(stored);
  }, []);

  const cycleTheme = () => {
    const order = ["dark", "solid", "light", "system"];
    const next = order[(order.indexOf(theme) + 1) % order.length]!;
    setTheme(next);
    localStorage.setItem(THEME_STORAGE, next);
    applyTheme(next);
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
    <header className="sticky top-0 z-40 border-b border-white/10 bg-surface-strong/40 backdrop-blur-xl">
      <div className="flex items-center gap-4 px-4 py-3.5 sm:px-6">
        <button
          onClick={onOpenSearch}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-muted-foreground backdrop-blur-md transition-all duration-75 ease-out hover:scale-[1.01] hover:border-white/20 hover:bg-white/10 active:scale-[0.98] sm:max-w-xl"
        >
          <Search className="size-4 shrink-0" />
          <span className="truncate">Search or type a command...</span>
          <kbd className="ml-auto hidden rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:block">
            ⌘K
          </kbd>
        </button>

        <div className="ml-auto flex items-center gap-2">
          {/* Connect CTA (only when no profile data yet) */}
          {!player.data && (
            <Link
              to="/connect"
              className="hidden items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/15 px-3 py-2 text-xs font-semibold text-primary transition-all duration-75 ease-out hover:scale-[1.03] hover:bg-primary/25 active:scale-95 sm:flex"
            >
              <KeyRound className="size-3.5" /> Connect
            </Link>
          )}

          {/* Mobile Nav Toggle */}
          <button
            onClick={onOpenNav}
            aria-label="Open navigation"
            className="rounded-lg p-2 text-muted-foreground transition-all duration-75 ease-out hover:scale-[1.05] hover:bg-white/10 hover:text-foreground active:scale-95 lg:hidden"
          >
            <Menu className="size-4" />
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => player.refetch()}
            aria-label="Refresh data"
            className="rounded-lg p-2 text-muted-foreground transition-all duration-75 ease-out hover:scale-[1.05] hover:bg-white/10 hover:text-foreground active:scale-95"
          >
            <RefreshCw className={cn("size-4", player.isFetching && "animate-spin")} />
          </button>

          {/* Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="relative rounded-lg p-2 text-muted-foreground transition-all duration-75 ease-out hover:scale-[1.05] hover:bg-white/10 hover:text-foreground active:scale-95 outline-none">
              <Bell className="size-4" />
              {feed.unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-emerald-400 text-[9px] font-bold text-black ring-2 ring-background">
                  {feed.unreadCount > 9 ? "9+" : feed.unreadCount}
                </span>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 border-white/10 bg-[#0E121B]/95 p-3 backdrop-blur-2xl"
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
                      "rounded-xl p-2.5 transition text-left",
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
                className="mt-2 block rounded-lg border border-white/10 bg-white/5 py-2 text-center text-[11px] font-medium text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
              >
                View all notifications
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle Button */}
          <button
            onClick={cycleTheme}
            aria-label="Toggle Theme"
            className="rounded-lg p-2 text-muted-foreground transition-all duration-75 ease-out hover:scale-[1.05] hover:bg-white/10 hover:text-foreground active:scale-95"
            title={`Theme: ${theme} (click to change)`}
          >
            {themeIcon}
          </button>

          {/* Settings Link */}
          <Link
            to="/settings"
            aria-label="Settings"
            className="rounded-lg p-2 text-muted-foreground transition-all duration-75 ease-out hover:scale-[1.05] hover:bg-white/10 hover:text-foreground active:scale-95"
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
      {/* Live Video Background: Full Fill, Minimal Overlay & Very Subtle Blur */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/favicon.ico"
          suppressHydrationWarning
          className="size-full object-cover"
        >
          <source src={headerVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-background/20 backdrop-blur-[2px]" />
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
          <main key={pathname} className="animate-page-in px-4 pb-16 pt-6 sm:px-8">
            {children}
          </main>

          {/* Footer: provenance + live API health */}
          <footer className="border-t border-white/10 px-4 py-5 sm:px-8">
            <FooterContent />
          </footer>
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
                <div key={section.group} className="mb-5">
                  <p className="eyebrow px-3 pb-2">{section.group}</p>
                  <ul className="space-y-1">
                    {section.items.map((item) => (
                      <li key={item.to}>
                        <Link
                          to={item.to}
                          onClick={() => setNavOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-all hover:bg-white/10 hover:text-foreground"
                        >
                          <item.icon className="size-4 shrink-0" />
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
        <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
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
        "animate-fade-slide-up rounded-3xl border border-white/10 bg-slate-950/30 p-6 backdrop-blur-xl shadow-2xl transition-all duration-100 ease-out hover:-translate-y-0.5 hover:border-primary/30 hover:bg-slate-950/40",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function StatTile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="px-6 py-5">
      <p className="eyebrow">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

export function StatRow({ stats }: { stats: { label: string; value: string; sub: string }[] }) {
  return (
    <div className="grid grid-cols-1 divide-y divide-white/10 rounded-3xl border border-white/10 bg-slate-950/30 backdrop-blur-xl shadow-2xl sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x lg:divide-white/10">
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
