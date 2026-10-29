import type { RouteLocationNormalized } from 'vue-router'
import { NavigationFailureType, isNavigationFailure } from 'vue-router'

export function useNavigationProgress () {
  const progress = ref(0)
  const isLoading = ref(false)
  const error = ref(false)

  if (import.meta.client) {
    const app = useNuxtApp()
    const router = useRouter()
    const renderedRoute = useRoute()
    let activeRoute: RouteLocationNormalized | undefined
    let pagePending = false
    let frame = 0
    let showTimer: ReturnType<typeof setTimeout> | undefined
    let hideTimer: ReturnType<typeof setTimeout> | undefined
    let resetTimer: ReturnType<typeof setTimeout> | undefined

    function clearTimers () {
      cancelAnimationFrame(frame)
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
      clearTimeout(resetTimer)
    }

    function start (to: RouteLocationNormalized) {
      clearTimers()
      activeRoute = to
      // A new route can supersede one that is still visible. Keep its position
      // instead of snapping the butterfly back across the viewport. Restart
      // hidden once it reaches the final stretch reserved for completion.
      if (!isLoading.value || progress.value > 90) {
        isLoading.value = false
        progress.value = 0
      }
      error.value = false
      showTimer = setTimeout(() => {
        isLoading.value = true
        const initialProgress = progress.value
        let started: number | undefined
        function advance (now: number) {
          started ??= now
          // Preserve Nuxt's original 1800ms estimated-progress curve, reserving
          // the final stretch so the butterfly stays onscreen while pending.
          const estimated = 200 / Math.PI * Math.atan((now - started) / 900)
          progress.value = Math.min(90, initialProgress + (100 - initialProgress) * estimated / 100)
          frame = requestAnimationFrame(advance)
        }
        frame = requestAnimationFrame(advance)
      }, 80)
    }

    function finish (failed = false) {
      if (!activeRoute) { return }
      activeRoute = undefined
      clearTimers()
      error.value = failed
      // Navigations resolved before the show delay need no visible animation.
      if (!isLoading.value) { progress.value = 0; return }
      const from = progress.value
      const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 0
        : Math.max(240, (100 - from) * 7)
      let started: number | undefined
      function complete (now: number) {
        started ??= now
        const elapsed = duration === 0 ? 1 : Math.min(1, (now - started) / duration)
        progress.value = from + (100 - from) * (1 - (1 - elapsed) ** 2)
        if (elapsed < 1) {
          frame = requestAnimationFrame(complete)
          return
        }
        hideTimer = setTimeout(() => {
          isLoading.value = false
          resetTimer = setTimeout(() => { progress.value = 0 }, 400)
        }, 120)
      }
      frame = requestAnimationFrame(complete)
    }

    function finishRenderedRoute () {
      if (!pagePending && activeRoute === router.currentRoute.value && renderedRoute.fullPath === activeRoute?.fullPath) {
        finish()
      }
    }

    // Nuxt emits page:loading:end for cancelled navigations too, without a
    // destination. Route identity lets an obsolete cancellation be ignored.
    const cleanup = [
      router.beforeEach((to) => {
        if (!app.isHydrating) { start(to) }
      }),
      router.afterEach((to, _from, failure) => {
        if (failure) {
          // Clicking the committed destination again must not finish its
          // still-pending content. Clicking the old page cancels a new route.
          if (to === activeRoute || (isNavigationFailure(failure, NavigationFailureType.duplicated) && activeRoute !== router.currentRoute.value)) {
            finish()
          }
          return
        }
        // Cached and same-component pages can already be rendered here.
        void nextTick(finishRenderedRoute)
      }),
      router.onError((_error, to) => {
        if (to === activeRoute) { finish(true) }
      }),
      app.hook('page:start', () => { pagePending = true }),
      app.hook('page:finish', () => {
        pagePending = false
        finishRenderedRoute()
      }),
      app.hook('vue:error', () => finish(true)),
      app.hook('app:error', () => finish(true)),
    ]

    // Nuxt normally updates useRoute once the page resolves. A duplicate
    // navigation can sync it early, so also wait for pending Suspense above.
    watch(() => renderedRoute.fullPath, finishRenderedRoute, { flush: 'post' })
    onScopeDispose(() => {
      clearTimers()
      cleanup.forEach(remove => remove())
    })
  }

  return { progress: readonly(progress), isLoading: readonly(isLoading), error: readonly(error) }
}
