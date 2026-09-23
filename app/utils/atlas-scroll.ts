type AtlasScrollHost = {
  position: () => number
  now: () => number
  scroll: (top: number) => void
  request: (callback: (time: number) => void) => number
  cancel: (id: number) => void
}

/** A cancellable scroll tween shared by reading turns and the exit control. */
export function createAtlasScroll (host: AtlasScrollHost) {
  let frame: number | undefined
  function cancel () {
    if (frame !== undefined) { host.cancel(frame) }
    frame = undefined
  }
  function start (target: number | (() => number), complete: () => void, duration = 1500) {
    cancel()
    const from = host.position()
    const started = host.now()
    const tick = (time: number) => {
      const t = Math.min(1, Math.max(0, (time - started) / duration))
      // Quintic smootherstep: zero velocity and acceleration at both ends.
      const eased = t * t * t * (t * (t * 6 - 15) + 10)
      const destination = typeof target === 'function' ? target() : target
      host.scroll(from + (destination - from) * eased)
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

type PagingHost = AtlasScrollHost & {
  stops: () => number[]
  duration: (from: number, to: number) => number
  target: (index: number | undefined) => void
  complete: (index: number) => void
}
type PagingWheel = Pick<WheelEvent, 'deltaX' | 'deltaY' | 'cancelable' | 'preventDefault'>

/** One unfinished turn owns one pair of stops, regardless of input count. */
export function createAtlasPaging (host: PagingHost) {
  const scroll = createAtlasScroll(host)
  let turn: { from: number, to: number, direction: -1 | 1, wheel: boolean } | undefined
  let hold: { index: number, direction: -1 | 1, until: number } | undefined
  let holdFrame: number | undefined

  function clearHold () {
    if (holdFrame !== undefined) { host.cancel(holdFrame) }
    holdFrame = undefined
    hold = undefined
  }
  function cancel () {
    scroll.cancel()
    clearHold()
    turn = undefined
    host.target(undefined)
  }
  function settle (time: number) {
    holdFrame = undefined
    if (!hold) { return }
    host.scroll(host.stops()[hold.index]!)
    if (time >= hold.until) { hold = undefined; return }
    holdFrame = host.request(settle)
  }
  function advance (direction: -1 | 1, source: 'button' | 'wheel' = 'button') {
    const stops = host.stops()
    if (stops.length < 2) { return false }
    if (source === 'wheel' && hold?.direction === direction && host.now() < hold.until) {
      hold.until = host.now() + 160
      return true
    }
    clearHold()
    if (turn?.direction === direction) {
      turn.wheel ||= source === 'wheel'
      return true
    }
    const y = host.position()
    let from: number
    let to: number
    const reversing = !!turn
    if (turn) {
      from = turn.to
      to = turn.from
    } else {
      if (y < stops[0]! - 2 || y > stops.at(-1)! + 2) { return false }
      to = direction > 0 ? stops.findIndex(stop => stop > y + 2) : stops.findLastIndex(stop => stop < y - 2)
      if (to < 0) { return false }
      from = to - direction
    }
    const next = { from, to, direction, wheel: source === 'wheel' }
    turn = next
    host.target(to)
    const distance = Math.abs(stops[to]! - y)
    const duration = host.duration(from, to)
      * (reversing ? Math.min(1, distance / Math.max(1, Math.abs(stops[to]! - stops[from]!))) : 1)
    scroll.start(() => host.stops()[to]!, () => {
      if (turn !== next) { return }
      turn = undefined
      host.target(undefined)
      if (next.wheel) {
        hold = { index: to, direction, until: host.now() + 180 }
        holdFrame = host.request(settle)
      }
      host.complete(to)
    }, Math.max(180, duration))
    return true
  }
  function wheel (event: PagingWheel) {
    if (event.deltaY === 0 || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) { return false }
    const handled = advance(event.deltaY > 0 ? 1 : -1, 'wheel')
    if (handled && event.cancelable) { event.preventDefault() }
    return handled
  }
  return { advance, wheel, cancel }
}
