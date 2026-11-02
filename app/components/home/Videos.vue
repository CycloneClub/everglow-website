<script setup lang="ts">
import type { BilibiliVideoFeed } from '#shared/types/bilibili'
import { featuredBilibiliVideos } from '#shared/data/bilibili'
import { siteLinks } from '#shared/data/links'

const { t, locale } = useI18n()
const { data: feed } = useLazyFetch<BilibiliVideoFeed>('/api/bilibili-videos', {
  server: false,
  default: (): BilibiliVideoFeed => ({ videos: featuredBilibiliVideos, source: 'featured', updatedAt: null }),
})
const failedCovers = ref<Record<string, boolean>>({})
const videos = computed(() => feed.value?.videos?.length ? feed.value.videos : featuredBilibiliVideos)
function formatDate (date: string) {
  return new Intl.DateTimeFormat(locale.value, { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Shanghai' }).format(new Date(date))
}
</script>

<template>
  <section
    class="home-videos"
    aria-labelledby="home-videos-title"
  >
    <header class="home-videos__header">
      <h2 id="home-videos-title">
        {{ t('home.videos.title') }}
      </h2>
      <a
        class="home-videos__more"
        :href="siteLinks.bilibili"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ t('home.videos.more') }}
        <Icon name="lucide:arrow-up-right" />
        <span class="home-videos__sr-only">{{ t('home.videos.newTab') }}</span>
      </a>
    </header>
    <ul class="home-videos__grid">
      <li
        v-for="video in videos"
        :key="video.bvid"
      >
        <a
          class="home-videos__card"
          :href="video.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div class="home-videos__visual">
            <img
              v-if="!failedCovers[video.cover]"
              :src="video.cover"
              alt=""
              width="640"
              height="360"
              loading="lazy"
              decoding="async"
              referrerpolicy="no-referrer"
              @error="failedCovers[video.cover] = true"
            >
            <HomeBrandIcon
              v-else
              name="bilibili"
              class="home-videos__fallback"
            />
            <span
              class="home-videos__play"
              aria-hidden="true"
            ><Icon name="lucide:play" /></span>
            <span class="home-videos__watch">{{ t('home.videos.watch') }} <Icon name="lucide:arrow-up-right" /></span>
          </div>
          <div class="home-videos__info">
            <h3 :title="video.title">{{ video.title }}</h3>
            <time :datetime="video.publishedAt">{{ formatDate(video.publishedAt) }}</time>
          </div>
          <span class="home-videos__sr-only">{{ t('home.videos.newTab') }}</span>
        </a>
      </li>
    </ul>
  </section>
</template>

<style lang="scss" scoped>
.home-videos {
  margin-top: clamp(1.75rem, 4vh, 3rem);
  padding-top: 1.5rem;
  border-top: 1px solid var(--everglow-trans-black-3);
}

.home-videos__header {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.25rem;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.home-videos__header h2 {
  font-size: clamp(1.4rem, 2vw, 1.85rem);
  font-weight: 500;
}

.home-videos__more {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--everglow-blue-5);
  font-size: 0.9375rem;

  &:hover { text-decoration: underline; }
}

.home-videos__grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 1.25rem;
  padding: 0;
  list-style: none;

  li { min-width: 0; }
}

.home-videos__card {
  display: block;
  height: 100%;
  color: inherit;
  border-radius: 0.6rem;
}

.home-videos__visual {
  position: relative;
  display: grid;
  place-items: center;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: linear-gradient(135deg, #172936, #28495a);
  border: 1px solid var(--everglow-trans-black-3);
  border-radius: 0.6rem;

  &::after {
    position: absolute;
    inset: 0;
    content: '';
    background: linear-gradient(transparent 50%, rgb(0 0 0 / 45%));
    pointer-events: none;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.home-videos__fallback { width: 4rem; height: 4rem; color: #8daab8; }

.home-videos__play {
  position: absolute;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  color: #fff;
  background: rgb(0 0 0 / 45%);
  border: 1px solid rgb(255 255 255 / 65%);
  border-radius: 50%;

  .iconify { margin-left: 0.15rem; font-size: 1.25rem; }
}

.home-videos__watch {
  position: absolute;
  z-index: 1;
  right: 0.75rem;
  bottom: 0.6rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #fff;
  font-size: 0.75rem;
}

.home-videos__info {
  padding-top: 0.75rem;

  h3 {
    display: -webkit-box;
    overflow: hidden;
    font-size: 1rem;
    font-weight: 500;
    line-height: 1.5;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  time {
    display: block;
    margin-top: 0.35rem;
    color: var(--everglow-font-color-1);
    font-size: 0.8125rem;
  }
}

.home-videos__card:focus-visible,
.home-videos__more:focus-visible {
  outline: 2px solid var(--everglow-blue-5);
  outline-offset: 5px;
}

.home-videos__card:hover h3 { color: var(--everglow-blue-5); }

.home-videos__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .home-videos__visual img { transition: transform 0.25s ease; }
  .home-videos__card:hover img { transform: scale(1.035); }
}

@media (max-width: 833px) {
  .home-videos__grid { grid-template-columns: 1fr; gap: 1.5rem; }
}
</style>
