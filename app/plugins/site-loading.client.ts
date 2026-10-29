import type {} from '~/utils/site-loading-state'

export default defineNuxtPlugin({
  name: 'site-loading',
  enforce: 'pre',
  dependsOn: ['nuxt:router'],
  async setup (app) {
    const loading = window.__everglowLoading
    if (!loading) { return }
    const initialPath = window.location.pathname
    app.hook('app:mounted', () => loading.appReady())
    // The standalone overlay belongs to the initial document. Subsequent SPA
    // navigation is already covered by CommonNavigationProgress.
    useRouter().beforeEach((to, from) => {
      if (from.matched.length && to.path !== initialPath) { loading.cancel() }
    })
    // Fetch application modules in parallel, but preserve CSS-before-mount for
    // components that measure their layout/canvas dimensions in onMounted.
    await loading.stylesReady
  },
})
