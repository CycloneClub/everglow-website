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
    <div
      :style="{ backgroundImage: `url('${sky}')` }"
      aria-hidden="true"
      class="atlas-landscape__layer atlas-landscape__decoration"
    />
    <img
      :src="landscape"
      :alt="alt"
      :title="alt"
      class="atlas-landscape__layer"
      decoding="async"
    >
    <div
      v-if="foreground"
      :style="{ backgroundImage: `url('${foreground}')` }"
      aria-hidden="true"
      class="atlas-landscape__layer atlas-landscape__decoration"
    />
  </div>
</template>

<style scoped>
.atlas-landscape { position: relative; width: 100%; height: var(--atlas-landscape-height, 100%); }
.atlas-landscape__layer { position: absolute; inset: 0; display: block; width: 100%; height: 100%; object-fit: cover; object-position: center; }
.atlas-landscape__decoration { background-size: cover; background-position: center; background-repeat: no-repeat; pointer-events: none; }
</style>
