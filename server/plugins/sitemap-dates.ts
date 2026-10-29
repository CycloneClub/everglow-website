import { seoPath } from '#shared/utils/seo'
import { atlasLayers } from '../../app/data/world-atlas'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('sitemap:resolved', (context) => {
    const dates = useRuntimeConfig().public.seoModifiedAt as Record<string, string>
    for (const entry of context.urls) {
      const path = seoPath(new URL(entry.loc, 'https://everglowmod.com').pathname)
      if (dates[path]) { entry.lastmod = dates[path] }
      if (['/', '/en-us', '/zh-hk'].includes(path)) {
        const origin = new URL(entry.loc, 'https://everglowmod.com').origin
        const images = (entry.images || []).map(image => ({ ...image, loc: new URL(image.loc, origin).href }))
        for (const src of atlasLayers.flatMap(layer => [layer.landscape, layer.specimenImage, layer.encounterImage]).filter(Boolean)) {
          const loc = new URL(src, origin).href
          if (!images.some(image => image.loc === loc)) { images.push({ loc }) }
        }
        entry.images = images
      }
    }
  })
})
