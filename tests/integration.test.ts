/** The Astro integration: route injection + the options virtual module. */

import { describe, expect, it } from "vitest";
import scoltaAstro, { SCOLTA_ROUTES, VIRTUAL_OPTIONS_ID, scoltaOptionsPlugin } from "../src/integration.js";

function runConfigSetup(options: Record<string, unknown>) {
  const injected: any[] = [];
  const updates: any[] = [];
  const integration = scoltaAstro(options);
  expect(integration.name).toBe("scolta-astro");
  void integration.hooks["astro:config:setup"]!({
    config: {},
    injectRoute: (r: any) => injected.push(r),
    updateConfig: (c: any) => {
      updates.push(c);
      return c;
    },
    logger: { info() {}, warn() {}, error() {} },
  });
  return { injected, updates };
}

describe("astro:config:setup", () => {
  it("injects the four endpoints at the exact paths scolta.js defaults to", () => {
    const { injected } = runConfigSetup({});
    expect(injected.map((r) => r.pattern)).toEqual([
      "/api/scolta/v1/expand-query",
      "/api/scolta/v1/summarize",
      "/api/scolta/v1/followup",
      "/api/scolta/v1/health",
    ]);
    expect(injected.every((r) => r.prerender === false)).toBe(true);
    expect(injected.map((r) => r.entrypoint)).toEqual(SCOLTA_ROUTES.map((r) => r.entrypoint));
    expect(injected.every((r) => String(r.entrypoint).startsWith("scolta-astro/routes/"))).toBe(true);
  });

  it("serializes the SAVED options into the virtual module and forces the package through Vite", () => {
    const { updates } = runConfigSetup({ site_name: "Acme", results_per_page: 7 });
    expect(updates.length).toBe(1);
    const vite = updates[0].vite;
    expect(vite.ssr.noExternal).toContain("scolta-astro");
    const plugin = vite.plugins[0];
    const resolved = plugin.resolveId(VIRTUAL_OPTIONS_ID);
    expect(resolved).toBeTruthy();
    const code = plugin.load(resolved);
    expect(code).toContain('"site_name":"Acme"');
    expect(code).toContain('"results_per_page":7');
  });

  it("the options plugin ignores unrelated module ids", () => {
    const plugin = scoltaOptionsPlugin({});
    expect(plugin.resolveId("astro")).toBeUndefined();
    expect(plugin.load("astro")).toBeUndefined();
  });
});
