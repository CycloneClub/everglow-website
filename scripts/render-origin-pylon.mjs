// Reproduce a static frame of OriginalPylon_VFX.Draw and OriginPylon_PurpleCrack.fx.
// Usage: node scripts/render-origin-pylon.mjs <Everglow source root>
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { chromium } from 'playwright-core'

const sourceRoot = process.argv[2]
if (!sourceRoot) { throw new Error('Pass the Everglow source root') }
const tileRoot = 'Sources/Modules/Yggdrasil/YggdrasilTown/Tiles/OriginPylon'
const sources = {
  pylon: `${tileRoot}/OriginPylon.png`,
  chain: `${tileRoot}/OriginPylon_Chain.png`,
  noise: 'Sources/Everglow.Function/Textures/Noise_Perlin.png',
}
const images = Object.fromEntries(await Promise.all(Object.entries(sources).map(async ([key, path]) => [
  key, `data:image/png;base64,${(await readFile(resolve(sourceRoot, path))).toString('base64')}`,
])))
const browser = await chromium.launch({ channel: 'msedge', headless: true })
try {
  const page = await browser.newPage()
  const png = await page.evaluate(async (sources) => {
    const images = Object.fromEntries(await Promise.all(Object.entries(sources).map(async ([key, src]) => {
      const image = new Image()
      image.src = src
      await image.decode()
      const canvas = document.createElement('canvas')
      canvas.width = image.width
      canvas.height = image.height
      const context = canvas.getContext('2d')
      context.drawImage(image, 0, 0)
      return [key, { image, width: image.width, height: image.height, pixels: context.getImageData(0, 0, image.width, image.height).data }]
    })))
    // PointWrap sampling matches the source VFX batch. Freeze timeValue at zero.
    function sample (texture, u, v) {
      const x = Math.floor(((u % 1 + 1) % 1) * texture.width)
      const y = Math.floor(((v % 1 + 1) % 1) * texture.height)
      return texture.pixels.subarray((y * texture.width + x) * 4, (y * texture.width + x) * 4 + 4)
    }
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 660
    const context = canvas.getContext('2d')
    const frame = context.createImageData(660, 660)
    function over (offset, red, green, blue, alpha) {
      const oldAlpha = frame.data[offset + 3] / 255
      const combined = alpha + oldAlpha * (1 - alpha)
      if (!combined) { return }
      for (const [channel, value] of [red, green, blue].entries()) {
        frame.data[offset + channel] = (value * alpha + frame.data[offset + channel] * oldAlpha * (1 - alpha)) / combined
      }
      frame.data[offset + 3] = combined * 255
    }
    // Six anchors, one radian apart, 290px from the pylon center.
    for (const layer of ['cracks', 'chains']) {
      for (let k = 0; k < 6; k++) {
        const cos = Math.cos(k), sin = Math.sin(k)
        for (let y = 0; y < 660; y++) {
          for (let x = 0; x < 660; x++) {
            const dx = x + 0.5 - 330, dy = y + 0.5 - 330
            const radial = dx * cos + dy * sin
            const tangent = -dx * sin + dy * cos
            const offset = (y * 660 + x) * 4
            if (layer === 'cracks') {
              const normal = radial - 290
              if (Math.abs(normal) > 20 || Math.abs(tangent) > 60) { continue }
              const u = k / 7 + 0.1 - tangent / 600
              const v = 0.5 - normal / 200
              let light = sample(images.noise, u, v)[0] / 255 * (155 / 255) * (1 - Math.abs(tangent) / 60)
              light *= Math.sin(((v - 0.5) * 5 + 0.5) * 3.14159) * 2.4
              if (light >= 0.7) { over(offset, 0, 0, 0, 1) } else if (light > 0.4) { over(offset, 127.5 * (0.7 - light) * 4, 0, 255 * (0.7 - light) * 4, 1) }
            } else {
              if (radial < 2 || radial > 290 || Math.abs(tangent) > 4) { continue }
              const color = sample(images.chain, (290 - radial) / 24, (4 - tangent) / 8)
              const fade = Math.min(1, (290 - radial) / 12, (radial - 2) / 12)
              over(offset, color[0], color[1], color[2], color[3] / 255 * fade)
            }
          }
        }
      }
    }
    context.putImageData(frame, 0, 0)
    context.imageSmoothingEnabled = false
    // Original full-sheet quad relative to (i + 5, j + 7) * 16.
    context.drawImage(images.pylon.image, 330 - 256, 330 - 244.8, 512, 404.8)
    return canvas.toDataURL('image/png').split(',')[1]
  }, images)
  const output = resolve('public/images/atlas/origin-pylon-scene.png')
  await writeFile(output, Buffer.from(png, 'base64'))
  process.stdout.write(`Rendered ${output}\n`)
} finally { await browser.close() }
