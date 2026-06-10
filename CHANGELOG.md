# Changelog

## [Unreleased]

## [1.0.0]

- Initial Astro integration: injected AI server routes at
  `/api/scolta/v1/{expand-query,summarize,followup,health}`, the
  `ScoltaSearch.astro` mount component, static-output crawl + content-source
  modes, the `scolta-build` CLI, and asset vendoring. Reuses the `scolta`
  binding for all indexing/scoring/AI; no bundled CMS module.
- Routes send the raw payload (`{terms}` / `{summary}` / `{response}`) on
  success and `{error}` on failure — matching what `scolta.js` reads and the
  Django/Laravel/Drupal controllers emit (no `{ok,data}` envelope).
- Route handlers resolve config at request time, lowest precedence first:
  `scolta.config.mjs`/`.js` at the project root, the options passed to the
  `scoltaAstro()` integration (serialized into the server bundle via a virtual
  module), then the `SCOLTA_AI_PROVIDER` / `SCOLTA_API_KEY` / `SCOLTA_AI_MODEL`
  / `SCOLTA_AI_BASE_URL` environment overrides.
- Default the AI service to the auto-provisioning `AmazeeAiService` when the
  resolved provider is `amazee` (free LiteLLM trial, no key required), backed by
  a filesystem credential store under the state dir.
