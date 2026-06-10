/**
 * Route modules: raw-payload responses (no {ok,data} envelope — the bug class
 * scolta-nuxt 1.0.0 fixed) + request-time config resolution (file < integration
 * options < env).
 */

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

declare global {
  var __SCOLTA_ASTRO_TEST_OPTIONS__: Record<string, unknown> | undefined;
}

// Set BEFORE the first import of any route module: the virtual options module
// (provided by vitest.config.ts here, by the integration's Vite plugin in an
// app) is evaluated once on first load and then cached. An explicit non-amazee
// provider with no key keeps the AI path deterministic and offline: expansion
// degrades to the original query instead of provisioning a trial.
globalThis.__SCOLTA_ASTRO_TEST_OPTIONS__ = { ai_provider: "anthropic", ai_api_key: "", results_per_page: 7 };

const expandQuery = await import("../src/routes/expand-query.js");
const summarize = await import("../src/routes/summarize.js");
const followup = await import("../src/routes/followup.js");
const health = await import("../src/routes/health.js");
const { resolveRequestConfig } = await import("../src/routes/util.js");

function post(route: { POST: (ctx: any) => Response | Promise<Response> }, body: unknown): Promise<Response> | Response {
  return route.POST({
    request: new Request("http://localhost/api/scolta/v1/test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  });
}

describe("raw payload contract", () => {
  it("expand-query answers 200 with the raw {terms} payload", async () => {
    const res = await post(expandQuery, { query: "rebase" });
    expect(res.status).toBe(200);
    const json = await res.json();
    // AI unconfigured -> expansion degrades to the original query. The payload
    // is the binding's raw data (terms + ranking knobs scolta.js reads), with
    // no {ok,data} envelope around it.
    expect(json.terms).toEqual(["rebase"]);
    expect("ok" in json).toBe(false);
    expect("data" in json).toBe(false);
  });

  it("expand-query tolerates a missing body", async () => {
    const res = await expandQuery.POST({ request: new Request("http://localhost/x", { method: "POST" }) } as any);
    expect([200, 400]).toContain(res.status);
    expect("data" in (await res.json())).toBe(false);
  });

  it("summarize responds raw-shaped (no envelope; {error} only on non-200)", async () => {
    const res = await post(summarize, { query: "rebase", context: "Rebasing rewrites history." });
    const json = await res.json();
    expect("ok" in json).toBe(false);
    expect("data" in json).toBe(false);
    // AI unconfigured -> graceful raw degrade ({} at 200); errors pair a
    // non-200 status with an {error} body.
    if (res.status === 200) expect("error" in json).toBe(false);
    else expect(typeof json.error).toBe("string");
  });

  it("followup validates messages: 400 + {error}", async () => {
    const res = await post(followup, { messages: [] });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(typeof json.error).toBe("string");
    expect("ok" in json).toBe(false);
  });

  it("health answers 200 JSON reflecting the integration options", async () => {
    const res = await health.GET({ request: new Request("http://localhost/api/scolta/v1/health") } as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    // results_per_page: 7 came in through the virtual options module — the
    // round-trip proof that scoltaAstro() options reach the served config.
    expect(json.scoring.RESULTS_PER_PAGE).toBe(7);
  });
});

describe("request-time config resolution", () => {
  let tmp: string;
  beforeAll(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), "scolta-astro-cfg-"));
    fs.writeFileSync(
      path.join(tmp, "scolta.config.mjs"),
      'export default { site_name: "File Site", results_per_page: 5, outputDir: "public" };\n',
    );
  });
  afterAll(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it("reads scolta.config.mjs from the project root", async () => {
    const c = await resolveRequestConfig(tmp);
    expect(c.scolta.site_name).toBe("File Site");
    expect(c.outputDir).toBe("public");
  });

  it("integration options override the file; env overrides both", async () => {
    const prev = process.env["SCOLTA_API_KEY"];
    process.env["SCOLTA_API_KEY"] = "sk-env";
    try {
      const c = await resolveRequestConfig(tmp);
      expect(c.scolta.results_per_page).toBe(7); // integration options beat the file's 5
      expect(c.scolta.site_name).toBe("File Site"); // file value kept where not overridden
      expect(c.scolta.ai_api_key).toBe("sk-env"); // env wins over the options' empty key
    } finally {
      if (prev === undefined) delete process.env["SCOLTA_API_KEY"];
      else process.env["SCOLTA_API_KEY"] = prev;
    }
  });

  it("falls back to env-only when no config file exists", async () => {
    const empty = fs.mkdtempSync(path.join(os.tmpdir(), "scolta-astro-empty-"));
    try {
      const c = await resolveRequestConfig(empty);
      expect(c.scolta.results_per_page).toBe(7); // integration options still apply
    } finally {
      fs.rmSync(empty, { recursive: true, force: true });
    }
  });
});
