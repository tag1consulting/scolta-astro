# scolta-astro — conventions

Thin Astro integration over the `scolta` binding (`../scolta-node`). It adds
ONLY Astro glue — injected API routes, the `ScoltaSearch.astro` mount
component, the static-output crawl, and the build CLI. It NEVER reimplements
indexing, scoring, tokenizing, AI, or content-source logic — all of that is in
`scolta` and shared with scolta-next/scolta-nuxt. The JSON:API/decoupled-Drupal
example is NOT duplicated here; it lives in scolta-next and applies unchanged.

- Main entry `scolta-astro` is the integration (default export) + named utils.
  Framework-free build utils are also at `scolta-astro/core` / `scolta-astro/build`.
- Route modules ship at `scolta-astro/routes/*` and resolve config at request
  time, lowest precedence first: `scolta.config.mjs` < integration options
  (serialized into the server bundle via `virtual:scolta-astro-options`) < env.
- `scolta` is a published-npm dependency (`^1.0.0`); demos override it with a
  `file:` install of `../scolta-node`.
- astro is peer/ambient — declared in src/types/ambient.d.ts so the package
  typechecks/builds standalone; real types come from the consumer.
- No AI attribution. Tests are vitest against the plain handler/build/config
  surface (no Astro runtime needed); the integration + routes are E2E-verified
  by the GitMastery (Astro) demo.
