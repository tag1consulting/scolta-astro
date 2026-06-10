/**
 * Framework-free core surface — everything except the Astro integration itself.
 *
 * Importable from plain Node (build scripts, tests, CI) without an Astro
 * runtime: config, the AI handler logic, the build runner, the content-source
 * protocol, and the browser bootstrap. The integration entry (`scolta-astro`,
 * the default export for `integrations: [scoltaAstro()]`) re-exports all of
 * this too.
 */

export { AstroScoltaConfig, type AstroScoltaConfigInit, type ContentMode } from "./config.js";
export { loadConfigObject } from "./config-loader.js";
export { createScoltaApi, type ScoltaApi, type ScoltaApiOptions } from "./handlers.js";
export { buildIndex, crawlStaticOutput, exportPathToUrl, type BuildOptions } from "./build.js";
export {
  CachedContentReference,
  collectSource,
  type ScoltaContentSource,
  type EnumeratedContent,
} from "./content-source.js";
export { buildWindowScolta, type BootstrapOptions } from "./bootstrap.js";
