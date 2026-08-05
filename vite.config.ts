import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    ssr: false, // <-- Disables SSR so Vercel renders 100% on the client!
  },
});