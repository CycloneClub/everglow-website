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
