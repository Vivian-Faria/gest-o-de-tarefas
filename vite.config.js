import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 },
  // All source files are at the root level (no src/ folder)
  root: ".",
  build: {
    outDir: "dist",
  },
});
