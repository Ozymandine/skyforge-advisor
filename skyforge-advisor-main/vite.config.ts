import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

export default defineConfig(({ command, mode }) => {
  if (command === "serve" && !process.env["HYPIXEL_API_KEY"]) {
    const key = loadEnv(mode, process.cwd(), "HYPIXEL_API_KEY")["HYPIXEL_API_KEY"];
    if (key) process.env["HYPIXEL_API_KEY"] = key;
  }

  return {
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
      react(),
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
  };
});
