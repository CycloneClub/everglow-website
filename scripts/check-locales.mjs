import assert from 'node:assert/strict'
import process from 'node:process'
import { chromium } from 'playwright-core'

const baseURL = process.env.LOCALE_TEST_URL
if (!baseURL) { throw new Error('Set LOCALE_TEST_URL to a local dev/preview server URL.') }

const browser = await chromium.launch({ channel: process.env.LOCALE_TEST_BROWSER || 'chrome', headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 1365, height: 900 }, reducedMotion: 'reduce' })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  const hydrated = () => page.waitForFunction(() => document.querySelector('#__nuxt')?.__vue_app__?.config.globalProperties.$nuxt?.isHydrating === false)
  const switchToKorean = async () => {
    await page.locator('.everglow-chooser').hover()
    await page.locator('.options-content span').filter({ hasText: '한국어' }).click()
  }

  await page.goto(`${baseURL}/ja-jp/about`)
  await hydrated()
  await switchToKorean()
  await page.waitForURL('**/ko-kr/about')
  await page.getByRole('heading', { name: /행동 강령/ }).waitFor()

  await page.goto(`${baseURL}/ko-kr/news`)
  await hydrated()
  await page.locator('.news-item .btn').first().click()
  await page.waitForURL(/\/ko-kr\/news\/.+/)
  await page.locator('.article-body .markdown').waitFor()
  assert.equal(await page.locator('.content-fallback').count(), 0)

  await page.goto(`${baseURL}/ja-jp/docs/getting-started/installation`)
  await hydrated()
  await page.locator('.article-body .markdown').waitFor()
  assert.ok(await page.locator('.article-body a[href="https://steamcommunity.com/sharedfiles/filedetails/?id=2906178094"]').count())
  assert.equal(await page.locator('.content-fallback').count(), 0)
  const links = await page.locator('.aside a').evaluateAll(elements => elements.map(element => element.getAttribute('href')))
  assert.ok(links.length > 0)
  assert.ok(links.every(href => href.startsWith('/ja-jp/')))

  await page.goto(`${baseURL}/ja-jp`)
  await hydrated()
  await switchToKorean()
  await page.waitForURL('**/ko-kr')
  await page.waitForFunction(() => document.documentElement.lang.toLowerCase() === 'ko-kr' && document.body.textContent.includes('한 그루의 나무'))
  const cards = await page.locator('.home-news__card[href]').evaluateAll(elements => elements.map(element => element.getAttribute('href')))
  assert.equal(cards.length, 3)
  assert.ok(cards.every(href => href.startsWith('/ko-kr/news/')))

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(`${baseURL}/ko-kr/about`)
  await hydrated()
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
  await page.getByRole('button', { name: '메뉴 열기', exact: true }).click()
  await page.locator('#header-menu .main-menu').waitFor()
  assert.deepEqual(errors, [])
  console.debug('PASS: Japanese/Korean language switching, independent article pages, docs navigation, homepage copy and mobile layout')
} finally {
  await browser.close()
}
