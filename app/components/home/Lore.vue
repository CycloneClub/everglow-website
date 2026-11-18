<script setup lang="ts">
import { siteLinks } from '#shared/data/links'
import { atlasCopy, atlasLayers, atlasText, unchartedLayers } from '~/data/world-atlas'
import { atlasExitDuration, createAtlasPaging, createAtlasScroll } from '~/utils/atlas-scroll'
import { atlasReadingIndex, atlasScrollProgress, atlasTurnDuration, atlasTurnEasing, createAtlasReadingStops, createAtlasTimeline, sampleAtlas } from '~/utils/atlas-timeline'

const { locale } = useI18n()
const text = (value: Parameters<typeof atlasText>[0]) => atlasText(value, locale.value)
const root = ref<HTMLElement>()
const stage = ref<HTMLElement>()
const composition = ref<HTMLElement>()
const after = ref<HTMLElement>()
const progress = ref(0)
const ready = ref(false)
const reduced = ref(false)
const manual = ref(false)
const narrow = ref(false)
const shortViewport = ref(false)
const animated = computed(() => ready.value && !reduced.value && !manual.value && !shortViewport.value)
const timeline = createAtlasTimeline(atlasLayers)
const readingStops = createAtlasReadingStops(timeline)
const pendingStop = ref<number>()
const readingIndex = computed(() => pendingStop.value ?? atlasReadingIndex(readingStops, progress.value))
const atEnding = computed(() => progress.value >= readingStops.at(-1)! - 0.0001 && pendingStop.value === undefined)
const state = computed(() => sampleAtlas(timeline, progress.value, narrow.value))
const paperVisibility = computed(() => state.value.paper)
const camera = computed(() => {
  const zoom = narrow.value ? 1 + (state.value.zoom - 1) * 0.8 : state.value.zoom
  return `translate(500 600) scale(${zoom}) translate(${-state.value.x} ${-state.value.y})`
})
const unchartedLabel = `${unchartedLayers[0]?.numeral ?? '?'} — ${unchartedLayers.at(-1)?.numeral ?? '?'} / TERRA INCOGNITA`
const layer = computed(() => atlasLayers[state.value.layer])
const height = `calc(${timeline.units * 46}svh + 100dvh)`
let frame = 0
let resize: ResizeObserver | undefined
let motion: MediaQueryList | undefined
let mobile: MediaQueryList | undefined
let listening = false
let pagingHeight = 0
let pageTurn: ReturnType<typeof createAtlasScroll> | undefined
let paging: ReturnType<typeof createAtlasPaging> | undefined
let skipping = false

function update () {
  frame = 0
  if (!root.value || !animated.value) { return }
  const rect = root.value.getBoundingClientRect()
  progress.value = atlasScrollProgress(rect.top, stableHeight(), timeline.units)
}
function cancelPaging () {
  paging?.cancel()
  pageTurn?.cancel()
  skipping = false
  pendingStop.value = undefined
}
function interruptPaging (event: Event) {
  const pagingControl = event.target instanceof Element && event.target.closest('.atlas-paging')
  if (pagingControl && ['pointerdown', 'touchstart'].includes(event.type)) { return }
  if (pagingControl && event instanceof KeyboardEvent && ['Enter', ' '].includes(event.key)) { return }
  cancelPaging()
}
function turnNote (direction: -1 | 1) {
  if (!root.value || !animated.value) { return }
  if (skipping) { pageTurn?.cancel(); skipping = false }
  paging?.advance(direction)
}
function wheel (event: WheelEvent) {
  if (!animated.value || narrow.value || /hidden|clip/.test(getComputedStyle(document.body).overflowY)) {
    cancelPaging()
    return false
  }
  if (event.deltaY === 0 || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) { return false }
  if (skipping) { pageTurn?.cancel(); skipping = false }
  return paging?.wheel(event) ?? false
}
defineExpose({ wheel, stage })

function exitPosition () {
  const destination = after.value
  if (!destination) { return window.scrollY }
  const viewport = window.visualViewport
  const viewportBottom = viewport ? viewport.offsetTop + viewport.height : window.innerHeight
  return Math.max(0, window.scrollY + destination.getBoundingClientRect().bottom - viewportBottom)
}
function stableHeight () {
  return composition.value ? Number.parseFloat(getComputedStyle(composition.value).minHeight) : 0
}
function schedule () {
  frame ||= requestAnimationFrame(update)
}
function preferences () {
  const wasAnimated = animated.value
  const wasNarrow = narrow.value
  const activeId = layer.value?.id
  const rect = root.value?.getBoundingClientRect()
  const wasReading = ready.value && rect && rect.top < 0 && rect.bottom > 0
  reduced.value = motion?.matches ?? false
  narrow.value = mobile?.matches ?? false
  shortViewport.value = stableHeight() < 600
  if (pendingStop.value !== undefined && (wasNarrow !== narrow.value || Math.abs(stableHeight() - pagingHeight) > 0.5)) { cancelPaging() }
  if (wasReading && wasAnimated !== animated.value) {
    cancelPaging()
    nextTick(() => {
      const target = !animated.value && activeId
        ? root.value?.querySelector<HTMLElement>(`[data-atlas-layer="${activeId}"]`)
        : root.value
      target?.scrollIntoView({ block: 'start', behavior: 'instant' })
    })
  }
  schedule()
}
function resized () { cancelPaging(); preferences() }
function start () {
  if (listening) { return }
  listening = true
  const scrollHost = {
    position: () => window.scrollY,
    now: () => performance.now(),
    scroll: (top: number) => window.scrollTo({ top, behavior: 'instant' }),
    request: (callback: FrameRequestCallback) => requestAnimationFrame(callback),
    cancel: (id: number) => cancelAnimationFrame(id),
  }
  pageTurn = createAtlasScroll(scrollHost)
  paging = createAtlasPaging({
    ...scrollHost,
    stops: () => {
      if (!root.value) { return [] }
      const top = root.value.getBoundingClientRect().top + window.scrollY
      return [...readingStops.map(stop => top + stop * stableHeight() * timeline.units * 0.46), exitPosition()]
    },
    duration: (from, to) => Math.max(from, to) >= readingStops.length
      ? atlasExitDuration
      : atlasTurnDuration(timeline, readingStops[from]!, readingStops[to]!),
    easing: (from, to) => Math.max(from, to) >= readingStops.length
      ? undefined
      : atlasTurnEasing(timeline, readingStops[from]!, readingStops[to]!),
    target: (index) => { pendingStop.value = index; pagingHeight = stableHeight() },
    complete: (index) => {
      if (index === readingStops.length) { after.value?.focus({ preventScroll: true }) }
      schedule()
    },
  })
  motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  mobile = window.matchMedia('(max-width: 760px), (max-height: 600px)')
  preferences()
  ready.value = true
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', resized)
  window.addEventListener('touchstart', interruptPaging, { passive: true })
  window.addEventListener('touchmove', interruptPaging, { passive: true })
  window.addEventListener('pointerdown', interruptPaging)
  window.addEventListener('keydown', interruptPaging)
  motion.addEventListener('change', preferences)
  mobile.addEventListener('change', preferences)
  resize = new ResizeObserver(preferences)
  if (root.value) { resize.observe(root.value) }
  if (composition.value) { resize.observe(composition.value) }
  schedule()
}
function stop () {
  listening = false
  cancelPaging()
  cancelAnimationFrame(frame)
  frame = 0
  window.removeEventListener('scroll', schedule)
  window.removeEventListener('resize', resized)
  window.removeEventListener('touchstart', interruptPaging)
  window.removeEventListener('touchmove', interruptPaging)
  window.removeEventListener('pointerdown', interruptPaging)
  window.removeEventListener('keydown', interruptPaging)
  motion?.removeEventListener('change', preferences)
  mobile?.removeEventListener('change', preferences)
  resize?.disconnect()
}
function noteOpacity (index: number) {
  return state.value.notes[index]
}
async function toggleReading () {
  cancelPaging()
  manual.value = !manual.value
  await nextTick()
  root.value?.scrollIntoView({ block: 'start', behavior: 'instant' })
  schedule()
}
function skip () {
  cancelPaging()
  const destination = after.value
  if (!destination) { return }
  const complete = () => { skipping = false; destination.focus({ preventScroll: true }) }
  if (reduced.value) {
    window.scrollTo({ top: exitPosition(), behavior: 'instant' })
    complete()
    return
  }
  skipping = true
  pageTurn?.start(exitPosition, complete, atlasExitDuration)
}
onMounted(start)
onActivated(() => { start(); schedule() })
onDeactivated(stop)
onBeforeUnmount(stop)
</script>

<template>
  <section
    id="lore"
    ref="root"
    tabindex="-1"
    class="world-atlas"
    :class="{ 'is-animated': animated }"
    :style="animated ? { height } : undefined"
    :aria-label="text(atlasCopy.title)"
  >
    <div class="atlas-sheet">
      <div
        ref="stage"
        class="atlas-stage"
      >
        <div
          class="atlas-paper"
        />
        <div
          v-if="animated"
          class="atlas-veil"
          :style="{ opacity: 1 - paperVisibility }"
          aria-hidden="true"
        />
        <div
          class="atlas-grain"
          aria-hidden="true"
        />
        <div
          class="atlas-border"
          aria-hidden="true"
        />
        <div
          ref="composition"
          class="atlas-composition"
        >
          <header class="atlas-running-head">
            <span>EVERGLOW <i>/</i> FIELD ATLAS</span><span class="atlas-volume">YGGDRASIL · VOL. 01</span>
          </header>
          <div
            class="atlas-toolbar"
            :style="animated && paperVisibility < 0.5 ? { '--atlas-muted': '#e5d8b6' } : undefined"
          >
            <button
              v-if="ready && !reduced && !shortViewport"
              type="button"
              @click="toggleReading"
            >
              {{ text(animated ? atlasCopy.static : atlasCopy.animated) }}
            </button>
            <button
              type="button"
              @click="skip"
            >
              {{ text(atlasCopy.skip) }} <span aria-hidden="true">↗</span>
            </button>
          </div>
          <template v-if="animated">
            <div class="atlas-drawing">
              <HomeAtlasTree
                :camera="camera"
                :map="state.map"
                :active="state.layer"
                :focus="state.title"
                :illustration="state.illustration"
                :unknown="state.unknown"
              />
            </div>
            <article
              v-if="layer"
              class="atlas-reading"
              :aria-label="text(layer.name)"
            >
              <div
                class="atlas-layer-title"
                :style="{ opacity: state.title }"
              >
                <p class="atlas-kicker">
                  LAYER {{ layer.numeral }} <span>—</span> YGGDRASIL
                </p><h3>{{ text(layer.name) }}</h3><p class="atlas-latin">
                  {{ layer.english }}
                </p><p class="atlas-description">
                  {{ text(layer.description) }}
                </p>
              </div>
              <div
                class="atlas-details"
                :class="{ 'has-three': layer.details.length === 3 }"
              >
                <aside
                  v-for="(detail, index) in layer.details"
                  :key="detail.id"
                  class="atlas-annotation"
                  :data-atlas-detail="detail.id"
                  :style="{ opacity: noteOpacity(index) }"
                  :aria-hidden="(noteOpacity(index) ?? 0) < 0.1"
                >
                  <HomeAtlasDetailImage
                    :detail="detail"
                    :label="text(detail.name)"
                  />
                  <h4>{{ text(detail.name) }}</h4>
                  <p v-if="detail.description">
                    {{ text(detail.description) }}
                  </p>
                </aside>
              </div>
            </article>
            <div
              class="atlas-unknown"
              :style="{ opacity: state.unknown * (1 - state.returning) }"
              :aria-hidden="state.unknown * (1 - state.returning) < 0.1"
            >
              <p class="atlas-kicker">
                {{ unchartedLabel }}
              </p><h3>{{ text(atlasCopy.unknown) }}</h3>
            </div>
            <div
              class="atlas-location"
              :style="{ opacity: state.map }"
              aria-hidden="true"
            >
              <span>↑</span><span
                v-for="level in [...unchartedLayers].reverse()"
                :key="level.numeral"
                class="is-unknown"
              >·</span><span
                v-for="(level, index) in [...atlasLayers].reverse()"
                :key="level.id"
                :class="{ 'is-current': state.layer === atlasLayers.length - index - 1 }"
              >{{ level.numeral }}</span><span>⌁</span>
            </div>
            <footer
              class="atlas-running-foot"
              :class="{ 'atlas-paging': narrow }"
            >
              <template v-if="narrow">
                <button
                  type="button"
                  :disabled="readingIndex === 0"
                  @click="turnNote(-1)"
                >
                  <span aria-hidden="true">←</span> {{ text(atlasCopy.previous) }}
                </button>
                <span aria-hidden="true">FOLIO / {{ layer ? layer.numeral : state.unknown > 0.5 ? '∞' : '00' }}</span>
                <button
                  type="button"
                  @click="turnNote(1)"
                >
                  {{ text(atEnding ? atlasCopy.continue : atlasCopy.next) }} <span aria-hidden="true">→</span>
                </button>
              </template>
              <template v-else>
                <span aria-hidden="true" /><span aria-hidden="true">↓</span><span>FOLIO / {{ layer ? layer.numeral : state.unknown > 0.5 ? '∞' : '00' }}</span>
              </template>
            </footer>
          </template>
          <div
            v-else
            class="atlas-static"
          >
            <div class="atlas-static-opening">
              <HomeAtlasTree
                camera="translate(500 600) scale(0.88) translate(-500 -600)"
                :map="0.3"
                :active="-1"
                :focus="0"
                :illustration="0"
                :unknown="0"
              />
            </div>
            <article
              v-for="entry in atlasLayers"
              :key="entry.id"
              class="atlas-static-layer"
              :data-atlas-layer="entry.id"
            >
              <p class="atlas-kicker">
                LAYER {{ entry.numeral }}
              </p><h3>{{ text(entry.name) }}</h3><p class="atlas-latin">
                {{ entry.english }}
              </p><p>{{ text(entry.description) }}</p>
              <figure>
                <HomeAtlasLandscape
                  class="atlas-static-landscape"
                  :landscape="entry.landscape"
                  :sky="entry.sky"
                  :foreground="entry.foreground"
                  :alt="text(entry.imageAlt)"
                />
              </figure>
              <div
                v-for="detail in entry.details"
                :key="detail.id"
                class="atlas-static-detail"
                :data-atlas-detail="detail.id"
              >
                <HomeAtlasDetailImage
                  :detail="detail"
                  :label="text(detail.name)"
                />
                <h4>{{ text(detail.name) }}</h4>
                <p v-if="detail.description">
                  {{ text(detail.description) }}
                </p>
              </div>
            </article>
            <div class="atlas-static-ending">
              <p>{{ unchartedLabel }}</p><h3>{{ text(atlasCopy.unknown) }}</h3>
              <HomeAtlasTree
                camera="translate(500 600) scale(0.88) translate(-500 -600)"
                :map="1"
                :active="-1"
                :focus="0"
                :illustration="0"
                :unknown="1"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section
    id="after-atlas"
    ref="after"
    class="atlas-after"
    tabindex="-1"
  >
    <p>{{ text(atlasCopy.continuation) }}</p><div>
      <NuxtLinkLocale to="/docs/getting-started/installation">
        {{ text(atlasCopy.download) }} <span aria-hidden="true">↗</span>
      </NuxtLinkLocale><a
        :href="siteLinks.discord"
        target="_blank"
        rel="noopener noreferrer"
      >Discord ↗</a><a
        :href="siteLinks.github"
        target="_blank"
        rel="noopener noreferrer"
      >GitHub ↗</a><a
        :href="siteLinks.wiki"
        target="_blank"
        rel="noopener noreferrer"
      >Wiki ↗</a>
    </div>
  </section>
</template>

<style src="~/assets/css/world-atlas.css" />
