<script setup lang="ts">
defineProps<{
  landscape: string
  sky: string
  foreground?: string
  alt: string
}>()
</script>

<template>
  <div
    class="atlas-landscape"
    :title="alt"
  >
    <img
      :src="sky"
      alt=""
      class="atlas-landscape__layer"
      decoding="async"
    >
    <img
      :src="landscape"
      :alt="alt"
      :title="alt"
      class="atlas-landscape__layer"
      decoding="async"
    >
    <img
      v-if="foreground"
      :src="foreground"
      alt=""
      class="atlas-landscape__layer"
      decoding="async"
    >
  </div>
</template>

<style scoped>
.atlas-landscape { position: relative; width: 100%; height: var(--atlas-landscape-height, 100%); }
.atlas-landscape__layer { position: absolute; inset: 0; display: block; width: 100%; height: 100%; object-fit: cover; object-position: center; }
.atlas-landscape__layer[alt=""] { pointer-events: none; }
</style>
