export type AtlasPoint = { at: number, x?: number, y: number, zoom: number }
export type AtlasTimeline = {
  units: number
  points: AtlasPoint[]
  readings: { start: number, end: number }[]
  outro: number
}

export const clampAtlas = (value: number) => Math.min(1, Math.max(0, value))
export const atlasEase = (value: number) => {
  const t = clampAtlas(value)
  return t * t * (3 - 2 * t)
}

/** Coordinates belong to the same tree throughout; lower y means a higher layer. */
export function createAtlasTimeline (layers: { x?: number, y: number }[]): AtlasTimeline {
  if (!layers.length) { throw new Error('The atlas needs at least one layer') }
  const points: AtlasPoint[] = [
    { at: 0, y: 600, zoom: 0.88 },
    { at: 1.25, y: 780, zoom: 1.3 },
  ]
  const readings: AtlasTimeline['readings'] = []
  const readingUnits = 9
  let cursor = 3
  layers.forEach((layer, index) => {
    points.push({ at: cursor, x: layer.x, y: layer.y, zoom: 2.65 })
    readings.push({ start: cursor, end: cursor + readingUnits })
    cursor += readingUnits
    points.push({ at: cursor, x: layer.x, y: layer.y, zoom: 2.65 })
    const next = layers[index + 1]
    if (next) {
      points.push({ at: cursor + 1.5, x: ((layer.x ?? 500) + (next.x ?? 500)) / 2, y: (layer.y + next.y) / 2, zoom: 1.5 })
      cursor += 3
    }
  })
  const outro = cursor
  points.push(
    { at: cursor + 2.5, y: 360, zoom: 1.35 },
    { at: cursor + 5, y: 600, zoom: 0.88 },
    { at: cursor + 8, y: 600, zoom: 0.88 },
  )
  const units = cursor + 8
  return {
    units,
    points: points.map(point => ({ ...point, at: point.at / units })),
    readings: readings.map(reading => ({ start: reading.start / units, end: reading.end / units })),
    outro: outro / units,
  }
}

/** Pure, reversible scroll -> state mapping. No elapsed-time animations. */
export function sampleAtlas (timeline: AtlasTimeline, progress: number, compact = false) {
  const p = clampAtlas(progress)
  const nextIndex = timeline.points.findIndex(point => point.at >= p)
  const to = timeline.points[Math.max(1, nextIndex)]!
  const from = timeline.points[Math.max(0, nextIndex - 1)]!
  const mix = atlasEase((p - from.at) / (to.at - from.at))
  const layer = timeline.readings.findIndex(reading => p >= reading.start && p <= reading.end)
  const reading = timeline.readings[layer]
  const local = reading ? clampAtlas((p - reading.start) / (reading.end - reading.start)) : 0
  const fade = 1 - atlasEase((local - 0.9) / 0.1)
  const notes = [0.12, 0.29, 0.46, 0.64].map(start => reading ? atlasEase((local - start) / 0.12) * fade : 0)
  // Keep the original compact fade lengths. Only overlap the outgoing
  // tail with the incoming head to avoid two strong text blocks colliding.
  const compactStarts = [0.12, 0.3, 0.48, 0.66]
  const compactNotes = compactStarts.map((start, index) => {
    if (!reading) { return 0 }
    const next = compactStarts[index + 1]
    const exitStart = next === undefined ? 0.92 : next - 0.03
    return atlasEase((local - start) / 0.06) * (1 - atlasEase((local - exitStart) / 0.06))
  })
  return {
    x: (from.x ?? 500) + ((to.x ?? 500) - (from.x ?? 500)) * mix,
    y: from.y + (to.y - from.y) * mix,
    zoom: from.zoom + (to.zoom - from.zoom) * mix,
    layer,
    local,
    title: reading ? atlasEase(local / 0.1) * fade : 0,
    illustration: notes[0] ?? 0,
    notes: compact ? compactNotes : notes,
    map: atlasEase((p * timeline.units - 0.35) / 2.65),
    intro: 1 - atlasEase(p * timeline.units / 1.2),
    unknown: atlasEase((p - timeline.outro) * timeline.units / 2),
    closing: atlasEase((p * timeline.units - (timeline.units - 3)) / 1.2),
    paper: 1 - atlasEase((p * timeline.units - (timeline.units - 0.7)) / 0.7),
  }
}
