import assert from 'node:assert/strict'
import test from 'node:test'
import { createAtlasEntrance } from '../app/utils/atlas-entrance.ts'

function setup () {
  let time = 0
  let y = 0
  let callback
  let enabled = true
  const snap = createAtlasEntrance({
    bounds: () => ({ start: 0, end: 800, y, enabled }),
    now: () => time,
    scroll: (value) => { y = value },
    request: (value) => { callback = value; return 1 },
    cancel: () => { callback = undefined },
  })
  return {
    snap,
    position: () => y,
    setPosition: (value) => { y = value },
    disable: () => { enabled = false },
    tick: (value) => { time = value; const frame = callback; callback = undefined; frame?.(time) },
  }
}

test('one downward gesture covers the hero and stops exactly at the atlas opening', () => {
  const scene = setup()
  assert.equal(scene.snap.advance(0, 80), true)
  scene.tick(350)
  assert.ok(scene.position() > 0 && scene.position() < 800)
  scene.tick(700)
  assert.equal(scene.position(), 800)
  // Inertia from the same gesture must not advance the atlas timeline.
  assert.equal(scene.snap.advance(0, 20), true)
  scene.tick(950)
  assert.equal(scene.snap.advance(0, 80), false)
  assert.equal(scene.position(), 800)
})

test('normal chapter scrolling, horizontal gestures and reduced motion are untouched', () => {
  const scene = setup()
  assert.equal(scene.snap.advance(90, 10), false)
  assert.equal(scene.snap.advance(0, -80), false)
  scene.setPosition(900)
  assert.equal(scene.snap.advance(0, 80), false)
  scene.setPosition(0)
  scene.disable()
  assert.equal(scene.snap.advance(0, 80), false)
  assert.equal(scene.position(), 0)
})

test('reversing during entry automatically returns the sheet below the viewport', () => {
  const scene = setup()
  scene.snap.advance(0, 80)
  scene.tick(300)
  const position = scene.position()
  assert.equal(scene.snap.advance(0, -20), true)
  assert.equal(scene.position(), position, 'changing direction must not jump')
  scene.tick(1000)
  assert.equal(scene.position(), 0)
})

test('upward input at the opening exits, and downward input during exit reverses it', () => {
  const scene = setup()
  scene.setPosition(800)
  assert.equal(scene.snap.advance(0, -80), true)
  scene.tick(350)
  assert.ok(scene.position() > 0 && scene.position() < 800)
  assert.equal(scene.snap.advance(0, 100), true)
  scene.tick(1050)
  assert.equal(scene.position(), 800)
  scene.tick(1400)
  assert.equal(scene.snap.advance(0, -80), true)
  scene.tick(2100)
  assert.equal(scene.position(), 0)
})

test('a burst of downward wheel events cannot interrupt or restart the entrance', () => {
  const scene = setup()
  const wheel = cancelable => ({
    deltaX: 0, deltaY: 160, cancelable,
    preventDefault: () => { assert.equal(cancelable, true) },
  })
  scene.snap.wheel(wheel(true))
  for (let time = 50; time < 700; time += 50) {
    scene.tick(time)
    scene.snap.wheel(wheel(time % 100 === 0))
  }
  scene.tick(700)
  assert.equal(scene.position(), 800)
  scene.snap.wheel(wheel(false))
  // Simulate an uncancellable native scroll after the event handler.
  scene.setPosition(950)
  scene.tick(716)
  assert.equal(scene.position(), 800)
  scene.snap.wheel(wheel(false))
  scene.setPosition(950)
  scene.tick(1200)
  assert.equal(scene.position(), 800, 'a delayed final frame still corrects native drift')
  assert.equal(scene.snap.advance(0, 80), false)
})

test('upward wheel events reverse a snap even when the event is not cancellable', () => {
  const scene = setup()
  scene.snap.advance(0, 80)
  scene.tick(350)
  scene.snap.wheel({ deltaX: 0, deltaY: -50, cancelable: false, preventDefault: () => assert.fail('not cancellable') })
  scene.tick(1050)
  assert.equal(scene.position(), 0)
})

test('leaving the page cancels both animation and pending inertia correction', () => {
  const scene = setup()
  scene.snap.advance(0, 80)
  scene.tick(300)
  const position = scene.position()
  scene.snap.cancel()
  scene.tick(1000)
  assert.equal(scene.position(), position)
  scene.setPosition(0)
  scene.snap.advance(0, 80)
  scene.tick(1700)
  scene.snap.cancel()
  scene.setPosition(850)
  scene.tick(1800)
  assert.equal(scene.position(), 850)
})
