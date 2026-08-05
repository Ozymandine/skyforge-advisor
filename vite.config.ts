import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import path from "path";

export default defineConfig({
  tanstackStart: {
    ssr: false, // Disables SSR for clean client-side rendering
  },
  publicDir: "public", // Explicitly forces Vite to include public/items in static builds
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});