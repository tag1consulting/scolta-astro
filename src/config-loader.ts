/**
 * Project config-file loader shared by the `scolta-build` CLI and the injected
 * route modules: `scolta.config.mjs` / `scolta.config.js` at the project root
 * is the lowest-precedence config layer (integration options and the
 * environment win — see routes/util.ts).
 */

import * as path from "node:path";
import { pathToFileURL } from "node:url";
import type { AstroScoltaConfigInit } from "./config.js";

export async function loadConfigObject(root: string): Promise<AstroScoltaConfigInit> {
  for (const name of ["scolta.config.mjs", "scolta.config.js"]) {
    try {
      const mod: unknown = await import(pathToFileURL(path.join(root, name)).href);
      const m = mod as { default?: unknown; config?: unknown };
      const obj = m.default ?? m.config ?? mod;
      if (obj && typeof obj === "object") return obj as AstroScoltaConfigInit;
    } catch {
      // fall through to env-only
    }
  }
  return {};
}
