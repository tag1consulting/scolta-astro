#!/usr/bin/env node
/**
 * `scolta-build` CLI for Astro — builds the Pagefind index from an Astro site.
 * Reuses the framework-agnostic build engine in `scolta`; this only supplies
 * the Astro output dir + config.
 *
 *   npx scolta-build            # fresh build (after `astro build`)
 *   npx scolta-build --force | --resume | --restart
 *   npx scolta-build assets     # copy runtime assets into the output dir
 */

import { realpathSync } from "node:fs";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import { AstroScoltaConfig } from "./config.js";
import { loadConfigObject } from "./config-loader.js";
import { buildIndex } from "./build.js";
import { copyAssets } from "./assets.js";

export async function main(argv = process.argv.slice(2)): Promise<number> {
  const cwd = process.cwd();
  const config = AstroScoltaConfig.fromEnv(await loadConfigObject(cwd));

  if (argv[0] === "assets") {
    const n = copyAssets(import.meta.url, path.join(cwd, config.outputDir), config.assetsPublicPath);
    console.log(`[scolta] Copied ${n} runtime assets into ${path.join(config.outputDir, config.assetsPublicPath)}`);
    return 0;
  }

  const mode = argv.includes("--resume") ? "resume" : argv.includes("--restart") ? "restart" : "fresh";
  const force = argv.includes("--force");
  const report = await buildIndex(config, { mode, force, logger: console });
  if (report.success) {
    console.log(`[scolta] ${report.toBuildResult().message}`);
    return 0;
  }
  console.error(`[scolta] Build failed: ${report.error}`);
  return 1;
}

/** True when this module is the entry point — symlink-safe (npm `.bin` links). */
function invokedDirectly(): boolean {
  const argv1 = process.argv[1];
  if (!argv1) return false;
  try {
    return import.meta.url === pathToFileURL(realpathSync(argv1)).href;
  } catch {
    return import.meta.url === pathToFileURL(argv1).href;
  }
}

if (invokedDirectly()) {
  main().then((code) => process.exit(code)).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
