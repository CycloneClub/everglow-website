<script setup lang="ts">
const { locale } = useI18n()
const isCjk = computed(() => locale.value.startsWith('zh'))
</script>

<template>
  <div
    class="home-page"
    :class="{ 'is-cjk': isCjk }"
  >
    <HomeWelcome />
    <HomeNews />
    <HomeShowcase />
    <HomeLore />
  </div>
</template>

<style lang="scss" scoped>
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
