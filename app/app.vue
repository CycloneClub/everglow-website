<script setup lang="ts">
import { siteLinks } from '#shared/data/links'

const { locale, t } = useI18n()
const route = useRoute()
const i18nHead = useLocaleHead()
const localePath = useLocalePath()

const i18nTitle = (titleChunk: string) => {
  return titleChunk
    ? `${titleChunk} - ${t('head.title')}`
    : `${t('head.fulltitle')} | ${t('head.fulltitle2')}`
}

const site = useSiteConfig()
const websiteUrl = () => new URL(localePath('index'), site.url).href
// Match the localized node created by nuxt-schema-org, preserving its publisher
// and translation relationships instead of creating a second website.
useSchemaOrg([
  defineWebSite({
    '@id': () => `${websiteUrl()}#website`,
    'url': websiteUrl,
    'alternateName': ['Everglow', '流光无际', '流光無際', 'Everglow Mod'],
  }),
])

// The router knows each locale's catch-all route even when its translation
// does not exist. Keep alternate links limited to actual content pages.
const { data: contentPaths } = await useAsyncData('seo-content-paths', async () => {
  const collections = ['news', 'news_en', 'news_hk', 'docs', 'docs_en', 'docs_hk'] as const
  const pages = await Promise.all(collections.map(collection =>
    queryCollection(collection).select('path').all(),
  ))
  return pages.flat().map(page => page.path)
})
const localeHeadLinks = computed(() => (i18nHead.value.link || []).filter((link) => {
  if (!('hreflang' in link) || !/^(?:\/(?:zh-cn|zh-hk|en-us))?\/(?:news|docs)\/.+/.test(route.path)) {
    return true
  }
  const path = new URL(link.href, site.url).pathname.replace(/^\/zh-cn(?=\/)/, '').replace(/\/$/, '')
  return contentPaths.value?.includes(path) ?? false
}))

useHead(() => ({
  titleTemplate: i18nTitle,
  title: '',
  htmlAttrs: {
    lang: locale.value,
  },
  link: [
    ...localeHeadLinks.value,
    {
      rel: 'me',
      href: siteLinks.github,
    },
    {
      rel: 'me',
      href: siteLinks.bilibili,
    },
  ],
  meta: [...(i18nHead.value.meta || [])],
}))

useSeoMeta({
  twitterCard: 'summary_large_image',
})

const ogImages = defineOgImage('Everglow.satori', {}, {
  width: 1200,
  height: 630,
  alt: 'Everglow — a Terraria adventure beneath a moonlit sky',
})

// Reuse the generated URL (including its signature) instead of the schema
// module's default homepage logo. Leave article image metadata independent.
if (import.meta.server && ogImages?.[0] && ['/', '/en-us', '/zh-hk'].includes(route.path.replace(/\/$/, '') || '/')) {
  useSchemaOrg([
    defineWebPage({
      primaryImageOfPage: {
        '@type': 'ImageObject',
        'url': new URL(ogImages[0], site.url).href,
        'width': 1200,
        'height': 630,
      },
    }),
  ])
}
</script>

<template>
  <div id="everglow">
    <CommonHeader />
    <CommonNavigationProgress />
    <CommonMain>
      <NuxtPage />
    </CommonMain>
    <CommonFooter />
  </div>
</template>

<style lang="scss">
  @import url('@/assets/css/index.scss');
</style>
