/**
 * Reads the options object passed to the `scoltaAstro()` integration.
 *
 * Astro has no Nuxt-style runtimeConfig, so the integration serializes its
 * options into a virtual module (`virtual:scolta-astro-options`, provided by a
 * Vite plugin in integration.ts) that gets bundled into the server build. The
 * import is dynamic and guarded: outside an Astro build (the CLI, plain-Node
 * tests), the module does not resolve and the options are simply absent.
 */

import type { AstroScoltaConfigInit } from "./config.js";

export async function loadIntegrationOptions(): Promise<AstroScoltaConfigInit> {
  try {
    const mod = await import("virtual:scolta-astro-options");
    const obj = (mod as { default?: unknown }).default;
    if (obj && typeof obj === "object") return obj as AstroScoltaConfigInit;
  } catch {
    // Integration not active in this runtime — file + env config only.
  }
  return {};
}
