import { defineConfig } from "vitest/config";

// Stand-in for the integration's Vite plugin (integration.ts serializes the
// scoltaAstro() options into this virtual module inside an Astro build): tests
// resolve it against a test-controlled global, set BEFORE the first import of a
// route module — the virtual module is evaluated once and then cached.
const VIRTUAL_OPTIONS_ID = "virtual:scolta-astro-options";
const RESOLVED_VIRTUAL_OPTIONS_ID = "\0" + VIRTUAL_OPTIONS_ID;

export default defineConfig({
  plugins: [
    {
      name: "test:scolta-astro-options",
      resolveId(id) {
        return id === VIRTUAL_OPTIONS_ID ? RESOLVED_VIRTUAL_OPTIONS_ID : undefined;
      },
      load(id) {
        if (id !== RESOLVED_VIRTUAL_OPTIONS_ID) return undefined;
        return "export default globalThis.__SCOLTA_ASTRO_TEST_OPTIONS__ ?? {};";
      },
    },
  ],
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
