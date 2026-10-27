<script setup lang="ts">
const { progress, isLoading, error } = useNavigationProgress()
</script>

<template>
  <div
    class="navigation-progress"
    :class="{ 'is-loading': isLoading, 'is-error': error }"
    :style="{ transform: `scaleX(${progress / 100})` }"
    aria-hidden="true"
  >
    <span class="navigation-progress-shimmer" />
  </div>
  <!-- Keep the sprite outside the scaled bar so its pixel proportions stay intact. -->
  <span
    class="navigation-butterfly"
    :class="{ 'is-loading': isLoading }"
    :style="{ left: `clamp(18px, ${progress}%, calc(100% - 18px))` }"
    aria-hidden="true"
  >
    <span class="navigation-butterfly-flight">
      <span class="navigation-butterfly-sprite" />
    </span>
  </span>
</template>

<style scoped>
  .navigation-progress {
    position: fixed;
    top: var(--header-height);
    right: 0;
    left: 0;
    z-index: 4001;
    height: 3px;
    pointer-events: none;
    transform-origin: left;
    opacity: 0;
    transition: transform 0.1s, opacity 0.4s;
    color: var(--everglow-blue-3);
    background: currentColor;
    box-shadow: 0 0 6px currentColor, 0 3px 16px var(--everglow-trans-blue-3);
  }

  .navigation-progress.is-loading {
    opacity: 1;
  }

  .navigation-butterfly {
    position: fixed;
    top: calc(var(--header-height) + 1.5px);
    z-index: 4002;
    width: 36px;
    height: 34px;
    pointer-events: none;
    transform: translate(-50%, -50%);
    opacity: 0;
    transition: left 0.1s, opacity 0.4s;
    filter: drop-shadow(0 0 4px #80ccffb3) drop-shadow(0 0 9px #548aff80);
  }

  .navigation-butterfly.is-loading {
    opacity: 1;
  }

  .navigation-butterfly-flight,
  .navigation-butterfly-sprite {
    display: block;
    width: 100%;
    height: 100%;
    animation-play-state: paused;
  }

  .navigation-butterfly-flight {
    animation: butterfly-hover 1.2s ease-in-out infinite paused;
  }

  .navigation-butterfly-sprite {
    background: url('/images/ui/summoned-butterfly.png') no-repeat 0 0 / 36px 136px;
    image-rendering: pixelated;
    transform: scaleX(-1);
    /* Four 36×34 frames, matching the game's ten ticks per frame at 60 fps. */
    animation: butterfly-flap 0.667s steps(4) infinite paused;
  }

  .is-loading .navigation-butterfly-flight,
  .is-loading .navigation-butterfly-sprite {
    animation-play-state: running;
  }

  @keyframes butterfly-flap {
    to { background-position-y: -136px; }
  }

  @keyframes butterfly-hover {
    0%, 100% { transform: translateY(1px) rotate(-4deg); }
    50% { transform: translateY(-2px) rotate(4deg); }
  }

  .navigation-progress-shimmer {
    position: absolute;
    inset: 0;
    overflow: hidden;
    background: linear-gradient(90deg, #5888ff, #9b79ff, #59caff, #9cf4ff, #5888ff);
    background-size: 200% 100%;
    animation: navigation-gradient 4s linear infinite paused;
  }

  .navigation-progress.is-loading .navigation-progress-shimmer {
    animation-play-state: running;
  }

  .navigation-progress.is-error {
    color: var(--everglow-red-4);
  }

  .navigation-progress.is-error .navigation-progress-shimmer {
    background: none;
  }

  @keyframes navigation-gradient {
    from { background-position: 0% 0; }
    to { background-position: -200% 0; }
  }

  @media (prefers-reduced-motion: reduce) {
    .navigation-progress,
    .navigation-butterfly {
      transition: none !important;
    }

    .navigation-butterfly-flight,
    .navigation-butterfly-sprite,
    .navigation-progress-shimmer {
      animation: none;
    }
  }
</style>
