import { defineConfig } from "tsup";

const shared = {
  dts: true,
  sourcemap: true,
  target: "node20",
  external: ["astro", "scolta", "virtual:scolta-astro-options"],
} as const;

export default defineConfig([
  {
    ...shared,
    entry: {
      integration: "src/integration.ts",
      core: "src/core.ts",
      build: "src/build.ts",
      cli: "src/cli.ts",
      // The ScoltaSearch.astro component imports ./dist/bootstrap.js directly so
      // its frontmatter stays dependency-free (no scolta binding in the page path).
      bootstrap: "src/bootstrap.ts",
    },
    format: ["esm", "cjs"],
    clean: true,
    outExtension({ format }) {
      return { js: format === "cjs" ? ".cjs" : ".js" };
    },
  },
  {
    ...shared,
    // Route modules referenced by the integration via injectRoute (package
    // specifiers) — ESM only: Astro resolves injected entrypoints with
    // require.resolve, so the exports map sends every condition to these files
    // (a CJS build would be picked via the "require" condition and its
    // default-import interop breaks against the ESM-only external `scolta`).
    entry: {
      "routes/expand-query": "src/routes/expand-query.ts",
      "routes/summarize": "src/routes/summarize.ts",
      "routes/followup": "src/routes/followup.ts",
      "routes/health": "src/routes/health.ts",
    },
    format: ["esm"],
    clean: false,
  },
]);
