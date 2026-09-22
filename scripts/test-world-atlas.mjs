import assert from 'node:assert/strict'
import test from 'node:test'
import { createAtlasTimeline, sampleAtlas } from '../app/utils/atlas-timeline.ts'

const layers = [{ y: 920 }, { y: 710 }, { y: 500 }]

test('the first short scroll starts the camera instead of holding a still overview', () => {
  const timeline = createAtlasTimeline(layers)
  // A quarter unit is about 11.5vh: one small wheel gesture after docking.
  const early = sampleAtlas(timeline, 0.25 / timeline.units)
  assert.ok(early.zoom > 0.9)
  assert.ok(early.y > 600)
  assert.ok(early.intro < 1)
  assert.ok(sampleAtlas(timeline, 0.75 / timeline.units).map > 0)
})

test('scrolling advances from lower layers to higher layers through a wider view', () => {
  const timeline = createAtlasTimeline(layers)
  const readings = timeline.readings
  let previousY = Infinity
  for (const reading of readings) {
    const middle = (reading.start + reading.end) / 2
    const state = sampleAtlas(timeline, middle)
    assert.ok(state.y < previousY, 'the world camera must travel upward')
    assert.equal(state.layer, readings.indexOf(reading))
    previousY = state.y
  }
  const transition = sampleAtlas(timeline, (readings[0].end + readings[1].start) / 2)
  assert.ok(transition.zoom < sampleAtlas(timeline, readings[0].start).zoom)
  assert.equal(transition.layer, -1)
})

test('the camera is continuous and rewinding returns exactly the same state', () => {
  const timeline = createAtlasTimeline(layers)
  // Keep scroll distance per sample fixed when reading durations change.
  const steps = timeline.units * 30
  const forward = Array.from({ length: steps + 1 }, (_, i) => sampleAtlas(timeline, i / steps))
  for (let i = steps; i >= 0; i--) {
    assert.deepEqual(sampleAtlas(timeline, i / steps), forward[i])
    if (i > 0) {
      assert.ok(Math.abs(forward[i].y - forward[i - 1].y) < 8)
      assert.ok(Math.abs(forward[i].zoom - forward[i - 1].zoom) < 0.08)
    }
  }
})

test('annotations appear progressively and withdraw before leaving the layer', () => {
  const timeline = createAtlasTimeline(layers)
  const { start, end } = timeline.readings[0]
  const at = fraction => sampleAtlas(timeline, start + (end - start) * fraction)
  assert.equal(at(0).notes[3], 0)
  assert.ok(at(0.3).notes[0] > 0.9)
  assert.equal(at(0.3).notes[3], 0)
  assert.ok(at(0.85).notes.every(value => value > 0.9))
  assert.ok(at(0.999).notes.every(value => value < 0.01))
})

test('new layers extend the journey while preserving the full-tree ending', () => {
  const original = createAtlasTimeline(layers)
  const extended = createAtlasTimeline([...layers, { y: 340 }])
  assert.equal(extended.readings.length, 4)
  assert.ok(extended.units > original.units)
  assert.equal(sampleAtlas(extended, 0.96).zoom, sampleAtlas(extended, 0).zoom)
  assert.equal(sampleAtlas(extended, 0.96).y, sampleAtlas(extended, 0).y)
  assert.deepEqual(sampleAtlas(extended, -1), sampleAtlas(extended, 0))
  assert.deepEqual(sampleAtlas(extended, 2), sampleAtlas(extended, 1))
  assert.throws(() => createAtlasTimeline([]), /layer/i)
})

test('a newly charted side branch becomes the camera target', () => {
  const timeline = createAtlasTimeline([{ x: 500, y: 920 }, { x: 335, y: 635 }])
  const reading = timeline.readings[1]
  assert.equal(sampleAtlas(timeline, (reading.start + reading.end) / 2).x, 335)
})

test('compact notes retain gradual fades and overlap the next entrance with the previous exit', () => {
  const timeline = createAtlasTimeline(layers)
  const { start, end } = timeline.readings[0]
  const at = local => sampleAtlas(timeline, start + (end - start) * local, true)
  assert.ok(Math.abs(at(0.15).notes[0] - 0.5) < 0.001, 'the original gradual entrance must be retained')
  for (const middle of [0.315, 0.495, 0.675]) {
    const state = at(middle)
    const visible = state.notes.filter(value => value > 0.1)
    assert.equal(visible.length, 2, 'two neighboring notes should share the handoff')
    assert.ok(visible.every(value => Math.abs(value - 0.15625) < 0.001), 'only the tails overlap, not two half-visible text blocks')
    assert.equal(state.illustration, 1, 'the region remains visible during handoffs')
  }
  for (let step = 180; step <= 920; step++) {
    const state = at(step / 1000)
    assert.ok(state.notes.reduce((sum, value) => sum + value, 0) >= 0.3124, 'handoffs must never be blank')
  }
  assert.ok(Math.abs(at(0.95).notes[3] - 0.5) < 0.001, 'the final fade also retains its length')
})
