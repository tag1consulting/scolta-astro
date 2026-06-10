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

The same `ScoltaTracker` debounce pattern as scolta-next (gated on
`autoRebuild`); serverless deployments should trigger rebuilds via webhook/CI.
