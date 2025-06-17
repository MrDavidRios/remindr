import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Optionally, specify include pattern if your tests are in a subfolder
    include: ["tests/**/*.spec.ts*"],
  },
});
