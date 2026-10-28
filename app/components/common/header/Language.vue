<script setup lang="ts">
import type { Langs } from '#shared/types'

const { availableLocales } = useI18n()
const app = useNuxtApp()
const route = useRoute()
const switchLocalePath = useSwitchLocalePath()
const { data: contentPaths } = useNuxtData<string[]>('seo-content-paths')
const languageLinks = computed(() => availableLocales.map(code => ({
  code,
  href: switchLocalePath(code),
})).filter(({ href }) => {
  if (!href) { return false }
  if (!/^(?:\/(?:zh-cn|zh-hk|en-us))?\/(?:news|docs)\/.+/.test(route.path)) { return true }
  const path = href.split(/[?#]/)[0].replace(/\/$/, '')
  return contentPaths.value?.includes(path) ?? false
}))

const isShowOptions = ref(false)

const setLanguage = async (event: MouseEvent, code: Langs) => {
  // Preserve native new-tab/window behavior for modified clicks.
  if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) { return }
  event.preventDefault()
  event.stopPropagation()
  isShowOptions.value = false
  await app.$switchLocalePreservingPosition(code)
}
</script>

<template>
  <div class="setting-language">
    <div
      class="everglow-select"
      @mouseleave="isShowOptions = false"
      @blur="isShowOptions = false"
    >
      <div
        ref="container"
        tabindex="-1"
        class="everglow-chooser"
        @mouseenter="isShowOptions = true"
      >
        <Icon name="dashicons:translation" />
        <Icon
          class="icon"
          name="lucide:chevron-down"
        />
      </div>
      <Transition name="bottom">
        <div
          v-show="isShowOptions"
          class="options bottom"
        >
          <div class="options-content">
            <a
              v-for="option in languageLinks"
              :key="option.code"
              :href="option.href"
              :hreflang="option.code"
              @click="setLanguage($event, option.code)"
            >
              {{ $t(`body.header.settings.languages.${option.code}`) }}
            </a>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .setting-language {
    display: flex;
    justify-content: space-between;
  }

  .everglow-select {
    a {
      padding-right: 10px;
    }
  }

  .everglow-select {
    position: relative;
    cursor: pointer;

    &:hover {
      .everglow-chooser {
        color: var(--everglow-blue-5);
      }
    }

    .everglow-chooser {
      width: 100%;
      display: flex;
      justify-content: space-around;
      align-items: center;

      .icon {
        font-size: 1.5rem;
      }
    }

    .options {
      min-width: 8rem;
      position: absolute;

      padding-top: 1rem;
      right: 0;

      .options-content {
        padding: 7px;
        border: 1px solid var(--everglow-trans-blue-1);
        background-color: var(--everglow-trans-white-5);
        backdrop-filter: blur(10px);
        border-radius: 5px;
        box-shadow: var(--shadow);
      }

      a {
        font-size: 1.4rem;
        display: flex;
        padding: 5px;
        border-radius: 5px;

        &:hover {
          background-color: var(--everglow-blue-0);
        }
      }
    }
  }
</style>
