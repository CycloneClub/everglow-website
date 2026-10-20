import assert from 'node:assert/strict'
import { get as httpGet } from 'node:http'
import { get as httpsGet } from 'node:https'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

function attributes (tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, name, value]) => [name, value.replaceAll('&amp;', '&')]))
}

// Exercise the HTTP contract: missing content must not become indexable empty pages.
export async function verifyDocumentationStatus (baseUrl) {
  for (const prefix of ['', '/en-us', '/zh-hk']) {
    const validPath = prefix + '/docs/getting-started/installation'
    const valid = await fetch(new URL(validPath, baseUrl), { signal: AbortSignal.timeout(30_000) })
    assert.equal(valid.status, 200, validPath + ': existing installation guide remains available')
    assert.ok((await valid.text()).includes('2906178094'), validPath + ': render the installation content')
    for (const suffix of ['/docs/guide/recipes', '/docs/seo-missing-document']) {
      const path = prefix + suffix
      const response = await fetch(new URL(path, baseUrl), { signal: AbortSignal.timeout(30_000) })
      assert.equal(response.status, 404, path + ': missing documentation must return HTTP 404')
    }
  }
  for (const path of ['/en-us/docs/mechanics/mission', '/zh-hk/docs/mechanics/mission', '/zh-cn/docs/guide/recipes']) {
    const response = await fetch(new URL(path, baseUrl), { signal: AbortSignal.timeout(30_000) })
    assert.equal(response.status, 404, path + ': missing translations and legacy URLs must not serve empty pages')
  }
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
  await check('legacy Simplified Chinese URLs redirect to unprefixed pages', async () => {
    for (const [from, to] of [
      ['/zh-cn', '/'],
      ['/zh-cn/', '/'],
      ['/zh-cn/about', '/about'],
      ['/zh-cn/news/2025-06-30', '/news/2025-06-30'],
      ['/zh-cn/docs/getting-started/introduction', '/docs/getting-started/introduction'],
      ['/zh-cn/docs/mechanics/biome-label?ref=search&value=%2F', '/docs/mechanics/biome-label?ref=search&value=%2F'],
    ]) {
      const response = await fetch(new URL(from, baseUrl), { redirect: 'manual' })
      assert.equal(response.status, 301, `${from}: permanent redirect`)
      assert.equal(response.headers.get('location'), to, `${from}: preserve path and query`)
      const target = await fetch(new URL(to, baseUrl), { redirect: 'manual' })
      assert.equal(target.status, 200, `${to}: no redirect loop`)
      const html = await target.text()
      assert.match(html, /<html[^>]*lang="zh-cn"/i)
      assert.ok(!/<title>未知领域/.test(html), `${to}: render the actual page`)
    }
  })
  await check('homepage stays stable across language preferences', async () => {
    for (const language of ['en-US', 'zh-HK', 'zh-CN']) {
      const response = await fetch(new URL('/', baseUrl), {
        redirect: 'manual', headers: { 'accept-language': language, 'cookie': 'i18n_redirected=en-us' },
      })
      assert.equal(response.status, 200, `${language}: root must not redirect`)
      assert.match(await response.text(), /<html[^>]*lang="zh-cn"/i)
    }
  })
  await check('documentation returns real HTTP status codes', () => verifyDocumentationStatus(baseUrl))
  await check('localized homepage aliases permanently redirect to their canonical pages', async () => {
    for (const locale of ['en-us', 'zh-hk']) {
      const response = await fetch(new URL(`/${locale}/?ref=search&value=%2F`, baseUrl), { redirect: 'manual' })
      assert.equal(response.status, 301)
      assert.equal(response.headers.get('location'), `/${locale}?ref=search&value=%2F`)
      const target = await fetch(new URL(response.headers.get('location'), baseUrl), { redirect: 'manual' })
      assert.equal(target.status, 200, 'canonical homepage must not redirect again')
      const canonical = ((await target.text()).match(/<link\b[^>]*>/g) || []).map(attributes).filter(tag => tag.rel === 'canonical')
      assert.deepEqual(canonical.map(tag => tag.href), [`${siteOrigin}/${locale}`])
    }
  })
  await check('www aliases redirect directly to the canonical host', async () => {
    for (const [path, target] of [
      ['/', '/'],
      ['/docs/getting-started/installation', '/docs/getting-started/installation'],
      ['/en-us/', '/en-us'],
      ['/zh-hk/', '/zh-hk'],
      ['/zh-cn/about?ref=search&value=%2F', '/about?ref=search&value=%2F'],
    ]) {
      // fetch does not preserve a custom Host header; send it over HTTP directly.
      const url = new URL(path, baseUrl)
      const get = url.protocol === 'https:' ? httpsGet : httpGet
      const response = await new Promise((resolve, reject) => {
        get(url, { headers: { host: 'www.everglowmod.com' }, signal: AbortSignal.timeout(30_000) }, (res) => {
          res.resume()
          resolve(res)
        }).on('error', reject)
      })
      assert.equal(response.statusCode, 301, path)
      assert.equal(response.headers.location, `https://everglowmod.com${target}`, path)
    }
  })
  let manifest
  await check('IndexNow deployment manifest and ownership proof', async () => {
    manifest = JSON.parse(await fetchText('/indexnow-manifest.json'))
    assert.equal(manifest.site, siteOrigin)
    assert.match(manifest.revision, /^[a-f0-9]{40}$/)
    assert.match((await fetchText('/indexnow-key.txt')).trim(), /^[a-z0-9-]{8,128}$/i)
    assert.ok(Object.keys(manifest.pages).length > 12)
  })
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
      for (const path of ['/about', '/news', '/playground', '/news/2025-06-30', '/docs/getting-started/introduction', '/docs/mechanics/biome-label']) {
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
          if (language === 'zh-CN') {
            assert.equal(new URL(matches[0].href).pathname.replace(/\/$/, ''), path, 'Simplified Chinese links have no locale prefix')
          }
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
      assert.ok(paths.includes(`${prefix}/docs/mechanics/biome-label`), 'translated biome documentation must be listed')
      assert.equal(new Set(paths).size, paths.length, 'no duplicate URLs')
      if (prefix) { assert.ok(!paths.includes(`${prefix}/docs/mechanics/mission`), 'do not invent untranslated docs') }
      for (const match of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
        const url = new URL(match[1].match(/<loc>([^<]+)<\/loc>/)[1])
        const lastmod = match[1].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1]
        const expected = manifest?.pages[url.pathname]?.lastmod
        assert.ok(expected, `${url.pathname}: tracked source date`)
        assert.equal(Date.parse(lastmod), Date.parse(expected), `${url.pathname}: sitemap must use source date`)
      }
    })
    await check(`${locale} article structured data`, async () => {
      const path = `${prefix}/news/2025-06-30`
      const html = await fetchText(path)
      const graph = [...html.matchAll(/<script\b[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(match => JSON.parse(match[1])['@graph'] || [])
      const articles = graph.filter(node => [node['@type']].flat().includes('BlogPosting'))
      assert.equal(articles.length, 1)
      const article = articles[0]
      assert.ok(article.headline?.includes('2025'))
      assert.ok(Number.isFinite(Date.parse(article.datePublished)))
      assert.equal(Date.parse(article.dateModified), Date.parse(manifest?.pages[path]?.lastmod))
      assert.ok(article.author, 'article must identify its author')
      assert.ok(article.image, 'article cover must be represented')
      assert.ok(html.includes('2025-06-30_FurnaceArea.png'))
    })
  }
  await check('untranslated documentation has no invented language alternatives', async () => {
    const html = await fetchText('/docs/mechanics/mission')
    const links = (html.match(/<link\b[^>]*>/g) || []).map(attributes).filter(tag => tag.hreflang)
    assert.ok(links.some(link => link.hreflang === 'zh-CN'))
    assert.ok(!links.some(link => /^(?:en(?:-US)?|zh-HK)$/i.test(link.hreflang)))
  })
  assert.equal(failures.length, 0, failures.join('\n'))
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await verifySeo(process.env.SEO_BASE_URL || 'http://127.0.0.1:43177')
}
