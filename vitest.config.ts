import { defineConfig } from "vitest/config";

// Use globals instead of `import { describe } from "vitest"`. On Windows that
// import can load a second Vitest runtime and fail with `undefined.config`.
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
