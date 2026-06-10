import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    integration: "src/integration.ts",
    core: "src/core.ts",
    build: "src/build.ts",
    cli: "src/cli.ts",
    // The ScoltaSearch.astro component imports ./dist/bootstrap.js directly so
    // its frontmatter stays dependency-free (no scolta binding in the page path).
    bootstrap: "src/bootstrap.ts",
    // Route modules referenced by the integration via injectRoute (package
    // specifiers) — must be emitted as loadable JS at the exported subpaths.
    "routes/expand-query": "src/routes/expand-query.ts",
    "routes/summarize": "src/routes/summarize.ts",
    "routes/followup": "src/routes/followup.ts",
    "routes/health": "src/routes/health.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  target: "node20",
  external: ["astro", "scolta", "virtual:scolta-astro-options"],
  outExtension({ format }) {
    return { js: format === "cjs" ? ".cjs" : ".js" };
  },
});
