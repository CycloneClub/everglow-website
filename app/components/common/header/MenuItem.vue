<script setup lang="ts">
const { name, link } = defineProps<{
  name: string
  link: string
}>()

const emit = defineEmits(['navigate', 'openDocs'])
</script>

<template>
  <li class="main-menu-item">
    <NuxtLinkLocale
      :to="link"
      :target="link.startsWith('/') ? '_self' : '_blank'"
      :class="['main-menu-item-content', { 'docs-link': name === 'docs' }]"
      @click="emit('navigate')"
    >
      <span class="text">{{ $t(`body.header.${name}`) }}</span>
      <Icon
        class="chevron"
        name="line-md:chevron-small-right"
      />
    </NuxtLinkLocale>
    <button
      v-if="name === 'docs'"
      type="button"
      class="main-menu-item-content docs-trigger"
      aria-controls="header-docs-menu"
      @click="emit('openDocs')"
    >
      <span class="text">{{ $t('body.header.docs') }}</span>
      <Icon
        class="chevron"
        name="line-md:chevron-small-right"
      />
    </button>
  </li>
</template>

<style lang="scss" scoped>
  .main-menu-item-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    line-height: 1.5rem;
    color: inherit;
    text-align: left;

    .text {
      transition: color 0.3s;
    }

    .chevron {
      display: none;
    }

    &:hover .text {
      color: var(--everglow-blue-5);
    }

    &:focus-visible {
      outline: 2px solid var(--everglow-blue-5);
      outline-offset: 2px;
    }
  }

  .docs-trigger {
    display: none;
  }

  @media only screen and (max-width: 833px) {
    .main-menu-item-content {
      min-height: var(--header-height);
      font-size: 2rem;

      .chevron {
        display: block;
        opacity: 0;
        transform: translateX(-4px);
        transition: opacity 0.24s, transform 0.24s;
      }

      &:hover .chevron,
      &:focus-visible .chevron {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .docs-link {
      display: none;
    }

    .docs-trigger {
      display: flex;
    }
  }
</style>
