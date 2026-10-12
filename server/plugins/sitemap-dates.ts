import { seoPath } from '#shared/utils/seo'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('sitemap:resolved', (context) => {
    const dates = useRuntimeConfig().public.seoModifiedAt as Record<string, string>
    for (const entry of context.urls) {
      const path = seoPath(new URL(entry.loc, 'https://everglowmod.com').pathname)
      if (dates[path]) { entry.lastmod = dates[path] }
    }
  })
})
