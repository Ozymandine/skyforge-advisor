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
