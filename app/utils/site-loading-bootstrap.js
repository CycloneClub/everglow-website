// Serialized into the HTML head. Keep this function self-contained: it runs
// before Nuxt's modules and owns a dialog outside the hydrated application.
export function startSiteLoading () {
  if (window.__everglowLoading) { return }
  const completed = new Set()
  const images = new Map()
  let expected = new Set()
  let elements
  let observer
  let documentParsed = false
  let appMounted = false
  let scenePainted = false
  let phase = 'loading' // loading → painting → complete → closed
  let previousOverflow
  let frame = 0
  let timer
  let resolveStylesReady
  let stylesActivated = false
  const stylesReady = new Promise((resolve) => { resolveStylesReady = resolve })
  const absolute = value => new URL(value, document.baseURI).href
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

  function block (event) { event.preventDefault(); event.stopPropagation() }

  function close () {
    if (phase === 'closed') { return }
    phase = 'closed'
    // A cancelled navigation still needs the page's styles to become usable;
    // do not leave media=print behind after removing the restoration listener.
    for (const link of document.head.querySelectorAll('link[data-site-loading-media]')) { activateStyle(link) }
    resolveStylesReady()
    clearTimeout(timer)
    cancelAnimationFrame(frame)
    observer?.disconnect()
    mutation.disconnect()
    document.removeEventListener('load', loaded, true)
    document.removeEventListener('error', loaded, true)
    if (previousOverflow !== undefined) { document.body.style.overflow = previousOverflow }
    elements?.root.close()
    elements?.root.remove()
  }

  function activateStyle (link) {
    link.setAttribute('media', link.getAttribute('data-site-loading-media'))
    link.removeAttribute('data-site-loading-media')
  }

  function checkStyles () {
    // The dialog is in the body, so its presence means the complete head has
    // been parsed. Do not resolve after an early cached link but before later
    // stylesheet tags have even been discovered by the parser.
    if (elements && document.head.querySelectorAll('link[data-site-loading-media]').length === 0) {
      stylesActivated = true
      resolveStylesReady()
    }
  }

  // Resource completion drives the readout; time only controls the exit fade.
  function publish () {
    if (phase === 'closed' || !elements) { return }
    const headDone = [...expected].filter(url => completed.has(url)).length
    const imageDone = [...images.values()].filter(Boolean).length
    // Fixed phase budgets prevent newly discovered page images from making
    // early head-resource progress jump backwards. No time-based advancement.
    let value = (expected.size ? headDone * 70 / expected.size : 70)
      + (documentParsed ? (images.size ? imageDone * 25 / images.size : 25) : 0)
      + (appMounted ? 3 + (scenePainted ? 2 : 0) : 0)
    value = phase === 'complete' ? 100 : Math.min(99, Math.floor(value * 10) / 10)
    elements.number.textContent = String(value).padStart(2, '0')
    elements.bar.setAttribute('aria-valuenow', String(value))
    elements.fill.style.transform = `scaleX(${value / 100})`
    if (phase === 'loading' && documentParsed && stylesActivated && appMounted && scenePainted && headDone === expected.size && imageDone === images.size) {
      finish()
    }
  }

  function finish () {
    phase = 'painting'
    // Let the mounted page paint before removing the overlay. The home scene
    // also reports its own first frame; neither signal fabricates progress.
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        if (phase === 'closed') { return }
        phase = 'complete'
        publish()
        timer = setTimeout(() => {
          elements.root.classList.add('is-leaving')
          timer = setTimeout(close, reduced() ? 0 : 300)
        }, reduced() ? 0 : 180)
      })
    })
  }

  function record (entries) {
    for (const entry of entries) {
      if (entry.responseEnd > 0) { completed.add(absolute(entry.name)) }
    }
    publish()
  }

  function connect () {
    if (elements || phase === 'closed') { return }
    const root = document.querySelector('#site-loading')
    if (!root) { return }
    const number = root.querySelector('[data-loading-number]')
    const bar = root.querySelector('[role="progressbar"]')
    const fill = root.querySelector('[data-loading-fill]')
    if (!number || !bar || !fill) { return }
    elements = { root, number, bar, fill }
    scenePainted = root.getAttribute('data-home-scene') !== 'true'
    expected = new Set(Array.from(document.head.querySelectorAll('script[src], link[rel="stylesheet"], link[rel="modulepreload"], link[rel="preload"]'))
      .map(element => element.src || element.href).filter(Boolean).map(absolute))
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    root.addEventListener('cancel', block)
    root.addEventListener('keydown', (event) => { if (event.key === 'Escape') { block(event) } })
    root.addEventListener('wheel', block, { passive: false })
    root.addEventListener('touchmove', block, { passive: false })
    root.close()
    root.showModal()
    root.focus({ preventScroll: true })
    mutation.disconnect()
    checkStyles()
    record(performance.getEntriesByType('resource'))
  }

  function trackImage (image, url) {
    if (!url) { return }
    const key = absolute(url)
    if (images.has(key)) { return }
    images.set(key, false)
    const settle = () => {
      if (phase === 'closed') { return }
      images.set(key, true)
      publish()
    }
    // decode() waits for both download and decoding, including cached images.
    image.decode().then(settle, settle)
  }

  function scanImages () {
    for (const image of document.querySelectorAll('#__nuxt img:not([loading="lazy"])')) {
      trackImage(image, image.currentSrc || image.src)
    }
    // News cards and the light-theme cover use inline CSS backgrounds.
    for (const element of document.querySelectorAll('#__nuxt [style*="background"]')) {
      for (const match of element.style.backgroundImage.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
        const url = absolute(match[1])
        if (images.has(url)) { continue }
        const image = new Image()
        image.src = url
        trackImage(image, url)
      }
    }
  }

  function loaded (event) {
    const link = event.target
    if (link?.hasAttribute?.('data-site-loading-media')) {
      activateStyle(link)
      checkStyles()
    }
    const url = event.target?.src || event.target?.href
    if (!url) { return }
    completed.add(absolute(url))
    publish()
  }

  const mutation = new MutationObserver(connect)
  mutation.observe(document.documentElement, { childList: true, subtree: true })
  document.addEventListener('load', loaded, true)
  document.addEventListener('error', loaded, true)
  if (typeof PerformanceObserver !== 'undefined') {
    observer = new PerformanceObserver(list => record(list.getEntries()))
    observer.observe({ type: 'resource', buffered: true })
  }
  window.__everglowLoading = {
    stylesReady,
    documentReady () {
      if (phase === 'closed') { return }
      connect()
      scanImages()
      documentParsed = true
      publish()
    },
    appReady () {
      if (phase === 'closed') { return }
      scanImages()
      appMounted = true
      publish()
    },
    sceneReady () {
      if (phase === 'closed') { return }
      scanImages()
      scenePainted = true
      publish()
    },
    cancel: close,
  }
  connect()
}
