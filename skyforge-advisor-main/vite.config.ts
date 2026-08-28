import { defineConfig } from "vite";
import path from "path";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

export default defineConfig({
  publicDir: "public", // Explicitly forces Vite to include public/items in static builds
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    // SSR enabled for SEO on public pages (landing, wiki, flips).
    // Client-only storage access is guarded in the storage libs.
    tanstackStart({}),
    nitro({
      // Public JSON API for mods/tools (documented in README).
      handlers: [
        {
          route: "/api/flips",
          method: "GET",
          handler: "./server/api/flips.ts",
        },
        {
          route: "/api/leaderboard",
          method: "GET",
          handler: "./server/api/leaderboard.ts",
        },
      ],
    }),
  ],
});
