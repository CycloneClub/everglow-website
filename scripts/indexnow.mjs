import { readFile, writeFile } from 'node:fs/promises'
import process from 'node:process'
import { setTimeout } from 'node:timers/promises'
import { pathToFileURL } from 'node:url'

const manifestPath = '/indexnow-manifest.json'
const endpoint = 'https://api.indexnow.org/indexnow'

function validate (manifest) {
  if (manifest?.version !== 1 || !manifest.revision || !manifest.pages || typeof manifest.pages !== 'object') {
    throw new Error('Invalid SEO deployment manifest')
  }
  const site = new URL(manifest.site)
  if (site.protocol !== 'https:' || site.origin !== manifest.site) { throw new Error('Expected an HTTPS site origin') }
  for (const [path, page] of Object.entries(manifest.pages)) {
    const url = new URL(path, site)
    if (!path.startsWith('/') || url.origin !== site.origin || url.pathname !== path || url.search || url.hash || typeof page?.hash !== 'string') {
      throw new Error(`Invalid canonical page path: ${path}`)
    }
  }
}

export function changedUrls (before, after) {
  validate(after)
  if (before) {
    validate(before)
    if (before.site !== after.site) { throw new Error('Cannot compare different sites') }
  }
  const paths = new Set([...Object.keys(before?.pages || {}), ...Object.keys(after.pages)])
  return [...paths].filter(path => before?.pages[path]?.hash !== after.pages[path]?.hash).sort().map(path => new URL(path, after.site).href)
}

export async function readLiveManifest (site, fetcher = fetch) {
  const response = await fetcher(`${site}${manifestPath}`, { cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(15_000) })
  if (response.status === 404) { return null }
  if (!response.ok) { throw new Error(`Cannot read previous deployment: HTTP ${response.status}`) }
  const manifest = await response.json()
  validate(manifest)
  if (manifest.site !== site) { throw new Error('Unexpected deployment site') }
  return manifest
}

export async function submitChanges (before, after, key, fetcher = fetch) {
  const urls = changedUrls(before, after)
  if (!urls.length) { return 0 }
  if (!/^[a-z0-9-]{8,128}$/i.test(key)) { throw new Error('Invalid IndexNow key') }
  const live = await readLiveManifest(after.site, fetcher)
  if (!live || live.revision !== after.revision || JSON.stringify(live.pages) !== JSON.stringify(after.pages)) {
    throw new Error('Expected deployment is not live yet; no IndexNow notification sent')
  }
  const keyLocation = `${after.site}/indexnow-key.txt`
  const proof = await fetcher(keyLocation, { cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(15_000) })
  if (!proof.ok || (await proof.text()).trim() !== key) { throw new Error('Live IndexNow key does not match') }
  for (let offset = 0; offset < urls.length; offset += 10_000) {
    const response = await fetcher(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: new URL(after.site).host, key, keyLocation, urlList: urls.slice(offset, offset + 10_000) }),
      signal: AbortSignal.timeout(30_000),
    })
    if (response.status !== 200 && response.status !== 202) { throw new Error(`IndexNow returned HTTP ${response.status}`) }
  }
  return urls.length
}

export async function notifyWithRetry (before, after, key, fetcher = fetch, pause = setTimeout) {
  // Restarts, CDN propagation, throttling and transient network errors must not
  // lose the checkpoint. Repeated submissions are safe for the same URL batch.
  for (let attempt = 0; ; attempt++) {
    try {
      return await submitChanges(before, after, key, fetcher)
    } catch (error) {
      if (attempt >= 4 || /HTTP (?:400|403|422)|Invalid |different sites/i.test(error.message)) { throw error }
      await pause(2000 * (attempt + 1))
    }
  }
}

async function main () {
  const [action, snapshotFile] = process.argv.slice(2)
  if (!snapshotFile || !['snapshot', 'submit', 'dry-run'].includes(action)) {
    throw new Error('Usage: node scripts/indexnow.mjs snapshot|submit|dry-run <previous-manifest.json>')
  }
  const after = JSON.parse(await readFile('.output/public/indexnow-manifest.json', 'utf8'))
  validate(after)
  if (action === 'snapshot') {
    try {
      const saved = JSON.parse(await readFile(snapshotFile, 'utf8'))
      changedUrls(saved, after)
      console.debug('Reusing the last acknowledged IndexNow checkpoint.')
      return
    } catch (error) {
      if (error.code !== 'ENOENT') { throw error }
    }
    await writeFile(snapshotFile, JSON.stringify(await readLiveManifest(after.site)))
    console.debug('Saved the previous live SEO manifest.')
    return
  }
  const before = JSON.parse(await readFile(snapshotFile, 'utf8'))
  if (action === 'dry-run') {
    console.debug(JSON.stringify(changedUrls(before, after), null, 2))
    return
  }
  const key = (await readFile('public/indexnow-key.txt', 'utf8')).trim()
  const count = await notifyWithRetry(before, after, key)
  await writeFile(snapshotFile, JSON.stringify(after))
  console.debug(`IndexNow accepted ${count} changed URLs (acceptance does not guarantee indexing).`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}
