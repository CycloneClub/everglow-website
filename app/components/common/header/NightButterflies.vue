<script setup lang="ts">
const fluttering = ref(false)
const butterflyFlights = [-60, -38, 56].map((drift, index) => ({
  drift,
  delay: 0.12 + index * 0.09,
  path: `M 0 0 C ${drift * 0.18} 18 ${drift * 0.65} 30 ${drift * 0.9} 8 S ${drift * 1.45} -12 ${drift} -52`,
}))
const colorMode = useColorMode()

const changeColorMode = (mode: 'light' | 'dark') => {
  // Keep the restriction at the preference write, so other theme consumers
  // and future theme switching remain available.
  if (mode === 'light') {
    fluttering.value ||= true
    return
  }

  colorMode.preference = mode
}
</script>

<template>
  <button
    type="button"
    class="icon-button night-butterflies"
    :aria-label="$t('body.header.toggleTheme')"
    @click="changeColorMode(colorMode.value === 'dark' ? 'light' : 'dark')"
  >
    <span
      :class="['moon', { shaking: fluttering }]"
      aria-hidden="true"
    >
      <Icon :name="colorMode.value === 'dark' ? 'line-md:sunny-outline-to-moon-loop-transition' : 'line-md:moon-filled-alt-to-sunny-filled-loop-transition'" />
    </span>
    <span
      v-if="fluttering"
      class="butterfly-flock"
      aria-hidden="true"
    >
      <span
        v-for="(flight, index) in butterflyFlights"
        :key="index"
        class="butterfly-flight"
        :style="{
          '--drift': `${flight.drift}px`,
          '--delay': `${flight.delay}s`,
          '--flight-path': `path('${flight.path}')`,
        }"
        @animationend.self="index === butterflyFlights.length - 1 && (fluttering = false)"
      >
        <svg
          class="butterfly-trail"
          viewBox="-100 -60 200 130"
          focusable="false"
        >
          <path
            v-for="segment in 3"
            :key="segment"
            :d="flight.path"
            pathLength="100"
            :style="{
              '--tail-offset': `${segment * 6}px`,
              'opacity': 0.6 / segment,
              'strokeWidth': `${2.4 - segment * 0.4}px`,
            }"
          />
        </svg>
        <span class="butterfly">
          <span class="butterfly-emergence">
            <span class="butterfly-sprite" />
          </span>
        </span>
      </span>
    </span>
    <Teleport to="body">
      <Transition name="night-dim">
        <div
          v-if="fluttering"
          class="night-screen-off"
          aria-hidden="true"
        />
      </Transition>
    </Teleport>
  </button>
</template>

<style scoped>
.night-butterflies {
  position: relative;
  isolation: isolate;
  cursor: pointer;
}

.moon {
  position: relative;
  z-index: 1;
  display: inline-flex;
  width: 20px;
  height: 20px;
}

.moon :deep(.iconify) {
  width: 100%;
  height: 100%;
}

.night-butterflies:hover .moon {
  filter: drop-shadow(0 0 4px currentColor);
}

.shaking {
  animation: moon-shake 0.3s ease-in-out;
}

.night-screen-off {
  position: fixed;
  inset: 0;
  /* Keep the header button and its butterflies above the dimmed page. */
  z-index: 3999;
  background: #05080d;
  opacity: 0.36;
  pointer-events: none;
}

.night-dim-enter-active,
.night-dim-leave-active {
  transition: opacity 0.35s ease-in-out;
}

.night-dim-enter-from,
.night-dim-leave-to {
  opacity: 0;
}

.butterfly-flock {
  position: absolute;
  z-index: 0;
  top: -80px;
  left: -80px;
  width: calc(100% + 160px);
  height: calc(100% + 160px);
  pointer-events: none;
}

.butterfly-flight {
  --flight-duration: 2s;
  --flight-easing: cubic-bezier(0.35, 0, 0.5, 1);
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  pointer-events: none;
  animation: butterfly-flight-fade var(--flight-duration) var(--delay) ease-in-out both;
}

.butterfly {
  position: absolute;
  top: 0;
  left: 0;
  width: 46px;
  height: 46px;
  pointer-events: none;
  filter: drop-shadow(0 0 4px #80ccffb3) drop-shadow(0 0 9px #548aff80);
  offset-path: var(--flight-path);
  offset-position: 0 0;
  offset-anchor: center;
  /* Match the sprite's up-left heading to the path tangent, as in-game. */
  offset-rotate: auto 135deg;
  transform: scale(0.325);
  animation: butterfly-follow-path var(--flight-duration) var(--delay) var(--flight-easing) both;
}

.butterfly-trail {
  position: absolute;
  left: -100px;
  top: -60px;
  width: 200px;
  height: 130px;
  overflow: visible;
  fill: none;
  stroke: #80d8ff;
  stroke-linecap: round;
  filter: drop-shadow(0 0 3px #62baff);
}

.butterfly-trail path {
  /* Three adjoining segments grow dimmer away from the butterfly. */
  stroke-dasharray: 6 100;
  animation: butterfly-trail-flow var(--flight-duration) var(--delay) var(--flight-easing) both;
}

.butterfly-sprite {
  display: block;
  width: 46px;
  height: 46px;
  /* Keep the outline, color and shadow on the same animation frame. */
  background-image:
    url('/images/ui/glowing-butterfly-bound.png'),
    url('/images/ui/glowing-butterfly.png'),
    url('/images/ui/glowing-butterfly-dark.png');
  background-repeat: no-repeat;
  background-position: 0 0;
  background-size: 46px 276px;
  image-rendering: pixelated;
  animation: butterfly-flap 0.5s steps(6) infinite;
}

.butterfly-emergence {
  display: block;
  width: 46px;
  height: 46px;
  /* Reveal from the icon's center during takeoff. Keep the glow on the
     outer particle so it never gets cut into a rectangular dark patch. */
  animation: butterfly-emerge 0.12s var(--delay) ease-out both;
}

@keyframes butterfly-emerge {
  from { clip-path: inset(50%); }
  to { clip-path: inset(0); }
}

@keyframes moon-shake {
  0%, 100% { transform: rotate(0); }
  25% { transform: translateX(-2px) rotate(-12deg); }
  50% { transform: translateX(2px) rotate(10deg); }
  75% { transform: translateX(-1px) rotate(-6deg); }
}

@keyframes butterfly-follow-path {
  from { offset-distance: 0%; }
  to { offset-distance: 100%; }
}

@keyframes butterfly-trail-flow {
  from { stroke-dashoffset: var(--tail-offset); }
  to { stroke-dashoffset: calc(var(--tail-offset) - 100px); }
}

@keyframes butterfly-flight-fade {
  0%, 100% { opacity: 0; }
  12%, 70% { opacity: 1; }
}

@keyframes butterfly-flap {
  to { background-position-y: -276px; }
}

@media (prefers-reduced-motion: reduce) {
  .night-screen-off, .butterfly-trail { display: none; }
  .night-dim-enter-active, .night-dim-leave-active { transition: none; }
  .shaking, .butterfly, .butterfly-sprite, .butterfly-emergence { animation: none; }
  .butterfly-flight {
    animation: butterfly-fade 0.6s var(--delay) ease-out both;
  }
  .butterfly {
    top: -23px;
    left: -23px;
    offset-path: none;
    transform: translate(var(--drift), 0) scale(0.325);
  }
  @keyframes butterfly-fade {
    0%, 100% { opacity: 0; }
    40% { opacity: 0.7; }
  }
}
</style>
