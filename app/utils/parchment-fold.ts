export type PaperDirection = 'diagonal' | 'up'

/** A continuous paper curl: settled paper, a broad arc, then its lifted back. */
export function foldPaperPoint (width: number, height: number, progress: number, x: number, y: number, direction: PaperDirection = 'diagonal') {
  const p = Math.min(1, Math.max(0, progress))
  if (p === 1) { return { x, y, z: 0, shade: 1 } }
  const length = Math.hypot(1 / width, 1 / height)
  const nx = direction === 'up' ? 0 : 1 / width / length
  const ny = direction === 'up' ? 1 : 1 / height / length
  const diagonal = width * nx + height * ny
  const distance = (width - x) * nx + (height - y) * ny
  const baseRadius = diagonal * 0.11 * (0.82 + 0.18 * Math.sin(Math.PI * p))
  const front = -2 * baseRadius + p * (diagonal + 2 * baseRadius)
  const travel = distance - front
  if (travel <= 0) { return { x, y, z: 0, shade: 1 } }
  // A gently varying radius gives the free corner a little give, without ripples.
  const across = direction === 'up' ? x / width * 2 - 1 : x / width - y / height
  const radius = baseRadius * (1 + 0.14 * Math.sin(across * Math.PI / 2) * Math.sin(Math.PI * p))
  const angle = Math.min(Math.PI, travel / radius)
  const projected = front + radius * Math.sin(angle) - Math.max(0, travel - Math.PI * radius)
  const offset = distance - projected
  return {
    x: x + nx * offset,
    y: y + ny * offset,
    z: radius * (1 - Math.cos(angle)),
    shade: 0.72 + 0.28 * Math.abs(Math.cos(angle)) - 0.04 * Math.sin(angle),
  }
}

/** Opacity at the GPU-to-DOM handoff. */
export function paperHandoff (progress: number) {
  const blend = Math.min(1, Math.max(0, (progress - 0.94) / 0.06))
  return { paper: blend > 0 ? 1 : 0, canvas: 1 - blend }
}
