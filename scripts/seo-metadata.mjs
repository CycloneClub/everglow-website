import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { articleDate } from '../shared/utils/seo.ts'

export function contentRoute (file) {
  return '/' + file.replace(/^content\//, '').replace(/\.md$/, '').split('/')
    .map(part => part.replace(/^\d+\./, '').replace(/^index$/, '').toLowerCase())
    .filter(Boolean).join('/')
}

// Recomputed at Nuxt config load, independent of the Content parser cache.
// Dates are never based on checkout mtimes or the build clock.
export function createSeoManifest (root, site = 'https://everglowmod.com') {
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }).trim()
  if (git('rev-parse', '--is-shallow-repository') === 'true') {
    throw new Error('SEO dates require complete Git history. Fetch with fetch-depth: 0.')
  }
  const files = git('ls-files', '--cached', '--others', '--exclude-standard', '-z').split('\0').filter(file => file && existsSync(join(root, file)))
  const contents = new Map()
  const read = (file) => {
    if (!contents.has(file)) { contents.set(file, readFileSync(join(root, file))) }
    return contents.get(file)
  }
  const matching = prefixes => files.filter(file => prefixes.some(prefix => file === prefix || file.startsWith(prefix + '/')))
  const latest = (paths) => {
    if (!paths.length) { return undefined }
    const date = git('log', '-1', '--format=%cI', '--', ...paths)
    return date ? new Date(date).toISOString() : undefined
  }
  const fingerprint = paths => createHash('sha256').update([...new Set(paths)].sort().map(file => `${file}\0${createHash('sha256').update(read(file)).digest('hex')}`).join('\n')).digest('hex')
  const shared = matching(['app/app.vue', 'app/components/common', 'app/assets', 'app/plugins', 'app/layouts', 'app/utils/index.ts', 'nuxt.config.ts'])
  const pages = {}
  const locales = [['', 'zh-CN'], ['/en-us', 'en-US'], ['/zh-hk', 'zh-HK'], ['/ja-jp', 'ja-JP'], ['/ko-kr', 'ko-KR'], ['/ru-ru', 'ru-RU']]
  for (const [prefix, locale] of locales) {
    const translation = matching([`i18n/locales/${locale}.ts`])
    for (const [path, source, components] of [
      ['', 'app/pages/index.vue', 'app/components/home'],
      ['/about', 'app/pages/about/index.vue', 'app/components/about'],
      ['/news', 'app/pages/news/index.vue', 'app/components/news'],
    ]) {
      if (!files.includes(source)) { continue }
      const contentPrefix = `content/${prefix ? locale + '/' : ''}${path.slice(1)}`
      const own = [...matching([source, components]), ...translation, ...(path === '/news' || path === '/about' ? matching([contentPrefix]) : [])]
      if (!path) { own.push(...matching(['app/data', `content/${prefix ? locale + '/' : ''}news`])) }
      pages[prefix + path || '/'] = { hash: fingerprint([...shared, ...own]), lastmod: latest(own) }
    }
  }
  for (const file of files.filter(file => /^content\/(?:(?:en-US|zh-HK|ja-JP|ko-KR|ru-RU)\/)?(?:news|docs|about)\/.*\.md$/.test(file))) {
    const path = contentRoute(file)
    const source = read(file).toString('utf8')
    const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] || ''
    const field = name => frontmatter.match(new RegExp(`^${name}:\\s*['"]?([^'"\\r\\n]+)`, 'm'))?.[1]?.trim()
    const published = articleDate(field('date'))
    const modified = articleDate(field('updatedAt')) || latest([file])
    const lastmod = modified && published && Date.parse(modified) < Date.parse(published) ? published : modified
    const locale = locales.find(([prefix]) => prefix && path.startsWith(prefix + '/'))?.[1] ?? 'zh-CN'
    const section = path.replace(/^\/(?:en-us|zh-hk|ja-jp|ko-kr|ru-ru)\//, '/').split('/')[1]
    const assets = [...source.matchAll(/['"(]\/(images\/[^'"\s)]+)/g)].map(match => `public/${match[1]}`).filter(asset => files.includes(asset))
    const own = [file, ...assets, ...matching([`app/pages/${section}`, `app/components/${section}`, `i18n/locales/${locale}.ts`])]
    pages[path] = { hash: fingerprint([...shared, ...own]), ...(lastmod ? { lastmod } : {}) }
  }
  return { version: 1, site: new URL(site).origin, revision: git('rev-parse', 'HEAD'), pages }
}
