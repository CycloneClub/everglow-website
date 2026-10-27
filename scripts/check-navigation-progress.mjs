import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import process from 'node:process'

const { chromium } = createRequire(import.meta.url)('playwright-core')
const baseURL = process.env.NEWS_TEST_URL
if (!baseURL) {
  throw new Error('Set NEWS_TEST_URL to the local dev/preview server URL.')
}

function staysVisible (page) {
  return page.evaluate(() => new Promise((resolve) => {
    const started = performance.now()
    function sample () {
      const bar = getComputedStyle(document.querySelector('.navigation-progress'))
      const butterfly = getComputedStyle(document.querySelector('.navigation-butterfly'))
      if (bar.opacity !== '1' || butterfly.opacity !== '1') { resolve(false); return }
      if (performance.now() - started >= 900) { resolve(true); return }
      requestAnimationFrame(sample)
    }
    sample()
  }))
}

async function checkPendingContent (browser) {
  const page = await browser.newPage()
  let releaseContent
  const contentGate = new Promise((resolve) => { releaseContent = resolve })
  try {
    await page.goto(`${baseURL}/news`, { waitUntil: 'domcontentloaded' })
    await page.waitForFunction(() => document.querySelector('#__nuxt')?.__vue_app__?.config.globalProperties.$nuxt?.isHydrating === false)
    await page.route('**/__nuxt_content/**/sql_dump.txt**', async (request) => {
      await contentGate
      await request.continue()
    })
    const article = await page.locator('.news-item-header a').first().getAttribute('href')
    await page.locator('.news-item-header a').first().click()
    await page.waitForURL(url => url.pathname === article)
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.navigation-progress')).opacity === '1')
    assert.equal(await page.locator('.article-body').count(), 0, 'Article content should still be pending after URL commit')
    await page.locator('.news-item-header a').first().click()
    assert.equal(await staysVisible(page), true, 'Repeating the committed URL must keep progress visible until its content resolves')
    releaseContent()
    await page.locator('.article-body').waitFor()
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.navigation-progress')).opacity === '0')
    console.debug('PASS: repeated click after URL commit waits for async article content')
  } finally {
    releaseContent()
    await page.unrouteAll({ behavior: 'wait' })
    await page.close()
  }
}

async function main () {
  const browser = await chromium.launch({ channel: process.env.NEWS_TEST_BROWSER || 'chrome', headless: true })
  try {
    const page = await browser.newPage()
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(`${baseURL}/news`, { waitUntil: 'domcontentloaded' })
    await page.waitForFunction(() => document.querySelector('#__nuxt')?.__vue_app__?.config.globalProperties.$nuxt?.isHydrating === false)
    const article = await page.locator('.news-item-header a').first().getAttribute('href')
    await page.evaluate(() => {
      const app = document.querySelector('#__nuxt').__vue_app__.config.globalProperties.$nuxt
      window.pendingNavigations = {}
      window.finishedNavigations = []
      window.removeProgressGuard = app.$router.beforeResolve(to => new Promise((resolve) => { window.pendingNavigations[to.path] = resolve }))
      app.$router.afterEach((to, _from, failure) => window.finishedNavigations.push({ path: to.path, failure: failure?.type }))
    })

    await page.locator('.news-item-header a').first().click()
    await page.waitForFunction(article => !!window.pendingNavigations[article], article)
    await page.locator('header a[href="/about"]').click()
    await page.waitForFunction(() => !!window.pendingNavigations['/about'])
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.navigation-progress')).opacity === '1')
    await page.evaluate(article => window.pendingNavigations[article](), article)
    await page.waitForFunction(article => window.finishedNavigations.some(entry => entry.path === article && entry.failure), article)

    // Observe beyond the fade interval: an obsolete cancellation must never
    // hide the indicator while the most recent navigation is still blocked.
    assert.equal(await staysVisible(page), true, 'Cancelling the old article navigation must not hide progress for the pending About page')

    await page.evaluate(() => {
      window.pendingNavigations['/about']()
      window.removeProgressGuard()
    })
    await page.waitForURL('**/about')
    await page.locator('.about .article').waitFor()
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.navigation-progress')).opacity === '0')
    await page.goBack()
    await page.waitForURL('**/news')
    await page.locator('.news-item').first().waitFor()
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.navigation-progress')).opacity === '0')

    // Identical destinations still represent different navigation attempts.
    // The latest attempt must be able to either abort or complete normally.
    for (const acceptLatest of [false, true]) {
      await page.evaluate(() => {
        const app = document.querySelector('#__nuxt').__vue_app__.config.globalProperties.$nuxt
        window.repeatedNavigations = []
        window.finishedNavigations = []
        window.removeProgressGuard = app.$router.beforeResolve(() => new Promise((resolve) => { window.repeatedNavigations.push(resolve) }))
      })
      await page.locator('.news-item-header a').first().click()
      await page.waitForFunction(() => window.repeatedNavigations.length === 1)
      await page.locator('.news-item-header a').first().click()
      await page.waitForFunction(() => window.repeatedNavigations.length === 2)
      await page.waitForFunction(() => getComputedStyle(document.querySelector('.navigation-progress')).opacity === '1')
      await page.evaluate(() => window.repeatedNavigations[0]())
      await page.waitForFunction(() => window.finishedNavigations.some(entry => entry.failure))
      assert.equal(await staysVisible(page), true, 'An older attempt to the same URL must not finish the newer attempt')
      await page.evaluate((accept) => {
        window.repeatedNavigations[1](accept ? undefined : false)
        window.removeProgressGuard()
      }, acceptLatest)
      await page.waitForURL(url => url.pathname === (acceptLatest ? article : '/news'))
      await page.waitForFunction(() => getComputedStyle(document.querySelector('.navigation-progress')).opacity === '0')
      if (acceptLatest) { await page.locator('.article-body').waitFor() }
    }
    assert.deepEqual(errors, [])
    console.debug('PASS: obsolete cancellation, repeated same-URL clicks, latest cancellation/completion and cached Back navigation')
    await checkPendingContent(browser)
  } finally {
    await browser.close()
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
