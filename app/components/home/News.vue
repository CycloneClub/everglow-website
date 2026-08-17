<script setup lang="ts">
import type { NewsCollectionItem } from '@nuxt/content'

const { t, locale } = useI18n()

const { data: list } = await useAsyncData(
  `home-news-${locale.value}`,
  () =>
    queryCollection(newsCollectionKey(locale.value))
      .order('date', 'DESC')
      .limit(3)
      .all(),
  { watch: [locale] },
)

const cards = computed(() => {
  const articles = (list.value ?? []) as NewsCollectionItem[]
  return Array.from({ length: 3 }, (_, i) => {
    const item = articles[i]
    if (!item) {
      return {
        description: t('home.news.placeholderDescription'),
        key: `placeholder-${i}`,
        linked: false,
        title: t('home.news.placeholderTitle'),
      }
    }
    return {
      date: item.date ? String(item.date).slice(0, 10) : undefined,
      description:
        item.description?.trim() || t('home.news.placeholderDescription'),
      image: item.image,
      key: item.path || `article-${i}`,
      linked: Boolean(item.path),
      title: item.title?.trim() || t('home.news.placeholderTitle'),
      to: item.path,
    }
  })
})
</script>

<template>
  <section
    id="news"
    class="home-news"
    aria-labelledby="news-title"
  >
    <div class="home-news__inner">
      <header>
        <h2 id="news-title">
          {{ $t('body.header.news') }}
        </h2>
        <NuxtLinkLocale
          class="home-news__more"
          to="/news"
        >
          {{ $t('home.news.more') }}
          <Icon name="lucide:arrow-up-right" />
        </NuxtLinkLocale>
      </header>
      <ul>
        <li
          v-for="card in cards"
          :key="card.key"
        >
          <NuxtLinkLocale
            v-if="card.linked"
            class="home-news__card"
            :to="card.to"
          >
            <div
              class="home-news__visual"
              :class="{ 'has-image': card.image }"
              :style="card.image
                ? { backgroundImage: `url('${card.image}')` }
                : undefined"
            />
            <div>
              <h3>{{ card.title }}</h3>
              <p>{{ card.description }}</p>
              <time v-if="card.date">{{ card.date }}</time>
            </div>
          </NuxtLinkLocale>
          <div
            v-else
            class="home-news__card home-news__card--placeholder"
          >
            <div class="home-news__visual" />
            <div>
              <h3>{{ card.title }}</h3>
              <p>{{ card.description }}</p>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style lang="scss" scoped>
  .home-news {
    display: flex;
    flex-direction: column;
    height: 100dvh;
    padding: calc(var(--header-height) + 1.25rem) max(1.5rem, 7vw)
      max(2rem, 6vh);
    color: var(--everglow-black);
    background: var(--everglow-white);
  }

  .home-news__inner {
    display: flex;
    flex: 0 0 58%;
    flex-direction: column;
    gap: 1.25rem;
    width: 100%;
    min-height: 0;

    header {
      display: flex;
      flex-shrink: 0;
      gap: 1rem;
      align-items: baseline;
      justify-content: space-between;
    }

    h2 {
      font-size: clamp(2.25rem, 4.5vw, 3.75rem);
      font-weight: 500;
      letter-spacing: 0.02em;
    }

    ul {
      display: grid;
      flex: 1;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1.25rem;
      min-height: 0;
      align-items: stretch;

      > li {
        display: flex;
        min-width: 0;
      }
    }
  }

  .home-news__more {
    display: inline-flex;
    gap: 0.25rem;
    align-items: center;
    color: var(--everglow-blue-5);
    font-size: 1.0625rem;

    &:hover {
      text-decoration: underline;
    }
  }

  .home-news__card {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
    color: inherit;
    background: var(--everglow-grey-0);
    border: 1px solid var(--everglow-trans-black-3);
    border-radius: 0.75rem;
    transition:
      transform 0.15s ease,
      border-color 0.15s ease;

    &:hover {
      border-color: var(--everglow-blue-5);
      transform: translateY(-0.2rem);
    }

    &--placeholder {
      opacity: 0.78;

      &:hover {
        border-color: var(--everglow-trans-black-3);
        transform: none;
      }
    }

    > div:last-child {
      display: flex;
      flex: 0 0 auto;
      flex-direction: column;
      padding: 1rem 1.15rem 1.1rem;

      h3 {
        font-size: 1.25rem;
        font-weight: 500;
        line-height: 1.4;
      }

      p {
        display: -webkit-box;
        margin-top: 0.45rem;
        overflow: hidden;
        color: var(--everglow-font-color-1);
        font-size: 1.0625rem;
        line-height: 1.55;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      time {
        margin-top: 0.75rem;
        color: var(--everglow-font-color-0);
        font-size: 0.875rem;
      }
    }
  }

  .home-news__visual {
    flex: 1 1 48%;
    min-height: 6.5rem;
    background:
      linear-gradient(180deg, var(--everglow-trans-blue-0), var(--everglow-trans-blue-1));
    background-size: cover;
    background-position: center;

    &.has-image {
      background-color: var(--everglow-grey-0);
    }
  }

  @media only screen and (max-width: 833px) {
    .home-news {
      height: auto;
      min-height: 100dvh;
      padding-right: max(1.25rem, 5vw);
      padding-left: max(1.25rem, 5vw);
    }

    .home-news__inner {
      flex: none;

      ul {
        flex: none;
        grid-template-columns: 1fr;
      }
    }

    .home-news__visual {
      flex: none;
      height: 9rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .home-news__card {
      transition: none;

      &:hover {
        transform: none;
      }
    }
  }
</style>
