/// <reference types="astro/client" />
/**
 * Widget-mount smoke test (mandated for browser-mounting adapters): rendering
 * <ScoltaSearch /> through Astro's container API must produce the container
 * div scolta.js hydrates into, the stylesheet + widget-module tags, and a
 * window.scolta bootstrap carrying `container` + a `wasmPath` ending in the
 * WASM glue module. Requires `npm run build` first (the component imports
 * ./dist/bootstrap.js).
 */

import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import ScoltaSearch from "../ScoltaSearch.astro";

async function renderSearch(props: Record<string, unknown>): Promise<JSDOM> {
  const container = await AstroContainer.create();
  const html = await container.renderToString(ScoltaSearch, { props });
  return new JSDOM(html, { runScripts: "dangerously" });
}

describe("<ScoltaSearch /> mount", () => {
  it("renders the container div and injects the stylesheet + widget tags", async () => {
    const dom = await renderSearch({ config: { siteName: "Mount Site" } });
    const doc = dom.window.document;

    expect(doc.querySelector("#scolta-search[data-scolta-search]")).not.toBeNull();
    const link = doc.querySelector('link[rel="stylesheet"][data-scolta]');
    expect(link?.getAttribute("href")).toBe("/scolta/css/scolta.css");
    const widget = doc.querySelector('script[type="module"][data-scolta]');
    expect(widget?.getAttribute("src")).toBe("/scolta/js/scolta.js");
  });

  it("the inline bootstrap sets window.scolta with container + WASM glue path", async () => {
    const dom = await renderSearch({ config: { siteName: "Mount Site" } });
    // runScripts executed the inline define:vars bootstrap during parse.
    const scolta = (dom.window as unknown as { scolta?: Record<string, unknown> }).scolta;
    expect(scolta).toBeTruthy();
    expect(scolta!["container"]).toBe("#scolta-search");
    expect(String(scolta!["wasmPath"]).endsWith("/wasm/scolta_core.js")).toBe(true);
    expect(scolta!["siteName"]).toBe("Mount Site");
  });

  it("honours containerId and assetsPath props", async () => {
    const dom = await renderSearch({
      config: {},
      containerId: "my-search",
      assetsPath: "/static/scolta",
    });
    expect(dom.window.document.querySelector("#my-search")).not.toBeNull();
    const scolta = (dom.window as unknown as { scolta?: Record<string, unknown> }).scolta;
    expect(scolta!["container"]).toBe("#my-search");
    expect(scolta!["wasmPath"]).toBe("/static/scolta/wasm/scolta_core.js");
  });
});
