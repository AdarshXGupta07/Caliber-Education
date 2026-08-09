import { defineConfig } from "vitest/config";
import path from "path";

// Minimal config for testing pure functions only — no jsdom/React Testing
// Library. See src/app/quiz/[id]/page.test.ts.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
