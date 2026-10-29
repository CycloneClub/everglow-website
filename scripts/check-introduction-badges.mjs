import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import process from 'node:process'

const { chromium } = createRequire(import.meta.url)('playwright-core')
const baseURL = process.env.BADGE_TEST_URL
if (!baseURL) {
  throw new Error('Set BADGE_TEST_URL to the local dev/preview server URL.')
}

// Keep the SVG dimensions deterministic without depending on live badge counts.
const badgeSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="20"><rect width="120" height="20" fill="#555"/><text x="8" y="14" fill="white" font-size="11">Example badge</text></svg>'
const contributorsSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="80"><rect width="240" height="80" fill="#555"/></svg>'
const browser = await chromium.launch({ channel: process.env.BADGE_TEST_BROWSER || 'chrome', headless: true })

try {
  for (const deviceScaleFactor of [1, 2]) {
    const context = await browser.newContext({
      deviceScaleFactor,
      viewport: { width: 1440, height: 1000 },
    })
    try {
      await context.route('https://img.shields.io/**', route => route.fulfill({
        contentType: 'image/svg+xml',
        body: badgeSVG,
      }))
      await context.route('https://contrib.rocks/**', route => route.fulfill({
        contentType: 'image/svg+xml',
        body: contributorsSVG,
      }))
      const page = await context.newPage()
      for (const prefix of ['', '/en-us', '/zh-hk']) {
        await page.goto(`${baseURL}${prefix}/docs/getting-started/introduction`, { waitUntil: 'domcontentloaded' })
        for (const state of ['initial', 'reload', 'mobile']) {
          if (state === 'reload') await page.reload({ waitUntil: 'domcontentloaded' })
          if (state === 'mobile') await page.setViewportSize({ width: 390, height: 844 })
          await page.waitForFunction(() => {
            const images = [...document.querySelectorAll('.article-body img[src*="img.shields.io"]')]
            return images.length === 7 && images.every(image => image.complete && image.naturalWidth > 0)
          })
          const sizes = await page.locator('.article-body img[src*="img.shields.io"]').evaluateAll(images => images.map(image => ({
            name: image.alt,
            width: image.getBoundingClientRect().width,
            height: image.getBoundingClientRect().height,
          })))
          for (const size of sizes) {
            const label = `${prefix || 'zh-cn'}, DPR ${deviceScaleFactor}, ${state}, ${size.name}`
            assert.equal(size.height, 20, `${label}: SVG height must not shrink`)
            assert.equal(size.width, 120, `${label}: SVG width must not shrink`)
          }
          await page.waitForFunction(() => {
            const image = document.querySelector('.article-body img[src*="contrib.rocks"]')
            return image?.complete && image.naturalWidth > 0
          })
          const contributors = await page.locator('.article-body img[src*="contrib.rocks"]').boundingBox()
          const label = `${prefix || 'zh-cn'}, DPR ${deviceScaleFactor}, ${state}, contributors`
          assert.equal(contributors.width, 240, `${label}: SVG width must not shrink`)
          assert.equal(contributors.height, 80, `${label}: SVG height must not shrink`)
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No horizontal overflow')
        }
        await page.setViewportSize({ width: 1440, height: 1000 })
        console.log(`${prefix || 'zh-cn'}, DPR ${deviceScaleFactor}: badge and contributor sizes stable on load, reload, and mobile`)
      }
    }
    finally {
      await context.close()
    }
  }
}
finally {
  await browser.close()
}
