import type { APIRoute } from "astro";
import type { ai } from "scolta";
import { createScoltaApi } from "../handlers.js";
import { readJsonBody, resolveRequestConfig, respond } from "./util.js";

/** scolta-astro/routes/followup -> POST /api/scolta/v1/followup */
export const POST: APIRoute = async ({ request }) => {
  const body = await readJsonBody<{ messages?: ai.ChatMessage[] }>(request);
  const result = await createScoltaApi(await resolveRequestConfig()).followUp(body);
  return respond(result);
};
