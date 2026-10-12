import assert from 'node:assert/strict'
import test from 'node:test'
import { changedUrls, notifyWithRetry, readLiveManifest, submitChanges } from './indexnow.mjs'

const manifest = (pages, revision = 'new') => ({ version: 1, revision, site: 'https://everglowmod.com', pages })
const page = hash => ({ hash })

test('IndexNow includes added, changed and deleted URLs, but not unchanged pages', () => {
  const before = manifest({ '/same': page('a'), '/changed': page('b'), '/deleted': page('c') })
  const after = manifest({ '/same': page('a'), '/changed': page('d'), '/added': page('e') })
  assert.deepEqual(changedUrls(before, after), ['https://everglowmod.com/added', 'https://everglowmod.com/changed', 'https://everglowmod.com/deleted'])
  assert.deepEqual(changedUrls(after, after), [])
  assert.equal(changedUrls(null, after).length, 3)
  assert.throws(() => changedUrls(before, manifest({ '//evil.example/path': page('x') })))
})

test('no submission before the expected deployment and ownership file are live', async () => {
  const after = manifest({ '/news/test': page('a') })
  const calls = []
  const fakeFetch = (url, options) => {
    calls.push([url, options])
    return new Response(JSON.stringify({ ...after, revision: 'old' }), { status: 200 })
  }
  await assert.rejects(submitChanges(null, after, 'test-key-123', fakeFetch), /deployment/i)
  assert.equal(calls.length, 1)
})

test('notification validates live key, accepts 202 and reports failures', async () => {
  const after = manifest({ '/news/test': page('a') })
  const calls = []
  const fakeFetch = (url, options) => {
    calls.push([url, options])
    if (url.includes('indexnow-manifest')) { return Response.json(after) }
    if (url.endsWith('indexnow-key.txt')) { return new Response('test-key-123') }
    return new Response('', { status: 202 })
  }
  assert.equal(await submitChanges(null, after, 'test-key-123', fakeFetch), 1)
  const payload = JSON.parse(calls.at(-1)[1].body)
  assert.equal(payload.host, 'everglowmod.com')
  assert.deepEqual(payload.urlList, ['https://everglowmod.com/news/test'])
  await assert.rejects(submitChanges(null, after, 'different-key', fakeFetch), /key/i)
  await assert.rejects(submitChanges(null, after, 'test-key-123', (url, opts) => opts?.method === 'POST' ? new Response('', { status: 429 }) : fakeFetch(url, opts)), /429/)
})

test('temporary notification failures retain the same deleted URL batch for retry', async () => {
  const before = manifest({ '/deleted': page('old') }, 'old')
  const after = manifest({ '/added': page('new') })
  const submissions = []
  const fakeFetch = (url, options) => {
    if (url.includes('indexnow-manifest')) { return Response.json(after) }
    if (url.endsWith('indexnow-key.txt')) { return new Response('test-key-123') }
    submissions.push(JSON.parse(options.body).urlList)
    return new Response('', { status: submissions.length === 1 ? 429 : 200 })
  }
  assert.equal(await notifyWithRetry(before, after, 'test-key-123', fakeFetch, () => Promise.resolve()), 2)
  assert.deepEqual(submissions, [
    ['https://everglowmod.com/added', 'https://everglowmod.com/deleted'],
    ['https://everglowmod.com/added', 'https://everglowmod.com/deleted'],
  ])
})

test('only a genuine missing manifest bootstraps the first deployment', async () => {
  assert.equal(await readLiveManifest('https://everglowmod.com', () => new Response('', { status: 404 })), null)
  await assert.rejects(readLiveManifest('https://everglowmod.com', () => new Response('', { status: 503 })), /503/)
  await assert.rejects(readLiveManifest('https://everglowmod.com', () => Response.json({})), /Invalid/)
})

test('URL batches respect the IndexNow limit of 10000', async () => {
  const after = manifest(Object.fromEntries(Array.from({ length: 10001 }, (_, i) => [`/page-${i}`, page('hash')])))
  const sizes = []
  const fakeFetch = (url, options) => {
    if (url.includes('indexnow-manifest')) { return Response.json(after) }
    if (url.endsWith('indexnow-key.txt')) { return new Response('test-key-123') }
    sizes.push(JSON.parse(options.body).urlList.length)
    return new Response('', { status: 200 })
  }
  assert.equal(await submitChanges(null, after, 'test-key-123', fakeFetch), 10001)
  assert.deepEqual(sizes, [10000, 1])
})
