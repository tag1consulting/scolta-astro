import type { APIRoute } from "astro";
import { readJsonBody, respond, useScoltaApi } from "./util.js";

/** scolta-astro/routes/summarize -> POST /api/scolta/v1/summarize */
export const POST: APIRoute = async ({ request }) => {
  const body = await readJsonBody<{ query?: string; context?: string }>(request);
  const result = await (await useScoltaApi()).summarize(body);
  return respond(result);
};
