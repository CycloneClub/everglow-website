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

const hreflangLinks = [
  {
    rel: 'alternate',
    hreflang: 'zh-cn',
    href: 'https://everglow.cloudea.work/zh-cn/',
  },
  {
    rel: 'alternate',
    hreflang: 'en-us',
    href: 'https://everglow.cloudea.work/en-us/',
  },
  {
    rel: 'alternate',
    hreflang: 'zh-hk',
    href: 'https://everglow.cloudea.work/zh-hk/',
  },
  {
    rel: 'alternate',
    hreflang: 'x-default',
    href: 'https://everglow.cloudea.work/',
  },
] as const

useHead({
  titleTemplate: i18nTitle,
  title: '',
  htmlAttrs: {
    lang: locale.value,
  },
  link: [
    ...(i18nHead.value.link || []),
    ...hreflangLinks,
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
})

useSeoMeta({
  twitterCard: 'summary_large_image',
})

defineOgImage('Pergel.satori', {
  title: 'Everglow',
  description: 'Welcome to Everglow no Sekai!',
  headline: 'terraria mod',
  siteName: 'Everglow',
  siteLogo: '/icon.png',
  theme: '#212121',
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
