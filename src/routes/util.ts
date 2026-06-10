/**
 * Shared response mapping + per-request config resolution for the injected
 * /api/scolta/v1 route modules.
 */

import { AstroScoltaConfig } from "../config.js";
import { loadConfigObject } from "../config-loader.js";
import { loadIntegrationOptions } from "../options.js";

export interface EndpointResultLike {
  ok: boolean;
  status?: number;
  data?: unknown;
  error?: string;
  retry_after?: string;
  limit?: number;
}

/**
 * Resolve the per-request config. Lowest to highest precedence:
 * `scolta.config.mjs`/`.js` at the project root, the options passed to the
 * `scoltaAstro()` integration (virtual module), then the environment.
 */
export async function resolveRequestConfig(root: string = process.cwd()): Promise<AstroScoltaConfig> {
  const fileConfig = await loadConfigObject(root);
  const integrationOptions = await loadIntegrationOptions();
  return AstroScoltaConfig.fromEnv({ ...fileConfig, ...integrationOptions });
}

/** Parse a JSON request body, tolerating absent/invalid bodies. */
export async function readJsonBody<T>(request: Request): Promise<T | undefined> {
  try {
    return (await request.json()) as T;
  } catch {
    return undefined;
  }
}

/**
 * Map an EndpointResult to a Web Response.
 * scolta.js reads the payload fields (terms/summary/response) directly off the
 * response body, so success responses send the raw `data` (not an {ok,data}
 * envelope) and failures send {error} — mirroring the Django/Laravel/Drupal
 * controllers' response mapping exactly.
 */
export function respond(result: EndpointResultLike): Response {
  if (result.ok) {
    return Response.json(result.data ?? {});
  }
  const headers = new Headers();
  if (result.retry_after) headers.set("Retry-After", result.retry_after);
  return Response.json({ error: result.error ?? "Error" }, { status: result.status ?? 500, headers });
}
