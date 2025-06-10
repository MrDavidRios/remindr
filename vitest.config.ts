import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: ["packages/main", "packages/renderer", "packages/shared"],
    coverage: {
      reporter: ["text", "lcov"],
    },
  },
});
