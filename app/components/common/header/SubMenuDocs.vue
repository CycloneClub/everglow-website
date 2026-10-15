<script setup lang="ts">
import type { NavigationTree } from '#shared/types'

const { links } = defineProps<{ links: NavigationTree[] }>()
const emit = defineEmits(['return', 'navigate'])
</script>

<template>
  <div class="common-header-submenu-docs">
    <button
      type="button"
      class="return-btn"
      :aria-label="$t('body.header.backToMenu')"
      @click="emit('return')"
    >
      <Icon name="lucide:chevron-left" />
    </button>
    <CommonContentNavigationTree
      :links="links"
      @navigate="emit('navigate')"
    />
  </div>
</template>

<style lang="scss" scoped>
  .common-header-submenu-docs {
    padding: 40px;

    .return-btn {
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--everglow-font-color-3);
      margin: 0 0 20px;
      transition: color 0.3s ease;
      .iconify {
        width: 100%;
        height: 100%;
      }

      &:hover {
        color: var(--everglow-blue-5);
      }
      &:focus-visible {
        outline: 2px solid var(--everglow-blue-5);
        outline-offset: 2px;
      }
    }
  }
</style>
