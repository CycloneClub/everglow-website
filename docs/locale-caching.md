# Static locale delivery and Cloudflare configuration

## Static locale messages

Nuxt I18n's official `experimental.prerenderMessages: true` option emits the
three dictionaries into `.output/public/_i18n/<hash>/<locale>/messages.json`.
Deploy all of `.output/`, including these files. No dependency patches or runtime
overrides are needed. A translation change generates a new hashed URL.

The browser still requests the active locale before mounting and when switching
languages. These are static GET requests, with
`Cache-Control: public, max-age=31536000, immutable`. A warm browser can reuse the
file; a CDN hit avoids contacting the origin. A cold CDN miss can still fetch the
static file from the origin. Prerendering alone does not move the request earlier.

Configure a Cloudflare Cache Rule for `/_i18n/*` to make these public language
files eligible for caching and respect their origin cache headers. Language
files do not vary by theme cookie. Check the actual message URL from browser DevTools twice and confirm
`CF-Cache-Status: HIT` and `Age`. Merely enabling the Cloudflare proxy is not enough.
Keep previous hashed files while cached HTML or open browser tabs may still refer
to them; the current deployment uses `rsync --delete`, so deployment retention
must be handled before relying on old hashed URLs surviving a release.

No Cloudflare account configuration or production deployment is performed by
this branch.

## Verification

- Run `pnpm build`, then `node scripts/smoke-test.mjs` for SSR/cache headers and
  three static language files whose served content matches the source dictionaries.
- Start a production preview and run
  `PERFORMANCE_TEST_URL=http://localhost:3000 node scripts/check-home-performance.mjs`
  with Chrome installed. It checks direct visits, language switching,
  static language delivery, and browser cache reuse when revisiting a language.
- Compare compressed HTML size, TTFB, response-end and overlay removal under the
  same network/CPU settings.
