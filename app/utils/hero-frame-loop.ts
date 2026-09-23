export type HeroFrameBounds = { width: number, height: number, visible: boolean }

export function createHeroFrameLoop (options: {
  request: (callback: FrameRequestCallback) => number
  cancel: (id: number) => void
  bounds: () => HeroFrameBounds
  paint: (now: number) => void
}) {
  let frame = 0
  let running = false

  function tick (now: number) {
    frame = 0
    if (!running) { return }
    const { width, height, visible } = options.bounds()
    if (visible && width > 0 && height > 0) { options.paint(now) }
    if (running) { frame = options.request(tick) }
  }

  return {
    start () {
      if (running) { return }
      running = true
      frame = options.request(tick)
    },
    stop () {
      running = false
      if (frame) { options.cancel(frame) }
      frame = 0
    },
  }
}
