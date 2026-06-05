import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Matches the @/* alias used across the source tree
    alias: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
  },
  test: {
    // Run component tests in a browser-like environment without a real browser
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
  },
});
