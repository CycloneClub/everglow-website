import { createAtlasEntrance } from '~/utils/atlas-entrance'

export function useAtlasEntrance (page: Ref<HTMLElement | undefined>) {
  let snap: ReturnType<typeof createAtlasEntrance> | undefined
  let motion: MediaQueryList | undefined
  let listening = false
  let touch: { x: number, y: number } | undefined

  function blocked (target: EventTarget | null, keyboard = false) {
    if (!(target instanceof HTMLElement)) { return false }
    if (target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="dialog"]')) { return true }
    if (keyboard && target.closest('a, button, [role="button"]')) { return true }
    // Leave independently scrollable controls and navigation overlays alone.
    for (let element: HTMLElement | null = target; element && element !== document.body; element = element.parentElement) {
      if (element.scrollHeight > element.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(element).overflowY)) { return true }
    }
    return false
  }
  function wheel (event: WheelEvent) {
    // An unrelated target or an uncancellable packet must not abort a snap.
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || blocked(event.target)) { return }
    snap?.wheel(event)
  }
  function keydown (event: KeyboardEvent) {
    if (event.ctrlKey || event.metaKey || event.altKey || blocked(event.target, true)) { snap?.cancel(); return }
    const down = ['ArrowDown', 'PageDown', ' '].includes(event.key) && !event.shiftKey
    const up = ['ArrowUp', 'PageUp'].includes(event.key) || (event.key === ' ' && event.shiftKey)
    if (down || up) {
      if (snap?.advance(0, down ? 1 : -1)) { event.preventDefault() }
    } else {
      snap?.cancel()
    }
  }
  function touchstart (event: TouchEvent) {
    const point = event.touches[0]
    touch = event.touches.length === 1 && point && !blocked(event.target) ? { x: point.clientX, y: point.clientY } : undefined
  }
  function touchmove (event: TouchEvent) {
    const point = event.touches[0]
    if (!touch || !point || event.touches.length !== 1) { return }
    const dx = touch.x - point.clientX
    const dy = touch.y - point.clientY
    // Decide on the first scrolling touchmove, before native panning takes over.
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 3) { return }
    if (snap?.advance(dx, dy) && event.cancelable) { event.preventDefault() }
    touch = { x: point.clientX, y: point.clientY }
  }
  function touchend () { touch = undefined }
  function cancel () { snap?.cancel() }
  function enter () {
    const atlas = page.value?.querySelector<HTMLElement>('#lore')
    if (!atlas) { return }
    if (!snap?.advance(0, 1)) {
      window.scrollTo({
        top: atlas.getBoundingClientRect().top + window.scrollY,
        behavior: motion?.matches ? 'instant' : 'smooth',
      })
    }
    atlas.focus({ preventScroll: true })
  }
  function start () {
    if (listening) { return }
    listening = true
    motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    snap = createAtlasEntrance({
      bounds: () => {
        const atlas = page.value?.querySelector<HTMLElement>('#lore')
        const y = window.scrollY
        return {
          start: (page.value?.getBoundingClientRect().top ?? 0) + y,
          end: (atlas?.getBoundingClientRect().top ?? 0) + y,
          y,
          enabled: !!atlas && !motion?.matches && !/hidden|clip/.test(getComputedStyle(document.body).overflowY),
        }
      },
      now: () => performance.now(),
      scroll: top => window.scrollTo({ top, behavior: 'instant' }),
      request: callback => requestAnimationFrame(callback),
      cancel: id => cancelAnimationFrame(id),
    })
    window.addEventListener('wheel', wheel, { passive: false })
    window.addEventListener('keydown', keydown)
    window.addEventListener('touchstart', touchstart, { passive: true })
    window.addEventListener('touchmove', touchmove, { passive: false })
    window.addEventListener('touchend', touchend)
    window.addEventListener('touchcancel', touchend)
    window.addEventListener('pointerdown', cancel)
    window.addEventListener('resize', cancel)
    motion.addEventListener('change', cancel)
  }
  function stop () {
    listening = false
    cancel()
    touchend()
    window.removeEventListener('wheel', wheel)
    window.removeEventListener('keydown', keydown)
    window.removeEventListener('touchstart', touchstart)
    window.removeEventListener('touchmove', touchmove)
    window.removeEventListener('touchend', touchend)
    window.removeEventListener('touchcancel', touchend)
    window.removeEventListener('pointerdown', cancel)
    window.removeEventListener('resize', cancel)
    motion?.removeEventListener('change', cancel)
  }
  onMounted(start)
  onActivated(start)
  onDeactivated(stop)
  onBeforeUnmount(stop)
  return { enter }
}
