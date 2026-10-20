import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { contentRoute, createSeoManifest } from './seo-metadata.mjs'
import { articleDate } from '../shared/utils/seo.ts'
import * as seo from '../shared/utils/seo.ts'

test('duplicate hosts and localized homepages resolve to one canonical URL', () => {
  assert.equal(typeof seo.canonicalRedirect, 'function', 'canonical redirect resolver must exist')
  for (const [from, to] of [
    ['https://www.everglowmod.com/', 'https://everglowmod.com/'],
    ['https://www.everglowmod.com/docs/getting-started/installation', 'https://everglowmod.com/docs/getting-started/installation'],
    ['https://www.everglowmod.com/en-us/news/2025-06-30?ref=search&value=%2F', 'https://everglowmod.com/en-us/news/2025-06-30?ref=search&value=%2F'],
    ['https://everglowmod.com/en-us/', '/en-us'],
    ['https://everglowmod.com/zh-hk/', '/zh-hk'],
    ['https://www.everglowmod.com/en-us/', 'https://everglowmod.com/en-us'],
    ['https://www.everglowmod.com/zh-cn/about?ref=search', 'https://everglowmod.com/about?ref=search'],
    ['https://everglowmod.com/zh-cn/', '/'],
    ['https://everglowmod.com/zh-cn//example.com', '/example.com'],
  ]) {
    const target = seo.canonicalRedirect(new URL(from))
    assert.equal(target, to, from)
    assert.equal(seo.canonicalRedirect(new URL(target, from)), undefined, `${from}: no redirect chain or loop`)
  }
})

test('canonical redirects leave canonical pages, assets and preview hosts alone', () => {
  assert.equal(typeof seo.canonicalRedirect, 'function', 'canonical redirect resolver must exist')
  for (const url of [
    'https://everglowmod.com/',
    'https://everglowmod.com/en-us',
    'https://everglowmod.com/zh-hk',
    'https://everglowmod.com/docs/getting-started/installation',
    'https://everglowmod.com/api/example/',
    'https://everglowmod.com/images/example.png',
    'https://everglowmod.com/zh-cn-example',
    'http://localhost:3000/',
    'https://preview.example.com/about',
  ]) {
    assert.equal(seo.canonicalRedirect(new URL(url)), undefined, url)
  }
})

test('content routes match the canonical localized Nuxt Content paths', () => {
  assert.equal(contentRoute('content/en-US/docs/1.getting-started/2.installation.md'), '/en-us/docs/getting-started/installation')
  assert.equal(contentRoute('content/zh-HK/about/index.md'), '/zh-hk/about')
  assert.equal(contentRoute('content/news/2025-06-30.md'), '/news/2025-06-30')
})

test('article dates carry an explicit timezone and invalid dates are omitted', () => {
  assert.equal(articleDate('2025-06-30 16:38:27'), '2025-06-30T16:38:27+08:00')
  assert.equal(articleDate('2026-10-12T06:00:00Z'), '2026-10-12T06:00:00Z')
  assert.equal(articleDate('not a date'), undefined)
  assert.equal(articleDate('2025-02-30 12:00:00'), undefined)
})

test('lastmod follows file history, not build time or unrelated commits; hashes catch working edits', () => {
  const root = mkdtempSync(join(tmpdir(), 'everglow-seo-'))
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim()
  const commit = (date) => {
    git('add', '.')
    execFileSync('git', ['-c', 'user.name=SEO Test', '-c', 'user.email=seo@example.com', 'commit', '-qm', 'fixture'], {
      cwd: root, env: { ...process.env, GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date },
    })
  }
  try {
    git('init', '-q')
    git('config', 'core.autocrlf', 'false')
    mkdirSync(join(root, 'content/news'), { recursive: true })
    mkdirSync(join(root, 'app/pages'), { recursive: true })
    mkdirSync(join(root, 'app/data'), { recursive: true })
    writeFileSync(join(root, 'app/pages/index.vue'), '<template>Home</template>')
    writeFileSync(join(root, 'app/data/world-atlas.ts'), 'original atlas copy')
    const file = join(root, 'content/news/2025-06-30.md')
    writeFileSync(file, '---\ntitle: Test\ndate: 2025-06-30 12:00:00\n---\nOriginal')
    commit('2025-07-01T00:00:00Z')
    const first = createSeoManifest(root)
    writeFileSync(join(root, 'README.md'), 'unrelated')
    commit('2025-08-01T00:00:00Z')
    const second = createSeoManifest(root)
    const path = '/news/2025-06-30'
    assert.equal(first.pages[path].lastmod, '2025-07-01T00:00:00.000Z')
    assert.deepEqual(second.pages[path], first.pages[path])
    writeFileSync(file, '---\ntitle: Test\ndate: 2025-06-30 12:00:00\n---\nChanged')
    assert.notEqual(createSeoManifest(root).pages[path].hash, first.pages[path].hash)
    commit('2025-09-01T00:00:00Z')
    assert.equal(createSeoManifest(root).pages[path].lastmod, '2025-09-01T00:00:00.000Z')
    const newsEdit = createSeoManifest(root)
    assert.notEqual(newsEdit.pages['/'].hash, first.pages['/'].hash, 'homepage includes latest news')
    assert.equal(newsEdit.pages['/'].lastmod, '2025-09-01T00:00:00.000Z')
    writeFileSync(join(root, 'app/data/world-atlas.ts'), 'revised atlas copy')
    commit('2025-10-01T00:00:00Z')
    const atlasEdit = createSeoManifest(root)
    assert.notEqual(atlasEdit.pages['/'].hash, newsEdit.pages['/'].hash)
    assert.equal(atlasEdit.pages['/'].lastmod, '2025-10-01T00:00:00.000Z')
    assert.deepEqual(atlasEdit.pages[path], newsEdit.pages[path], 'atlas changes do not update news article dates')
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
