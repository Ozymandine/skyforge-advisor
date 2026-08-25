// src/lib/audio-chimes.ts
// Native Web Audio API Chimes Suite for Hypixel SkyBlock Event Alarms:
// Zero-latency synthesized tone engine (Crystal Chime, Resonant Bell, Chord Arpeggio, Quick Alert)
// with persistent client-side configuration.

export type ChimeProfile = "crystal" | "bell" | "arpeggio" | "alert";

export type CalendarAlarmSettings = {
  enabled: boolean;
  volume: number; // 0.0 to 1.0
  chimeType: ChimeProfile;
  alertJacob: boolean;
  alertDarkAuction: boolean;
  alertFestivals: boolean;
  alertMinutesBefore: number; // 1, 3, 5, 10
};

const STORAGE_KEY = "skyforge_calendar_alarms";

export const DEFAULT_ALARM_SETTINGS: CalendarAlarmSettings = {
  enabled: true,
  volume: 0.7,
  chimeType: "crystal",
  alertJacob: true,
  alertDarkAuction: true,
  alertFestivals: true,
  alertMinutesBefore: 5,
};

export function getAlarmSettings(): CalendarAlarmSettings {
  if (typeof window === "undefined") return DEFAULT_ALARM_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ALARM_SETTINGS;
    return { ...DEFAULT_ALARM_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_ALARM_SETTINGS;
  }
}

export function saveAlarmSettings(settings: CalendarAlarmSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage write errors
  }
}

let audioCtxInstance: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtxInstance) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      audioCtxInstance = new AudioCtx();
    }
  }
  if (audioCtxInstance && audioCtxInstance.state === "suspended") {
    audioCtxInstance.resume();
  }
  return audioCtxInstance;
}

/**
 * Synthesizes and plays a zero-latency tone using Web Audio API oscillators and gain envelopes.
 */
export function playChime(
  type: ChimeProfile = "crystal",
  volume: number = 0.7,
): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), now);
  masterGain.connect(ctx.destination);

  switch (type) {
    case "crystal": {
      // Dual harmonic sine waves with crisp attack and shimmering decay
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(1174.66, now); // D6
      osc1.frequency.exponentialRampToValueAtTime(1760.0, now + 0.15); // A6

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(2349.32, now); // D7
      osc2.frequency.exponentialRampToValueAtTime(3520.0, now + 0.15); // A7

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.8, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.3);
      osc2.stop(now + 1.3);
      break;
    }

    case "bell": {
      // Resonant triangle fundamental with metallic ringing overtones
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(880.0, now); // A5

      gain.gain.setValueAtTime(0.9, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 1.9);
      break;
    }

    case "arpeggio": {
      // Ascending 4-note chord arpeggio (C5 -> E5 -> G5 -> C6)
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteStart = now + i * 0.09;

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.linearRampToValueAtTime(0.6, noteStart + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.6);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(noteStart);
        osc.stop(noteStart + 0.65);
      });
      break;
    }

    case "alert": {
      // Rapid 2-tone pulse alert
      [880, 1320].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const toneStart = now + i * 0.12;

        osc.type = "square";
        osc.frequency.setValueAtTime(freq, toneStart);

        gain.gain.setValueAtTime(0.3, toneStart);
        gain.gain.exponentialRampToValueAtTime(0.001, toneStart + 0.1);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(toneStart);
        osc.stop(toneStart + 0.11);
      });
      break;
    }
  }
}

