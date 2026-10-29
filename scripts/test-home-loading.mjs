import assert from 'node:assert/strict'
import test from 'node:test'
import { loadMenuSkyAssets } from '../app/utils/menu-sky.ts'

function mockImages (t) {
  const original = globalThis.Image
  const images = []
  globalThis.Image = class {
    constructor () { images.push(this) }
    decode () {
      return new Promise((resolve, reject) => { this.decoded = resolve; this.decodeFailed = reject })
    }
  }
  t.after(() => {
    if (original) { globalThis.Image = original } else { delete globalThis.Image }
  })
  return images
}

test('the scene waits for every image to decode, including out-of-order completions', async (t) => {
  const images = mockImages(t)
  let ready = false
  const loading = loadMenuSkyAssets().then((assets) => { ready = true; return assets })
  images.forEach(image => image.onload())
  await Promise.resolve()
  assert.equal(ready, false, 'network completion alone must not make the scene ready')
  for (const index of [5, 2, 0, 4, 1, 3]) {
    assert.equal(ready, false, 'every image must finish decoding before the scene is ready')
    images[index].decoded()
    await Promise.resolve()
  }
  const assets = await loading
  assert.equal(ready, true)
  assert.equal(assets.bg, images[0])
  assert.equal(assets.front1, images[5])
})

test('a broken image cannot make the scene ready', async (t) => {
  const images = mockImages(t)
  const loading = loadMenuSkyAssets()
  const rejected = assert.rejects(loading, /failed to load/)
  images[0].onerror()
  for (const image of images.slice(1)) { image.onload() }
  await Promise.resolve()
  images.slice(1).forEach(image => image.decoded())
  await rejected
})

test('an undecodable image rejects the scene rather than completing it', async (t) => {
  const images = mockImages(t)
  const loading = loadMenuSkyAssets()
  const rejected = assert.rejects(loading, /decode failed/)
  images.forEach(image => image.onload())
  await Promise.resolve()
  images[0].decodeFailed(new Error('decode failed'))
  images.slice(1).forEach(image => image.decoded())
  await rejected
})
