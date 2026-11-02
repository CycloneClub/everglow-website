import { featuredBilibiliVideos } from '#shared/data/bilibili'
import { siteLinks } from '#shared/data/links'
import { createVideoFeedCache } from '../utils/bilibili-feed'

let cache: ReturnType<typeof createVideoFeedCache>

export default defineEventHandler((event) => {
  if (!cache) {
    const storage = useStorage('data')
    cache = createVideoFeedCache({
      seed: featuredBilibiliVideos,
      load: () => $fetch(siteLinks.bilibiliFeed, { timeout: 12000, retry: 0, responseType: 'json' }),
      read: () => storage.getItem('bilibili:last-success'),
      write: snapshot => storage.setItem('bilibili:last-success', snapshot),
      onError: () => console.warn('[bilibili] Feed or storage unavailable; retaining saved/featured videos.'),
    })
  }
  setHeader(event, 'Cache-Control', 'public, max-age=60')
  return cache.get()
})
