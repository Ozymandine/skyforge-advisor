// src/lib/theme.ts
// Theme state shared by the header toggle and the Settings page.

const THEME_STORAGE = "theme";

export function getTheme(): string {
  if (typeof window === "undefined") return "dark";
  return window.localStorage.getItem(THEME_STORAGE) ?? "dark";
}

export function applyTheme(theme: string): void {
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

export function setTheme(theme: string): void {
  window.localStorage.setItem(THEME_STORAGE, theme);
  applyTheme(theme);
  window.dispatchEvent(new CustomEvent("skyforge-theme", { detail: theme }));
}

export function onThemeChange(listener: (theme: string) => void): () => void {
  const handler = (e: Event) => listener((e as CustomEvent<string>).detail);
  window.addEventListener("skyforge-theme", handler);
  return () => window.removeEventListener("skyforge-theme", handler);
}
export const accentOptions = ["stone", "sage", "sand"] as const;
type Accent = (typeof accentOptions)[number];

const SCENE_STORAGE = "skyforge.scene";

export function getSceneTheme() {
  const defaults = { accent: "stone" as Accent, opacity: 77, scenery: true };
  if (typeof window === "undefined") return defaults;
  try {
    const value = JSON.parse(window.localStorage.getItem(SCENE_STORAGE) ?? "{}");
    return {
      accent: accentOptions.includes(value.accent) ? (value.accent as Accent) : defaults.accent,
      opacity:
        typeof value.opacity === "number" && value.opacity >= 65 && value.opacity <= 95
          ? value.opacity
          : defaults.opacity,
      scenery: typeof value.scenery === "boolean" ? value.scenery : defaults.scenery,
    };
  } catch {
    return defaults;
  }
}

export function applySceneTheme(theme: ReturnType<typeof getSceneTheme>) {
  const root = document.documentElement;
  root.dataset["skyforgeAccent"] = theme.accent;
  root.dataset["skyforgeScenery"] = theme.scenery ? "on" : "off";
  root.style.setProperty("--scene-panel-opacity", theme.opacity + "%");
}

export function setSceneTheme(theme: ReturnType<typeof getSceneTheme>) {
  window.localStorage.setItem(SCENE_STORAGE, JSON.stringify(theme));
  applySceneTheme(theme);
}
