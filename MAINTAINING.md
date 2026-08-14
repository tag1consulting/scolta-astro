# MAINTAINING — scolta-astro

The Astro integration over the `scolta` binding. Publishes to npm.

Everything true of more than one Scolta repo lives in
[scolta-core/MAINTAINING.md](https://github.com/tag1consulting/scolta-core/blob/main/MAINTAINING.md):
the version rules, the release order, the fleet checks, the rules every repo shares.

**What it is.** An Astro integration, framework glue only: the injected API routes, the
`ScoltaSearch.astro` mount component, the static-output crawl and the build CLI. It depends on `scolta`
(the repo is `scolta-node`) and never on `scolta-core` directly.

**Where the version lives.** `package.json`.

**Where it publishes.** npm, as `scolta-astro`. To confirm: `npm install scolta-astro` in a throwaway
directory resolves it. The main entry is the integration (default export) plus named utils; the
framework-free build utils are also at `scolta-astro/core` and `scolta-astro/build`, and the route
modules ship at `scolta-astro/routes/*`.

**CI checks.** One `test` job, and unlike the other npm adapters it runs on **Node 22 only**: this
package's own engines floor is 20, but the mount suite runs the Astro devDependency, whose engines
require 22.12 or newer. The job runs `npm run build`, `npm test` (vitest twice, the second pass under
`vitest.mount.config.ts`), `npm run typecheck`, `npm run lint`, `npm run check:publish` and
`npm run check:pack`. Everything else about the workflow matches the other npm adapters, including the
pinned npm version.

**On release day.** Release this after scolta-node. Tag `vX.Y.Z`; the release workflow is the same shape
as the other npm adapters and publishes through Trusted Publishing (OIDC), which attaches provenance
automatically.

**Watch out for.**

- Route modules resolve config at request time, lowest precedence first: `scolta.config.mjs`, then
  integration options (serialized into the server bundle through `virtual:scolta-astro-options`), then
  env. `src/config-loader.ts` implements that order and no test file exercises it directly; the
  integration and its routes are verified end to end by the Astro demo, so a change there is
  demo-verified rather than CI-verified.
- `astro` is peer or ambient, declared in `src/types/ambient.d.ts` so this package typechecks and builds
  standalone. The real types come from the consumer.
- The `file:` dependency trap: the published manifest must carry a semver, never a `file:` path. The
  demos deliberately override `scolta` with a `file:` install of a sibling checkout, which is exactly the
  state that must not reach a published tarball. `check:pack` is what catches a leftover.
- This package carries no copy of the browser bundle; it comes from `scolta`.
