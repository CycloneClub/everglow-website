import assert from 'node:assert/strict'
import test from 'node:test'

import { createAtlasScroll } from '../app/utils/atlas-scroll.ts'
import * as atlasScroll from '../app/utils/atlas-scroll.ts'

function pagingScene () {
  assert.equal(typeof atlasScroll.createAtlasPaging, 'function', 'shared wheel/button paging controller is available')
  let y = 1000
  let time = 0
  let callback
  let target
  const started = []
  const completed = []
  const paging = atlasScroll.createAtlasPaging({
    position: () => y,
    now: () => time,
    scroll: (value) => { y = value },
    request: (value) => { callback = value; return 1 },
    cancel: () => { callback = undefined },
    stops: () => [1000, 2000, 3000, 4000],
    duration: () => 1500,
    target: (value) => { target = value; if (value !== undefined) { started.push(value) } },
    complete: index => completed.push(index),
  })
  return {
    paging, started, completed,
    target: () => target,
    position: () => y,
    setPosition: (value) => { y = value },
    tick: (value) => { time = value; const frame = callback; callback = undefined; frame?.(time) },
    wheel: (deltaY, cancelable = true, deltaX = 0) => {
      let prevented = false
      const handled = paging.wheel({ deltaY, deltaX, cancelable, preventDefault: () => { prevented = true } })
      return { handled, prevented }
    },
  }
}

test('repeated Next clicks keep one target and the original completion time', () => {
  const scene = pagingScene()
  scene.paging.advance(1)
  scene.tick(500)
  for (let i = 0; i < 8; i++) { scene.paging.advance(1) }
  assert.deepEqual(scene.started, [1])
  scene.tick(1500)
  assert.equal(scene.position(), 2000)
  assert.deepEqual(scene.completed, [1])
  scene.paging.advance(1)
  assert.equal(scene.target(), 2, 'a new click after arrival advances once')
})

test('reversing an unfinished turn returns to its departure stop without a jump or queue', () => {
  const scene = pagingScene()
  scene.paging.advance(1)
  scene.tick(750)
  assert.equal(scene.position(), 1500)
  scene.paging.advance(-1)
  assert.equal(scene.position(), 1500)
  assert.equal(scene.target(), 0)
  scene.paging.advance(-1)
  assert.deepEqual(scene.started, [1, 0])
  scene.tick(1500)
  assert.equal(scene.position(), 1000)
  assert.deepEqual(scene.completed, [0])
})

test('reversing twice reuses the original pair of stops', () => {
  const scene = pagingScene()
  scene.paging.advance(1)
  scene.tick(750)
  scene.paging.advance(-1)
  scene.tick(1000)
  scene.paging.advance(1)
  assert.equal(scene.target(), 1)
  scene.tick(3000)
  assert.equal(scene.position(), 2000)
})

test('wheel bursts and inertial tails do not queue another page', () => {
  const scene = pagingScene()
  assert.deepEqual(scene.wheel(100), { handled: true, prevented: true })
  scene.tick(600)
  scene.wheel(80)
  scene.tick(1450)
  scene.wheel(10)
  scene.tick(1500)
  scene.tick(1600)
  scene.wheel(2)
  scene.tick(1700)
  scene.wheel(1)
  assert.deepEqual(scene.started, [1])
  scene.tick(1900)
  assert.deepEqual(scene.wheel(100), { handled: true, prevented: true })
  assert.equal(scene.target(), 2)
})

test('uncancellable wheel drift is corrected during movement and settling; reversal is immediate', () => {
  const scene = pagingScene()
  assert.deepEqual(scene.wheel(100, false), { handled: true, prevented: false })
  scene.setPosition(1300)
  scene.tick(750)
  assert.equal(scene.position(), 1500)
  scene.tick(1500)
  scene.setPosition(2040)
  scene.tick(1550)
  assert.equal(scene.position(), 2000)
  scene.wheel(-80)
  assert.equal(scene.target(), 0)
})

test('outside content and horizontal wheel input stay native, and manual positions snap in the requested direction', () => {
  const scene = pagingScene()
  assert.equal(scene.wheel(10, true, 50).handled, false)
  assert.equal(scene.wheel(-100).handled, false, 'opening returns control to the hero entrance')
  scene.setPosition(700)
  assert.equal(scene.wheel(100).handled, false)
  scene.setPosition(1900)
  scene.wheel(100)
  assert.equal(scene.target(), 1, 'do not skip the next stop when near it')
  scene.paging.cancel()
  scene.setPosition(3100)
  scene.wheel(-100)
  assert.equal(scene.target(), 2)
  scene.paging.cancel()
  scene.setPosition(4000)
  assert.equal(scene.wheel(100).handled, false, 'past the exit stays native')
})

test('cancel clears the pending destination, animation and gesture lock', () => {
  const scene = pagingScene()
  scene.wheel(100)
  scene.tick(750)
  scene.paging.cancel()
  scene.tick(3000)
  assert.equal(scene.position(), 1500)
  assert.equal(scene.target(), undefined)
  assert.deepEqual(scene.completed, [])
  scene.wheel(-100)
  assert.equal(scene.target(), 0)
})

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

test('a fast exit follows a changing viewport boundary and finishes in 700ms', () => {
  const scene = setup()
  let viewportHeight = 700
  // The boundary is at document y=1400; toolbar collapse exposes more height.
  scene.start(() => 1400 - viewportHeight, 700)
  assert.equal(scene.position(), 0, 'the exit must not jump immediately')
  scene.tick(350)
  assert.equal(scene.position(), 350)
  viewportHeight = 800
  scene.tick(700)
  assert.equal(scene.position(), 600, 'the boundary finishes at the new viewport bottom')
  assert.equal(scene.completed(), 1)
})
