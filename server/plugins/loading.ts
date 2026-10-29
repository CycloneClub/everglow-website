import { useServerHooks } from 'nuxt/server'
import { deferPageStyles, renderSiteLoading } from '../utils/site-loading'

export default defineNitroPlugin(() => {
  useServerHooks().hook('render:html', (html, { event }) => {
    const loading = renderSiteLoading(event.path.split('?')[0] || '/')
    // Pending Vue styles otherwise block both first paint and later inline
    // head scripts, preventing even this independent dialog from appearing.
    html.head = html.head.map(deferPageStyles)
    html.head.unshift(loading.head)
    html.bodyPrepend.unshift(loading.bodyPrepend)
    html.bodyAppend.push(loading.bodyAppend)
  })
})
