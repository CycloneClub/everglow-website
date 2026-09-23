<script setup lang="ts">
import type { createParchmentRenderer } from '~/utils/parchment-renderer'
import { paperHandoff } from '~/utils/parchment-fold'

const props = defineProps<{ source?: HTMLElement, progress: number }>()
const emit = defineEmits<{ ready: [value: boolean] }>()
const { locale } = useI18n()
const canvas = ref<HTMLCanvasElement>()
const active = ref(false)
let renderer: Awaited<ReturnType<typeof createParchmentRenderer>> | undefined
let motion: MediaQueryList | undefined
let resize: ResizeObserver | undefined
let mode: MutationObserver | undefined
let generation = 0
let queued = 0
let mounted = false
let pending = true
let dimensions = ''

function setReady (value: boolean) { active.value = value; emit('ready', value) }
function release () { renderer?.dispose(); renderer = undefined; setReady(false) }
function paint () {
  if (!renderer) { return }
  if (!active.value && (props.progress === 0 || props.progress === 1)) { setReady(true) }
  if (active.value) { renderer.render(props.progress) }
}
async function prepare () {
  queued = 0
  if (!mounted || !canvas.value || !props.source) { return }
  const root = props.source.closest('.world-atlas')
  if (motion?.matches || !root) { release(); return }
  // Capture only the opening, never a chapter's camera or a half-finished fold.
  if (root.getBoundingClientRect().top < -2 || (props.progress > 0 && props.progress < 1)) { return }
  const version = ++generation
  pending = false
  release()
  await nextTick()
  try {
    await document.fonts.ready
    const { createParchmentRenderer: create } = await import('~/utils/parchment-renderer')
    if (!mounted || version !== generation || !canvas.value || !props.source) { return }
    if (root.getBoundingClientRect().top < -2 || (props.progress > 0 && props.progress < 1)) { pending = true; return }
    const next = await create(canvas.value, props.source, root.classList.contains('is-animated') ? 'diagonal' : 'up')
    if (!mounted || version !== generation) { next.dispose(); return }
    if (root.getBoundingClientRect().top < -2 || (props.progress > 0 && props.progress < 1)) {
      next.dispose()
      pending = true
      return
    }
    renderer = next
    paint()
  } catch (error) {
    if (import.meta.dev) { console.warn('Parchment cover unavailable:', error) }
    // The readable DOM and ordinary entrance remain available without WebGL.
    if (version === generation) { release() }
  }
}
function schedule () { if (mounted && pending) { queued ||= requestAnimationFrame(prepare) } }
function invalidate () { generation++; pending = true; if (mounted) { release(); schedule() } }
function bindSource () {
  if (!mounted) { return }
  resize?.disconnect()
  mode?.disconnect()
  dimensions = ''
  if (props.source) {
    resize?.observe(props.source)
    const root = props.source.closest('.world-atlas')
    if (root) { mode?.observe(root, { attributes: true, attributeFilter: ['class'] }) }
  }
  invalidate()
}
function lost () { generation++; pending = false; release() }
watch(() => props.progress, () => { paint(); schedule() }, { flush: 'post' })
watch(() => props.source, bindSource, { flush: 'post' })
watch(locale, invalidate, { flush: 'post' })
function start () {
  if (mounted) { return }
  mounted = true
  motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  resize = new ResizeObserver(() => {
    const size = props.source ? props.source.clientWidth + ':' + props.source.clientHeight : ''
    if (size !== dimensions) { dimensions = size; invalidate() }
  })
  mode = new MutationObserver(invalidate)
  motion.addEventListener('change', invalidate)
  canvas.value?.addEventListener('webglcontextlost', lost)
  window.addEventListener('scroll', schedule, { passive: true })
  bindSource()
}
function stop () {
  mounted = false
  generation++
  cancelAnimationFrame(queued)
  queued = 0
  pending = true
  resize?.disconnect()
  mode?.disconnect()
  motion?.removeEventListener('change', invalidate)
  canvas.value?.removeEventListener('webglcontextlost', lost)
  window.removeEventListener('scroll', schedule)
  release()
}
onMounted(start)
onActivated(start)
onDeactivated(stop)
onBeforeUnmount(stop)
</script>

<template>
  <canvas
    v-show="active && progress > 0 && progress < 1"
    ref="canvas"
    class="parchment-cover"
    :style="{ opacity: paperHandoff(progress).canvas }"
    aria-hidden="true"
  />
</template>

<style scoped>
.parchment-cover {
  position: fixed;
  inset: 0;
  z-index: 2;
  width: 100%;
  height: 100dvh;
  pointer-events: none;
}
@media (prefers-reduced-motion: reduce) {
  .parchment-cover { display: none; }
}
</style>
