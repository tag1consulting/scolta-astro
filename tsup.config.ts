import { defineConfig } from "tsup";

// The route modules build as a separate, SEQUENTIAL tsup pass (see the build
// script — a parallel config array races this pass's clean against the other
// pass's output; scolta-next's identically structured build lost files to it).
export default defineConfig({
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
  // import.meta.url is empty ({}) in the CJS output without this: the shim
  // derives it from __filename, so the CLI's direct-invoke detection and
  // copyAssets source-dir resolution work under the .cjs entry too. Without
  // it, `node dist/cli.cjs assets` could never run main().
  shims: true,
  dts: true,
  clean: true,
  sourcemap: true,
  target: "node20",
  external: ["astro", "scolta", "virtual:scolta-astro-options"],
  outExtension({ format }) {
    return { js: format === "cjs" ? ".cjs" : ".js" };
  },
});
