import assert from 'node:assert/strict'
import test from 'node:test'
import { docsCollectionKey, mapLocaleDocsNavigation, newsCollectionKey } from '../app/utils/index.ts'
import { canonicalRedirect } from '../shared/utils/seo.ts'

test('Japanese and Korean use independent content collections and canonical routes', () => {
  for (const [locale, suffix] of [['ja-jp', 'ja'], ['ko-kr', 'ko']]) {
    assert.equal(newsCollectionKey(locale), `news_${suffix}`)
    assert.equal(docsCollectionKey(locale), `docs_${suffix}`)
    assert.equal(canonicalRedirect(new URL(`https://everglowmod.com/${locale}/`)), `/${locale}`)
    const pages = [{ title: 'Installation', path: `/${locale}/docs/getting-started/installation` }]
    const navigation = [{ path: `/${locale}`, children: [{ path: `/${locale}/docs`, children: pages }] }]
    assert.deepEqual(mapLocaleDocsNavigation(navigation, locale), pages)
  }
})

test('existing locales keep their own collections', () => {
  for (const [locale, news, docs] of [['zh-cn', 'news', 'docs'], ['zh-hk', 'news_hk', 'docs_hk'], ['en-us', 'news_en', 'docs_en']]) {
    assert.equal(newsCollectionKey(locale), news)
    assert.equal(docsCollectionKey(locale), docs)
  }
})
