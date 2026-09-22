<script setup lang="ts">
import { atlasCopy, atlasLayers, atlasText, unchartedLayers } from '~/data/world-atlas'
import { createAtlasScroll } from '~/utils/atlas-scroll'
import { atlasReadingIndex, atlasScrollProgress, atlasTurnDuration, createAtlasReadingStops, createAtlasTimeline, sampleAtlas } from '~/utils/atlas-timeline'

const { locale } = useI18n()
const text = (value: Parameters<typeof atlasText>[0]) => atlasText(value, locale.value)
const root = ref<HTMLElement>()
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

function update () {
  frame = 0
  if (!root.value || !animated.value) { return }
  const rect = root.value.getBoundingClientRect()
  progress.value = atlasScrollProgress(rect.top, stableHeight(), timeline.units)
}
function cancelPaging () {
  pageTurn?.cancel()
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
  if (direction === 1 && atEnding.value) { skip(); return }
  const index = Math.max(0, Math.min(readingStops.length - 1, readingIndex.value + direction))
  pendingStop.value = index
  pagingHeight = stableHeight()
  const top = root.value.getBoundingClientRect().top + window.scrollY
  const target = readingStops[index]!
  pageTurn?.start(top + target * pagingHeight * timeline.units * 0.46, () => {
    pendingStop.value = undefined
    schedule()
  }, atlasTurnDuration(timeline, progress.value, target))
}
function stableHeight () {
  return composition.value ? Number.parseFloat(getComputedStyle(composition.value).minHeight) : 0
}
function schedule () {
  frame ||= requestAnimationFrame(update)
}
function preferences () {
  const wasAnimated = animated.value
  const activeId = layer.value?.id
  const rect = root.value?.getBoundingClientRect()
  const wasReading = ready.value && rect && rect.top < 0 && rect.bottom > 0
  reduced.value = motion?.matches ?? false
  narrow.value = mobile?.matches ?? false
  shortViewport.value = stableHeight() < 600
  if (pendingStop.value !== undefined && (!narrow.value || Math.abs(stableHeight() - pagingHeight) > 0.5)) { cancelPaging() }
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
function start () {
  if (listening) { return }
  listening = true
  pageTurn = createAtlasScroll({
    position: () => window.scrollY,
    now: () => performance.now(),
    scroll: top => window.scrollTo({ top, behavior: 'instant' }),
    request: callback => requestAnimationFrame(callback),
    cancel: id => cancelAnimationFrame(id),
  })
  motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  mobile = window.matchMedia('(max-width: 760px), (max-height: 600px)')
  preferences()
  ready.value = true
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', preferences)
  window.addEventListener('wheel', interruptPaging, { passive: true })
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
  window.removeEventListener('resize', preferences)
  window.removeEventListener('wheel', interruptPaging)
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
  const target = () => {
    const viewport = window.visualViewport
    const viewportBottom = viewport ? viewport.offsetTop + viewport.height : window.innerHeight
    return Math.max(0, window.scrollY + destination.getBoundingClientRect().bottom - viewportBottom)
  }
  const complete = () => destination.focus({ preventScroll: true })
  if (reduced.value) {
    window.scrollTo({ top: target(), behavior: 'instant' })
    complete()
    return
  }
  pageTurn?.start(target, complete, 700)
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
    :aria-label="text(atlasCopy.subtitle)"
  >
    <div class="atlas-stage">
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
          <div
            class="atlas-introduction"
            :style="{ opacity: state.intro }"
            :aria-hidden="state.intro < 0.1"
          >
            <p class="atlas-kicker">
              {{ text(atlasCopy.subtitle) }}
            </p><h2>{{ text(atlasCopy.title) }}</h2><p class="atlas-intro-note">
              {{ text(atlasCopy.intro) }}
            </p><span
              class="atlas-seal"
              aria-hidden="true"
            >世<br>界</span>
          </div>
          <div
            class="atlas-discovery"
            :style="{ opacity: state.map * (1 - state.title) * (1 - state.unknown) }"
            aria-hidden="true"
          >
            <span>fig. 01</span><p>{{ text(atlasCopy.mapNote) }}</p><svg viewBox="0 0 140 70"><path d="M130 7Q55 -5 12 60m0 0 4-17m-4 17 18-5" /></svg>
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
            <p
              class="atlas-plate-caption"
              :style="{ opacity: state.illustration }"
            >
              {{ text(layer.place) }}
            </p>
            <aside
              class="atlas-annotation atlas-note"
              :style="{ opacity: noteOpacity(0) }"
              :aria-hidden="(noteOpacity(0) ?? 0) < 0.1"
            >
              <span class="atlas-small-label">01 / {{ text(atlasCopy.observation) }}</span><p>{{ text(layer.note) }}</p><svg
                viewBox="0 0 190 50"
                aria-hidden="true"
              ><path d="M6 8q90 48 170 4m0 0-19-1m19 1-9 16" /></svg>
            </aside>
            <aside
              class="atlas-annotation atlas-specimen"
              :style="{ opacity: noteOpacity(1) }"
              :aria-hidden="(noteOpacity(1) ?? 0) < 0.1"
            >
              <span class="atlas-small-label">02 / {{ text(atlasCopy.specimen) }}</span><div class="atlas-specimen-study">
                <img
                  :src="layer.specimenImage"
                  :alt="text(layer.specimen)"
                  :class="{ 'is-portrait': layer.id === 'town' }"
                  width="140"
                  height="150"
                ><span aria-hidden="true">a.</span>
              </div><h4>{{ text(layer.specimen) }}</h4><p>{{ text(layer.specimenNote) }}</p>
            </aside>
            <aside
              class="atlas-annotation atlas-mechanism"
              :style="{ opacity: noteOpacity(2) }"
              :aria-hidden="(noteOpacity(2) ?? 0) < 0.1"
            >
              <span aria-hidden="true">※</span><p>{{ text(layer.mechanism) }}</p>
            </aside>
            <aside
              class="atlas-annotation atlas-encounter"
              :style="{ opacity: noteOpacity(3) }"
              :aria-hidden="(noteOpacity(3) ?? 0) < 0.1"
            >
              <span class="atlas-small-label">03 / {{ text(atlasCopy.encounter) }}</span><img
                v-if="layer.encounterImage"
                :src="layer.encounterImage"
                :alt="text(layer.encounter)"
                class="atlas-pinned-image"
                width="270"
                height="150"
              ><span
                v-else
                class="atlas-question"
                aria-hidden="true"
              >?</span><h4>{{ text(layer.encounter) }}</h4><p>{{ text(layer.encounterNote) }}</p>
            </aside>
          </article>
          <div
            class="atlas-unknown"
            :style="{ opacity: state.unknown * (1 - state.closing) }"
            :aria-hidden="state.unknown * (1 - state.closing) < 0.1"
          >
            <p class="atlas-kicker">
              {{ unchartedLabel }}
            </p><h3>{{ text(atlasCopy.unknown) }}</h3><p>{{ text(atlasCopy.unknownNote) }}</p>
          </div>
          <p
            class="atlas-closing"
            :style="{ opacity: state.closing }"
            :aria-hidden="state.closing < 0.1"
          >
            Hang on to your dreams.
          </p>
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
              <span>{{ text(atlasCopy.scroll) }}</span><span aria-hidden="true">↓</span><span>FOLIO / {{ layer ? layer.numeral : state.unknown > 0.5 ? '∞' : '00' }}</span>
            </template>
          </footer>
        </template>
        <div
          v-else
          class="atlas-static"
        >
          <div class="atlas-static-opening">
            <h2>{{ text(atlasCopy.title) }}</h2><p>{{ text(atlasCopy.intro) }}</p><HomeAtlasTree
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
              <div
                class="atlas-static-landscape"
                :style="{ backgroundImage: `${entry.foreground ? `url(${entry.foreground}), ` : ''}url(${entry.landscape}), url(${entry.sky})` }"
                role="img"
                :aria-label="text(entry.place)"
              /><figcaption>{{ text(entry.place) }}</figcaption>
            </figure>
            <p>{{ text(entry.note) }}</p><div class="atlas-static-specimen">
              <img
                :src="entry.specimenImage"
                :alt="text(entry.specimen)"
                width="110"
                height="130"
                loading="lazy"
              ><div><h4>{{ text(entry.specimen) }}</h4><p>{{ text(entry.specimenNote) }}</p></div>
            </div>
            <p class="atlas-static-margin">
              ※ {{ text(entry.mechanism) }}
            </p><figure v-if="entry.encounterImage">
              <img
                :src="entry.encounterImage"
                :alt="text(entry.encounter)"
                width="600"
                height="334"
                loading="lazy"
              >
            </figure><h4>{{ text(entry.encounter) }}</h4><p>{{ text(entry.encounterNote) }}</p>
          </article>
          <div class="atlas-static-ending">
            <p>{{ unchartedLabel }}</p><h3>{{ text(atlasCopy.unknown) }}</h3><p>{{ text(atlasCopy.unknownNote) }}</p>
            <HomeAtlasTree
              camera="translate(500 600) scale(0.88) translate(-500 -600)"
              :map="1"
              :active="-1"
              :focus="0"
              :illustration="0"
              :unknown="1"
            />
            <p class="atlas-static-quote">
              Hang on to your dreams.
            </p>
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
        href="https://discord.gg/pdXvp89Dbp"
        target="_blank"
        rel="noopener noreferrer"
      >Discord ↗</a><a
        href="https://github.com/Solaestas/Everglow"
        target="_blank"
        rel="noopener noreferrer"
      >GitHub ↗</a><a
        href="https://terrariamods.wiki.gg/wiki/Everglow"
        target="_blank"
        rel="noopener noreferrer"
      >Wiki ↗</a>
    </div>
  </section>
</template>

<style src="~/assets/css/world-atlas.css" />
