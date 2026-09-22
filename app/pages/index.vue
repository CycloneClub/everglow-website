<script setup lang="ts">
// The home page translates reactively; retain its camera and reading mode.
definePageMeta({ key: 'home' })

const { locale } = useI18n()
const isCjk = computed(() => locale.value.startsWith('zh'))
const page = ref<HTMLElement>()
useAtlasEntrance(page)
</script>

<template>
  <div
    ref="page"
    class="home-page"
    :class="{ 'is-cjk': isCjk }"
  >
    <div class="home-opening">
      <div class="home-opening__hero">
        <HomeWelcome />
      </div>
    </div>
    <HomeLore />
    <HomeShowcase />
    <HomeNews />
  </div>
</template>

<style lang="scss" scoped>
  .home-opening {
    position: relative;
    z-index: 0;
    height: 200svh;
    margin-bottom: -100svh;
  }

  .home-opening__hero {
    position: sticky;
    top: 0;
    height: 100svh;

    :deep(.parallex-scroll-base) {
      height: 100svh;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .home-opening {
      height: auto;
      margin-bottom: 0;
    }

    .home-opening__hero {
      position: relative;
    }
  }

  .home-page {
    font-family:
      Satoshi,
      'Noto Sans SC',
      'Noto Sans TC',
      var(--font-family);
    font-weight: 400;

    &.is-cjk {
      :deep(h1),
      :deep(h2) {
        font-weight: 400;
        letter-spacing: 0.1em;
        line-height: 1.18;
      }
    }
  }
</style>
