<script setup lang="ts">
defineProps<{
  src: string
  cover?: boolean
}>()
</script>

<template>
  <section
    class="parallex-scroll-base"
    :class="{ 'is-cover': cover }"
    :style="{ backgroundImage: `url(${src})` }"
  >
    <slot />
  </section>
</template>

<style>
  .parallex-scroll-base {
    height: 100dvh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-attachment: fixed;
    background-size: cover;
    background-position: center;
  }

  .parallex-scroll-base.is-cover {
    display: block;
  }

  @media (prefers-reduced-motion: reduce) {
    .parallex-scroll-base {
      background-attachment: scroll;
    }
  }
</style>
