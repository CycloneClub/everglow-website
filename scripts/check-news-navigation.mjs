import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import process from 'node:process'

const { chromium } = createRequire(import.meta.url)('playwright-core')
// Run against a local dev/preview server, e.g. NEWS_TEST_URL=http://localhost:3001.
const baseURL = process.env.NEWS_TEST_URL
if (!baseURL) {
  throw new Error('Set NEWS_TEST_URL to the local dev/preview server URL.')
}

async function main () {
  const browser = await chromium.launch({ channel: process.env.NEWS_TEST_BROWSER || 'chrome', headless: true })
  try {
    for (const selector of ['.news-item-header a', '.news-item-img', '.news-item-footer .btn']) {
      const page = await browser.newPage()
      try {
        const errors = []
        page.on('pageerror', error => errors.push(error.message))
        await page.goto(`${baseURL}/news`, { waitUntil: 'domcontentloaded' })
        await page.waitForFunction(() => document.querySelector('#__nuxt')?.__vue_app__?.config.globalProperties.$nuxt?.isHydrating === false)
        const entry = page.locator(selector).first()
        const target = await entry.evaluate(element => element.closest('.news-item').querySelector('.news-item-header a').getAttribute('href'))

        // Hold the real navigation pending so a cancelled duplicate cannot hide
        // behind a fast cached page. Keep the router and loading hooks intact.
        await page.evaluate((target) => {
          const app = document.querySelector('#__nuxt').__vue_app__.config.globalProperties.$nuxt
          window.removeNewsNavigationGuard = app.$router.beforeResolve(to => to.path === target
            ? new Promise((resolve) => { window.releaseNewsNavigation = resolve })
            : undefined)
        }, target)
        await entry.click()
        await page.waitForFunction(() => typeof window.releaseNewsNavigation === 'function')
        try {
          await page.waitForFunction(() => getComputedStyle(document.querySelector('.navigation-progress')).opacity === '1', null, { timeout: 2000 })
        } catch {
          assert.fail(`${selector}: progress must remain visible while the article navigation is pending`)
        }

        await page.evaluate(() => {
          window.releaseNewsNavigation()
          window.removeNewsNavigationGuard()
        })
        await page.waitForURL(url => url.pathname === target)
        await page.locator('.article-body').waitFor()
        await page.waitForFunction(() => getComputedStyle(document.querySelector('.navigation-progress')).opacity === '0')
        assert.deepEqual(errors, [])
        console.debug(`PASS: ${selector} shows progress until the article is ready`)
      } finally {
        await page.close()
      }
    }
  } finally {
    await browser.close()
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
