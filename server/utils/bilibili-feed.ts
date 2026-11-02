import type { BilibiliVideo, BilibiliVideoFeed } from '../../shared/types/bilibili'
import { siteLinks } from '../../shared/data/links.ts'

const hour = 60 * 60 * 1000
const retryDelay = 5 * 60 * 1000
type Snapshot = { videos: BilibiliVideo[], updatedAt: string }
type RecordValue = Record<string, unknown>

function record (value: unknown): RecordValue {
  return value && typeof value === 'object' ? value as RecordValue : {}
}

function coverUrl (value: unknown): string | undefined {
  if (typeof value !== 'string') { return }
  try {
    const url = new URL(value.startsWith('//') ? `https:${value}` : value)
    if (!['http:', 'https:'].includes(url.protocol) || !/^i\d+\.hdslb\.com$/.test(url.hostname) || !url.pathname.startsWith('/bfs/') || url.username || url.password || url.port) { return }
    url.protocol = 'https:'
    return url.href
  } catch { return }
}

function videoItem (value: unknown): BilibiliVideo | undefined {
  const item = record(value)
  if (typeof item.title !== 'string' || !item.title.trim() || typeof item.url !== 'string' || typeof item.date_published !== 'string') { return }
  const publishedAt = Date.parse(item.date_published)
  if (!Number.isFinite(publishedAt)) { return }
  const match = item.url.match(/^https?:\/\/www\.bilibili\.com\/video\/(BV[A-Za-z0-9]{10})\/?(?:[?#].*)?$/)
  if (!match) { return }
  const html = typeof item.content_html === 'string' ? item.content_html : ''
  const image = html.match(/<img\s[^>]*?\bsrc\s*=\s*["']([^"']+)["']/i)?.[1]
  const cover = coverUrl(item.image) || coverUrl(image)
  if (!cover) { return }
  return { bvid: match[1]!, title: item.title.trim().slice(0, 300), url: `https://www.bilibili.com/video/${match[1]}/`, cover, publishedAt: new Date(publishedAt).toISOString() }
}

export function parseVideoFeed (value: unknown): BilibiliVideo[] {
  const feed = record(value)
  if (typeof feed.home_page_url !== 'string' || feed.home_page_url.replace(/^http:/, 'https:').replace(/\/$/, '') !== siteLinks.bilibili || !Array.isArray(feed.items)) {
    throw new Error('Expected the configured Bilibili account JSON feed')
  }
  const videos = feed.items.map(videoItem).filter((item): item is BilibiliVideo => Boolean(item))
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .filter((item, index, all) => all.findIndex(other => other.bvid === item.bvid) === index).slice(0, 5)
  if (!videos.length) { throw new Error('Feed contains no valid videos') }
  return videos
}

export function createVideoFeedCache (options: {
  seed: BilibiliVideo[]
  load: () => Promise<unknown>
  read?: () => Promise<unknown>
  write?: (snapshot: Snapshot) => Promise<unknown>
  now?: () => number
  onError?: (error: unknown) => void
}) {
  const now = options.now || Date.now
  let snapshot: Snapshot | undefined
  let initialized = false
  let retryAt = 0
  let pending: Promise<BilibiliVideoFeed> | undefined

  async function refresh (): Promise<BilibiliVideoFeed> {
    if (!initialized) {
      initialized = true
      try {
        const saved = record(await options.read?.())
        if (typeof saved.updatedAt === 'string' && Number.isFinite(Date.parse(saved.updatedAt)) && Array.isArray(saved.videos)) {
          const videos = parseVideoFeed({ home_page_url: siteLinks.bilibili, items: saved.videos.map((v) => {
            const video = record(v)
            return { ...video, date_published: video.publishedAt, image: video.cover }
          }) })
          snapshot = { videos, updatedAt: saved.updatedAt }
        }
      } catch (error) { options.onError?.(error) }
    }
    const fresh = snapshot && now() - Date.parse(snapshot.updatedAt) < hour
    if (!fresh && now() >= retryAt) {
      try {
        const videos = parseVideoFeed(await options.load())
        snapshot = { videos, updatedAt: new Date(now()).toISOString() }
        try { await options.write?.(snapshot) } catch (error) { options.onError?.(error) }
      } catch (error) {
        retryAt = now() + retryDelay
        options.onError?.(error)
      }
    }
    return snapshot
      ? { ...snapshot, source: now() - Date.parse(snapshot.updatedAt) < hour ? 'live' : 'cached' }
      : { videos: options.seed, source: 'featured', updatedAt: null }
  }

  return {
    get (): Promise<BilibiliVideoFeed> {
      pending ??= refresh().finally(() => { pending = undefined })
      return pending
    },
  }
}
