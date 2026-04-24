import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    include: [
      "app/**/*.test.{ts,tsx}",
      "src/**/*.test.{ts,tsx}",
      "tests/**/*.test.{ts,tsx}",
    ],
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
});
