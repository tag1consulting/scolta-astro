/**
 * Astro adapter configuration. Same shape as scolta-next/scolta-nuxt, defaulting
 * the output dir to Astro's `astro build` target. Wraps the framework-agnostic
 * {@link ScoltaConfig}; the values the developer sets are exactly what the
 * adapter reports back (Release Gate family 4).
 */

import { ScoltaConfig } from "scolta";

export type ContentMode = "static-export" | "content";

export interface AstroScoltaConfigInit extends Record<string, unknown> {
  source?: ContentMode;
  /** `astro build` output dir to crawl (Astro default `dist`). */
  exportDir?: string;
  /** Parent dir the `pagefind/` index is written under. */
  outputDir?: string;
  stateDir?: string;
  assetsPublicPath?: string;
  autoRebuild?: boolean;
  autoRebuildDelay?: number;
}

export class AstroScoltaConfig {
  readonly scolta: ScoltaConfig;
  readonly source: ContentMode;
  readonly exportDir: string;
  readonly outputDir: string;
  readonly stateDir: string;
  readonly assetsPublicPath: string;
  readonly autoRebuild: boolean;
  readonly autoRebuildDelay: number;

  constructor(init: AstroScoltaConfigInit = {}) {
    this.scolta = ScoltaConfig.fromObject(init);
    this.source = init.source === "content" ? "content" : "static-export";
    this.exportDir = init.exportDir ?? "dist";
    // For a static `astro build`, the index is written alongside the generated
    // output so it is served at /pagefind. Override for server/hybrid setups
    // (e.g. outputDir: "public" so Astro copies it into the client build).
    this.outputDir = init.outputDir ?? "dist";
    this.stateDir = init.stateDir ?? ".scolta";
    this.assetsPublicPath = init.assetsPublicPath ?? "/scolta";
    this.autoRebuild = init.autoRebuild ?? false;
    this.autoRebuildDelay = init.autoRebuildDelay ?? 2000;
  }

  static fromObject(init: AstroScoltaConfigInit = {}): AstroScoltaConfig {
    return new AstroScoltaConfig(init);
  }

  /**
   * Environment values win over the static config so a deployment can point AI
   * at an explicit provider/key (e.g. SCOLTA_AI_PROVIDER=anthropic +
   * SCOLTA_API_KEY) and skip the Amazee default.
   */
  static fromEnv(init: AstroScoltaConfigInit = {}, env: NodeJS.ProcessEnv = process.env): AstroScoltaConfig {
    const merged: AstroScoltaConfigInit = { ...init };
    if (env["SCOLTA_API_KEY"]) merged["ai_api_key"] = env["SCOLTA_API_KEY"];
    if (env["SCOLTA_AI_MODEL"]) merged["ai_model"] = env["SCOLTA_AI_MODEL"];
    if (env["SCOLTA_AI_PROVIDER"]) merged["ai_provider"] = env["SCOLTA_AI_PROVIDER"];
    if (env["SCOLTA_AI_BASE_URL"]) merged["ai_base_url"] = env["SCOLTA_AI_BASE_URL"];
    return new AstroScoltaConfig(merged);
  }

  toBrowserConfig(): Record<string, unknown> {
    return this.scolta.toBrowserConfig();
  }
}
