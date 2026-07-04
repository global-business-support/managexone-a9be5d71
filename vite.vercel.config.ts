// Vercel-specific build config. Lovable preview/publish still uses vite.config.ts.
// Nitro's Vercel preset writes the required `.vercel/output` deployment files.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: { preset: "vercel" },
  tanstackStart: {
    server: { entry: "server" },
  },
});
