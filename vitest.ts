import { defaultExclude, type ViteUserConfig } from "vitest/config"

export default {
  optimizeDeps: { exclude: [] },
  resolve: {
    conditions: ["module", "development|production"],
    dedupe: ["@effect/vitest", "vitest"],
    tsconfigPaths: true,
  },
  test: {
    exclude: [...defaultExclude, "**/dist/**"],
    fakeTimers: { toFake: undefined },
    sequence: { concurrent: true },
    server: { deps: { inline: ["@effect/vitest"] } },
    setupFiles: [new URL("./vitest.setup.ts", import.meta.url).pathname],
  },
} satisfies ViteUserConfig
