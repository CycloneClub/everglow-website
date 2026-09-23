type EntranceHost = {
  bounds: () => { start: number, end: number, y: number, enabled: boolean }
  now: () => number
  scroll: (y: number) => void
  request: (callback: (time: number) => void) => number
  cancel: (id: number) => void
}

type EntranceWheel = Pick<WheelEvent, 'deltaX' | 'deltaY' | 'cancelable' | 'preventDefault'>

/** Bidirectional cover transition; chapter paging is handled separately. */
export function createAtlasEntrance (host: EntranceHost) {
  let frame: number | undefined
  let phase: 'idle' | 'moving' | 'settling' = 'idle'
  let direction = 0
  let settleUntil = 0
  let settleLimit = 0

  function cancel () {
    if (frame !== undefined) { host.cancel(frame) }
    frame = undefined
    phase = 'idle'
    direction = 0
    settleUntil = 0
    settleLimit = 0
  }

  function advance (dx: number, dy: number) {
    const bounds = host.bounds()
    if (!bounds.enabled) { cancel(); return false }
    if (dy === 0 || Math.abs(dx) >= Math.abs(dy)) { return false }
    const intent = Math.sign(dy)
    const now = host.now()
    // Repeated input never restarts the animation clock or cancels the target.
    if (phase === 'moving' && intent === direction) { return true }
    if (phase === 'settling' && intent === direction && now < settleUntil && now < settleLimit) {
      settleUntil = now + 160
      return true
    }
    const reversing = phase !== 'idle' && intent !== direction
    cancel()
    if (!reversing && (bounds.y < bounds.start - 2 || bounds.y > bounds.end + 2)) { return false }
    const target = intent > 0 ? bounds.end : bounds.start
    if (Math.abs(bounds.y - target) <= 2) { return false }
    const from = bounds.y
    // A mid-flight reversal only travels the remaining portion of the cover.
    const duration = Math.max(180, 1500 * Math.min(1, Math.abs(target - from) / Math.max(1, bounds.end - bounds.start)))
    direction = intent
    phase = 'moving'
    const settle = (time: number) => {
      if (!host.bounds().enabled) { cancel(); return }
      // Some wheel packets cannot prevent native scrolling. Correct that drift
      // until this gesture ends, but never hold new reading input indefinitely.
      host.scroll(target)
      if (time >= settleUntil || time >= settleLimit) { cancel(); return }
      frame = host.request(settle)
    }
    const tick = (time: number) => {
      if (!host.bounds().enabled) { cancel(); return }
      const progress = Math.min(1, Math.max(0, (time - now) / duration))
      // Zero velocity and acceleration at each end let the paper lift and settle.
      const eased = progress ** 3 * (progress * (progress * 6 - 15) + 10)
      host.scroll(from + (target - from) * eased)
      if (progress < 1) {
        frame = host.request(tick)
      } else {
        phase = 'settling'
        settleUntil = time + 180
        settleLimit = time + 360
        frame = host.request(settle)
      }
    }
    frame = host.request(tick)
    return true
  }
  function wheel (event: EntranceWheel) {
    const handled = advance(event.deltaX, event.deltaY)
    if (handled && event.cancelable) { event.preventDefault() }
    return handled
  }
  return { advance, wheel, cancel, active: () => phase !== 'idle' }
}
