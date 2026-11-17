import assert from 'node:assert/strict'
import test from 'node:test'
import { atlasReadingIndex, atlasScrollProgress, atlasTurnDuration, atlasTurnEasing, createAtlasReadingStops, createAtlasTimeline, sampleAtlas } from '../app/utils/atlas-timeline.ts'
import { atlasLayers } from '../app/data/world-atlas.ts'

const layers = [920, 710, 500].map(y => ({ y, details: [{}, {}, {}, {}] }))

test('the exit darkens gradually across the final approach', () => {
  const timeline = createAtlasTimeline(layers)
  const stop = createAtlasReadingStops(timeline).at(-1)
  assert.equal(sampleAtlas(timeline, stop).paper, 1)
  const early = sampleAtlas(timeline, 1 - 2 / timeline.units).paper
  const late = sampleAtlas(timeline, 1 - 1 / timeline.units).paper
  assert.ok(early > 0.8 && early < 1, 'begin shading well before the final instant')
  assert.ok(late > 0 && late < early, 'keep an extended intermediate shade')
  assert.equal(sampleAtlas(timeline, 1).paper, 0)
})

test('published regions include Betty and preserve the boat-island-boss sequence', () => {
  const town = atlasLayers.find(layer => layer.id === 'town')
  const kelp = atlasLayers.find(layer => layer.id === 'kelp')
  assert.equal(town.details.filter(detail => detail.id === 'betty').length, 1)
  assert.deepEqual(kelp.details.map(detail => detail.id), ['black-awning-boat', 'isle-of-bloom', 'vampire-mat'])
  const timeline = createAtlasTimeline(atlasLayers)
  const stops = createAtlasReadingStops(timeline)
  let cursor = 1
  for (const [index, layer] of atlasLayers.entries()) {
    for (let detail = 0; detail < layer.details.length; detail++) {
      const state = sampleAtlas(timeline, stops[cursor + detail + 1], true)
      assert.equal(state.layer, index)
      assert.equal(state.notes[detail], 1)
    }
    cursor += layer.details.length + 1
  }
})

test('cross-layer movement and reveal have the same time budget as the first arrival', () => {
  const timeline = createAtlasTimeline(layers)
  const stops = createAtlasReadingStops(timeline)
  const smooth = t => t ** 3 * (t * (t * 6 - 15) + 10)
  function measure (from, to, start, end) {
    const duration = atlasTurnDuration(timeline, stops[from], stops[to])
    const samples = Array.from({ length: duration + 1 }, (_, ms) => {
      const ease = atlasTurnEasing(timeline, stops[from], stops[to])?.(ms / duration) ?? smooth(ms / duration)
      return stops[from] + (stops[to] - stops[from]) * ease
    })
    return samples.findIndex(p => p >= end - 1e-10) - samples.findIndex(p => p >= start - 1e-10)
  }
  const firstMove = measure(0, 1, 0, timeline.readings[0].start)
  const crossMove = measure(5, 6, timeline.readings[0].end, timeline.readings[1].start)
  assert.ok(Math.abs(firstMove - crossMove) < 5, `camera movement: first=${firstMove}ms cross=${crossMove}ms`)
  const firstReveal = measure(0, 1, timeline.readings[0].start, stops[1])
  const crossReveal = measure(5, 6, timeline.readings[1].start, stops[6])
  assert.ok(Math.abs(firstReveal - crossReveal) < 5)
})

test('turn duration distinguishes local annotations from large camera movements in both directions', () => {
  const timeline = createAtlasTimeline(layers)
  const stops = createAtlasReadingStops(timeline)
  for (const [from, to, duration] of [[1, 2, 1500], [2, 3, 1500], [3, 4, 1500], [5, 6, 6000], [0, 1, 4500], [15, 16, 3000]]) {
    assert.equal(atlasTurnDuration(timeline, stops[from], stops[to]), duration)
    assert.equal(atlasTurnDuration(timeline, stops[to], stops[from]), duration)
  }
  const betweenLayers = (timeline.readings[0].end + timeline.readings[1].start) / 2
  assert.equal(atlasTurnDuration(timeline, betweenLayers, stops[6]), 4500)
})

test('mobile reading stops land on complete titles and annotations in every layer', () => {
  const timeline = createAtlasTimeline(layers)
  const stops = createAtlasReadingStops(timeline)
  assert.equal(stops.length, 17)
  assert.equal(stops[0], 0)
  for (let layer = 0; layer < layers.length; layer++) {
    const title = sampleAtlas(timeline, stops[1 + layer * 5], true)
    assert.equal(title.layer, layer)
    assert.equal(title.title, 1)
    for (let note = 0; note < 4; note++) {
      const state = sampleAtlas(timeline, stops[2 + layer * 5 + note], true)
      assert.equal(state.layer, layer)
      assert.equal(state.notes[note], 1)
      assert.equal(state.illustration, 1)
      assert.equal(state.zoom, 2.65)
    }
  }
  assert.equal(stops.at(-1), timeline.outro + 2.5 / timeline.units, 'no separate quote or empty final stop')
  const unknown = sampleAtlas(timeline, stops.at(-1), true)
  assert.equal(unknown.unknown, 1)
  assert.equal(unknown.returning, 0)
  assert.equal(unknown.paper, 1)
  assert.ok(stops.every((stop, index) => !index || stop > stops[index - 1]))
})

test('the first wheel stop focuses the town with its introduction fully visible', () => {
  const timeline = createAtlasTimeline(layers)
  const stops = createAtlasReadingStops(timeline)
  const title = sampleAtlas(timeline, stops[1])
  assert.equal(title.layer, 0)
  assert.equal(title.y, layers[0].y)
  assert.equal(title.zoom, 2.65)
  assert.equal(title.title, 1)
  assert.equal(title.illustration, 1, 'scenery must arrive with the introduction')
})

test('regional introductions fade gradually only after the camera has stopped', () => {
  const timeline = createAtlasTimeline(layers)
  const stops = createAtlasReadingStops(timeline)
  for (const [from, to] of [[0, 1], [5, 6]]) {
    const duration = atlasTurnDuration(timeline, stops[from], stops[to])
    const destination = sampleAtlas(timeline, stops[to]).layer
    const frames = Array.from({ length: duration / 10 + 1 }, (_, index) => {
      const time = index * 10
      const t = time / duration
      const eased = atlasTurnEasing(timeline, stops[from], stops[to])?.(t) ?? t ** 3 * (t * (t * 6 - 15) + 10)
      const state = sampleAtlas(timeline, stops[from] + (stops[to] - stops[from]) * eased)
      if (state.layer === destination && state.illustration > 0 && state.illustration < 1) {
        assert.equal(state.y, layers[destination].y, 'camera must be stationary throughout the reveal')
        assert.equal(state.zoom, 2.65)
      }
      return { time, opacity: state.layer === destination ? state.illustration : 0 }
    })
    const low = frames.find(frame => frame.opacity >= 0.1).time
    const high = frames.find(frame => frame.opacity >= 0.9).time
    assert.ok(high - low >= 600, `regional fade is compressed to ${high - low}ms`)
    const approach = sampleAtlas(timeline, timeline.readings[destination].start - 0.5 / timeline.units)
    assert.equal(approach.illustration, 0)
    const arrived = sampleAtlas(timeline, timeline.readings[destination].start + 0.1 / timeline.units)
    assert.equal(arrived.y, layers[destination].y)
    assert.equal(arrived.illustration, 0, 'allow the camera to settle before revealing content')
    const revealing = sampleAtlas(timeline, timeline.readings[destination].start + 1.5 / timeline.units)
    assert.ok(revealing.illustration > 0 && revealing.illustration < 1)
    assert.equal(revealing.illustration, revealing.title)
    assert.ok(revealing.notes.every(opacity => opacity === 0))
  }
})

test('regions create stops only for their own detail cards', () => {
  const timeline = createAtlasTimeline([
    { y: 920, details: [{}, {}] },
    { y: 750, details: [{}] },
    { y: 500, details: [] },
  ])
  const stops = createAtlasReadingStops(timeline)
  assert.equal(stops.length, 8, 'overview, three introductions, three details, and the unknown-region stop')
  let cursor = 1
  for (const [index, count] of [2, 1, 0].entries()) {
    for (const compact of [false, true]) {
      const intro = sampleAtlas(timeline, stops[cursor], compact)
      assert.equal(intro.layer, index)
      assert.equal(intro.title, 1)
      assert.equal(intro.illustration, 1)
      assert.equal(intro.notes.length, count)
      for (let note = 0; note < count; note++) {
        const state = sampleAtlas(timeline, stops[cursor + note + 1], compact)
        assert.equal(state.notes[note], 1)
        assert.equal(state.illustration, 1)
        if (compact) { assert.equal(state.notes.filter(value => value > 0.1).length, 1) }
      }
    }
    cursor += count + 1
  }
  assert.ok(timeline.readings[0].end - timeline.readings[0].start > timeline.readings[2].end - timeline.readings[2].start)
})

test('manual scrolling resolves to the nearest reading stop for forward and back controls', () => {
  const stops = [0, 0.2, 0.4, 0.6, 0.9]
  assert.equal(atlasReadingIndex(stops, 0.22), 1)
  assert.equal(atlasReadingIndex(stops, 0.38), 2)
  assert.equal(atlasReadingIndex(stops, -0.1), 0)
  assert.equal(atlasReadingIndex(stops, 1), 4)
})

test('reading progress depends on stable composition height, not browser toolbar height', () => {
  const timeline = createAtlasTimeline(layers.slice(0, 2))
  const distance = 700 * timeline.units * 0.46
  const offset = -distance / 2
  const progress = atlasScrollProgress(offset, 700, timeline.units)
  assert.equal(progress, 0.5)
  assert.equal(atlasScrollProgress(offset / 2, 350, timeline.units), progress, 'a true resize uses the new composition height')
  assert.equal(atlasScrollProgress(100, 700, timeline.units), 0)
  assert.equal(atlasScrollProgress(-distance, 700, timeline.units), 1)
  assert.equal(atlasScrollProgress(-distance * 2, 700, timeline.units), 1)
  assert.equal(atlasScrollProgress(0, 0, timeline.units), 0)
})

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
  assert.equal(transition.illustration, 0)
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
  assert.ok(at(0.4).notes[0] > 0.9)
  assert.equal(at(0.3).notes[3], 0)
  assert.ok(at(0.85).notes.every(value => value > 0.9))
  assert.ok(at(0.999).notes.every(value => value < 0.01))
})

test('new layers extend the journey while preserving the full-tree ending', () => {
  const original = createAtlasTimeline(layers)
  const extended = createAtlasTimeline([...layers, { y: 340 }])
  assert.equal(extended.readings.length, 4)
  assert.ok(extended.units > original.units)
  assert.equal(sampleAtlas(extended, 1).zoom, sampleAtlas(extended, 0).zoom)
  assert.equal(sampleAtlas(extended, 1).y, sampleAtlas(extended, 0).y)
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
  const span = (end - start) * timeline.units
  const at = elapsed => sampleAtlas(timeline, start + elapsed / timeline.units, true)
  assert.ok(Math.abs(at(3.8).notes[0] - 0.5) < 0.001, 'entrance must remain gradual')
  for (const middle of [5.65, 7.65, 9.65]) {
    const state = at(middle)
    const visible = state.notes.filter(value => value > 0.1)
    assert.equal(visible.length, 2, 'two neighboring notes should share the handoff')
    assert.ok(visible.every(value => Math.abs(value - 0.15625) < 0.001), 'only the tails overlap, not two half-visible text blocks')
    assert.equal(state.illustration, 1, 'the region remains visible during handoffs')
  }
  for (let step = 410; step <= (span - 0.8) * 100; step++) {
    const state = at(step / 100)
    assert.ok(state.notes.reduce((sum, value) => sum + value, 0) >= 0.3124, 'handoffs must never be blank')
  }
  assert.ok(Math.abs(at(span - 0.5).notes[3] - 0.5) < 0.001, 'the final fade remains gradual')
})
