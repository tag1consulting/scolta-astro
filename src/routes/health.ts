import type { APIRoute } from "astro";
import { useScoltaApi } from "./util.js";

/** scolta-astro/routes/health -> GET /api/scolta/v1/health */
export const GET: APIRoute = async () => {
  return Response.json(await (await useScoltaApi()).health());
};
