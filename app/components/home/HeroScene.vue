<script setup lang="ts">
import { createHeroFollower } from '~/utils/hero-parallax'
import { type MenuSkyRenderer, createMenuSky, loadMenuSkyAssets } from '~/utils/menu-sky'
import { type MenuWater, createMenuWater } from '~/utils/menu-water'

defineProps<{
  /** Layout parity with ParallexScrollBase so the hero wrapper can swap dynamically. */
  cover?: boolean
}>()

// Fetch the menu scene assets alongside the page, not after hydration.
useHead({
  link: ['bg', 'star', 'moon', 'water', 'front2', 'front1'].map(name => ({
    rel: 'preload',
    as: 'image' as const,
    href: `/images/hero/menu/${name}.png`,
  })),
})

const root = ref<HTMLElement>()
const sceneCanvas = ref<HTMLCanvasElement>()
const waterCanvas = ref<HTMLCanvasElement>()
const debug = ref('')
const debugging = ref(false)

onMounted(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  const finePointer = window.matchMedia('(pointer: fine)')
  debugging.value = new URLSearchParams(window.location.search).has('debug')

  const follower = createHeroFollower()
  let renderer: MenuSkyRenderer | undefined
  let water: MenuWater | undefined
  let ctx: CanvasRenderingContext2D | null = null
  let frame = 0
  let last = 0
  let visible = true
  let disposed = false

  function resize () {
    if (!root.value || !sceneCanvas.value) { return }
    const rect = root.value.getBoundingClientRect()
    const ratio = Math.min(1.75, window.devicePixelRatio || 1)
    sceneCanvas.value.width = Math.round(rect.width * ratio)
    sceneCanvas.value.height = Math.round(rect.height * ratio)
    ctx = sceneCanvas.value.getContext('2d')
    water?.resize(rect.width, rect.height, ratio)
    // Resizing clears the canvas; the static scene has no loop to repaint it.
    if (reduced.matches) { paint(performance.now()) }
  }

  function paint (now: number) {
    if (!renderer || !root.value || !ctx) { return }
    const rect = root.value.getBoundingClientRect()
    const frames = reduced.matches ? 0 : Math.min(4, last ? (now - last) / (1000 / 60) : 1)
    last = now
    const c = reduced.matches ? { x: 0, y: 0 } : follower.tick(now)
    const scroll = Math.min(1, Math.max(0, window.scrollY / Math.max(1, window.innerHeight)))
    renderer.draw(ctx, {
      width: rect.width,
      height: rect.height,
      dpr: Math.min(1.75, window.devicePixelRatio || 1),
      cx: c.x,
      cy: c.y,
      scroll,
    }, frames, water ? 'shader' : 'canvas')
    if (water) {
      const region = renderer.waterRegion()
      if (region) { water.render(region, now / 1000) }
    }
    if (debugging.value) {
      debug.value = `c: ${c.x.toFixed(3)}, ${c.y.toFixed(3)} · scroll: ${scroll.toFixed(3)}`
    }
  }

  function onPointerMove (event: PointerEvent) {
    if (!root.value || !finePointer.matches) { return }
    follower.move(event.clientX, event.clientY, root.value.getBoundingClientRect())
  }
  function onPointerLeave () {
    follower.leave()
  }

  const observer = new IntersectionObserver((entries) => {
    visible = entries.some(entry => entry.isIntersecting)
  })
  if (root.value) { observer.observe(root.value) }

  resize()
  window.addEventListener('resize', resize)

  loadMenuSkyAssets().then((assets) => {
    if (disposed) { return }
    renderer = createMenuSky(assets)
    // Populate the star field before the first painted frame.
    renderer.prewarm(600)
    if (!reduced.matches && waterCanvas.value && window.CSS?.supports('mix-blend-mode', 'plus-lighter')) {
      water = createMenuWater(waterCanvas.value)
      resize()
    }
    if (reduced.matches) {
      // Static hero: a settled frame, no pointer tracking, no loop.
      paint(performance.now())
    } else {
      if (finePointer.matches) {
        window.addEventListener('pointermove', onPointerMove, { passive: true })
        document.documentElement.addEventListener('pointerleave', onPointerLeave)
      }
      frame = requestAnimationFrame(function tick (now) {
        if (visible) { paint(now) }
        if (!disposed) { frame = requestAnimationFrame(tick) }
      })
    }
  }).catch(() => {
    // The solid night-sky color remains as the fallback.
  })

  onBeforeUnmount(() => {
    disposed = true
    observer.disconnect()
    cancelAnimationFrame(frame)
    window.removeEventListener('resize', resize)
    window.removeEventListener('pointermove', onPointerMove)
    document.documentElement.removeEventListener('pointerleave', onPointerLeave)
  })
})
</script>

<template>
  <section
    ref="root"
    class="hero-scene"
  >
    <canvas
      ref="sceneCanvas"
      class="hero-scene__canvas"
      aria-hidden="true"
    />
    <canvas
      ref="waterCanvas"
      class="hero-scene__water"
      aria-hidden="true"
    />
    <div class="hero-scene__content">
      <slot />
    </div>
    <pre
      v-if="debugging"
      class="hero-scene__debug"
    >{{ debug }}</pre>
  </section>
</template>

<style lang="scss" scoped>
  .hero-scene {
    position: relative;
    height: 100%;
    min-height: 100svh;
    overflow: hidden;
    // Night-sky base shown until the menu scene assets finish loading.
    background: #070b1e;
    isolation: isolate;
  }

  .hero-scene__canvas {
    position: absolute;
    z-index: 1;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .hero-scene__water {
    position: absolute;
    z-index: 2;
    inset: 0;
    width: 100%;
    height: 100%;
    mix-blend-mode: plus-lighter;
    pointer-events: none;
  }

  .hero-scene__content {
    position: relative;
    z-index: 3;
    height: 100%;
  }

  .hero-scene__debug {
    position: absolute;
    z-index: 9;
    top: calc(var(--header-height) + 0.5rem);
    left: 0.75rem;
    margin: 0;
    padding: 0.4rem 0.6rem;
    color: #9fe8ff;
    font-size: 11px;
    line-height: 1.4;
    background: rgb(0 0 0 / 55%);
    border-radius: 6px;
    pointer-events: none;
  }
</style>
