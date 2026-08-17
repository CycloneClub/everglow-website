<script setup lang="ts">
const { t } = useI18n()

const keys = ['boss', 'weapons', 'scenes'] as const
const label = computed(() => t('home.showcase.label'))
const slides = computed(() =>
  keys.map((key, i) => ({
    caption: t(`home.showcase.${key}.caption`),
    index: String(i + 1).padStart(2, '0'),
    key,
    title: t(`home.showcase.${key}.title`),
  })),
)
</script>

<template>
  <HomeHorizontalScrollBase :label="label">
    <li
      v-for="slide in slides"
      :key="slide.key"
      class="pin-item showcase-slide"
    >
      <p>{{ label }} · {{ slide.index }} / 03</p>
      <h2>{{ slide.title }}</h2>
      <p>{{ slide.caption }}</p>
      <p>{{ slide.title }}</p>
    </li>
  </HomeHorizontalScrollBase>
</template>

<style lang="scss" scoped>
  .showcase-slide {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
    padding: 6rem max(1.5rem, 8vw);

    > p:first-child {
      color: #7dd3fc;
      font-size: clamp(1rem, 1.15vw, 1.25rem);
      font-weight: 500;
      letter-spacing: 0.18em;
      text-transform: uppercase;
    }

    h2,
    > p:nth-child(3) {
      position: relative;
      z-index: 1;
    }

    h2 {
      max-width: 16ch;
      margin-top: 0.75rem;
      font-size: clamp(3.5rem, 9vw, 10rem);
      font-weight: 500;
      letter-spacing: 0.02em;
      line-height: 1.08;
    }

    > p:nth-child(3) {
      max-width: 36rem;
      margin-top: 1.35rem;
      color: #cbd5e1;
      font-size: clamp(1.125rem, 1.5vw, 1.75rem);
      line-height: 1.65;
    }

    > p:last-child {
      position: absolute;
      right: 4vw;
      bottom: 8vh;
      z-index: 0;
      color: rgb(248 250 252 / 8%);
      font-size: clamp(4rem, 18vw, 12rem);
      font-weight: 500;
      letter-spacing: 0.02em;
      pointer-events: none;
      user-select: none;
    }
  }
</style>
