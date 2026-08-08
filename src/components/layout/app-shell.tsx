import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  BookOpen,
  Boxes,
  Compass,
  Coins,
  Gauge,
  Hammer,
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
  Trophy,
  Users,
  Check,
  Sun,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import headerVideo from "@/assets/skyblock-header.mp4";
import { usePlayer, useAccount } from "@/hooks/use-account";
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
      { to: "/net-worth", label: "Net Worth", icon: Coins },
    ],
  },
  {
    group: "Tools",
    items: [
      { to: "/advisor", label: "Advisor", icon: Gauge },
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
  const player = usePlayer();
  const activeProfile = player.data?.profiles.find((p) => p.selected);

  return (
    <aside
      className={cn(
        "sticky top-0 z-30 hidden h-screen shrink-0 flex-col border-r border-white/10 bg-sidebar/40 backdrop-blur-xl lg:flex",
        collapsed ? "w-[86px]" : "w-[276px]",
      )}
    >
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary ring-1 ring-primary/40 shadow-inner">
          <Trophy className="size-4" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">SkyBlock Assistant</p>
            <p className="truncate text-xs text-muted-foreground">Personal analytics</p>
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

      <div className="p-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-all duration-75 hover:bg-white/10">
          {!collapsed ? (
            <>
              <p className="eyebrow">Profile</p>
              <p className="mt-2 text-base font-semibold">{player.data?.username ?? "Not connected"}</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="size-1.5 rounded-full bg-primary" />
                {activeProfile ? `${activeProfile.cuteName} · synced profile` : "Add an API key"}
              </p>
            </>
          ) : (
            <div className="flex justify-center">
              <span className="size-2 rounded-full bg-primary" />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function Header({ onOpenSearch }: { onOpenSearch: () => void }) {
  const account = useAccount();
  const player = usePlayer();
  const profiles = player.data?.profiles ?? [];
  const active =
    profiles.find((p) => p.profileId === (account.profileId || player.data?.activeProfileId))
      ?.cuteName ?? "No profile";

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
          <span className="hidden text-sm text-muted-foreground xl:block">
            {player.data?.username ?? "Not connected"} · {active}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3.5 py-2 text-sm font-medium backdrop-blur-md transition-all duration-75 ease-out hover:scale-[1.03] hover:bg-white/20 active:scale-95">
              <Users className="size-4 text-muted-foreground" />
              {active}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 border-white/10 bg-slate-950/80 backdrop-blur-2xl">
              {profiles.length === 0 && (
                <DropdownMenuItem disabled className="py-2.5 text-xs">
                  Connect an API key in Settings
                </DropdownMenuItem>
              )}
              {profiles.map((p) => (
                <DropdownMenuItem
                  key={p.profileId}
                  onSelect={() => account.save({ profileId: p.profileId })}
                  className="flex items-start gap-2 py-2.5 transition-all duration-75 hover:scale-[1.01]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{p.cuteName}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.gameMode} · {p.members} member{p.members > 1 ? "s" : ""}
                    </p>
                  </div>
                  {active === p.cuteName && <Check className="mt-1 size-4 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={() => player.refetch()}
            aria-label="Refresh"
            className="rounded-lg p-2 text-muted-foreground transition-all duration-75 ease-out hover:scale-[1.05] hover:bg-white/10 hover:text-foreground active:scale-95"
          >
            <RefreshCw className={cn("size-4", player.isFetching && "animate-spin")} />
          </button>
          {[Bell, Sun].map((Icon, i) => (
            <button
              key={i}
              aria-label={["Notifications", "Theme"][i]}
              className="rounded-lg p-2 text-muted-foreground transition-all duration-75 ease-out hover:scale-[1.05] hover:bg-white/10 hover:text-foreground active:scale-95"
            >
              <Icon className="size-4" />
            </button>
          ))}
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
  const pathname = useRouterState({ select: (s) => s.location.pathname });

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
          <Header onOpenSearch={() => setOpen(true)} />
          <main key={pathname} className="px-4 pb-16 pt-6 sm:px-8">
            {children}
          </main>
        </div>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages, items, commands..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
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
        "rounded-3xl border border-white/10 bg-slate-950/30 p-6 backdrop-blur-xl shadow-2xl transition-all duration-100 ease-out hover:border-primary/30 hover:bg-slate-950/40",
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

export function ProgressBar({ pct, tone = "emerald" }: { pct: number; tone?: "emerald" | "gold" | "danger" }) {
  const toneClass =
    tone === "gold" ? "bg-gold" : tone === "danger" ? "bg-danger" : "bg-emerald";
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