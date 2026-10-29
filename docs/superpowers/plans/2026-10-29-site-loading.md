# Site loading: retained scope

## Five requirements

1. Show the loading screen on initial visits and refreshes of every route, including localized routes. Keep the existing indicator for SPA transitions.
2. Render independently of Vue as soon as HTML is available. Application styles must not block the loading screen's first paint.
3. Advance from actual resource completion, counting distinct images independently. Never advance based on elapsed time.
4. Track the current document's scripts, styles, preloads, eager images and inline image backgrounds. Exclude lazy images. The home route additionally waits for its scene's first frame.
5. Exit after resources settle, styles activate and the page mounts and paints. No skip button or timeout bypass.

Slow-network messages and startup-failure fallback are explicitly removed. Resource load/error listeners still settle bookkeeping; errors cannot substitute for app or scene readiness.

## Code responsibilities

- server/plugins/loading.ts injects the loader into every document, outside #__nuxt.
- server/utils/site-loading.ts owns minimal markup, inline presentation, localized accessibility labels and nonblocking stylesheet transformation. No-JavaScript stylesheet copies preserve ordinary page rendering.
- app/utils/site-loading-bootstrap.js owns early observation, URL deduplication, image decoding, stylesheet activation, the readout and exit cleanup. Its self-contained function is serialized into the head without application imports, so it can run before Vue downloads.
- app/plugins/site-loading.client.ts waits for CSS activation before mounting layout-sensitive components, reports app readiness and cancels the initial overlay when navigation supersedes it.
- Home components report one readiness event after the scene is usable. They do not maintain another progress counter.

The static background component is presentation-only. Welcome reports static-scene readiness after its DOM update; the global controller rescans and decodes that background. Canvas scenes still report their actual first frame. Image tracking uses decode promises directly, and a single phase plus one frame/timer handle controls completion and cancellation.

The budget is 70% declared head resources, 25% page images, 3% mounting and 2% scene readiness. These are phase weights, not byte percentages. Timers only control the completion fade.

## Cleanup and verification

- Removed the slow timer, status messages and their markup/styles/translations, failure state, global error/rejection listeners, Nuxt error hook and forced SSR fallback.
- Removed the unused scene progress callback and failure payload propagated through home components.
- Retained coverage for early observation, styles, routes, individual images, decoding, scene readiness and cleanup. Replaced obsolete fallback tests with checks that errors cannot impersonate readiness.
- Validation: all 77 Node tests and type checking pass; production build exits 0. Browser checks confirm early rendering with the entry and 29 styles held, normal completion after release, home first-frame readiness, English news and SPA navigation.
- Further simplification: 79 Node tests and type checking pass. Browser checks hold a dark-scene image and the light-theme background independently; neither allows premature entry, and releasing each completes normally. The light theme no longer needs component-level image loading.

## Scope boundary

An in-page loading screen requires HTML to arrive first. Server cold-start compilation is outside this controller's scope.

The accepted presentation uses only black and white, no title or artwork, and disables selection within the loading dialog. The temporary timed preview has been removed. The loader still holds completion for 180 ms and fades for 300 ms; initial page entry can therefore be later than the former unblocked page, even when network load time is similar. Further performance work is outside this change.
