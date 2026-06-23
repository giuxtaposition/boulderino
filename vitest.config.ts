import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "expo-crypto": path.resolve(__dirname, "src/test/expo-crypto-stub.ts"),
    },
  },
  test: {
    environment: "node",
    globals: false,
    include: [
      "src/domain/**/*.{test,spec}.ts",
      "src/application/**/*.{test,spec}.ts",
      "src/infrastructure/**/*.{test,spec}.ts",
    ],
    exclude: [
      "node_modules",
      "src/app/**",
      "src/components/**",
      "src/ui/**",
    ],
  },
});
