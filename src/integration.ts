/**
 * scolta-astro — the Astro integration.
 *
 * Injects the AI endpoints as server routes at the exact paths scolta.js
 * defaults to, and serializes the integration options into the server bundle
 * (virtual module) so the route handlers reflect the SAVED config at request
 * time. All indexing/scoring/AI logic lives in the shared `scolta` binding —
 * this integration is only Astro wiring. The <ScoltaSearch /> component is not
 * auto-registered (Astro has no global components); import it from
 * `scolta-astro/ScoltaSearch.astro`.
 */

import type { AstroIntegration } from "astro";
import type { AstroScoltaConfigInit } from "./config.js";

export const VIRTUAL_OPTIONS_ID = "virtual:scolta-astro-options";
const RESOLVED_VIRTUAL_OPTIONS_ID = "\0" + VIRTUAL_OPTIONS_ID;

export interface VitePluginLike {
  name: string;
  resolveId(id: string): string | undefined;
  load(id: string): string | undefined;
}

/** Vite plugin serializing the integration options into the server bundle. */
export function scoltaOptionsPlugin(options: AstroScoltaConfigInit): VitePluginLike {
  return {
    name: "scolta-astro:options",
    resolveId(id) {
      return id === VIRTUAL_OPTIONS_ID ? RESOLVED_VIRTUAL_OPTIONS_ID : undefined;
    },
    load(id) {
      return id === RESOLVED_VIRTUAL_OPTIONS_ID ? `export default ${JSON.stringify(options ?? {})};` : undefined;
    },
  };
}

/** The endpoint paths scolta.js defaults to, served by the shipped route modules. */
export const SCOLTA_ROUTES = [
  { pattern: "/api/scolta/v1/expand-query", entrypoint: "scolta-astro/routes/expand-query" },
  { pattern: "/api/scolta/v1/summarize", entrypoint: "scolta-astro/routes/summarize" },
  { pattern: "/api/scolta/v1/followup", entrypoint: "scolta-astro/routes/followup" },
  { pattern: "/api/scolta/v1/health", entrypoint: "scolta-astro/routes/health" },
] as const;

export default function scoltaAstro(options: AstroScoltaConfigInit = {}): AstroIntegration {
  return {
    name: "scolta-astro",
    hooks: {
      "astro:config:setup"(ctx) {
        ctx.updateConfig({
          vite: {
            plugins: [scoltaOptionsPlugin(options)],
            // Force this package through Vite so the virtual options import in
            // the route modules resolves in both dev SSR and the server build
            // (an externalized package would hit Node resolution and fail).
            // Also lets Astro compile the shipped ScoltaSearch.astro component.
            ssr: { noExternal: ["scolta-astro"] },
          },
        });
        for (const route of SCOLTA_ROUTES) {
          // The AI endpoints are request-time routes (POST + health probe);
          // never prerender them, even under static output.
          ctx.injectRoute({ pattern: route.pattern, entrypoint: route.entrypoint, prerender: false });
        }
      },
    },
  };
}

// The framework-free core is also available from the integration entry. Plain-
// Node consumers (build scripts, tests) should import from `scolta-astro/core`.
export * from "./core.js";
