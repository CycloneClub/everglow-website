import assert from 'node:assert/strict'
import test from 'node:test'
import { foldPaperPoint, paperHandoff } from '../app/utils/parchment-fold.ts'

test('the resting sheet exactly matches the readable page at every sampled point', () => {
  for (const [width, height] of [[1200, 800], [390, 844]]) {
    for (const u of [0, 0.25, 0.5, 0.75, 1]) {
      for (const v of [0, 0.25, 0.5, 0.75, 1]) {
        const result = foldPaperPoint(width, height, 1, u * width, v * height)
        assert.equal(result.x, u * width)
        assert.equal(result.y, v * height)
        assert.equal(result.z, 0)
      }
    }
  }
})

test('the folded sheet starts completely outside the viewport', () => {
  for (const u of [0, 0.25, 0.5, 0.75, 1]) {
    for (const v of [0, 0.25, 0.5, 0.75, 1]) {
      const point = foldPaperPoint(1200, 800, 0, u * 1200, v * 800)
      assert.ok(point.x > 1200 || point.y > 800)
    }
  }
})

test('the bottom-right corner settles before the top-left, with a flexible surface between them', () => {
  const settled = foldPaperPoint(1000, 1000, 0.5, 1000, 1000)
  const bent = foldPaperPoint(1000, 1000, 0.5, 500, 500)
  const waiting = foldPaperPoint(1000, 1000, 0.5, 0, 0)
  assert.deepEqual([settled.x, settled.y, settled.z], [1000, 1000, 0])
  assert.ok(bent.z > 30, 'the centre bends out of the screen instead of remaining a rigid plane')
  assert.ok(waiting.z > bent.z, 'the unlaid corner remains raised')
})

test('reversing progress retraces the same paper and adjacent vertices have no hinge jump', () => {
  const forward = foldPaperPoint(1200, 800, 0.55, 480, 320)
  foldPaperPoint(1200, 800, 0.8, 480, 320)
  assert.deepEqual(foldPaperPoint(1200, 800, 0.55, 480, 320), forward)
  for (let x = 0; x < 1200; x += 8) {
    const a = foldPaperPoint(1200, 800, 0.5, x, 400)
    const b = foldPaperPoint(1200, 800, 0.5, x + 1, 400)
    assert.ok(Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) < 2)
  }
})

test('the handoff never makes the whole sheet translucent over the hero', () => {
  for (const progress of [0.94, 0.95, 0.97, 0.99, 1]) {
    const opacity = paperHandoff(progress)
    const combined = opacity.paper + opacity.canvas * (1 - opacity.paper)
    assert.equal(combined, 1, 'at least one complete sheet must stay opaque throughout handoff')
  }
  assert.deepEqual(paperHandoff(1), { paper: 1, canvas: 0 })
})

test('static reading rolls vertically from below without dragging the page sideways', () => {
  for (const progress of [0, 0.3, 0.5, 0.8, 1]) {
    for (const x of [0, 300, 600]) {
      const point = foldPaperPoint(600, 800, progress, x, 400, 'up')
      assert.equal(point.x, x)
    }
  }
  const lowerEdge = foldPaperPoint(600, 800, 0.5, 300, 800, 'up')
  const middle = foldPaperPoint(600, 800, 0.5, 300, 400, 'up')
  assert.equal(lowerEdge.z, 0)
  assert.ok(middle.z > 20)
  assert.deepEqual(foldPaperPoint(600, 800, 1, 300, 400, 'up'), { x: 300, y: 400, z: 0, shade: 1 })
})
