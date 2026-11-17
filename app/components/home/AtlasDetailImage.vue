<script setup lang="ts">
import type { AtlasDetail } from '~/data/world-atlas'

defineProps<{ detail: AtlasDetail, label: string }>()
</script>

<template>
  <svg
    v-if="detail.artwork"
    class="atlas-detail-image is-artwork"
    :class="{ 'is-framed': detail.framed, 'has-overflow': detail.artwork.overflow }"
    :viewBox="`0 0 ${detail.artwork.width} ${detail.artwork.height}`"
    :preserveAspectRatio="detail.framed ? 'xMidYMax meet' : 'xMidYMid meet'"
    role="img"
    :aria-label="label"
  >
    <svg
      v-for="(part, index) in detail.artwork.parts"
      :key="index"
      :x="part.x ?? 0"
      :y="part.y ?? 0"
      :width="part.crop?.width ?? part.sheetWidth"
      :height="part.crop?.height ?? part.sheetHeight"
      :viewBox="`${part.crop?.x ?? 0} ${part.crop?.y ?? 0} ${part.crop?.width ?? part.sheetWidth} ${part.crop?.height ?? part.sheetHeight}`"
      style="overflow: hidden"
    >
      <image
        :href="part.image"
        :width="part.sheetWidth"
        :height="part.sheetHeight"
      />
    </svg>
  </svg>
  <svg
    v-else-if="detail.image && detail.sprite"
    class="atlas-detail-image is-sprite"
    :class="{ 'is-playing': detail.sprite.fps }"
    :viewBox="`0 0 ${detail.sprite.width} ${detail.sprite.height}`"
    :style="{
      '--sprite-distance': `${detail.sprite.height * detail.sprite.frames}px`,
      '--sprite-duration': `${detail.sprite.frames / (detail.sprite.fps || 1)}s`,
      '--sprite-frames': detail.sprite.frames,
    }"
    role="img"
    :aria-label="label"
  >
    <image
      :href="detail.image"
      :width="detail.sprite.width"
      :height="detail.sprite.height * detail.sprite.frames"
    />
  </svg>
  <img
    v-else-if="detail.image"
    class="atlas-detail-image"
    :class="{ 'is-portrait': detail.portrait }"
    :src="detail.image"
    :alt="label"
  >
</template>

<style scoped>
.atlas-detail-image { display: block; width: 100%; max-height: 150px; object-fit: contain; margin-bottom: 0.75rem; }
.is-portrait { width: 64px; height: 64px; image-rendering: pixelated; }
.is-sprite { overflow: hidden; image-rendering: pixelated; }
.is-artwork { overflow: hidden; image-rendering: pixelated; isolation: isolate; }
.is-artwork.has-overflow { overflow: visible; }
.atlas-detail-image.is-framed { box-sizing: border-box; height: min(12vh, 125px); border: 5px solid #f2e7cf; outline: 1px solid #77603d66; box-shadow: 2px 5px 8px #47371e26; filter: saturate(0.6) sepia(0.2); }
@media (max-width: 760px), (max-height: 600px) {
  .atlas-detail-image.is-framed { height: 64px; border-width: 3px; }
}
.is-playing image { animation: atlas-sprite-frames var(--sprite-duration) steps(var(--sprite-frames), end) infinite; }
@keyframes atlas-sprite-frames {
  from { transform: translateY(0); }
  to { transform: translateY(calc(-1 * var(--sprite-distance))); }
}
@media (prefers-reduced-motion: reduce) {
  .is-playing image { animation: none; }
}
</style>
