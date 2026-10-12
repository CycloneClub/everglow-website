import assert from 'node:assert/strict'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

function attributes (tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, name, value]) => [name, value.replaceAll('&amp;', '&')]))
}

export async function verifySeo (baseUrl) {
  const siteOrigin = new URL(process.env.SEO_SITE_URL || 'https://everglowmod.com').origin
  const failures = []
  const check = async (name, run) => {
    try {
      await run()
      console.debug(`PASS ${name}`)
    } catch (error) {
      failures.push(`${name}: ${error.message}`)
    }
  }
  const fetchText = async (path) => {
    const response = await fetch(new URL(path, baseUrl), { signal: AbortSignal.timeout(30_000) })
    assert.equal(response.status, 200, path)
    return response.text()
  }
  for (const [prefix, locale] of [['', 'zh-CN'], ['/en-us', 'en-US'], ['/zh-hk', 'zh-HK']]) {
    const home = await fetchText(`${prefix}/`)
    const description = html => (html.match(/<meta\b[^>]*>/g) || []).map(attributes).find(tag => tag.name === 'description')?.content
    await check(`${locale} site aliases`, () => {
      const graph = [...home.matchAll(/<script\b[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(match => JSON.parse(match[1])['@graph'] || [])
      const websites = graph.filter(node => node['@type'] === 'WebSite' && node.name)
      assert.equal(websites.length, 1, 'keep one named website node per page')
      assert.ok(websites[0].alternateName?.includes('Everglow Mod'))
      assert.ok(websites[0].alternateName?.includes(locale === 'en-US' ? '流光无际' : 'Everglow'))
      assert.equal(new URL(websites[0].url).pathname.replace(/\/$/, ''), prefix)
      assert.equal(new URL(websites[0].url).origin, siteOrigin)
      assert.ok(home.includes('Dream Chaser Group'), 'retain publisher identity')
    })
    await check(`${locale} page metadata and language links`, async () => {
      for (const path of ['/about', '/news', '/playground', '/news/2025-06-30', '/docs/getting-started/introduction']) {
        const html = await fetchText(`${prefix}${path}`)
        assert.ok(description(html)?.trim(), `${path} has a description`)
        assert.notEqual(description(html), description(home), `${path} must not reuse the homepage description`)
        const links = (html.match(/<link\b[^>]*>/g) || []).map(attributes).filter(tag => tag.hreflang)
        for (const link of links) {
          assert.equal(new URL(link.href).origin, siteOrigin)
          assert.ok(new URL(link.href).pathname.replace(/\/$/, '').endsWith(path), `${path}: all alternatives, including x-default, must refer to this page`)
        }
        for (const language of ['zh-CN', 'zh-HK', 'en-US']) {
          const matches = links.filter(link => link.hreflang.toLowerCase() === language.toLowerCase())
          assert.equal(matches.length, 1, `${path}: one alternate for ${language}`)
          assert.ok(new URL(matches[0].href).pathname.replace(/\/$/, '').endsWith(path), `${path}: alternate must refer to the same content`)
        }
        assert.ok(!/<title>[^<]*head\./.test(html), `${path}: translated title`)
        if (path.includes('/2025-') || path.includes('/introduction')) {
          assert.ok(!/<title>(?:新闻|新聞|News|文档|文檔|Docs) - /.test(html), `${path}: content-specific title`)
        }
      }
    })
    await check(`${locale} footer`, () => {
      const footer = home.match(/<footer\b[\s\S]*?<\/footer>/)?.[0]
      assert.ok(footer)
      assert.ok(/class="copyright"[^>]*data-nosnippet|data-nosnippet[^>]*class="copyright"/.test(footer), 'copyright must be excluded from snippets')
      if (locale !== 'en-US') { assert.ok(!footer.includes('The official website of the Everglow Mod for')) }
    })
    await check(`${locale} content sitemap`, async () => {
      const xml = await fetchText(`/__sitemap__/${locale}.xml`)
      const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]))
      for (const url of urls) { assert.equal(url.origin, siteOrigin) }
      const paths = urls.map(url => url.pathname)
      assert.ok(paths.includes(`${prefix}/news/2025-06-30`), 'news detail must be listed')
      assert.ok(paths.includes(`${prefix}/docs/getting-started/introduction`), 'documentation must be listed')
      assert.equal(new Set(paths).size, paths.length, 'no duplicate URLs')
      if (prefix) { assert.ok(!paths.includes(`${prefix}/docs/templates/fish`), 'do not invent untranslated docs') }
    })
  }
  await check('untranslated documentation has no invented language alternatives', async () => {
    const html = await fetchText('/docs/templates/fish')
    const links = (html.match(/<link\b[^>]*>/g) || []).map(attributes).filter(tag => tag.hreflang)
    assert.ok(links.some(link => link.hreflang === 'zh-CN'))
    assert.ok(!links.some(link => /^(?:en(?:-US)?|zh-HK)$/i.test(link.hreflang)))
  })
  assert.equal(failures.length, 0, failures.join('\n'))
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await verifySeo(process.env.SEO_BASE_URL || 'http://127.0.0.1:43177')
}
