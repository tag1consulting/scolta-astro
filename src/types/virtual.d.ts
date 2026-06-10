/**
 * The integration-options virtual module, provided by the Vite plugin in
 * integration.ts when the scoltaAstro() integration is active.
 */

declare module "virtual:scolta-astro-options" {
  const options: Record<string, unknown>;
  export default options;
}
