<template>
  <section
    id="lore"
    class="home-lore"
    aria-labelledby="lore-title"
  >
    <p>{{ $t('home.lore.eyebrow') }}</p>
    <h2 id="lore-title">
      {{ $t('home.lore.title') }}
    </h2>
    <p>{{ $t('home.lore.comingSoon') }}</p>
  </section>
</template>

<style lang="scss" scoped>
  .home-lore {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100dvh;
    padding: 6rem max(1.5rem, 7vw);
    text-align: center;
    color: var(--everglow-black);
    background: var(--everglow-grey-0);

    p:first-child {
      color: var(--everglow-blue-5);
      font-size: clamp(1rem, 1.15vw, 1.25rem);
      font-weight: 500;
      letter-spacing: 0.18em;
      text-transform: uppercase;
    }

    h2 {
      margin-top: 0.75rem;
      font-size: clamp(2.75rem, 7vw, 6rem);
      font-weight: 500;
      letter-spacing: 0.02em;
      line-height: 1.12;
    }

    p:last-child {
      margin-top: 1.15rem;
      color: var(--everglow-font-color-1);
      font-size: clamp(1.125rem, 1.4vw, 1.5rem);
    }
  }
</style>
