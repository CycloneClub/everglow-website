import assert from 'node:assert/strict'
import { runInNewContext } from 'node:vm'
import test from 'node:test'
import { startSiteLoading } from '../app/utils/site-loading-bootstrap.js'
import { deferPageStyles, renderSiteLoading } from '../server/utils/site-loading.ts'

function fixture ({ home = false, images = [], cached = [], backgrounds = [], rootInitiallyPresent = true, deferredStyle = false } = {}) {
  const number = { textContent: '00' }
  const bar = { value: '0', setAttribute: (_key, value) => { bar.value = value } }
  const fill = { style: {} }
  const root = {
    open: true, removed: false, classList: { add () {} },
    getAttribute: key => ({ 'data-home-scene': String(home) })[key],
    querySelector: selector => ({ '[data-loading-number]': number, '[role="progressbar"]': bar, '[data-loading-fill]': fill })[selector],
    close () { root.open = false }, showModal () { root.open = true }, focus () {},
    remove () { root.removed = true }, addEventListener () {}, removeEventListener () {},
  }
  const frames = []
  const timers = new Map()
  const events = new Map()
  const windowEvents = new Map()
  const resources = cached.map(path => ({ name: `http://test${path}`, responseEnd: 10 }))
  let resourceCallback
  let mutationCallback
  let rootPresent = rootInitiallyPresent
  let imageId = 0
  const image = (src) => {
    const handlers = new Map()
    let resolveDecode
    let rejectDecode
    let decoding
    const img = {
      src: `http://test${src}`, currentSrc: `http://test${src}`, complete: false, naturalWidth: 0, loading: 'eager', id: ++imageId,
      decode: () => decoding ??= new Promise((resolve, reject) => { resolveDecode = resolve; rejectDecode = reject }),
      addEventListener: (name, callback) => handlers.set(name, callback),
      removeEventListener: name => handlers.delete(name),
      loaded: () => { img.complete = true; img.naturalWidth = 100; handlers.get('load')?.() },
      decoded: () => resolveDecode(),
      failed: () => { img.complete = true; rejectDecode?.(new Error('image failed')); handlers.get('error')?.() },
    }
    return img
  }
  const pageImages = images.map(image)
  const backgroundImages = []
  const styleAttributes = new Map(deferredStyle ? [['media', 'print'], ['data-site-loading-media', 'screen']] : [])
  const stylesheet = {
    href: 'http://test/app.css', tagName: 'LINK',
    getAttribute: name => styleAttributes.get(name) ?? null,
    hasAttribute: name => styleAttributes.has(name),
    setAttribute: (name, value) => styleAttributes.set(name, value),
    removeAttribute: name => styleAttributes.delete(name),
  }
  const document = {
    baseURI: 'http://test/', documentElement: {}, body: { style: { overflow: 'auto' } },
    head: { querySelectorAll: selector => selector === 'link[data-site-loading-media]'
      ? (stylesheet.hasAttribute('data-site-loading-media') ? [stylesheet] : [])
      : [{ src: 'http://test/app.js' }, stylesheet] },
    querySelector: () => rootPresent ? root : null,
    querySelectorAll: selector => selector.includes('img') ? pageImages : backgrounds.map(url => ({ style: { backgroundImage: `url("${url}")` } })),
    addEventListener: (name, callback) => events.set(name, callback),
    removeEventListener: name => events.delete(name),
  }
  const window = {
    matchMedia: () => ({ matches: false }),
    addEventListener: (name, callback) => windowEvents.set(name, callback),
    removeEventListener: name => windowEvents.delete(name),
  }
  runInNewContext(`(${startSiteLoading.toString()})()`, {
    window, document, URL, Image: class { constructor () { const img = image('/placeholder'); backgroundImages.push(img); return img } },
    performance: { getEntriesByType: () => resources },
    PerformanceObserver: class { constructor (callback) { resourceCallback = callback } observe () {} disconnect () { resourceCallback = undefined } },
    MutationObserver: class { constructor (callback) { mutationCallback = callback } observe () {} disconnect () {} },
    requestAnimationFrame: (callback) => { frames.push(callback); return frames.length }, cancelAnimationFrame () {},
    setTimeout: (callback, delay) => { const id = timers.size + 1; timers.set(id, { callback, delay }); return id },
    clearTimeout: id => timers.delete(id),
  })
  const controller = window.__everglowLoading
  return {
    root, bar, images: pageImages, backgroundImages, controller, document, stylesheet,
    attach: () => { rootPresent = true; mutationCallback() },
    documentEvent: event => events.get(event.type)?.(event),
    windowEvent: event => windowEvents.get(event.type)?.(event),
    complete: (...paths) => resourceCallback?.({ getEntries: () => paths.map(path => ({ name: `http://test${path}`, responseEnd: 10 })) }),
    frame: () => { for (const callback of frames.splice(0)) { callback() } },
    timers: () => { for (const [id, timer] of [...timers]) { timers.delete(id); timer.callback() } },
  }
}

test('every route receives an independent localized dialog and early script', () => {
  for (const path of ['/', '/news', '/news/2026-06-30', '/docs/getting-started/introduction', '/about', '/en-us/news', '/zh-hk/about']) {
    const result = renderSiteLoading(path)
    assert.match(result.head, /startSiteLoading/)
    assert.match(result.bodyPrepend, /id="site-loading"/)
    assert.doesNotMatch(result.bodyPrepend, /__nuxt/)
    assert.match(result.bodyAppend, /documentReady/)
    assert.equal(result.bodyPrepend.includes('data-home-scene="true"'), path === '/')
  }
  assert.match(renderSiteLoading('/en-us/news').bodyPrepend, /Page loading progress/)
  assert.match(renderSiteLoading('/zh-hk/about').bodyPrepend, /頁面載入進度/)
  assert.match(renderSiteLoading('/en-us').bodyPrepend, /data-home-scene="true"/)
})

test('application styles cannot block the loading screen first paint and retain a no-JS fallback', () => {
  const original = '<link rel="stylesheet" href="/page.vue?type=style&amp;index=0" crossorigin integrity="hash">'
  const result = deferPageStyles(original)
  assert.match(result, /media="print"/)
  assert.match(result, /data-site-loading-media="all"/)
  assert.ok(result.includes(`<noscript>${original}</noscript>`))
  assert.match(result, /crossorigin integrity="hash"/)
  assert.match(deferPageStyles('<link rel="stylesheet" media="screen and (min-width: 30em)" href="/wide.css">'), /data-site-loading-media="screen and \(min-width: 30em\)"/)
})

test('stylesheet deferral does not rewrite preload links or tags inside scripts and noscript', () => {
  const original = '<link rel="preload" as="style" href="/a.css"><script>const s = `<link rel="stylesheet" href="/template.css">`</script><noscript><link rel="stylesheet" href="/fallback.css"></noscript>'
  assert.equal(deferPageStyles(original), original)
})

test('Vue readiness waits for deferred styles to be activated, while the dialog already exists', async () => {
  const p = fixture({ deferredStyle: true })
  assert.ok(p.controller.stylesReady, 'the readiness bridge needs a real stylesheet promise')
  let ready = false
  p.controller.stylesReady.then(() => { ready = true })
  p.complete('/app.js', '/app.css')
  await Promise.resolve()
  assert.equal(ready, false, 'download completion alone must not activate an unparsed stylesheet')
  assert.equal(p.stylesheet.getAttribute('media'), 'print')
  assert.equal(p.root.open, true)
  p.documentEvent({ type: 'load', target: p.stylesheet })
  await p.controller.stylesReady
  assert.equal(p.stylesheet.getAttribute('media'), 'screen')
  assert.equal(p.stylesheet.hasAttribute('data-site-loading-media'), false)
})

test('a stylesheet error settles the CSS gate without bypassing application readiness', async () => {
  const p = fixture({ deferredStyle: true, cached: ['/app.js'] })
  p.controller.documentReady()
  p.documentEvent({ type: 'error', target: p.stylesheet })
  await p.controller.stylesReady
  p.frame(); p.frame()
  assert.ok(Number(p.bar.value) < 100)
  assert.equal(p.root.removed, false)
  p.controller.appReady()
  p.frame(); p.frame()
  assert.equal(Number(p.bar.value), 100)
})

test('cancelling during a stylesheet download restores its original media before detaching listeners', async () => {
  const p = fixture({ deferredStyle: true })
  p.controller.cancel()
  await p.controller.stylesReady
  assert.equal(p.stylesheet.getAttribute('media'), 'screen')
  assert.equal(p.stylesheet.hasAttribute('data-site-loading-media'), false)
  assert.equal(p.root.removed, true)
})

test('completion waits for stylesheet activation, not just its network timing entry', () => {
  const p = fixture({ deferredStyle: true, cached: ['/app.js', '/app.css'] })
  p.controller.documentReady()
  p.controller.appReady()
  p.frame(); p.frame(); p.timers(); p.timers()
  assert.equal(p.root.removed, false)
  p.documentEvent({ type: 'load', target: p.stylesheet })
  p.frame(); p.frame(); p.timers(); p.timers()
  assert.equal(p.root.removed, true)
  assert.equal(p.stylesheet.getAttribute('media'), 'screen')
})

test('resource progress advances before Vue starts without a hydration handoff', () => {
  const p = fixture()
  p.complete('/app.css')
  assert.ok(Number(p.bar.value) > 0 && Number(p.bar.value) < 100)
  const before = p.bar.value
  p.complete('/app.css')
  assert.equal(p.bar.value, before)
  p.timers()
  assert.equal(p.bar.value, before)
  assert.equal(p.root.removed, false)
})

test('a generic page waits for its own images to load and decode, never for home assets', async () => {
  const p = fixture({ images: ['/article-a.png', '/article-b.png'] })
  p.controller.documentReady()
  p.complete('/app.js', '/app.css')
  p.controller.appReady()
  const before = Number(p.bar.value)
  p.images[0].loaded()
  assert.equal(Number(p.bar.value), before)
  p.images[0].decoded()
  await Promise.resolve(); await Promise.resolve()
  assert.ok(Number(p.bar.value) > before)
  assert.equal(p.root.removed, false)
  p.images[1].loaded(); p.images[1].decoded()
  await Promise.resolve(); await Promise.resolve()
  p.frame(); p.frame()
  assert.equal(Number(p.bar.value), 100)
  p.timers(); p.timers()
  assert.equal(p.root.removed, true)
  assert.equal(p.document.body.style.overflow, 'auto')
})

test('home waits for the explicit first-frame signal after the app mounts', () => {
  const p = fixture({ home: true, cached: ['/app.js', '/app.css'] })
  p.controller.documentReady()
  p.controller.appReady()
  p.frame(); p.frame()
  assert.ok(Number(p.bar.value) < 100)
  assert.equal(p.root.removed, false)
  p.controller.sceneReady()
  p.frame(); p.frame()
  assert.equal(Number(p.bar.value), 100)
})

test('an image error settles only that resource and still waits for application readiness', async () => {
  const p = fixture({ images: ['/broken.png'], cached: ['/app.js', '/app.css'] })
  p.controller.documentReady()
  p.images[0].failed()
  await Promise.resolve()
  p.frame(); p.frame()
  assert.ok(Number(p.bar.value) < 100)
  assert.equal(p.root.removed, false)
  p.controller.appReady()
  p.frame(); p.frame()
  assert.equal(Number(p.bar.value), 100)
  p.timers(); p.timers()
  assert.equal(p.root.removed, true)
})

test('cancellation cleans up the standalone layer and restores scroll', () => {
  const p = fixture()
  p.controller.cancel()
  assert.equal(p.root.removed, true)
  assert.equal(p.document.body.style.overflow, 'auto')
  const previous = p.bar.value
  p.complete('/app.css')
  assert.equal(p.bar.value, previous)
})

test('downloads before the dialog is parsed are retained and displayed on attachment', () => {
  const p = fixture({ rootInitiallyPresent: false })
  p.complete('/app.css')
  assert.equal(Number(p.bar.value), 0)
  p.attach()
  assert.ok(Number(p.bar.value) > 0)
})

test('each current-page image completes independently, without duplicate counting', async () => {
  const p = fixture({ images: Array.from({ length: 8 }, (_, i) => `/image-${i}.png`), cached: ['/app.css'] })
  p.controller.documentReady()
  let previous = Number(p.bar.value)
  for (const image of p.images) {
    image.loaded(); image.decoded()
    await Promise.resolve(); await Promise.resolve()
    const next = Number(p.bar.value)
    assert.ok(next > previous)
    image.loaded()
    await Promise.resolve(); await Promise.resolve()
    assert.equal(Number(p.bar.value), next)
    previous = next
  }
})

test('inline page backgrounds are decoded and counted once', async () => {
  const p = fixture({ backgrounds: ['/news.jpg', '/news.jpg'], cached: ['/app.js', '/app.css'] })
  p.controller.documentReady(); p.controller.appReady()
  assert.equal(p.backgroundImages.length, 1)
  assert.ok(Number(p.bar.value) < 100)
  p.backgroundImages[0].loaded(); p.backgroundImages[0].decoded()
  await Promise.resolve(); await Promise.resolve()
  p.frame(); p.frame()
  assert.equal(Number(p.bar.value), 100)
})

test('a light-theme background introduced after mounting is tracked before the scene becomes ready', async () => {
  const backgrounds = []
  const p = fixture({ home: true, backgrounds, cached: ['/app.js', '/app.css'] })
  p.controller.documentReady(); p.controller.appReady()
  backgrounds.push('/light-sky.jpg')
  p.controller.sceneReady()
  p.frame(); p.frame()
  assert.equal(p.backgroundImages.length, 1)
  assert.ok(Number(p.bar.value) < 100)
  p.backgroundImages[0].loaded(); p.backgroundImages[0].decoded()
  await Promise.resolve(); await Promise.resolve()
  p.frame(); p.frame()
  assert.equal(Number(p.bar.value), 100)
})

test('cancelling during image decode prevents late progress and completion', async () => {
  const p = fixture({ images: ['/pending.png'], cached: ['/app.js', '/app.css'] })
  p.controller.documentReady(); p.controller.appReady()
  p.images[0].loaded()
  p.controller.cancel()
  const progress = p.bar.value
  p.images[0].decoded()
  await Promise.resolve(); await Promise.resolve()
  p.frame(); p.frame(); p.timers(); p.timers()
  assert.equal(p.bar.value, progress)
  assert.equal(p.root.removed, true)
  assert.equal(p.document.body.style.overflow, 'auto')
})

test('a failed module request cannot impersonate app or home scene readiness', () => {
  const p = fixture({ home: true, cached: ['/app.css'] })
  p.controller.documentReady()
  p.documentEvent({ type: 'error', target: { tagName: 'SCRIPT', type: 'module', src: 'http://test/app.js' } })
  p.frame(); p.frame()
  p.timers(); p.timers()
  assert.equal(p.root.removed, false)
  assert.ok(Number(p.bar.value) < 100)
})

for (const type of ['error', 'unhandledrejection']) {
  test(`an unrelated early ${type} cannot complete loading`, () => {
    const p = fixture({ home: true, cached: ['/app.js', '/app.css'] })
    p.controller.documentReady()
    p.windowEvent({ type, error: new Error('startup'), reason: new Error('startup') })
    p.frame(); p.frame()
    p.timers(); p.timers()
    assert.equal(p.root.removed, false)
    assert.ok(Number(p.bar.value) < 100)
  })
}
