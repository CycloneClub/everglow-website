/**
 * Faithful Canvas 2D reproduction of the Everglow mod menu scene
 * (Sources/Everglow.Function/Menu/EverglowModMenu.cs):
 * slowly rotating sky, twinkling orbiting stars, trailing meteors,
 * an orbiting moon, the water overlay and the additive mirrored
 * reflection of the sky in the water region, all composited in a
 * 1920×1080 design space that is cover-fitted to the viewport.
 *
 * Frame units follow the game: advance = elapsed frames at 60fps.
 */

import type { WaterRegion } from './menu-water'

export type MenuSkyAssets = {
  bg: HTMLImageElement
  star: HTMLImageElement
  moon: HTMLImageElement
  water: HTMLImageElement
  front2: HTMLImageElement
  front1: HTMLImageElement
}

export type MenuSkyView = {
  /** Viewport size in CSS px. */
  width: number
  height: number
  dpr: number
  /** Damped pointer, each axis roughly within [-0.5, 0.5]. */
  cx: number
  cy: number
  /** Cover transition progress, 0 while the hero fills the screen. */
  scroll: number
}

export type MenuSkyRenderer = {
  /** Advance the simulation by `frames` (1 = 1/60s) and draw. */
  draw: (ctx: CanvasRenderingContext2D, view: MenuSkyView, frames: number, reflection?: 'canvas' | 'shader') => void
  /** Populate the star field without drawing (for a static first frame). */
  prewarm: (frames: number) => void
  /** Mirrored sky strip and water rect (device px) for the WebGL water. */
  waterRegion: () => WaterRegion | undefined
}

const DESIGN_W = 1920
const DESIGN_H = 1080
const ROT_SPEED = 0.0007
const CENTER_X = 960
const CENTER_Y = 820
const MOON_OFFSET_X = 680 - 1250
const MOON_OFFSET_Y = 920 - 1250
const STAR_TRAIL_LENGTH = 15
/**
 * Water reflection region in design space. The mod mirrors the sky at
 * (864, 729, 592, 168) in EverglowModMenu.PreDrawLogo; here the water
 * is widened horizontally (see preprocessWater) so the lake spans the
 * scene, the top is extended 10px above the true waterline (y=729) so
 * the water shader can sculpt a wavy edge, and the front landmasses
 * cover whatever reaches past their silhouettes.
 */
const REFLECT = { x: 667, y: 719, w: 838, h: 178 }
/** True waterline row of water.png's flat top in design space. */
const WATERLINE_Y = 729
/** Horizontal stretch applied to the water overlay, about the far shore's center (x=1085). */
const WATER_SCALE_X = 2
const WATER_CENTER_X = 1085
/** Flat-top span of the original water asset in design space. */
const WATER_SRC_X0 = 876
const WATER_SRC_X1 = 1295
/** Flat-top span after the horizontal stretch. */
const WATER_TOP_X0 = WATER_CENTER_X + (WATER_SRC_X0 - WATER_CENTER_X) * WATER_SCALE_X
const WATER_TOP_X1 = WATER_CENTER_X + (WATER_SRC_X1 - WATER_CENTER_X) * WATER_SCALE_X
const WAVE_1 = { amp: 3.2, period: 700, phase: 0 }
const WAVE_2 = { amp: 1.8, period: 250, phase: 2.1 }
const WAVE_ORIGIN_X = 300

/** Wavy waterline offset (design px, positive = lower) at design-space x. */
function waterlineOffset (x: number) {
  return WAVE_1.amp * Math.sin((x - WAVE_ORIGIN_X) * 2 * Math.PI / WAVE_1.period + WAVE_1.phase)
    + WAVE_2.amp * Math.sin((x - WAVE_ORIGIN_X) * 2 * Math.PI / WAVE_2.period + WAVE_2.phase)
}

/** The same wave in region-normalized units, consumed by the water shader. */
const WAVE_REGION = {
  a1: WAVE_1.amp / REFLECT.h,
  k1: 2 * Math.PI / WAVE_1.period * REFLECT.w,
  p1: (REFLECT.x - WAVE_ORIGIN_X) * 2 * Math.PI / WAVE_1.period + WAVE_1.phase,
  a2: WAVE_2.amp / REFLECT.h,
  k2: 2 * Math.PI / WAVE_2.period * REFLECT.w,
  p2: (REFLECT.x - WAVE_ORIGIN_X) * 2 * Math.PI / WAVE_2.period + WAVE_2.phase,
  base: 1 - (WATERLINE_Y - REFLECT.y) / REFLECT.h,
  invH: 1 / REFLECT.h,
}

/**
 * Widen the water overlay horizontally so the lake spans the scene
 * (the front landmasses cover the overflow), then carve the flat top
 * into the shared wavy waterline: erase above the wave, refill with
 * the water color where it rises.
 */
function preprocessWater (water: HTMLImageElement) {
  const canvas = document.createElement('canvas')
  canvas.width = water.naturalWidth
  canvas.height = water.naturalHeight
  const wctx = canvas.getContext('2d')!
  // The body is flat navy, so a horizontal stretch is visually lossless.
  wctx.drawImage(water, WATER_CENTER_X - WATER_CENTER_X * WATER_SCALE_X, 0, water.naturalWidth * WATER_SCALE_X, water.naturalHeight)
  wctx.globalCompositeOperation = 'destination-out'
  wctx.beginPath()
  wctx.moveTo(WATER_TOP_X0, WATERLINE_Y - 12)
  wctx.lineTo(WATER_TOP_X1, WATERLINE_Y - 12)
  for (let x = WATER_TOP_X1; x >= WATER_TOP_X0; x--) {
    wctx.lineTo(x, WATERLINE_Y + waterlineOffset(x))
  }
  wctx.closePath()
  wctx.fill()
  wctx.globalCompositeOperation = 'source-over'
  // The water's flat navy, sampled from the asset: rgb(0, 7, 46).
  wctx.fillStyle = 'rgb(0, 7, 46)'
  wctx.beginPath()
  wctx.moveTo(WATER_TOP_X0, WATERLINE_Y + 1)
  wctx.lineTo(WATER_TOP_X1, WATERLINE_Y + 1)
  for (let x = WATER_TOP_X1; x >= WATER_TOP_X0; x--) {
    wctx.lineTo(x, Math.min(WATERLINE_Y + 1, WATERLINE_Y + waterlineOffset(x)))
  }
  wctx.closePath()
  wctx.fill()
  return canvas
}

function loadImage (src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`failed to load ${src}`))
    img.src = src
  })
}

export async function loadMenuSkyAssets (base = '/images/hero/menu'): Promise<MenuSkyAssets> {
  const [bg, star, moon, water, front2, front1] = await Promise.all([
    loadImage(`${base}/bg.png`),
    loadImage(`${base}/star.png`),
    loadImage(`${base}/moon.png`),
    loadImage(`${base}/water.png`),
    loadImage(`${base}/front2.png`),
    loadImage(`${base}/front1.png`),
  ])
  return { bg, star, moon, water, front2, front1 }
}

type MenuStar = {
  x: number
  y: number
  baseScale: number
  scale: number
  alpha: number
  maxTime: number
  timeLeft: number
  tint: number
}

type MenuMeteor = {
  x: number
  y: number
  vx: number
  vy: number
  scale: number
  timeLeft: number
  trail: { x: number, y: number }[]
}

/** A foreground landmass layer, with its current parallax placement. */
type FrontLayer = {
  img: HTMLImageElement
  x: number
  y: number
  w: number
  h: number
}

function rotate (x: number, y: number, angle: number) {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  return { x: x * cos - y * sin, y: x * sin + y * cos }
}

/** Pre-tinted star sprites: the mod subtracts 50..170 from R and G. */
function makeStarTints (star: HTMLImageElement) {
  const size = star.naturalWidth || 9
  const base = document.createElement('canvas')
  base.width = size
  base.height = size
  const bctx = base.getContext('2d')!
  bctx.drawImage(star, 0, 0)
  const pixels = bctx.getImageData(0, 0, size, size)
  return [60, 100, 140].map((c) => {
    const tinted = document.createElement('canvas')
    tinted.width = size
    tinted.height = size
    const data = new ImageData(size, size)
    const f = (255 - c) / 255
    for (let i = 0; i < pixels.data.length; i += 4) {
      data.data[i] = pixels.data[i]! * f
      data.data[i + 1] = pixels.data[i + 1]! * f
      data.data[i + 2] = pixels.data[i + 2]!
      data.data[i + 3] = pixels.data[i + 3]!
    }
    tinted.getContext('2d')!.putImageData(data, 0, 0)
    return tinted
  })
}

export function createMenuSky (assets: MenuSkyAssets): MenuSkyRenderer {
  const starTints = makeStarTints(assets.star)
  const waterSurf = preprocessWater(assets.water)
  const stars: MenuStar[] = []
  const meteors: MenuMeteor[] = []
  let t = 0
  let starAcc = 0
  let meteorAcc = 0
  let stepAcc = 0

  const skyRT = document.createElement('canvas')
  const skyRTCtx = skyRT.getContext('2d')!
  const reflectRT = document.createElement('canvas')
  const reflectRTCtx = reflectRT.getContext('2d')!
  const maskRT = document.createElement('canvas')
  const maskRTCtx = maskRT.getContext('2d')!

  function spawnStar () {
    const maxTime = 200 + Math.random() * 200
    stars.push({
      x: Math.random() * DESIGN_W,
      y: Math.random() * DESIGN_H,
      baseScale: Math.random() * 2,
      scale: 0,
      alpha: 0,
      maxTime,
      timeLeft: maxTime,
      tint: Math.floor(Math.random() * starTints.length),
    })
  }

  function spawnMeteor () {
    meteors.push({
      x: Math.random() * (DESIGN_W + 350),
      y: -100,
      vx: (-12 - Math.random() * 20) * 0.8,
      vy: (8 + Math.random() * 25) * 0.8,
      scale: Math.random() * 2.5,
      timeLeft: 100,
      trail: [],
    })
  }

  /**
   * One exact 1/60s simulation step, mirroring the mod's fixed-tick Update.
   * Trail positions are recorded per step, so frame hitches can never
   * stretch a meteor ribbon across the screen.
   */
  function step () {
    t += 1
    starAcc += 1
    while (starAcc >= 1) {
      starAcc -= 1
      spawnStar()
    }
    meteorAcc += 1
    while (meteorAcc >= 1) {
      meteorAcc -= 1
      if (Math.random() < 1 / 50) { spawnMeteor() }
    }
    for (let i = stars.length - 1; i >= 0; i--) {
      const star = stars[i]!
      star.timeLeft -= 1
      if (star.timeLeft <= 0) {
        stars.splice(i, 1)
        continue
      }
      // Orbit speed scales with size for a sense of depth.
      const speed = 0.0003 + 0.0004 * star.baseScale / 2
      const rotated = rotate(star.x - CENTER_X, star.y - CENTER_Y, speed)
      star.x = CENTER_X + rotated.x
      star.y = CENTER_Y + rotated.y
      if (star.timeLeft > star.maxTime - 20) {
        star.alpha += (1 - star.alpha) * 0.1
      } else if (star.timeLeft < 20) {
        star.alpha += (0 - star.alpha) * 0.1
      }
      star.scale += Math.sin(star.timeLeft * 0.06) * 0.06
    }
    for (let i = meteors.length - 1; i >= 0; i--) {
      const meteor = meteors[i]!
      meteor.timeLeft -= 1
      if (meteor.timeLeft <= 0) {
        meteors.splice(i, 1)
        continue
      }
      meteor.x += meteor.vx
      meteor.y += meteor.vy
      meteor.trail.unshift({ x: meteor.x, y: meteor.y })
      if (meteor.trail.length > STAR_TRAIL_LENGTH) { meteor.trail.pop() }
    }
  }

  function update (frames: number) {
    stepAcc += Math.min(4, frames)
    while (stepAcc >= 1) {
      stepAcc -= 1
      step()
    }
  }

  function drawSky (view: MenuSkyView, k: number) {
    const { width, height, dpr } = view
    if (skyRT.width !== Math.round(width * dpr) || skyRT.height !== Math.round(height * dpr)) {
      skyRT.width = Math.round(width * dpr)
      skyRT.height = Math.round(height * dpr)
    }
    const ox = (width - DESIGN_W * k) / 2
    const oy = (height - DESIGN_H * k) / 2
    const ctx = skyRTCtx
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, skyRT.width, skyRT.height)
    ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * ox, dpr * oy)

    const angle = t * ROT_SPEED
    const skyX = view.cx * 10
    const skyY = view.cy * 6 + view.scroll * 30

    // Rotating sky, around the same off-center pivot as the mod menu.
    ctx.save()
    ctx.translate(CENTER_X + skyX, CENTER_Y + skyY)
    ctx.rotate(angle)
    ctx.drawImage(assets.bg, -1250, -1250, 2500, 2500)
    ctx.restore()

    ctx.globalCompositeOperation = 'lighter'
    for (const star of stars) {
      const depth = 8 + star.baseScale * 8
      const x = star.x + view.cx * depth
      const y = star.y + view.cy * depth * 0.6 + view.scroll * (20 + star.baseScale * 20)
      const size = Math.max(0.5, 9 * (star.baseScale + Math.max(0, star.scale)))
      const sprite = starTints[star.tint]!
      ctx.globalAlpha = Math.min(1, Math.max(0, star.alpha))
      ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size)
      ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size)
    }
    ctx.globalAlpha = 1

    for (const meteor of meteors) {
      if (meteor.trail.length < 3) { continue }
      const depth = 22
      const px = view.cx * depth
      const py = view.cy * depth * 0.6 + view.scroll * 50
      const speed = Math.hypot(meteor.vx, meteor.vy)
      const half = (12 * speed / 30) / 2
      const nx = -meteor.vy / speed
      const ny = meteor.vx / speed
      const head = meteor.trail[0]!
      const tail = meteor.trail[meteor.trail.length - 1]!
      ctx.beginPath()
      meteor.trail.forEach((point, i) => {
        const fade = i / meteor.trail.length > 0.5 ? 1 - i / meteor.trail.length : 1
        const w = half * Math.max(0.15, fade)
        const x = point.x + px + nx * w
        const y = point.y + py + ny * w
        if (i === 0) { ctx.moveTo(x, y) } else { ctx.lineTo(x, y) }
      })
      for (let i = meteor.trail.length - 1; i >= 0; i--) {
        const point = meteor.trail[i]!
        const fade = i / meteor.trail.length > 0.5 ? 1 - i / meteor.trail.length : 1
        const w = half * Math.max(0.15, fade)
        ctx.lineTo(point.x + px - nx * w, point.y + py - ny * w)
      }
      ctx.closePath()
      const gradient = ctx.createLinearGradient(head.x + px, head.y + py, tail.x + px, tail.y + py)
      gradient.addColorStop(0, 'rgba(200, 200, 255, 0.7)')
      gradient.addColorStop(1, 'rgba(200, 200, 255, 0.05)')
      ctx.fillStyle = gradient
      ctx.fill()
      ctx.fill()
      const headSize = 9 * Math.max(0.5, meteor.scale)
      const sprite = starTints[0]!
      ctx.globalAlpha = Math.min(1, meteor.timeLeft / 30)
      ctx.drawImage(sprite, head.x + px - headSize / 2, head.y + py - headSize / 2, headSize, headSize)
      ctx.globalAlpha = 1
    }

    // The moon orbits the sky pivot together with the clouds.
    const mv = rotate(MOON_OFFSET_X, MOON_OFFSET_Y, angle)
    ctx.save()
    ctx.translate(CENTER_X + mv.x + view.cx * 12, CENTER_Y + mv.y + view.cy * 7 + view.scroll * 36)
    ctx.rotate(angle)
    ctx.drawImage(assets.moon, -88 * 1.05, -88 * 1.05, 176 * 1.05, 176 * 1.05)
    ctx.restore()

    ctx.globalCompositeOperation = 'source-over'
    return { ox, oy }
  }

  let waterRegion: WaterRegion | undefined

  function drawReflection (ctx: CanvasRenderingContext2D, view: MenuSkyView, k: number, ox: number, oy: number, waterX: number, waterY: number, mode: 'canvas' | 'shader', fronts: FrontLayer[]) {
    const { dpr } = view
    const X = ox + (REFLECT.x + waterX) * k
    const Y = oy + (REFLECT.y + waterY) * k
    const W = REFLECT.w * k
    const H = REFLECT.h * k
    if (W < 4 || H < 4) {
      waterRegion = undefined
      return
    }
    const rw = Math.round(W * dpr)
    const rh = Math.round(H * dpr)
    if (reflectRT.width !== rw || reflectRT.height !== rh) {
      reflectRT.width = rw
      reflectRT.height = rh
      maskRT.width = rw
      maskRT.height = rh
    }
    // Water-surface alpha over the reflection region (with the wavy
    // waterline carved in), minus whatever the front landmasses cover
    // at their current parallax offsets — the reflection canvas sits
    // above the scene, so the mountains must punch through the mask.
    const ms = rw / REFLECT.w
    maskRTCtx.setTransform(1, 0, 0, 1, 0, 0)
    maskRTCtx.clearRect(0, 0, rw, rh)
    maskRTCtx.drawImage(waterSurf, REFLECT.x, REFLECT.y, REFLECT.w, REFLECT.h, 0, 0, rw, rh)
    maskRTCtx.globalCompositeOperation = 'destination-out'
    for (const front of fronts) {
      maskRTCtx.drawImage(front.img, (front.x - REFLECT.x - waterX) * ms, (front.y - REFLECT.y - waterY) * ms, front.w * ms, front.h * ms)
    }
    maskRTCtx.globalCompositeOperation = 'source-over'
    // Mirror of the sky above the waterline, flipped vertically. The
    // source band is offset so the mirror pivot stays the true
    // waterline even though the region top sits 10px above it.
    const mirrorPad = 2 * (WATERLINE_Y - REFLECT.y)
    reflectRTCtx.setTransform(1, 0, 0, 1, 0, 0)
    reflectRTCtx.clearRect(0, 0, rw, rh)
    reflectRTCtx.drawImage(skyRT, X * dpr, (Y - H + mirrorPad) * dpr, W * dpr, H * dpr, 0, rh, rw, -rh)
    // Confine the reflection to the visible water surface (via alpha).
    reflectRTCtx.globalCompositeOperation = 'destination-in'
    reflectRTCtx.drawImage(maskRT, 0, 0)
    reflectRTCtx.globalCompositeOperation = 'source-over'
    waterRegion = { strip: reflectRT, x: X * dpr, y: Y * dpr, w: W * dpr, h: H * dpr, wave: WAVE_REGION }
    if (mode === 'shader') { return }

    // The vertex-color fade of the original quad: 0.7 at the waterline to 0.2.
    reflectRTCtx.globalCompositeOperation = 'destination-in'
    const fade = reflectRTCtx.createLinearGradient(0, 0, 0, rh)
    fade.addColorStop(0, 'rgba(0, 0, 0, 0.7)')
    fade.addColorStop(1, 'rgba(0, 0, 0, 0.2)')
    reflectRTCtx.fillStyle = fade
    reflectRTCtx.fillRect(0, 0, rw, rh)
    reflectRTCtx.globalCompositeOperation = 'source-over'

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.globalCompositeOperation = 'lighter'
    ctx.drawImage(reflectRT, X * dpr, Y * dpr)
    ctx.globalCompositeOperation = 'source-over'
  }

  return {
    prewarm (frames) {
      for (let i = 0; i < frames; i++) { step() }
    },
    waterRegion: () => waterRegion,
    draw (ctx, view, frames, reflection = 'canvas') {
      if (frames > 0) { update(frames) }
      const { width, height, dpr } = view
      const k = Math.max(width / DESIGN_W, height / DESIGN_H)
      const { ox, oy } = drawSky(view, k)

      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, width * dpr, height * dpr)
      ctx.drawImage(skyRT, 0, 0)

      ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * ox, dpr * oy)
      const waterX = view.cx * 3
      const waterY = view.cy * 2 + view.scroll * 40
      ctx.globalAlpha = 0.95
      ctx.drawImage(waterSurf, waterX, waterY, DESIGN_W, DESIGN_H)
      ctx.globalAlpha = 1

      // Slight overscan so pointer parallax never exposes an edge. The
      // two landmasses move at clearly different rates for depth.
      const fronts: FrontLayer[] = [
        { img: assets.front2, x: -1920 * 0.03 + view.cx * 26, y: -1080 * 0.03 + view.cy * 13 + view.scroll * 100, w: DESIGN_W * 1.06, h: DESIGN_H * 1.06 },
        { img: assets.front1, x: -1920 * 0.045 + view.cx * 52, y: -1080 * 0.045 + view.cy * 22 + view.scroll * 200, w: DESIGN_W * 1.09, h: DESIGN_H * 1.09 },
      ]

      drawReflection(ctx, view, k, ox, oy, waterX, waterY, reflection, fronts)

      ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * ox, dpr * oy)
      for (const front of fronts) {
        ctx.drawImage(front.img, front.x, front.y, front.w, front.h)
      }
    },
  }
}
