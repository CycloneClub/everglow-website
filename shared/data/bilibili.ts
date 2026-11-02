import type { BilibiliVideo } from '../types/bilibili'

// Verified against each public video page and owner UID on 2026-11-02.
// Editorial fallback only: this is not a complete latest-upload snapshot.
export const featuredBilibiliVideos: BilibiliVideo[] = [
  {
    bvid: 'BV1ABQGBqEoW',
    title: '灯笼月15波Boss掉落武器展示',
    url: 'https://www.bilibili.com/video/BV1ABQGBqEoW/',
    cover: 'https://i0.hdslb.com/bfs/archive/5ca5a1169e4ca5cf471d26d5a71c9abcfb5e62e9.jpg',
    publishedAt: new Date(1776176841 * 1000).toISOString(),
  },
  {
    bvid: 'BV1M26zBdEpK',
    title: '[流光无际 | Everglow] 灯笼月事件重置换元',
    url: 'https://www.bilibili.com/video/BV1M26zBdEpK/',
    cover: 'https://i2.hdslb.com/bfs/archive/44f4e83aac3bfb925796837cb55d13bb0d9a1f22.jpg',
    publishedAt: new Date(1769787340 * 1000).toISOString(),
  },
  {
    bvid: 'BV1Qx4y1y7RA',
    title: '流光无际Mod：一些新内容和效果优化',
    url: 'https://www.bilibili.com/video/BV1Qx4y1y7RA/',
    cover: 'https://i1.hdslb.com/bfs/archive/790a86300910418b1f025f49a15d61c603d95fd2.jpg',
    publishedAt: new Date(1708488000 * 1000).toISOString(),
  },
  {
    bvid: 'BV1Wg4y1s7ja',
    title: '[流光无际]近期武器更新 - 棍棒, 弹弓及其它',
    url: 'https://www.bilibili.com/video/BV1Wg4y1s7ja/',
    cover: 'https://i0.hdslb.com/bfs/archive/770f59a0f21c284b379d9505c408a22d0caffa8d.jpg',
    publishedAt: '2023-03-25T04:39:09.000Z',
  },
  {
    bvid: 'BV1Me411N7sZ',
    title: '水晶颅骨升级之后的魔法书',
    url: 'https://www.bilibili.com/video/BV1Me411N7sZ/',
    cover: 'https://i1.hdslb.com/bfs/archive/4ba1c8380d7c102ffc7b1a16504a2dce46fe966c.jpg',
    publishedAt: '2022-12-02T15:54:26.000Z',
  },
]
