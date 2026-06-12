import type { APIRoute } from "astro";
import type { ai } from "scolta";
import { readJsonBody, respond, useScoltaApi } from "./util.js";

/** scolta-astro/routes/followup -> POST /api/scolta/v1/followup */
export const POST: APIRoute = async ({ request }) => {
  const body = await readJsonBody<{ messages?: ai.ChatMessage[] }>(request);
  const result = await (await useScoltaApi()).followUp(body);
  return respond(result);
};
