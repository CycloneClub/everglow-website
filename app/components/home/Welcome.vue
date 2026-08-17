<script setup lang="ts">
const colorMode = useColorMode()
const { t, locale } = useI18n()
const isCjk = computed(() => locale.value.startsWith('zh'))

const bg = computed(() =>
  colorMode.value === 'light'
    ? '/images/light-sky.jpg'
    : '/images/star-sky.jpg',
)

const heroActions = computed(() => [
  {
    description: t('home.hero.getModDescription'),
    external: false,
    icon: 'lucide:download',
    key: 'mod',
    title: t('home.hero.getMod'),
    to: '/docs/getting-started/installation',
    variant: 'primary',
  },
  {
    brand: 'github' as const,
    description: t('home.hero.githubDescription'),
    external: true,
    key: 'github',
    title: t('home.hero.github'),
    to: 'https://github.com/Solaestas/Everglow',
    variant: 'ghost',
  },
])

const communityLinks = computed(() => [
  {
    brand: 'discord' as const,
    external: true,
    key: 'discord',
    label: t('home.community.discord'),
    to: 'https://discord.gg/pdXvp89Dbp',
  },
  {
    brand: 'bilibili' as const,
    external: true,
    key: 'bilibili',
    label: t('home.community.bilibili'),
    to: 'https://space.bilibili.com/1079503056',
  },
  {
    brand: 'qq' as const,
    external: false,
    key: 'qq',
    label: t('home.community.qq'),
    to: '/about',
  },
])
</script>

<template>
  <HomeParallexScrollBase
    :src="bg"
    cover
  >
    <div
      class="home-welcome"
      :class="{ 'is-cjk': isCjk }"
    >
      <a
        class="home-welcome__tml"
        href="https://www.tmodloader.net/"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="$t('home.hero.tmodloader')"
      >
        <img
          src="/images/tmodloader-logo.png"
          :alt="$t('home.hero.tmodloader')"
          width="220"
          height="220"
        >
      </a>
      <div class="home-welcome__copy">
        <p class="home-welcome__eyebrow">
          {{ $t('meta.team') }}
        </p>
        <h1>{{ $t('head.title') }}</h1>
        <p class="home-welcome__tagline">
          {{ $t('nuxtSiteConfig.description') }}
        </p>
        <div class="home-welcome__actions">
          <template
            v-for="action in heroActions"
            :key="action.key"
          >
            <a
              v-if="action.external"
              :class="['home-welcome__cta', `home-welcome__cta--${action.variant}`]"
              :href="action.to"
              target="_blank"
              rel="noopener noreferrer"
            >
              <HomeBrandIcon
                v-if="action.brand"
                :name="action.brand"
              />
              <Icon
                v-else
                :name="action.icon"
                mode="svg"
              />
              <span>
                <strong>{{ action.title }}</strong>
                <small>{{ action.description }}</small>
              </span>
              <Icon
                class="home-welcome__cta-arrow"
                name="lucide:arrow-up-right"
                mode="svg"
              />
            </a>
            <NuxtLinkLocale
              v-else
              :class="['home-welcome__cta', `home-welcome__cta--${action.variant}`]"
              :to="action.to"
            >
              <HomeBrandIcon
                v-if="action.brand"
                :name="action.brand"
              />
              <Icon
                v-else
                :name="action.icon"
                mode="svg"
              />
              <span>
                <strong>{{ action.title }}</strong>
                <small>{{ action.description }}</small>
              </span>
              <Icon
                class="home-welcome__cta-arrow"
                name="lucide:arrow-up-right"
                mode="svg"
              />
            </NuxtLinkLocale>
          </template>
        </div>
      </div>
      <ul class="home-welcome__community">
        <li
          v-for="link in communityLinks"
          :key="link.key"
        >
          <a
            v-if="link.external"
            :aria-label="link.label"
            :href="link.to"
            target="_blank"
            rel="noopener noreferrer"
          >
            <HomeBrandIcon
              class="home-welcome__community-icon"
              :name="link.brand"
            />
            <span>{{ link.label }}</span>
          </a>
          <NuxtLinkLocale
            v-else
            :aria-label="link.label"
            :to="link.to"
          >
            <HomeBrandIcon
              class="home-welcome__community-icon"
              :name="link.brand"
            />
            <span>{{ link.label }}</span>
          </NuxtLinkLocale>
        </li>
      </ul>
    </div>
  </HomeParallexScrollBase>
</template>

<style lang="scss" scoped>
  .home-welcome {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    width: 100%;
    height: 100%;
    padding:
      calc(var(--header-height) + 1.5rem)
      max(1.5rem, 6vw)
      max(2.75rem, 8vh)
      max(1.75rem, 7vw);
    color: var(--everglow-black);
    background: linear-gradient(
      to top,
      var(--everglow-trans-white-2) 0%,
      var(--everglow-trans-white-5) 38%,
      transparent 72%
    );
  }

  .home-welcome__tml,
  .home-welcome__cta {
    &:focus-visible {
      outline: 2px solid var(--everglow-blue-5);
      outline-offset: 0.2rem;
    }
  }

  .home-welcome__tml {
    position: absolute;
    top: calc(var(--header-height) + 0.75rem);
    right: max(1.5rem, 6vw);
    z-index: 2;
    display: block;
    width: 5.5rem;
    overflow: hidden;
    line-height: 0;
    border-radius: 0.85rem;
    box-shadow: var(--everglow-shadow-0);
    transition: transform 0.15s ease;

    img {
      display: block;
      width: 100%;
      height: auto;
    }

    &:hover {
      transform: translateY(-0.12rem);
    }
  }

  .home-welcome__copy {
    max-width: 52rem;
  }

  .home-welcome__eyebrow {
    color: var(--everglow-blue-5);
    font-size: 0.875rem;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  h1 {
    margin-top: 0.6rem;
    font-size: 4.5rem;
    font-weight: 500;
    letter-spacing: 0.02em;
    line-height: 1.08;
  }

  .home-welcome__tagline {
    max-width: 38rem;
    margin-top: 1.25rem;
    color: var(--everglow-font-color-2);
    font-size: 1.125rem;
    font-weight: 400;
    line-height: 1.65;
  }

  .home-welcome__actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.85rem;
    max-width: 42rem;
    margin-top: 2rem;
  }

  .home-welcome__cta {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 0.85rem;
    align-items: center;
    min-height: 5.5rem;
    padding: 1rem 1.1rem;
    border-radius: 0.85rem;
    transition:
      color 0.15s ease,
      background-color 0.15s ease,
      border-color 0.15s ease,
      transform 0.15s ease;

    &:hover {
      transform: translateY(-0.15rem);
    }

    &--primary {
      color: var(--everglow-white);
      background: var(--everglow-black);
      border: 1px solid var(--everglow-black);

      &:hover {
        background: var(--everglow-blue-5);
        border-color: var(--everglow-blue-5);
      }
    }

    &--ghost {
      color: var(--everglow-black);
      background: var(--everglow-trans-white-5);
      border: 1px solid var(--everglow-trans-black-3);

      &:hover {
        border-color: var(--everglow-blue-5);
      }
    }

    > span {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      min-width: 0;
    }

    strong {
      font-size: 1.0625rem;
      font-weight: 500;
      line-height: 1.2;
    }

    small {
      font-size: 0.875rem;
      font-weight: 400;
      line-height: 1.45;
      opacity: 0.78;
    }

    :deep(svg) {
      width: 1.35rem;
      height: 1.35rem;
    }
  }

  .home-welcome__cta-arrow {
    opacity: 0.7;
  }

  .home-welcome__community {
    position: relative;
    z-index: 2;
    display: flex;
    flex-shrink: 0;
    flex-wrap: wrap;
    align-items: baseline;
    column-gap: 1.75rem;
    row-gap: 0.75rem;
    margin-top: 2.25rem;
    padding-top: 1.25rem;
    border-top: 1px solid var(--everglow-trans-black-3);

    a {
      position: relative;
      z-index: 2;
      color: var(--everglow-font-color-2);
      font-size: 0.9375rem;
      line-height: 1.25;
      white-space: nowrap;
      cursor: pointer;

      &:hover {
        color: var(--everglow-blue-5);
      }
    }
  }

  .home-welcome__community-icon {
    display: inline-block;
    width: 1em;
    height: 1em;
    margin-inline-end: 0.45em;
    vertical-align: -0.125em;

    :deep(svg) {
      display: block;
      width: 100%;
      height: 100%;
    }
  }

  .home-welcome.is-cjk {
    .home-welcome__eyebrow {
      letter-spacing: 0.22em;
    }

    h1 {
      font-weight: 400;
      letter-spacing: 0.12em;
      line-height: 1.2;
    }

    .home-welcome__tagline,
    .home-welcome__cta small,
    .home-welcome__community a {
      letter-spacing: 0.04em;
    }

    .home-welcome__cta strong {
      font-weight: 500;
      letter-spacing: 0.06em;
    }
  }

  @media only screen and (max-width: 833px) {
    .home-welcome {
      padding-right: max(1.25rem, 5vw);
      padding-bottom: max(2.25rem, 6vh);
      padding-left: max(1.25rem, 5vw);
    }

    .home-welcome__actions {
      grid-template-columns: 1fr;
    }

    .home-welcome__tml {
      right: max(1.25rem, 5vw);
      width: 3.75rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .home-welcome__cta,
    .home-welcome__tml {
      transition: none;

      &:hover {
        transform: none;
      }
    }
  }
</style>
