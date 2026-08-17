<script setup lang="ts">
defineProps<{
  label?: string
}>()

const sectionRef = ref<HTMLElement | null>(null)
const stickyRef = ref<HTMLElement | null>(null)
const trackRef = ref<HTMLElement | null>(null)
const offset = ref(0)
const paged = ref(false)

let raf = 0
let acc = 0
let lockTimer = 0
let absorb = false
let release = false
let lockY = 0
let self = false
let index = 0
let width = 0
let touchY = 0

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n))

const reduced = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const slides = () => trackRef.value?.children.length || 1

const metrics = () => {
  const el = sectionRef.value
  if (!el) {
    return null
  }
  const range = el.offsetHeight - window.innerHeight
  const n = slides()
  if (range <= 0 || n <= 1) {
    return null
  }
  return {
    origin: window.scrollY + el.getBoundingClientRect().top,
    range,
    n,
    step: range / (n - 1),
  }
}

const pinned = () => {
  const rect = sectionRef.value?.getBoundingClientRect()
  return Boolean(rect && rect.top <= 2 && rect.bottom >= window.innerHeight - 2)
}

const stick = () => {
  if (Math.abs(window.scrollY - lockY) < 1) {
    return
  }
  self = true
  window.scrollTo({ top: lockY })
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      self = false
    })
  })
}

const setSlide = (next: number, motion: boolean) => {
  const m = metrics()
  if (!m) {
    return
  }
  index = clamp(next, 0, m.n - 1)
  lockY = m.origin + index * m.step
  absorb = true
  release = false
  paged.value = motion && !reduced()
  offset.value = -index * width
  stick()
  acc = 0
  window.clearTimeout(lockTimer)
  lockTimer = window.setTimeout(() => {
    lockTimer = 0
    acc = 0
  }, reduced() ? 120 : 400)
}

const atEdge = (dir: -1 | 1) =>
  (dir < 0 && index <= 0) || (dir > 0 && index >= slides() - 1)

const turnLoose = () => {
  absorb = false
  release = true
}

const sync = () => {
  const section = sectionRef.value
  const sticky = stickyRef.value
  if (!section || !sticky || !trackRef.value) {
    return
  }
  const n = slides()
  const range = section.offsetHeight - window.innerHeight
  width = sticky.clientWidth
  sticky.style.setProperty('--home-slide-width', `${width}px`)
  if (range <= 0 || n <= 1) {
    offset.value = 0
    return
  }
  if (pinned()) {
    if (!release && !absorb) {
      const m = metrics()
      if (m) {
        setSlide(
          clamp(Math.round((window.scrollY - m.origin) / m.step), 0, m.n - 1),
          false,
        )
      }
    }
    offset.value = -index * width
    if (!release && !self) {
      stick()
    }
    return
  }
  absorb = false
  release = false
  paged.value = false
  offset.value =
    -clamp(-section.getBoundingClientRect().top / range, 0, 1) * (n - 1) * width
}

const onScroll = () => {
  raf ||= window.requestAnimationFrame(() => {
    raf = 0
    sync()
  })
}

const onWheel = (event: WheelEvent) => {
  if (!pinned()) {
    return
  }
  if (lockTimer) {
    event.preventDefault()
    return
  }
  if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
    return
  }
  const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY
  const dir = (delta > 0 ? 1 : -1) as -1 | 1
  if (atEdge(dir)) {
    turnLoose()
    return
  }
  event.preventDefault()
  acc += delta
  if (Math.abs(acc) < 48) {
    return
  }
  acc = 0
  setSlide(index + dir, true)
}

const onTouchStart = (event: TouchEvent) => {
  const touch = event.touches[0]
  if (touch) {
    touchY = touch.clientY
  }
}

const onTouchEnd = (event: TouchEvent) => {
  const touch = event.changedTouches[0]
  if (!pinned() || lockTimer || !touch) {
    return
  }
  const dy = touch.clientY - touchY
  if (Math.abs(dy) < 56) {
    return
  }
  const dir = (dy < 0 ? 1 : -1) as -1 | 1
  if (atEdge(dir)) {
    turnLoose()
    return
  }
  setSlide(index + dir, true)
}

onMounted(() => {
  sync()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
  window.addEventListener('wheel', onWheel, { passive: false })
  window.addEventListener('touchstart', onTouchStart, { passive: true })
  window.addEventListener('touchend', onTouchEnd, { passive: true })
})

onBeforeUnmount(() => {
  window.cancelAnimationFrame(raf)
  window.clearTimeout(lockTimer)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  window.removeEventListener('wheel', onWheel)
  window.removeEventListener('touchstart', onTouchStart)
  window.removeEventListener('touchend', onTouchEnd)
})
</script>

<template>
  <section
    ref="sectionRef"
    class="horizontal-scroll-base"
    :aria-label="label"
  >
    <div
      ref="stickyRef"
      class="pin-wrap-sticky"
    >
      <ul
        ref="trackRef"
        class="pin-wrap"
        :class="{ 'is-paged': paged }"
        :style="{ transform: `translate3d(${offset}px, 0, 0)` }"
      >
        <slot />
      </ul>
    </div>
  </section>
</template>

<style lang="scss" scoped>
  .horizontal-scroll-base {
    position: relative;
    height: 300dvh;
    color: #f8fafc;
    background: #0b1220;
  }

  .pin-wrap-sticky {
    position: sticky;
    top: 0;
    height: 100dvh;
    overflow: hidden;
    background:
      linear-gradient(90deg, rgb(8 15 28 / 55%), rgb(8 15 28 / 20%)),
      url('/images/starry-night-sky.jpg') center / cover;
  }

  .pin-wrap {
    display: flex;
    height: 100%;
    will-change: transform;

    &.is-paged {
      transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
    }
  }

  :deep(.pin-item) {
    flex: 0 0 var(--home-slide-width, 100vw);
    width: var(--home-slide-width, 100vw);
    height: 100dvh;
  }

  @media (prefers-reduced-motion: reduce) {
    .pin-wrap {
      will-change: auto;

      &.is-paged {
        transition: none;
      }
    }
  }
</style>
