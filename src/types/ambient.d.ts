/**
 * Minimal ambient declarations for the Astro peer surface this integration
 * touches. The real types come from the consumer's installed `astro` — these
 * just let scolta-astro typecheck and build standalone.
 */

declare module "astro" {
  export interface AstroIntegrationLogger {
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
  }

  export interface InjectedRoute {
    pattern: string;
    entrypoint: string | URL;
    prerender?: boolean;
  }

  export interface ConfigSetupHookParams {
    config: Record<string, unknown>;
    injectRoute(route: InjectedRoute): void;
    updateConfig(config: Record<string, unknown>): Record<string, unknown>;
    logger: AstroIntegrationLogger;
  }

  export interface AstroIntegration {
    name: string;
    hooks: {
      "astro:config:setup"?: (params: ConfigSetupHookParams) => void | Promise<void>;
      [hook: string]: unknown;
    };
  }

  export interface APIContext {
    request: Request;
    [key: string]: unknown;
  }

  export type APIRoute = (context: APIContext) => Response | Promise<Response>;
}
