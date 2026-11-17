export type AtlasPoint = { at: number, x?: number, y: number, zoom: number }
export type AtlasTimeline = {
  units: number
  points: AtlasPoint[]
  readings: { start: number, end: number, detailCount: number }[]
  outro: number
}

export const clampAtlas = (value: number) => Math.min(1, Math.max(0, value))
/** Toolbar expansion changes the paper's coverage, never the reading distance. */
export const atlasScrollProgress = (top: number, compositionHeight: number, units: number) =>
  clampAtlas(-top / Math.max(1, compositionHeight * units * 0.46))

export const atlasEase = (value: number) => {
  const t = clampAtlas(value)
  return t * t * (3 - 2 * t)
}

/** Coordinates belong to the same tree throughout; lower y means a higher layer. */
export function createAtlasTimeline (layers: { x?: number, y: number, details?: readonly unknown[] }[]): AtlasTimeline {
  if (!layers.length) { throw new Error('The atlas needs at least one layer') }
  const points: AtlasPoint[] = [
    { at: 0, y: 600, zoom: 0.88 },
    { at: 1.25, y: 780, zoom: 1.3 },
  ]
  const readings: AtlasTimeline['readings'] = []
  let cursor = 3
  layers.forEach((layer, index) => {
    const detailCount = layer.details?.length ?? 0
    const readingUnits = 5 + detailCount * 2
    points.push({ at: cursor, x: layer.x, y: layer.y, zoom: 2.65 })
    readings.push({ start: cursor, end: cursor + readingUnits, detailCount })
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
    { at: cursor + 6, y: 600, zoom: 0.88 },
  )
  const units = cursor + 6
  return {
    units,
    points: points.map(point => ({ ...point, at: point.at / units })),
    readings: readings.map(reading => ({ ...reading, start: reading.start / units, end: reading.end / units })),
    outro: outro / units,
  }
}

/** Reading controls target complete content, never a fade or camera transition. */
export function createAtlasReadingStops (timeline: AtlasTimeline): number[] {
  // Camera focus and the introduction share one stop. The reading boundary
  // remains an interpolation point, not a separate stop with invisible content.
  return [
    0,
    ...timeline.readings.flatMap(({ start, detailCount }) =>
      [3, ...Array.from({ length: detailCount }, (_, index) => 4.5 + index * 2)]
        .map(offset => start + offset / timeline.units)),
    timeline.outro + 2.5 / timeline.units,
  ]
}

export function atlasReadingIndex (stops: number[], progress: number) {
  return stops.reduce((nearest, stop, index) =>
    Math.abs(stop - progress) < Math.abs(stops[nearest]! - progress) ? index : nearest, 0)
}

function crossLayerTurn (timeline: AtlasTimeline, from: number, to: number) {
  const low = Math.min(from, to)
  const high = Math.max(from, to)
  const nextIndex = timeline.readings.findIndex(({ start }) => Math.abs(high - start - 3 / timeline.units) < 0.000001)
  if (nextIndex <= 0) { return undefined }
  const previous = timeline.readings[nextIndex - 1]!
  if (low < previous.start || low >= previous.end) { return undefined }
  return { low, high, departure: previous.end, arrival: timeline.readings[nextIndex]!.start }
}

const turnEase = (t: number) => t ** 3 * (t * (t * 6 - 15) + 10)

/** Keep cross-layer camera/reveal timing equal to the two halves of 0 -> 1. */
export function atlasTurnEasing (timeline: AtlasTimeline, from: number, to: number) {
  const turn = crossLayerTurn(timeline, from, to)
  if (!turn) { return undefined }
  return (progress: number) => {
    const time = (from < to ? progress : 1 - progress) * 6000
    let position: number
    if (time < 1500) {
      position = turn.low + (turn.departure - turn.low) * turnEase(time / 1500)
    } else if (time < 3750) {
      position = turn.departure + (turn.arrival - turn.departure) * 2 * turnEase((time - 1500) / 4500)
    } else {
      position = turn.arrival + (turn.high - turn.arrival) * (2 * turnEase(0.5 + (time - 3750) / 4500) - 1)
    }
    return clampAtlas((position - from) / (to - from))
  }
}

export function atlasTurnDuration (timeline: AtlasTimeline, from: number, to: number) {
  if (crossLayerTurn(timeline, from, to)) { return 6000 }
  const reading = timeline.readings.find(({ start, end }) => from >= start && from <= end)
  if (reading && to >= reading.start && to <= reading.end) { return 1500 }
  const includesIntroduction = timeline.readings.some(({ start }) => {
    const introduction = start + 3 / timeline.units
    return Math.abs(from - introduction) < 0.000001 || Math.abs(to - introduction) < 0.000001
  })
  // A regional arrival contains camera movement followed by a stationary reveal.
  return includesIntroduction ? 4500 : 3000
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
  const span = reading ? (reading.end - reading.start) * timeline.units : 0
  const elapsed = reading ? (p - reading.start) * timeline.units : 0
  const fade = 1 - atlasEase((elapsed - (span - 0.8)) / 0.8)
  const detailStarts = Array.from({ length: reading?.detailCount ?? 0 }, (_, index) => 3.5 + index * 2)
  const notes = detailStarts.map(start => atlasEase((elapsed - start) / 0.8) * fade)
  // On narrow screens only the fading tails of adjacent cards overlap.
  const compactNotes = detailStarts.map((start, index) => {
    const next = detailStarts[index + 1]
    const exitStart = next === undefined ? span - 0.8 : next - 0.3
    return atlasEase((elapsed - start) / 0.6) * (1 - atlasEase((elapsed - exitStart) / 0.6))
  })
  // The camera is fixed throughout the reading segment. Give it a short rest,
  // then reveal scenery and copy together before the introduction's single stop.
  const title = reading ? atlasEase((elapsed - 0.25) / 2.5) * fade : 0
  return {
    x: (from.x ?? 500) + ((to.x ?? 500) - (from.x ?? 500)) * mix,
    y: from.y + (to.y - from.y) * mix,
    zoom: from.zoom + (to.zoom - from.zoom) * mix,
    layer,
    local,
    title,
    illustration: title,
    notes: compact ? compactNotes : notes,
    map: atlasEase((p * timeline.units - 0.35) / 2.65),
    intro: 1 - atlasEase(p * timeline.units / 1.2),
    unknown: atlasEase((p - timeline.outro) * timeline.units / 2),
    returning: atlasEase(((p - timeline.outro) * timeline.units - 2.5) / 2.5),
    paper: 1 - turnEase(clampAtlas((p * timeline.units - (timeline.units - 2.5)) / 2.5)),
  }
}
