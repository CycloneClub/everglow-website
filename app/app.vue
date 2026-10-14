<script setup lang="ts">
const { locale, t } = useI18n()
const route = useRoute()
const i18nHead = useLocaleHead()
const localePath = useLocalePath()
const isPlaygroundWorkspace = computed(
  () => route.path.startsWith(`${localePath('/playground')}/`),
)

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
      href: 'https://github.com/Solaestas/Everglow',
    },
    {
      rel: 'me',
      href: 'https://space.bilibili.com/1079503056',
    },
  ],
  meta: [...(i18nHead.value.meta || [])],
}))

useSeoMeta({
  twitterCard: 'summary_large_image',
})

defineOgImage('Everglow.satori', {}, {
  width: 1200,
  height: 630,
  alt: 'Everglow — a Terraria adventure beneath a moonlit sky',
})
</script>

<template>
  <div id="everglow">
    <CommonHeader v-if="!isPlaygroundWorkspace" />
    <CommonMain>
      <NuxtPage />
    </CommonMain>
    <CommonFooter v-if="!isPlaygroundWorkspace" />
  </div>
</template>

<style lang="scss">
  @import url('@/assets/css/index.scss');
</style>
