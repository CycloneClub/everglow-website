type AtlasScrollHost = {
  position: () => number
  now: () => number
  scroll: (top: number) => void
  request: (callback: (time: number) => void) => number
  cancel: (id: number) => void
}

/** Only button-triggered turns are timed; normal scrolling remains native. */
export function createAtlasScroll (host: AtlasScrollHost) {
  let frame: number | undefined
  function cancel () {
    if (frame !== undefined) { host.cancel(frame) }
    frame = undefined
  }
  function start (target: number, complete: () => void, duration = 1500) {
    cancel()
    const from = host.position()
    const started = host.now()
    const tick = (time: number) => {
      const t = Math.min(1, Math.max(0, (time - started) / duration))
      // Quintic smootherstep: zero velocity and acceleration at both ends.
      const eased = t * t * t * (t * (t * 6 - 15) + 10)
      host.scroll(from + (target - from) * eased)
      if (t < 1) {
        frame = host.request(tick)
      } else {
        frame = undefined
        complete()
      }
    }
    frame = host.request(tick)
  }
  return { start, cancel }
}
