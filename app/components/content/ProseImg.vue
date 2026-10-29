<script setup lang="ts">
import VueEasyLightbox from 'vue-easy-lightbox/external-css'
import 'vue-easy-lightbox/external-css/vue-easy-lightbox.css'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  src?: string
  alt?: string
  title?: string
  width?: string | number
  height?: string | number
}>(), {
  src: '',
  alt: '',
})

const baseURL = useRuntimeConfig().app.baseURL
const source = computed(() => {
  if (props.src.startsWith('/') && !props.src.startsWith('//') && !props.src.startsWith(baseURL)) {
    return `${baseURL.replace(/\/$/, '')}${props.src}`
  }
  return props.src
})
const visible = ref(false)
const previewStyle = ref<Record<string, string>>({})
const previewWidth = ref(0)

function openPreview (event: Event) {
  const image = event.currentTarget as HTMLImageElement
  previewWidth.value = image.getBoundingClientRect().width * 2
  previewStyle.value = {
    '--preview-image-rendering': getComputedStyle(image).imageRendering,
  }
  visible.value = true
}

function sizePreview (event: Event) {
  const image = event.target as HTMLImageElement
  // The lightbox loads the original; NuxtImg's thumbnail may have a different size.
  if (previewWidth.value > 0 && image.naturalWidth > 0) {
    previewStyle.value['--preview-zoom'] = String(previewWidth.value / image.naturalWidth)
  }
}

watch(source, () => { visible.value = false })
onDeactivated(() => { visible.value = false })
</script>

<template>
  <NuxtImg
    v-bind="$attrs"
    :src="source"
    :alt="alt"
    :title="title ?? (alt || undefined)"
    :width="width"
    :height="height"
    class="prose-image-preview"
    role="button"
    tabindex="0"
    :aria-label="alt || source"
    @click.prevent.stop="openPreview"
    @keydown.enter.prevent="openPreview"
    @keydown.space.prevent="openPreview"
  />
  <ClientOnly>
    <Teleport to="body">
      <div
        class="prose-image-lightbox"
        :style="previewStyle"
        @load.capture="sizePreview"
      >
        <VueEasyLightbox
          :visible="visible"
          :imgs="[{ src: source, alt }]"
          scroll-disabled
          @hide="visible = false"
        />
      </div>
    </Teleport>
  </ClientOnly>
</template>

<style scoped>
.prose-image-preview {
  cursor: zoom-in;
}

.prose-image-preview:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 3px;
}

.prose-image-lightbox :deep(.vel-img) {
  /* Keep the image's layout size at or below its natural size for pinch zoom. */
  zoom: var(--preview-zoom, 1);
  width: auto;
  height: auto;
  max-width: calc(80vw / var(--preview-zoom, 1));
  max-height: calc(80vh / var(--preview-zoom, 1));
  image-rendering: var(--preview-image-rendering, auto);
}
</style>
