import type { APIRoute } from "astro";
import { createScoltaApi } from "../handlers.js";
import { readJsonBody, resolveRequestConfig, respond } from "./util.js";

/** scolta-astro/routes/expand-query -> POST /api/scolta/v1/expand-query */
export const POST: APIRoute = async ({ request }) => {
  const body = await readJsonBody<{ query?: string }>(request);
  const result = await createScoltaApi(await resolveRequestConfig()).expandQuery(body);
  return respond(result);
};
