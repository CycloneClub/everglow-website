<script setup lang="ts">
import type { HeaderMenuState } from '#shared/types'

const { state, menuList } = defineProps<{
  state: HeaderMenuState
  menuList: { name: string, link: string }[]
}>()

const emit = defineEmits(['close', 'openDocs', 'back', 'focusTrigger'])
const menu = ref<HTMLElement>()
const { locale } = useI18n()
const { data: navigation } = await useDocsNav()
const navLinks = computed(() => mapContentNavigation(
  mapLocaleDocsNavigation(navigation.value, locale.value),
))

const focusPanel = () => {
  if (state === 'docs') {
    menu.value?.querySelector<HTMLButtonElement>('.return-btn')?.focus()
  } else if (state === 'main') {
    menu.value?.querySelector<HTMLButtonElement>('.docs-trigger')?.focus()
  }
}

const leavePanel = (element: Element) => {
  if (element.contains(document.activeElement)) { emit('focusTrigger') }
  element.setAttribute('inert', '')
}

const resetPanelScroll = () => {
  if (menu.value) { menu.value.scrollTop = 0 }
}

watch(() => state, async (current, previous) => {
  await nextTick()
  if (current === 'main' && previous === 'closed') {
    menu.value?.querySelector<HTMLAnchorElement>('.main-menu a')?.focus()
  }
})
</script>

<template>
  <nav
    id="header-menu"
    ref="menu"
    class="header-menu"
    :data-state="state"
  >
    <Transition
      :name="state === 'docs' ? 'menu-forward' : 'menu-back'"
      mode="out-in"
      @before-leave="leavePanel"
      @after-leave="resetPanelScroll"
      @after-enter="focusPanel"
    >
      <CommonHeaderSubMenuDocs
        v-if="state === 'docs'"
        id="header-docs-menu"
        key="docs"
        class="docs-panel"
        :links="navLinks"
        @return="emit('back')"
        @navigate="emit('close')"
      />
      <ul
        v-else
        key="main"
        class="main-menu"
      >
        <CommonHeaderMenuItem
          v-for="item in menuList"
          :key="item.name"
          :name="item.name"
          :link="item.link"
          @navigate="emit('close')"
          @open-docs="emit('openDocs')"
        />
      </ul>
    </Transition>
  </nav>
</template>

<style lang="scss" scoped>
  .header-menu {
    display: flex;
    align-items: center;
    font-family: 'Public Sans', 'LXGW WenKai', sans-serif;
    font-weight: var(--font-weight--normal);
    font-size: 1.3rem;

    :deep(.navigation-links) {
      font-family: 'DM Sans', 'LXGW WenKai', sans-serif;
      font-size: 1.3rem;
    }

    :deep(.navigation-accordion-item > .title) {
      font-size: 1.5rem;
    }
  }

  .main-menu {
    display: flex;
    align-items: center;
    column-gap: 3rem;
  }

  .docs-panel {
    display: none;
  }

  @media only screen and (max-width: 833px) {
    .header-menu {
      position: absolute;
      top: var(--header-height);
      left: 0;
      display: block;
      width: 100%;
      height: calc(100dvh - var(--header-height));
      background-color: var(--everglow-white);
      overflow-y: auto;
      overflow-x: hidden;
      overscroll-behavior: contain;
      visibility: hidden;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease-in-out;

      &[data-state='main'],
      &[data-state='docs'] {
        visibility: visible;
        opacity: 1;
        pointer-events: auto;
      }

    }

    .main-menu {
      min-height: 100%;
      flex-direction: column;
      align-items: stretch;
      justify-content: center;
      padding: 0 40px;
    }

    .docs-panel {
      display: block;
    }

    .menu-forward-enter-active,
    .menu-forward-leave-active,
    .menu-back-enter-active,
    .menu-back-leave-active {
      transition: opacity 0.12s ease, transform 0.12s ease;
    }

    .menu-forward-enter-from,
    .menu-back-leave-to {
      opacity: 0;
      transform: translateX(16px);
    }

    .menu-forward-leave-to,
    .menu-back-enter-from {
      opacity: 0;
      transform: translateX(-16px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .header-menu,
    .menu-forward-enter-active,
    .menu-forward-leave-active,
    .menu-back-enter-active,
    .menu-back-leave-active {
      transition: none;
    }
  }
</style>
