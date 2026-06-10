import type { APIRoute } from "astro";
import { createScoltaApi } from "../handlers.js";
import { readJsonBody, resolveRequestConfig, respond } from "./util.js";

/** scolta-astro/routes/summarize -> POST /api/scolta/v1/summarize */
export const POST: APIRoute = async ({ request }) => {
  const body = await readJsonBody<{ query?: string; context?: string }>(request);
  const result = await createScoltaApi(await resolveRequestConfig()).summarize(body);
  return respond(result);
};
