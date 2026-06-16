# scolta-astro

Scolta integration for **Astro** — AI-powered [Pagefind](https://pagefind.app)
search, on top of the shared [`scolta`](../scolta-node) binding. It is a
deliberate minimal sibling of [`scolta-next`](../scolta-next) and
[`scolta-nuxt`](../scolta-nuxt): it reuses the same binding, the same WASM
scoring core, and `scolta.js` (vanilla JS, also used by Drupal/WordPress), so
the only Astro-specific work is the injected API routes, an `.astro` mount
component, and the output dir. **No bundled CMS module** — CMSs are reached
through the generic content-source interface or the JSON:API example in
scolta-next.

## Install

```js
// astro.config.mjs
import { defineConfig } from "astro/config";
import scoltaAstro from "scolta-astro";

export default defineConfig({
  integrations: [scoltaAstro({ site_name: "My Site", results_per_page: 12 })],
});
```

The integration injects the AI routes at the exact paths `scolta.js` defaults
to (`/api/scolta/v1/{expand-query,summarize,followup,health}`). They are
request-time server routes (POST + a health probe), so live AI needs server
output (`output: "server"` + an adapter such as `@astrojs/node`) — a fully
static site has the same caveat as scolta-next/scolta-nuxt: host the AI
endpoint externally or run server mode.

> **Node version:** Astro 6 requires Node `>=22.12`; Astro 4/5 on Node 20 is
> fine. This package declares `engines.node >=20` so Astro 4/5 users aren't
> blocked — but npm checks the package's *own* engines, not the peer's, so an
> Astro-6-on-Node-20 install hits Astro's own engine refusal rather than a
> pointer from here.

## Component

Astro has no global component registration; import the search component where
you mount it (typically a shared layout):

```astro
---
import ScoltaSearch from "scolta-astro/ScoltaSearch.astro";
---
<ScoltaSearch config={browserConfig} assetsPath="/scolta" pagefindPath="/pagefind/pagefind.js" />
```

It renders the mount container, sets `window.scolta` (including the `container`
and `wasmPath` keys scolta.js requires), and loads the stylesheet + widget
module from the vendored assets — no client framework needed.

## Configuration

Route handlers resolve config per request, lowest to highest precedence:

1. `scolta.config.mjs` / `scolta.config.js` at the project root (also what the
   `scolta-build` CLI reads),
2. the options object passed to `scoltaAstro()` (serialized into the server
   bundle via a virtual module),
3. the `SCOLTA_API_KEY` / `SCOLTA_AI_PROVIDER` / `SCOLTA_AI_MODEL` /
   `SCOLTA_AI_BASE_URL` environment variables.

## Health endpoint

`GET /api/scolta/v1/health` returns `{"status": "ok"|"degraded"}` — enough for
uptime monitors. The full diagnostic payload (provider, index state, scoring
config) is exposed only with `healthDetail: true` in the integration options
(or `scolta.config.mjs`). There is no user model in a headless stack, so
detail is config-gated rather than auth-gated; enable it only where the
endpoint is not publicly reachable.

## Content modes

- **`static-export`** (default) — after a static `astro build`,
  `npx scolta-build` crawls the rendered HTML in `dist/` and writes the index.
- **`content`** — register a content source (async iterable of `ContentItem`s +
  `changed-since` check). The JSON:API / decoupled-Drupal worked example lives
  in scolta-next and applies here unchanged (it is CMS-side, not framework-side).

## CLI

```sh
npx scolta-build            # fresh build after astro build
npx scolta-build --force | --resume | --restart
npx scolta-build assets     # copy runtime assets into the output dir
```

## Auto-rebuild

`ScoltaTracker` is the debounced rebuild helper the `autoRebuild` /
`autoRebuildDelay` config knobs configure — exported from `scolta-astro`, the
same helper [`scolta-next`](../scolta-next) ships. Wire `touch(key)` to your
content-change events and it schedules a single debounced rebuild that reuses
the token cache, so only changed pages re-tokenize:

```ts
import { createScoltaTracker, AstroScoltaConfig } from "scolta-astro";

const config = AstroScoltaConfig.fromEnv({ autoRebuild: true, source: "content" });
const tracker = createScoltaTracker(config, { source: mySource });

// from a CMS save / content webhook handler:
tracker.touch(`articles:${id}`);
```

`createScoltaTracker(config)` defaults `rebuild` to this package's `buildIndex`
(`BuildIntent.fresh`, no force); pass your own `rebuild` to override it. The
in-process debounce needs a long-running process — it works under server/SSR
output (`output: "server"`), but a fully static `astro build` or a serverless
deploy has no shared in-process timer, so trigger rebuilds via webhook/CI there.
scolta-next's Payload `afterChange`/`afterDelete` hooks are a reference wiring.
