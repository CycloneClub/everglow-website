<script setup lang="ts">
import VueEasyLightbox from 'vue-easy-lightbox/external-css'
import 'vue-easy-lightbox/external-css/vue-easy-lightbox.css'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  src?: string
  alt?: string
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

watch(source, () => { visible.value = false })
onDeactivated(() => { visible.value = false })
</script>

<template>
  <NuxtImg
    v-bind="$attrs"
    :src="source"
    :alt="alt"
    :width="width"
    :height="height"
    class="prose-image-preview"
    role="button"
    tabindex="0"
    :aria-label="alt || source"
    @click.prevent.stop="visible = true"
    @keydown.enter.prevent="visible = true"
    @keydown.space.prevent="visible = true"
  />
  <ClientOnly>
    <VueEasyLightbox
      :visible="visible"
      :imgs="[{ src: source, alt }]"
      teleport="body"
      scroll-disabled
      @hide="visible = false"
    />
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
</style>
