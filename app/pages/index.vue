<script setup lang="ts">
import { atlasCopy, atlasText } from '~/data/world-atlas'

// The home page translates reactively; retain its camera and reading mode.
definePageMeta({ key: 'home' })

const { locale } = useI18n()
const isCjk = computed(() => locale.value.startsWith('zh'))
const page = ref<HTMLElement>()
const { enter } = useAtlasEntrance(page)
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
        <a
          class="home-opening__enter"
          href="#lore"
          :aria-label="atlasText(atlasCopy.enter, locale)"
          :title="atlasText(atlasCopy.enter, locale)"
          @click.prevent="enter"
        >
          <svg
            viewBox="0 0 24 28"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="m5 13 7-7 7 7M5 22l7-7 7 7" />
          </svg>
        </a>
      </div>
    </div>
    <HomeLore />
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

    :deep(.home-welcome) {
      padding-bottom: max(4.5rem, 8svh);
    }
  }

  .home-opening__enter {
    position: absolute;
    z-index: 3;
    left: 50%;
    bottom: max(0.5rem, env(safe-area-inset-bottom));
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    color: var(--everglow-black);
    opacity: 0.75;
    transform: translateX(-50%);
    touch-action: manipulation;

    svg {
      width: 28px;
      height: 32px;
      animation: atlas-enter-float 1.8s ease-in-out infinite;
    }

    &:hover { opacity: 1; }
    &:focus-visible {
      outline: 2px solid var(--everglow-blue-5);
      outline-offset: 2px;
      border-radius: 4px;
    }
  }

  @keyframes atlas-enter-float {
    0%, 100% { transform: translateY(2px); }
    50% { transform: translateY(-5px); }
  }

  @media (prefers-reduced-motion: reduce) {
    .home-opening__enter svg {
      animation: none;
    }

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
