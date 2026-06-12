import { defineConfig } from "tsup";

// Route modules referenced by the integration via injectRoute (package
// specifiers) — ESM only, DELIBERATELY (commit 33d7f45): Astro resolves
// injected entrypoints with require.resolve, so the exports map sends every
// condition to these files; a CJS build would be picked via the "require"
// condition and its default-import interop breaks against the ESM-only
// external `scolta` (every endpoint 404'd). Do not reintroduce CJS here.
export default defineConfig({
  entry: {
    "routes/expand-query": "src/routes/expand-query.ts",
    "routes/summarize": "src/routes/summarize.ts",
    "routes/followup": "src/routes/followup.ts",
    "routes/health": "src/routes/health.ts",
  },
  format: ["esm"],
  dts: true,
  clean: false,
  sourcemap: true,
  target: "node20",
  external: ["astro", "scolta", "virtual:scolta-astro-options"],
})
