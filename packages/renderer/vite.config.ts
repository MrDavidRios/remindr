import react from "@vitejs/plugin-react-swc";
import { join } from "node:path";
import { defineConfig } from "vite";

const PACKAGE_ROOT = __dirname;
const PROJECT_ROOT = join(PACKAGE_ROOT, "../..");

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@renderer": join(PACKAGE_ROOT, "src"),
      "@hooks": join(PACKAGE_ROOT, "src/scripts/utils/hooks"),
      "@assets": join(PACKAGE_ROOT, "assets"),
      "@shared": join(PROJECT_ROOT, "packages/shared/src"),
      "@mocks/": join(PACKAGE_ROOT, "tests/mocks") + "/",
    },
  },
  base: "",
  server: {
    fs: {
      strict: true,
    },
  },
  build: {
    sourcemap: true,
    outDir: "dist",
    assetsDir: ".",
    rollupOptions: {
      input: {
        main: join(PACKAGE_ROOT, "index.html"),
        notification: join(PACKAGE_ROOT, "src/notifications/notification.html"),
        groupNotification: join(
          PACKAGE_ROOT,
          "src/notifications/groupnotification.html"
        ),
      },
    },
    emptyOutDir: true,
    reportCompressedSize: false,
  },
  plugins: [react()],
});
