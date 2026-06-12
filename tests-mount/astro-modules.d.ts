/**
 * Lets `tsc --noEmit` type the .astro import in this directory. Vitest's
 * Astro pipeline (vitest.mount.config.ts) does the real compilation; astro's
 * own `*.astro` wildcard lives in `astro/client` which tsc does not pull in
 * for plain .ts includes.
 */
declare module "*.astro" {
  import type { AstroComponentFactory } from "astro/runtime/server/index.js";
  const component: AstroComponentFactory;
  export default component;
}
