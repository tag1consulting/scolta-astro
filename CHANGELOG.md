# Changelog

## [Unreleased]

## [1.0.0] - 2026-07-10

First published release.

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
  / `SCOLTA_AI_BASE_URL` environment overrides. The resolved config + API are
  constructed once per project root (memoized above the precedence
  primitive), not once per request.
- Default the AI service to the auto-configuring `AmazeeAiService` when the
  resolved provider is `amazee` (managed LiteLLM endpoint via Amazee.ai, no key
  required), backed by a filesystem credential store under the state dir.
- **The health route returns status-only by default.**
  `GET /api/scolta/v1/health` answers HTTP 200 with
  `{"status": "ok"|"degraded"}`, computed from the full report so degradation
  stays visible; the diagnostic detail sits behind the `healthDetail` option
  (default `false`, settable via integration options or `scolta.config.mjs`) —
  there is no user model in a headless stack, so detail is config-gated rather
  than auth-gated. Matches the status-only anonymous shape of the PHP-family
  and Django adapters.
- **Exposed `ScoltaTracker`** — the debounced rebuild-on-content-change helper
  the `autoRebuild` / `autoRebuildDelay` config knobs configure, matching
  scolta-next. `touch(key)` records a change and schedules a single debounced
  rebuild that reuses the token cache (only changed pages re-tokenize);
  `createScoltaTracker(config)` wires the default `rebuild` to this package's
  `buildIndex` (`BuildIntent.fresh`, no force), overridable via an explicit
  `rebuild`. Wire `touch()` to your content events under server/SSR output;
  static `astro build` / serverless deploys rebuild via CI/webhook.
- **Dual-format packaging done right for an Astro integration.** `.`,
  `./core` and `./build` resolve their own types per condition (`.d.cts` for
  `require`), with `typesVersions` for node10-style subpath resolution — while
  the `routes/*` subpaths stay deliberately ESM-only: Astro resolves
  `injectRoute` entrypoints with `require.resolve`, and a CJS route build's
  default-import interop breaks against the ESM-only `scolta` (every endpoint
  404'd in the initial bring-up). The CJS entries that do exist carry tsup's
  `import.meta` shim — without it, `node dist/cli.cjs assets` could never run
  `main()` (the direct-invoke check compared an empty `import_meta` object's
  `url` against the argv URL). Artifact + child-process tests pin both; the
  end-to-end CJS run additionally needs the `scolta` binding >= 1.0.1 (its
  1.0.0 CJS entry crashes at require) and states that precondition.
- `bin` entry normalized (`dist/cli.js`, no `./` prefix) so the first publish
  avoids npm's "script name was cleaned" warning.
- **Pack-content regression guard (`npm run check:pack`).** A new
  `scripts/check-pack-content.mjs` runs `npm pack --dry-run --json` and asserts
  every packed path falls under the allowlist of prefixes *derived from this
  package's own `files` field* (`dist`, `ScoltaSearch.astro`, `README.md`,
  `CHANGELOG.md`, `LICENSE`, plus npm's always-included `package.json`) — never
  a hardcoded generic list. Anything outside fails the build with the leaked
  path printed and a pointer to the filter (package.json's `files`). It also
  caps the unpacked size at ~2x the measured good artifact (193,084 bytes →
  400,000-byte cap) to catch the bundled-fixture / stray-binary / 13 MB-zip
  class of mistake (cf. the scolta-wp 13 MB incident and WP.org dist-cruft
  flags). Wired into `.github/workflows/ci.yml` after the build step so dist/
  exists for the dry-run.
- **The release workflow runs the publish-surface guards before
  `npm publish` (`.github/workflows/release.yml`).** `check:publish` (publint +
  are-the-types-wrong) and `check:pack` (pack-content allowlist + size cap)
  gated only `ci.yml` on PRs, never the release workflow that actually
  publishes — so a tagged commit could ship a tarball the PR gate would have
  rejected. Both now run after `build`/`test` and before `npm publish`, gating
  the published tarball the same way CI gates PRs.
- **Verification:** widget-mount smoke test through Astro's container API
  (renders `<ScoltaSearch />`, executes the inline bootstrap under jsdom,
  asserts container + tags + `window.scolta`); `check:publish` (publint +
  `@arethetypeswrong/cli`) in the local and CI gates; type-checked eslint
  with `noImplicitOverride`.
- **CI and tag-triggered releases.** `.github/workflows/ci.yml` (PRs + main;
  Node 22 — the test gate's mount suite runs the astro devDep, which requires
  node >= 22.12) and `.github/workflows/release.yml` (`v*.*.*` tags publish to
  npm via OIDC Trusted Publishing once the package exists; the first publish
  is manual or token-based — trusted publishers can only be configured on
  existing packages).
