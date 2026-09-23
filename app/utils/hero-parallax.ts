export type HeroPointer = { x: number, y: number }

/**
 * Damped pointer follower ported from bilibili's animated-banner:
 * the pointer is anchored on entry, C = (client - anchor) / size,
 * and the applied value chases the target with a linear ~200ms lag.
 */
export function createHeroFollower (interval = 200) {
  let anchor: HeroPointer | undefined
  let target: HeroPointer = { x: 0, y: 0 }
  let current: HeroPointer = { x: 0, y: 0 }
  let last = 0

  function clamp (value: number) {
    return Math.max(-0.6, Math.min(0.6, value))
  }
  function move (clientX: number, clientY: number, rect: { left: number, top: number, width: number, height: number }) {
    if (!anchor) {
      anchor = { x: clientX, y: clientY }
      return
    }
    target = {
      x: clamp((clientX - anchor.x) / Math.max(1, rect.width)),
      y: clamp((clientY - anchor.y) / Math.max(1, rect.height)),
    }
  }
  function leave () {
    anchor = undefined
    target = { x: 0, y: 0 }
  }
  function tick (now: number) {
    const dt = last ? now - last : 16.7
    last = now
    const k = Math.min(1, dt / interval)
    current = {
      x: current.x + (target.x - current.x) * k,
      y: current.y + (target.y - current.y) * k,
    }
    return current
  }
  return { move, leave, tick, current: () => current, target: () => target }
}
