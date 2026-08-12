<script setup lang="ts">
const i18n = useI18n()

const workspaces = [
  {
    id: 'scene',
    name: 'Scene',
    description: 'Explore a real-time Three.js scene with water, sky, and lighting.',
    icon: 'lucide:box',
  },
  {
    id: 'hlsl-preview',
    name: 'HLSL Preview',
    description: 'Experiment with C# geometry and WebGL2 shaders in the browser.',
    icon: 'lucide:code-2',
  },
]

useHead({
  title: i18n.t('head.subtitles.playground'),
})
</script>

<template>
  <section
    class="playground-home"
    aria-labelledby="playground-title"
  >
    <div class="playground-home__content">
      <NuxtLinkLocale
        class="playground-home__brand"
        to="/"
        aria-label="Everglow home"
      >
        <EverglowLogo :size="30" />
        <span>EVERGLOW</span>
      </NuxtLinkLocale>

      <div class="playground-home__hero">
        <p class="playground-home__eyebrow">
          PLAYGROUND
        </p>
        <h1 id="playground-title">
          Build, preview, and explore.
        </h1>
        <p>
          Choose a workspace to try Everglow's interactive experiments.
        </p>
      </div>

      <nav
        class="workspace-grid"
        aria-label="Playground workspaces"
      >
        <NuxtLinkLocale
          v-for="workspace in workspaces"
          :key="workspace.id"
          :to="`/playground/${workspace.id}`"
          class="workspace-card"
        >
          <Icon :name="workspace.icon" />
          <div>
            <h2>{{ workspace.name }}</h2>
            <p>{{ workspace.description }}</p>
          </div>
          <Icon
            class="workspace-card__arrow"
            name="lucide:arrow-up-right"
          />
        </NuxtLinkLocale>
      </nav>
    </div>
  </section>
</template>

<style lang="scss" scoped>
  .playground-home {
    min-height: 100svh;
    margin-top: var(--header-height);
    padding: clamp(1.5rem, 5vw, 4rem);
    color: #e2e8f0;
    background:
      radial-gradient(circle at top right, rgb(14 116 144 / 36%), transparent 32rem),
      #111827;
  }

  .playground-home__content {
    width: min(100%, 68rem);
    margin: 0 auto;
  }

  .playground-home__brand {
    display: inline-flex;
    gap: 0.625rem;
    align-items: center;
    color: #f8fafc;
    font-size: 0.8125rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-decoration: none;
  }

  .playground-home__hero {
    max-width: 42rem;
    margin: clamp(5rem, 14vh, 9rem) 0 3rem;

    p {
      max-width: 34rem;
      margin: 1rem 0 0;
      color: #94a3b8;
      font-size: clamp(1rem, 2vw, 1.1875rem);
      line-height: 1.65;
    }
  }

  .playground-home__eyebrow {
    color: #7dd3fc !important;
    font-size: 0.75rem !important;
    font-weight: 700;
    letter-spacing: 0.16em;
  }

  h1,
  h2 {
    margin: 0;
  }

  h1 {
    margin-top: 0.75rem;
    color: #f8fafc;
    font-size: clamp(2.25rem, 6vw, 4.5rem);
    letter-spacing: -0.05em;
    line-height: 1.05;
  }

  .workspace-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  .workspace-card {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 1rem;
    align-items: start;
    min-height: 10rem;
    padding: 1.5rem;
    color: inherit;
    text-decoration: none;
    background: rgb(23 32 51 / 86%);
    border: 1px solid rgb(148 163 184 / 22%);
    border-radius: 0.75rem;
    transition: transform 150ms ease, background-color 150ms ease,
      border-color 150ms ease;

    > :deep(svg) {
      width: 1.375rem;
      height: 1.375rem;
      color: #7dd3fc;
    }

    &:hover {
      background: #243047;
      border-color: rgb(125 211 252 / 64%);
      transform: translateY(-0.25rem);
    }

    &:focus-visible {
      outline: 2px solid #7dd3fc;
      outline-offset: 0.25rem;
    }

    h2 {
      color: #f8fafc;
      font-size: 1.125rem;
    }

    p {
      margin: 0.5rem 0 0;
      color: #94a3b8;
      font-size: 0.9375rem;
      line-height: 1.55;
    }
  }

  .workspace-card__arrow {
    color: #94a3b8 !important;
  }

  @media (max-width: 40rem) {
    .workspace-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .workspace-card {
      transition: none;
    }
  }
</style>
