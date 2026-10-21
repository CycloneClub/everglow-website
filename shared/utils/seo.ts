// Historical news frontmatter uses the team's UTC+8 local publication time.
export function articleDate (value?: string): string | undefined {
  if (!value) { return undefined }
  const local = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})$/.exec(value)
  const iso = local ? `${local[1]}T${local[2]}+08:00` : value
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(iso)) { return undefined }
  const calendarDate = iso.slice(0, 10)
  const parsed = Date.parse(iso)
  if (!Number.isFinite(parsed) || new Date(`${calendarDate}T00:00:00Z`).toISOString().slice(0, 10) !== calendarDate) { return undefined }
  return iso
}

export function seoPath (path: string): string {
  return path.replace(/^\/zh-cn(?=\/|$)/, '').replace(/\/$/, '') || '/'
}

export function canonicalRedirect (url: URL): string | undefined {
  const isWww = url.hostname === 'www.everglowmod.com'
  let path = url.pathname
  if (/^\/zh-cn(?:\/|$)/.test(path)) {
    // Keep historical Chinese links local, including paths with extra slashes.
    path = path.slice('/zh-cn'.length).replace(/^\/+/, '/') || '/'
  }
  if (/^\/(?:en-us|zh-hk|ja-jp|ko-kr)\/+$/.test(path)) {
    path = path.replace(/\/+$/, '')
  }
  if (isWww) { return `https://everglowmod.com${path}${url.search}` }
  if (path !== url.pathname) { return `${path}${url.search}` }
}
