// Synthesized Web Audio Sound System for Skyforge
// Low-latency, zero external asset dependencies.

let audioCtx: AudioContext | null = null;
const SOUND_ENABLED_KEY = "skyforge_sound_enabled";
const SOUND_VOLUME_KEY = "skyforge_sound_volume";

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem(SOUND_ENABLED_KEY);
  return stored === "true";
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SOUND_ENABLED_KEY, enabled ? "true" : "false");
}

export function getSoundVolume(): number {
  if (typeof window === "undefined") return 0.4;
  const stored = localStorage.getItem(SOUND_VOLUME_KEY);
  return stored ? Number(stored) : 0.4;
}

export function setSoundVolume(volume: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SOUND_VOLUME_KEY, String(volume));
}

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Crisp UI Click (wooden button / menu select).
 */
export function playClickSound(customVol?: number) {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const vol = customVol ?? getSoundVolume();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

    gain.gain.setValueAtTime(vol * 0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  } catch {
    // Graceful fallback
  }
}

/**
 * Subtle low-pitch slot hover tick.
 */
export function playSlotHoverSound(customVol?: number) {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const vol = customVol ?? getSoundVolume();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.02);

    gain.gain.setValueAtTime(vol * 0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.025);
  } catch {
    // Graceful fallback
  }
}

/**
 * Minecraft XP orb pickup chime.
 */
export function playSuccessChime(customVol?: number) {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const vol = customVol ?? getSoundVolume();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.12);

    gain.gain.setValueAtTime(vol * 0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  } catch {
    // Graceful fallback
  }
}

/**
 * Level up or major milestone fanfare.
 */
export function playLevelUpSound(customVol?: number) {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const vol = customVol ?? getSoundVolume();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    notes.forEach((freq, index) => {
      const startTime = now + index * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(vol * 0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.25);
    });
  } catch {
    // Graceful fallback
  }
}
