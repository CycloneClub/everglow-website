import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'
import process from 'node:process'

const baseURL = process.env.NEWS_TEST_URL
if (!baseURL) { throw new Error('Set NEWS_TEST_URL to the local dev/preview server URL.') }

const browser = await chromium.launch({ channel: process.env.NEWS_TEST_BROWSER || 'chrome', headless: true })
try {
  for (const width of [1280, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 800 } })
    await page.goto(`${baseURL}/news`, { waitUntil: 'domcontentloaded' })
    await page.waitForFunction(() => document.querySelector('#__nuxt')?.__vue_app__?.config.globalProperties.$nuxt?.isHydrating === false)
    for (const hold of [180, 1200]) {
      // Hold a real navigation, then cancel it to isolate the completion
      // animation from page fetching and rendering time.
      const samples = await page.evaluate(async (hold) => {
        const app = document.querySelector('#__nuxt').__vue_app__.config.globalProperties.$nuxt
        let release
        const removeGuard = app.$router.beforeResolve(() => new Promise((resolve) => { release = resolve }))
        const navigation = app.$router.push('/about')
        while (!release) { await new Promise(requestAnimationFrame) }
        await new Promise(resolve => setTimeout(resolve, hold))
        const samples = []
        const started = performance.now()
        const sample = () => {
          const bar = document.querySelector('.navigation-progress')
          const butterfly = document.querySelector('.navigation-butterfly')
          const sprite = document.querySelector('.navigation-butterfly-sprite').getBoundingClientRect()
          samples.push({
            time: performance.now() - started,
            tip: bar.getBoundingClientRect().right,
            center: sprite.x + sprite.width / 2,
            left: sprite.left,
            loading: butterfly.classList.contains('is-loading'),
          })
        }
        sample()
        release(false)
        await navigation
        removeGuard()
        while (performance.now() - started < 1300) {
          await new Promise(requestAnimationFrame)
          sample()
        }
        return samples
      }, hold)
      const visible = samples.filter(sample => sample.loading)
      assert.ok(visible.at(-1).left > width, `Butterfly must fully leave the ${width}px viewport before hiding`)
      assert.ok(visible.every(sample => Math.abs(sample.center - sample.tip) < 2), 'Butterfly must stay at the bar tip throughout motion')
      const start = visible[0].center
      const end = visible.at(-1).center
      const middle = visible.filter(sample => sample.center > start + (end - start) * 0.1 && sample.center < start + (end - start) * 0.9)
      assert.ok(middle.length >= 6 && middle.at(-1).time - middle[0].time >= 120, 'Completion must visibly travel through intermediate positions instead of flashing across')
      assert.ok(visible.every((sample, index) => index === 0 || sample.center >= visible[index - 1].center - 1), 'Completion must not move backwards')
      console.debug(`PASS: ${width}px viewport, ${hold}ms navigation: synchronized, smooth, fully offscreen`)
      await page.waitForFunction(() => getComputedStyle(document.querySelector('.navigation-progress')).opacity === '0')
    }
    const restarted = await page.evaluate(async () => {
      const app = document.querySelector('#__nuxt').__vue_app__.config.globalProperties.$nuxt
      let release
      const removeGuard = app.$router.beforeResolve(() => new Promise((resolve) => { release = resolve }))
      const navigation = app.$router.push('/about')
      while (!release) { await new Promise(requestAnimationFrame) }
      await new Promise(resolve => setTimeout(resolve, 180))
      release(false)
      await navigation
      while (document.querySelector('.navigation-butterfly-sprite').getBoundingClientRect().left <= innerWidth) {
        await new Promise(requestAnimationFrame)
      }
      // Start again during the completion hold, while the indicator is still
      // marked loading but has already flown out of view.
      release = undefined
      const nextNavigation = app.$router.push('/about')
      while (!release) { await new Promise(requestAnimationFrame) }
      await new Promise(resolve => setTimeout(resolve, 180))
      const sprite = document.querySelector('.navigation-butterfly-sprite').getBoundingClientRect()
      const result = sprite.right > 0 && sprite.left < innerWidth
      release(false)
      await nextNavigation
      removeGuard()
      return result
    })
    assert.ok(restarted, 'A new navigation after fly-out must bring the butterfly back into view')
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.navigation-progress')).opacity === '0')
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.evaluate(async () => {
      const app = document.querySelector('#__nuxt').__vue_app__.config.globalProperties.$nuxt
      const removeGuard = app.$router.beforeResolve(() => new Promise(resolve => setTimeout(() => resolve(false), 180)))
      await app.$router.push('/about')
      removeGuard()
    })
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.navigation-progress')).opacity === '0')
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'Fly-out must not introduce horizontal scrolling')
    console.debug(`PASS: ${width}px viewport: restart after fly-out and reduced motion`)
    await page.close()
  }
} finally {
  await browser.close()
}
