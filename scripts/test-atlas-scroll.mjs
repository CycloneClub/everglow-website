import assert from 'node:assert/strict'
import test from 'node:test'

import { createAtlasScroll } from '../app/utils/atlas-scroll.ts'

function setup () {
  let y = 0
  let now = 0
  let callback
  let completed = 0
  const scroll = createAtlasScroll({
    position: () => y,
    now: () => now,
    scroll: (value) => { y = value },
    request: (value) => { callback = value; return 1 },
    cancel: () => { callback = undefined },
  })
  return {
    start: (target, duration = 1500) => scroll.start(target, () => { completed++ }, duration),
    cancel: scroll.cancel,
    tick: (time) => { now = time; const frame = callback; callback = undefined; frame?.(time) },
    position: () => y,
    completed: () => completed,
    pending: () => !!callback,
  }
}

test('an ordinary page turn takes 1500ms and eases gently at both ends', () => {
  const scene = setup()
  scene.start(1000)
  scene.tick(150)
  assert.ok(scene.position() > 0 && scene.position() < 20, 'gentle start')
  scene.tick(750)
  assert.equal(scene.position(), 500)
  assert.equal(scene.completed(), 0, 'the former approximate duration is only halfway')
  scene.tick(1350)
  assert.ok(scene.position() > 980 && scene.position() < 1000, 'gentle finish')
  scene.tick(1500)
  assert.equal(scene.position(), 1000)
  assert.equal(scene.completed(), 1)
  assert.equal(scene.pending(), false)
})

test('manual interruption cancels the turn without a later jump', () => {
  const scene = setup()
  scene.start(1000)
  scene.tick(750)
  scene.cancel()
  scene.tick(2000)
  assert.equal(scene.position(), 500)
  assert.equal(scene.completed(), 0)
  assert.equal(scene.pending(), false)
})

test('retargeting starts from the current position and cancels the previous destination', () => {
  const scene = setup()
  scene.start(1000)
  scene.tick(750)
  scene.start(0)
  assert.equal(scene.position(), 500)
  scene.tick(1500)
  assert.equal(scene.position(), 250)
  assert.equal(scene.completed(), 0)
  scene.tick(2250)
  assert.equal(scene.position(), 0)
  assert.equal(scene.completed(), 1)
})

test('large camera movements use 3000ms while preserving the same easing', () => {
  const scene = setup()
  scene.start(1000, 3000)
  scene.tick(1500)
  assert.equal(scene.position(), 500)
  assert.equal(scene.completed(), 0)
  scene.tick(3000)
  assert.equal(scene.position(), 1000)
  assert.equal(scene.completed(), 1)
})
