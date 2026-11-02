import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import zhCN from '../i18n/locales/zh-CN.ts'
import zhHK from '../i18n/locales/zh-HK.ts'
import enUS from '../i18n/locales/en-US.ts'

export async function verifyStaticLocaleMessages (baseURL) {
  const publicDir = resolve('.output/public')
  const files = (await readdir(publicDir, { recursive: true })).map(path => path.replaceAll('\\', '/'))
    .filter(path => /^_i18n\/[^/]+\/[^/]+\/messages\.json$/.test(path))
  const dictionaries = { 'zh-cn': zhCN, 'zh-hk': zhHK, 'en-us': enUS }
  assert.equal(files.length, 3, 'Build must emit one static message file for each locale')
  for (const [locale, expected] of Object.entries(dictionaries)) {
    const file = files.find(path => path.endsWith(`/${locale}/messages.json`))
    assert.ok(file, `Missing prerendered messages for ${locale}`)
    const payload = JSON.parse(await readFile(resolve(publicDir, file), 'utf8'))
    assert.deepEqual(payload[locale], expected, 'Static file must contain the complete locale dictionary')
    const response = await fetch(new URL(`/${file}`, baseURL))
    assert.equal(response.status, 200)
    assert.match(response.headers.get('cache-control') || '', /public.*max-age=31536000.*immutable/)
    assert.equal(response.headers.get('set-cookie'), null)
    assert.deepEqual(await response.json(), payload)
  }
  console.debug('PASS: three prerendered locale files with immutable cache headers')
}
