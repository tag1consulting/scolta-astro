import type { APIRoute } from "astro";
import { createScoltaApi } from "../handlers.js";
import { resolveRequestConfig } from "./util.js";

/** scolta-astro/routes/health -> GET /api/scolta/v1/health */
export const GET: APIRoute = async () => {
  return Response.json(await createScoltaApi(await resolveRequestConfig()).health());
};
