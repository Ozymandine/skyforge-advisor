import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Volume2,
  VolumeX,
  Play,
  Flame,
  Wheat,
  Sparkles,
  Gavel,
  ShieldAlert,
  Check,
  BellRing,
} from "lucide-react";

import { PageHero, Panel, ProgressBar } from "@/components/layout/app-shell";
import {
  getSkyBlockDate,
  getJacobContests,
  getDarkAuctions,
  getMajorEvents,
  formatTimeRemaining,
  type SkyBlockEvent,
} from "@/lib/calendar";
import {
  playChime,
  getAlarmSettings,
  saveAlarmSettings,
  type CalendarAlarmSettings,
  type ChimeProfile,
} from "@/lib/audio-chimes";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "SkyBlock Event Calendar & Jacob Contests — SkyForge Advisor" },
      {
        name: "description",
        content:
          "Live SkyBlock time, Jacob's 3-crop farming contest predictor, Dark Auction scheduler, event alarms and major festival countdowns.",
      },
      { property: "og:title", content: "SkyBlock Event Calendar — SkyForge Advisor" },
      {
        property: "og:description",
        content: "Real-time SkyBlock calendar, Jacob contest predictions, and Dark Auction schedules.",
      },
    ],
  }),
  component: CalendarRoute,
});

function CalendarRoute() {
  const [now, setNow] = useState<number>(Date.now());
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [alarms, setAlarms] = useState<CalendarAlarmSettings>(getAlarmSettings);
  const [lastChimedId, setLastChimedId] = useState<string | null>(null);

  // Tick every 1s for accurate live clock & countdowns
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update alarms persistence
  const updateAlarms = (newSettings: Partial<CalendarAlarmSettings>) => {
    const updated = { ...alarms, ...newSettings };
    setAlarms(updated);
    saveAlarmSettings(updated);
  };

  const sbDate = useMemo(() => getSkyBlockDate(now), [now]);
  const jacobContests = useMemo(() => getJacobContests(now, 8), [now]);
  const darkAuctions = useMemo(() => getDarkAuctions(now, 4), [now]);
  const majorEvents = useMemo(() => getMajorEvents(now), [now]);

  const currentJacob = jacobContests[0];
  const nextDarkAuction = darkAuctions[0];

  // Auto-chime alarm trigger for upcoming events
  useEffect(() => {
    if (!alarms.enabled) return;

    const thresholdMs = alarms.alertMinutesBefore * 60 * 1000;

    // Check Jacob's contest
    if (alarms.alertJacob && currentJacob) {
      if (
        currentJacob.status === "upcoming" &&
        currentJacob.timeRemainingMs <= thresholdMs &&
        currentJacob.timeRemainingMs > thresholdMs - 5000 &&
        lastChimedId !== currentJacob.id
      ) {
        playChime(alarms.chimeType, alarms.volume);
        setLastChimedId(currentJacob.id);
      }
    }

    // Check Dark Auction
    if (alarms.alertDarkAuction && nextDarkAuction) {
      if (
        nextDarkAuction.status === "upcoming" &&
        nextDarkAuction.timeRemainingMs <= thresholdMs &&
        nextDarkAuction.timeRemainingMs > thresholdMs - 5000 &&
        lastChimedId !== `da-${nextDarkAuction.startTime}`
      ) {
        playChime(alarms.chimeType, alarms.volume);
        setLastChimedId(`da-${nextDarkAuction.startTime}`);
      }
    }
  }, [now, alarms, currentJacob, nextDarkAuction, lastChimedId]);

  const filteredEvents = useMemo(() => {
    if (selectedCategory === "All") return majorEvents;
    return majorEvents.filter((e) => e.category === selectedCategory);
  }, [majorEvents, selectedCategory]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHero
        eyebrow="Live Intelligence"
        title="SkyBlock Event Calendar"
        description="Synchronized in-game clock, Jacob's 3-crop farming predictions, Dark Auction timers, and Web Audio alarms."
      />

      {/* Live SkyBlock Clock Banner */}
      <Panel className="relative overflow-hidden border-sky-500/30 bg-gradient-to-r from-sky-950/40 via-blue-950/20 to-purple-950/30">
        <div className="flex flex-wrap items-center justify-between gap-6 py-2">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl border border-sky-400/30 bg-sky-500/10 shadow-lg shadow-sky-500/10">
              <Clock className="size-7 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                  <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" /> Live In-Game Time
                </span>
                <span className="text-xs text-white/40 font-mono">
                  {new Date(now).toLocaleTimeString()} Local
                </span>
              </div>
              <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-white">
                {sbDate.formatted}
              </h2>
              <p className="mt-0.5 font-mono text-sm font-semibold text-sky-300">
                {sbDate.timeString} · Month {sbDate.month} / 12 (Day {sbDate.day} / 31)
              </p>
            </div>
          </div>

          {/* Quick Sound Toggle & Volume */}
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 backdrop-blur">
            <button
              onClick={() => updateAlarms({ enabled: !alarms.enabled })}
              className={cn(
                "flex size-9 items-center justify-center rounded-xl border transition-all",
                alarms.enabled
                  ? "border-sky-400/40 bg-sky-500/20 text-sky-300 hover:bg-sky-500/30"
                  : "border-white/10 bg-white/5 text-white/40 hover:bg-white/10"
              )}
              title={alarms.enabled ? "Alarms Enabled" : "Alarms Muted"}
            >
              {alarms.enabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
            </button>
            <div>
              <p className="text-xs font-semibold text-white">Audio Chimes</p>
              <p className="text-[10px] text-white/40">
                {alarms.enabled ? `${alarms.alertMinutesBefore}m before events` : "Muted"}
              </p>
            </div>
          </div>
        </div>
      </Panel>

      {/* Main Grid: Jacob's Contest & Dark Auction */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Jacob's Farming Contest */}
        {currentJacob && (
          <Panel className="relative overflow-hidden border-amber-500/20 bg-gradient-to-br from-amber-500/[0.04] via-transparent to-orange-500/[0.02]">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/10">
                  <Wheat className="size-5 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">Jacob's Farming Contest</h3>
                    {currentJacob.status === "active" ? (
                      <span className="animate-pulse rounded-full border border-emerald-500/40 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-300">
                        Active Now
                      </span>
                    ) : (
                      <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-300">
                        Upcoming
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/50">{currentJacob.skyblockDate}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-xl font-black text-amber-300">
                  {formatTimeRemaining(currentJacob.timeRemainingMs)}
                </p>
                <p className="text-[10px] text-white/40">
                  {currentJacob.status === "active" ? "Time left in contest" : "Starts at :15 past hour"}
                </p>
              </div>
            </div>

            {/* 3 Active / Upcoming Crops */}
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                {currentJacob.status === "active" ? "Current 3 Crops" : "Predicted 3 Crops"}
              </p>
              <div className="mt-2.5 grid grid-cols-3 gap-2.5">
                {currentJacob.crops.map((crop) => (
                  <div
                    key={crop.id}
                    className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-black/40 p-3 text-center transition-all hover:border-amber-400/40"
                  >
                    <span className="text-2xl">{crop.icon}</span>
                    <span className="mt-1 text-xs font-bold text-white">{crop.name}</span>
                    <span className="text-[10px] text-amber-400/80 font-mono">Contest Crop</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Upcoming Contests Carousel */}
            <div className="mt-5 border-t border-white/5 pt-4">
              <p className="text-xs font-semibold text-white/60">Upcoming Rotation</p>
              <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {jacobContests.slice(1, 5).map((contest) => (
                  <div
                    key={contest.id}
                    className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-white/60">
                        {new Date(contest.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <div className="flex gap-1">
                        {contest.crops.map((c) => (
                          <span key={c.id} title={c.name} className="text-sm">
                            {c.icon}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="font-mono text-[11px] text-amber-400">
                      in {formatTimeRemaining(contest.timeRemainingMs)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        )}

        {/* Dark Auction & Shen's Special Auction */}
        {nextDarkAuction && (
          <Panel className="relative overflow-hidden border-purple-500/20 bg-gradient-to-br from-purple-500/[0.04] via-transparent to-pink-500/[0.02]">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl border border-purple-400/30 bg-purple-500/10">
                  <Gavel className="size-5 text-purple-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">Sirius' Dark Auction</h3>
                    {nextDarkAuction.status === "active" ? (
                      <span className="animate-pulse rounded-full border border-emerald-500/40 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-300">
                        Active Bidding
                      </span>
                    ) : (
                      <span className="rounded-full border border-purple-500/40 bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-purple-300">
                        Every Hour at :55
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/50">{nextDarkAuction.location}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-xl font-black text-purple-300">
                  {formatTimeRemaining(nextDarkAuction.timeRemainingMs)}
                </p>
                <p className="text-[10px] text-white/40">Starts at :55 past hour</p>
              </div>
            </div>

            {/* Requirement & Details */}
            <div className="mt-4 rounded-xl border border-purple-500/20 bg-purple-950/20 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">Recommended Purse:</span>
                <span className="font-mono font-bold text-amber-300">50,000,000+ Coins</span>
              </div>
              <p className="mt-1 text-[11px] text-white/40">
                Requires entering Sirius' Hut before gate closes at :55. Top purses gain entry to the basement.
              </p>
            </div>

            {/* Featured Items Loot Rotation */}
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                Featured Exclusive Loot
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {nextDarkAuction.featuredItems.map((item) => (
                  <span
                    key={item}
                    className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/80"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Upcoming Dark Auctions */}
            <div className="mt-5 border-t border-white/5 pt-4">
              <p className="text-xs font-semibold text-white/60">Upcoming Cycles</p>
              <div className="mt-2 space-y-1.5">
                {darkAuctions.slice(1, 4).map((da, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2 text-xs"
                  >
                    <span className="font-mono text-white/60">
                      {new Date(da.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="font-mono text-[11px] text-purple-400">
                      in {formatTimeRemaining(da.timeRemainingMs)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        )}
      </div>

      {/* Major Recurring Events & Festivals */}
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white">Major SkyBlock Events Timeline</h2>
            <p className="text-xs text-white/50">
              Recurring seasonal festivals, world bosses, and special visitor events.
            </p>
          </div>
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {["All", "Festival", "Boss", "Farming"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "rounded-lg px-3 py-1 text-xs font-medium transition-all",
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground font-semibold shadow-md"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="flex flex-col justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur transition-all duration-75 hover:border-sky-500/30 hover:bg-white/[0.04]"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{evt.icon}</span>
                    <div>
                      <h3 className="text-sm font-bold text-white">{evt.name}</h3>
                      <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider">
                        {evt.category}
                      </span>
                    </div>
                  </div>
                  {evt.status === "active" ? (
                    <span className="animate-pulse rounded-full border border-emerald-500/40 bg-emerald-500/20 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-300">
                      Active Now
                    </span>
                  ) : (
                    <span className="font-mono text-xs font-bold text-sky-400">
                      {formatTimeRemaining(evt.timeRemainingMs)}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-xs text-white/60 leading-relaxed">{evt.description}</p>
              </div>

              <div className="mt-4 border-t border-white/5 pt-3 flex items-center justify-between text-[11px] text-white/40">
                <span>{evt.skyblockDate}</span>
                <span className="font-mono">
                  {new Date(evt.startTime).toLocaleDateString([], { month: "short", day: "numeric" })}{" "}
                  {new Date(evt.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Web Audio Chimes & Notification Settings */}
      <Panel className="border-sky-500/20 bg-gradient-to-br from-sky-500/[0.03] via-transparent to-purple-500/[0.02]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl border border-sky-400/30 bg-sky-500/10">
              <BellRing className="size-5 text-sky-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Web Audio Chimes Suite</h2>
              <p className="text-xs text-white/50">
                Synthesized in-browser sound alerts for Jacob's Contests, Dark Auctions, and Festivals.
              </p>
            </div>
          </div>
          <button
            onClick={() => playChime(alarms.chimeType, alarms.volume)}
            className="flex items-center gap-2 rounded-xl border border-sky-400/40 bg-sky-500/20 px-4 py-2 text-xs font-bold text-sky-300 hover:bg-sky-500/30 transition-all"
          >
            <Play className="size-3.5 fill-current" />
            Test Selected Chime
          </button>
        </div>

        <div className="mt-5 grid gap-6 md:grid-cols-3">
          {/* Tone Profile Selector */}
          <div>
            <p className="text-xs font-semibold text-white/80">Tone Profile</p>
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              {(["crystal", "bell", "arpeggio", "alert"] as ChimeProfile[]).map((tone) => (
                <button
                  key={tone}
                  onClick={() => {
                    updateAlarms({ chimeType: tone });
                    playChime(tone, alarms.volume);
                  }}
                  className={cn(
                    "flex items-center justify-between rounded-xl border p-2.5 text-xs capitalize transition-all",
                    alarms.chimeType === tone
                      ? "border-sky-400 bg-sky-500/20 text-white font-bold"
                      : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <span>{tone}</span>
                  {alarms.chimeType === tone && <Check className="size-3 text-sky-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Alarm Lead Time */}
          <div>
            <p className="text-xs font-semibold text-white/80">Alert Timing</p>
            <div className="mt-2.5 grid grid-cols-3 gap-2">
              {[1, 3, 5].map((mins) => (
                <button
                  key={mins}
                  onClick={() => updateAlarms({ alertMinutesBefore: mins })}
                  className={cn(
                    "rounded-xl border p-2.5 text-center text-xs font-medium transition-all",
                    alarms.alertMinutesBefore === mins
                      ? "border-sky-400 bg-sky-500/20 text-white font-bold"
                      : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                  )}
                >
                  {mins} min before
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-white/60">
              <span>Volume ({Math.round(alarms.volume * 100)}%)</span>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={alarms.volume}
                onChange={(e) => updateAlarms({ volume: parseFloat(e.target.value) })}
                className="w-28 accent-sky-400"
              />
            </div>
          </div>

          {/* Event Toggles */}
          <div>
            <p className="text-xs font-semibold text-white/80">Subscribed Events</p>
            <div className="mt-2.5 space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-white/80 hover:text-white">
                <input
                  type="checkbox"
                  checked={alarms.alertJacob}
                  onChange={(e) => updateAlarms({ alertJacob: e.target.checked })}
                  className="rounded border-white/20 accent-sky-400"
                />
                Jacob's Farming Contests (:15 past hour)
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-white/80 hover:text-white">
                <input
                  type="checkbox"
                  checked={alarms.alertDarkAuction}
                  onChange={(e) => updateAlarms({ alertDarkAuction: e.target.checked })}
                  className="rounded border-white/20 accent-sky-400"
                />
                Sirius' Dark Auction (:55 past hour)
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-white/80 hover:text-white">
                <input
                  type="checkbox"
                  checked={alarms.alertFestivals}
                  onChange={(e) => updateAlarms({ alertFestivals: e.target.checked })}
                  className="rounded border-white/20 accent-sky-400"
                />
                Major Festivals & Boss Spawns
              </label>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}
