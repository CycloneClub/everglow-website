import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import process from 'node:process'
const { chromium } = createRequire(import.meta.url)('playwright-core')
// Run against a dev/preview server with MENU_TEST_URL set.
// MENU_TEST_BROWSER selects an installed browser channel (default: chrome).
// MENU_TEST_REDUCED_MOTION=1 also exercises the no-animation path.
const baseURL = process.env.MENU_TEST_URL
if (!baseURL) throw new Error('Set MENU_TEST_URL to the local dev/preview server URL.')
;(async () => {
  const browser = await chromium.launch({ channel: process.env.MENU_TEST_BROWSER || 'chrome', headless: true })
  try {
    const reducedMotion = process.env.MENU_TEST_REDUCED_MOTION === '1'
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      reducedMotion: reducedMotion ? 'reduce' : 'no-preference',
    })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(`${baseURL}/about`)
    await page.waitForLoadState('networkidle')
    await page.waitForFunction(() => document.querySelector('#__nuxt')?.__vue_app__?.config.globalProperties.$nuxt?.isHydrating === false)
    const menu = page.locator('#header-menu')
    const toggle = page.locator('.main-menu-trigger button')
    const docs = page.locator('.docs-trigger')
    const back = page.locator('.return-btn')
    const state = async expected => {
      await page.waitForFunction(expected => document.querySelector('#header-menu')?.dataset.state === expected, expected)
      await page.waitForFunction(() => !document.querySelector('#header-menu [class*="-enter-active"], #header-menu [class*="-leave-active"]'))
    }
    await state('closed')
    assert.equal(await menu.isVisible(), false)
    await page.evaluate(() => { document.body.style.overflow = 'clip' })
    await toggle.tap()
    await state('main')
    await page.waitForFunction(() => document.activeElement?.matches('.main-menu a'))
    await page.keyboard.press('Shift+Tab')
    assert.equal(await page.locator('header').evaluate(e => e.contains(document.activeElement)), true)
    await toggle.focus()
    await page.keyboard.press('Tab')
    assert.equal(await page.locator('header').evaluate(e => e.contains(document.activeElement)), true)
    await docs.tap()
    await state('docs')
    await back.waitFor()
    if (reducedMotion) {
      assert.equal(await menu.evaluate(element => getComputedStyle(element).transitionDuration), '0s')
    }
    await page.waitForFunction(() => document.activeElement?.matches('.return-btn'))
    assert.equal(await page.locator('.main-menu').isVisible(), false)
    assert.equal(await back.evaluate(e => e === document.activeElement), true)
    const group = page.locator('#header-docs-menu button.title').first()
    await group.tap()
    await state('docs')
    await group.tap()
    await page.waitForFunction(() => getComputedStyle(document.querySelector('#header-menu')).opacity === '1')
    await back.tap()
    await state('main')
    await page.waitForFunction(() => document.activeElement?.matches('.docs-trigger'))
    assert.equal(await docs.evaluate(e => e === document.activeElement), true)
    if (!reducedMotion) {
      // Hold the outgoing panel long enough to exercise keyboard input mid-transition.
      const slowTransition = await page.addStyleTag({ content: '#header-menu .menu-forward-leave-active { transition-duration: 1s !important; }' })
      await docs.press('Enter')
      await page.locator('#header-menu [inert]').waitFor()
      assert.equal(await toggle.evaluate(e => e === document.activeElement), true)
      await page.keyboard.press('Escape')
      await state('closed')
      await slowTransition.evaluate(element => element.remove())
      await toggle.tap()
      await state('main')
    }
    await docs.tap()
    await toggle.tap()
    await state('closed')
    assert.equal(await page.evaluate(() => document.body.style.overflow), 'clip')
    await toggle.tap()
    await state('main')
    await docs.tap()
    await state('docs')
    const link = page.locator('#header-docs-menu a').first()
    const target = await link.getAttribute('href')
    await link.tap()
    await page.waitForURL(url => url.pathname === target)
    // Nuxt updates useRoute after the destination page resolves, later than the URL.
    await page.waitForFunction(target => document.querySelector('#__nuxt')?.__vue_app__?.config.globalProperties.$nuxt?._route.path === target, target)
    await state('closed')
    await toggle.tap()
    await state('main')
    assert.equal(await docs.isVisible(), true)
    await docs.tap()
    await page.keyboard.press('Escape')
    await state('closed')
    assert.equal(await toggle.evaluate(e => e === document.activeElement), true)
    await page.setViewportSize({ width: 320, height: 480 })
    await toggle.tap()
    await state('main')
    await docs.tap()
    await state('docs')
    await menu.evaluate(e => { e.scrollTop = e.scrollHeight })
    assert.equal(await menu.evaluate(e => e.scrollTop > 0), true, 'Short mobile viewport must scroll the docs panel')
    assert.equal(await page.locator('#header-docs-menu a').last().isVisible(), true)
    await page.setViewportSize({ width: 834, height: 900 })
    await state('closed')
    assert.equal(await page.evaluate(() => document.body.style.overflow), 'clip')
    assert.equal(await page.locator('.docs-link').isVisible(), true)
    assert.equal(await docs.isVisible(), false)
    await page.setViewportSize({ width: 833, height: 900 })
    await state('closed')
    await menu.waitFor({ state: 'hidden' })
    assert.equal(await menu.isVisible(), false)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(`${baseURL}/about`)
    await page.waitForLoadState('networkidle')
    await page.locator('.docs-link').click()
    await page.waitForURL(/\/docs\/getting-started\/introduction$/)
    assert.deepEqual(errors, [])
    console.log('PASS: panel switching, group toggles, link navigation, reset on reopen, focus, Escape, scroll restore, short viewport scrolling, breakpoints and desktop link')
  } finally {
    await browser.close()
  }
})().catch(error => { console.error(error); process.exitCode = 1 })
