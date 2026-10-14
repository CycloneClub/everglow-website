export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  if (!/^\/zh-cn(?:\/|$)/.test(url.pathname)) { return }

  // Keep historical links working while serving one URL per Chinese page.
  // Collapse leading slashes so the destination always stays on this site.
  const path = url.pathname.slice('/zh-cn'.length).replace(/^\/+/, '/') || '/'
  return sendRedirect(event, `${path}${url.search}`, 301)
})
