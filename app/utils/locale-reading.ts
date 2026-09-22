type LocaleRoute = { path: string, query?: Record<string, unknown>, hash?: string }
type ReadingBlock = { id: string, top: number }
export type ReadingLayout = {
  viewport: number
  pageHeight: number
  blocks: ReadingBlock[]
  atlas?: { top: number, height: number, stageHeight: number }
}
export type ReadingPosition =
  | { kind: 'atlas', progress: number, fallback: number }
  | { kind: 'block', id: string, index: number, offset: number, fallback: number }
  | { kind: 'page', fallback: number }

const clamp = (value: number) => Math.max(0, Math.min(1, value))

/** Locale prefixes are the only path segments that may be ignored. */
export function isLocaleOnlyNavigation (from: LocaleRoute, to: LocaleRoute, locales: string[]) {
  const contentPath = (path: string) => {
    const segments = path.split('/')
    if (locales.includes(segments[1] ?? '')) { segments.splice(1, 1) }
    return segments.join('/').replace(/\/+$/, '') || '/'
  }
  const queryKey = (query: Record<string, unknown> = {}) => JSON.stringify(Object.keys(query).sort().map(key => [key, query[key]]))
  return from.path !== to.path
    && contentPath(from.path) === contentPath(to.path)
    && queryKey(from.query) === queryKey(to.query)
    && (from.hash ?? '') === (to.hash ?? '')
}

export function captureReadingPosition (layout: ReadingLayout & { scrollY: number }): ReadingPosition {
  const { scrollY, viewport, pageHeight, atlas, blocks } = layout
  const fallback = clamp(scrollY / Math.max(1, pageHeight - viewport))
  if (atlas && scrollY >= atlas.top && scrollY <= atlas.top + atlas.height - atlas.stageHeight) {
    return { kind: 'atlas', progress: clamp((scrollY - atlas.top) / Math.max(1, atlas.height - atlas.stageHeight)), fallback }
  }
  // Use the block crossing the reading line below the fixed site header.
  const line = scrollY + Math.min(96, viewport * 0.2)
  let index = -1
  blocks.forEach((block, i) => {
    if (block.top <= line && (index === -1 || block.top >= blocks[index]!.top)) { index = i }
  })
  if (index >= 0) {
    const block = blocks[index]!
    return { kind: 'block', id: block.id, index, offset: block.top - scrollY, fallback }
  }
  return { kind: 'page', fallback }
}

export function restoreReadingPosition (position: ReadingPosition, layout: ReadingLayout) {
  const limit = Math.max(0, layout.pageHeight - layout.viewport)
  let top = position.fallback * limit
  if (position.kind === 'atlas' && layout.atlas) {
    top = layout.atlas.top + position.progress * Math.max(0, layout.atlas.height - layout.atlas.stageHeight)
  } else if (position.kind === 'block') {
    const block = (position.id && layout.blocks.find(block => block.id === position.id)) || layout.blocks[position.index]
    if (block) { top = block.top - position.offset }
  }
  return Math.max(0, Math.min(limit, top))
}
