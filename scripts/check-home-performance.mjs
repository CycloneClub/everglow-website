import assert from 'node:assert/strict'
import { readdir } from 'node:fs/promises'
import process from 'node:process'
import { chromium } from 'playwright-core'

const baseURL = process.env.PERFORMANCE_TEST_URL
if (!baseURL) { throw new Error('Set PERFORMANCE_TEST_URL to a production preview server.') }
const staticPaths = new Set((await readdir('.output/public', { recursive: true }))
  .map(path => `/${path.replaceAll('\\', '/')}`)
  .filter(path => /^\/_i18n\/[^/]+\/[^/]+\/messages\.json$/.test(path)))
assert.equal(staticPaths.size, 3, 'Build must prerender the three locale dictionaries')
const browser = await chromium.launch({ channel: process.env.PERFORMANCE_TEST_BROWSER || 'chrome', headless: true })
try {
  for (const path of ['/', '/zh-hk', '/en-us']) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
    const page = await context.newPage()
    const messages = []
    const errors = []
    page.on('response', (response) => {
      if (/\/_i18n\/.*\/messages\.json/.test(response.url())) { messages.push(response) }
    })
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(new URL(path, baseURL).href, { waitUntil: 'domcontentloaded' })
    await page.locator('#site-loading').waitFor({ state: 'detached', timeout: 30_000 })
    assert.ok(messages.length > 0, 'A cold visit must load the active static language file')
    for (const [locale, expectedPath] of [['en-us', '/en-us'], ['zh-hk', '/zh-hk'], ['zh-cn', '/'], ['en-us', '/en-us']]) {
      await page.locator('.setting-language .everglow-chooser').hover()
      await page.locator(`.setting-language a[hreflang="${locale}"]`).click()
      await page.waitForURL(url => url.pathname === expectedPath)
      await page.waitForFunction(code => document.documentElement.lang.toLowerCase() === code, locale)
      assert.ok((await page.title()).includes('Everglow') || (await page.title()).includes('流光'))
    }
    for (const response of messages) {
      assert.ok(staticPaths.has(new URL(response.url()).pathname), 'Every language request must resolve to a prerendered file')
      assert.equal(response.request().method(), 'GET')
      assert.equal(response.status(), 200)
      assert.match(response.headers()['cache-control'] || '', /public.*max-age=31536000.*immutable/)
    }
    const cached = await page.evaluate(() => performance.getEntriesByType('resource')
      .filter(entry => /\/_i18n\/.*\/messages\.json/.test(entry.name))
      .some(entry => entry.transferSize === 0 && entry.decodedBodySize > 0))
    assert.ok(cached, 'Revisiting a language should reuse the browser cache')
    assert.deepEqual(errors, [])
    console.debug(`PASS: ${path} direct visit, language switches and cached static messages`)
    await context.close()
  }
} finally { await browser.close() }
