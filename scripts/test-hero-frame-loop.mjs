import assert from 'node:assert/strict'
import test from 'node:test'
import { createHeroFrameLoop } from '../app/utils/hero-frame-loop.ts'

function scene () {
  const callbacks = new Map()
  let nextId = 0
  let width = 800
  let height = 600
  let visible = true
  const painted = []
  const loop = createHeroFrameLoop({
    request: (callback) => { const id = ++nextId; callbacks.set(id, callback); return id },
    cancel: (id) => { callbacks.delete(id) },
    bounds: () => ({ width, height, visible }),
    paint: (now) => { painted.push(now) },
  })
  return {
    loop,
    painted,
    pending: () => callbacks.size,
    size: (w, h) => { width = w; height = h },
    show: (value) => { visible = value },
    tick: (now) => { const [id, callback] = callbacks.entries().next().value ?? []; callbacks.delete(id); callback?.(now) },
  }
}

test('zero-sized cached hero skips drawing and resumes on return', () => {
  const hero = scene()
  hero.loop.start()
  hero.tick(16)
  assert.deepEqual(hero.painted, [16])
  hero.size(0, 0)
  hero.tick(32)
  assert.deepEqual(hero.painted, [16])
  assert.equal(hero.pending(), 1)
  hero.size(800, 600)
  hero.tick(48)
  assert.deepEqual(hero.painted, [16, 48])
})

test('deactivation cancels frames and activation starts one loop', () => {
  const hero = scene()
  hero.loop.start()
  hero.loop.stop()
  assert.equal(hero.pending(), 0)
  hero.show(false)
  hero.loop.start()
  hero.tick(16)
  assert.deepEqual(hero.painted, [])
  hero.show(true)
  hero.loop.start()
  assert.equal(hero.pending(), 1)
  hero.tick(32)
  assert.deepEqual(hero.painted, [32])
})
