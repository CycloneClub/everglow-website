<script setup lang="ts">
import type { Langs } from '#shared/types'

const { availableLocales, setLocale } = useI18n()

const isShowOptions = ref(false)

const setLanguage = (code: Langs) => {
  setLocale(code)
  isShowOptions.value = false
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
            <span
              v-for="(option, index) in availableLocales"
              v-once
              :key="index"
              @click.stop.prevent="setLanguage(availableLocales[index])"
            >
              {{ $t(`body.header.settings.languages.${option}`) }}
            </span>
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
    span {
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
        font-size: 18px;
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

      span {
        font-size: 15px;
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
