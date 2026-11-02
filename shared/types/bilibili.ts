export interface BilibiliVideo {
  bvid: string
  title: string
  url: string
  cover: string
  publishedAt: string
}

export interface BilibiliVideoFeed {
  videos: BilibiliVideo[]
  source: 'live' | 'cached' | 'featured'
  updatedAt: string | null
}
