import type { APIRoute } from "astro";
import { readJsonBody, respond, useScoltaApi } from "./util.js";

/** scolta-astro/routes/expand-query -> POST /api/scolta/v1/expand-query */
export const POST: APIRoute = async ({ request }) => {
  const body = await readJsonBody<{ query?: string }>(request);
  const result = await (await useScoltaApi()).expandQuery(body);
  return respond(result);
};
