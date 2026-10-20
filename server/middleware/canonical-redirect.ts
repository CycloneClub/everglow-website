import { canonicalRedirect } from '#shared/utils/seo'

export default defineEventHandler((event) => {
  const target = canonicalRedirect(getRequestURL(event))
  if (target) { return sendRedirect(event, target, 301) }
})
