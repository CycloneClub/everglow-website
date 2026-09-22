import type { Langs } from '#shared/types'
import type { ReadingLayout, ReadingPosition } from '~/utils/locale-reading'
import { captureReadingPosition, isLocaleOnlyNavigation, restoreReadingPosition } from '~/utils/locale-reading'

function readLayout (): ReadingLayout {
  const atlas = document.querySelector<HTMLElement>('.world-atlas.is-animated')
  const stage = atlas?.querySelector<HTMLElement>('.atlas-stage')
  const rect = atlas?.getBoundingClientRect()
  const blocks = Array.from(document.querySelectorAll<HTMLElement>('main h1, main h2, main h3, main h4, main p, main figure'))
    .filter(element => !element.closest('.world-atlas.is-animated, .aside, .toc, nav, aside, [aria-hidden="true"]'))
    .filter(element => element.getClientRects().length && element.getBoundingClientRect().height > 0)
    .map(element => ({ id: element.id, top: element.getBoundingClientRect().top + window.scrollY }))
  return {
    viewport: window.innerHeight,
    pageHeight: document.documentElement.scrollHeight,
    blocks,
    atlas: rect && stage ? { top: rect.top + window.scrollY, height: rect.height, stageHeight: stage.offsetHeight } : undefined,
  }
}

export default defineNuxtPlugin({
  name: 'locale-reading',
  dependsOn: ['i18n:plugin'],
  setup (app) {
    const router = useRouter()
    const switchLocalePath = useSwitchLocalePath()
    let pending: { from: string, to: string, position: ReadingPosition, left: number } | undefined
    let switching = false
    let installed = false

    // Nuxt replaces scrollBehavior during initial navigation. Install only when
    // the user first switches language, after the router has finished setup.
    function installScrollRestoration () {
      if (installed) { return }
      installed = true
      const ordinaryScroll = router.options.scrollBehavior
      router.options.scrollBehavior = async (to, from, savedPosition) => {
        const request = pending
        pending = undefined
        const preserve = request && !savedPosition
        && request.from === from.fullPath && request.to === to.fullPath
        && isLocaleOnlyNavigation(from, to, app.$i18n.availableLocales)

        // Let Nuxt wait for page:loading:end, including async translated content.
        // Its returned position is only applied by Vue Router after this wrapper returns.
        const ordinaryPosition = await ordinaryScroll?.call(router, to, from, savedPosition)
        if (!preserve) { return ordinaryPosition }
        await nextTick()
        if (router.currentRoute.value.fullPath !== to.fullPath) { return false }
        return { left: request.left, top: restoreReadingPosition(request.position, readLayout()), behavior: 'instant' }
      }
    }

    return {
      provide: {
        switchLocalePreservingPosition: async (code: Langs) => {
          if (switching || code === app.$i18n.locale.value) { return }
          installScrollRestoration()
          const from = router.currentRoute.value
          const to = router.resolve(switchLocalePath(code))
          const request = isLocaleOnlyNavigation(from, to, app.$i18n.availableLocales)
            ? { from: from.fullPath, to: to.fullPath, position: captureReadingPosition({ ...readLayout(), scrollY: window.scrollY }), left: window.scrollX }
            : undefined
          pending = request
          switching = true
          try {
            await app.$i18n.setLocale(code)
          } finally {
            switching = false
            // Cancel failed/redirected navigation without clearing a successful
            // request before Vue Router has had the chance to consume it.
            if (pending === request && router.currentRoute.value.fullPath !== to.fullPath) { pending = undefined }
          }
        },
      },
    }
  },
})
