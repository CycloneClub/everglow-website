function paperCanvas (width: number, height: number, ratio: number, paperHeight = height) {
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(width * ratio)
  canvas.height = Math.round(height * ratio)
  const context = canvas.getContext('2d')!
  context.scale(ratio, ratio)
  context.save()
  context.translate(width * 0.51, paperHeight * 0.47)
  context.scale(width * 0.72, paperHeight * 0.75)
  const paper = context.createRadialGradient(0, 0, 0, 0, 0, 1)
  paper.addColorStop(0, '#f4edda')
  paper.addColorStop(0.54, '#e5d8b6')
  paper.addColorStop(1, '#c8ae7d')
  context.fillStyle = paper
  context.fillRect(-2, -2, 4, 4)
  context.restore()
  const grain = document.createElement('canvas')
  grain.width = grain.height = 96
  const grainContext = grain.getContext('2d')!
  const pixels = grainContext.createImageData(96, 96)
  let seed = 71
  for (let i = 0; i < pixels.data.length; i += 4) {
    seed = seed * 16807 % 2147483647
    pixels.data[i] = 79
    pixels.data[i + 1] = 55
    pixels.data[i + 2] = 29
    pixels.data[i + 3] = seed % 19
  }
  grainContext.putImageData(pixels, 0, 0)
  context.fillStyle = context.createPattern(grain, 'repeat')!
  context.fillRect(0, 0, width, height)
  return { canvas, context }
}

/** Paint the actual opening's SVG and laid-out glyphs, without a DOM screenshot dependency. */
export async function createParchmentTextures (stage: HTMLElement) {
  const width = stage.clientWidth
  const height = Math.min(stage.clientHeight, window.innerHeight)
  const ratio = Math.min(1.5, window.devicePixelRatio || 1)
  const front = paperCanvas(width, height, ratio, stage.clientHeight)
  const back = paperCanvas(width, height, ratio, stage.clientHeight)
  const context = front.context
  const bounds = stage.getBoundingClientRect()
  const tree = stage.querySelector<SVGSVGElement>('.atlas-drawing .atlas-tree, .atlas-static-opening .atlas-tree')
  if (!tree) { throw new Error('The atlas opening is not ready') }
  const treeBounds = tree.getBoundingClientRect()
  const svg = tree.cloneNode(true) as SVGSVGElement
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  svg.setAttribute('width', String(treeBounds.width))
  svg.setAttribute('height', String(treeBounds.height))
  // Landscape photos are invisible in the opening; exclude external resources.
  svg.querySelectorAll('image').forEach(image => image.remove())
  // Freeze every DOM measurement before SVG decoding can yield to scrolling.
  const lettering = document.createElement('canvas')
  lettering.width = front.canvas.width
  lettering.height = front.canvas.height
  const letteringContext = lettering.getContext('2d')!
  letteringContext.scale(ratio, ratio)
  const border = stage.querySelector<HTMLElement>('.atlas-border')
  if (border) {
    const rect = border.getBoundingClientRect()
    letteringContext.strokeStyle = getComputedStyle(border).borderTopColor
    letteringContext.lineWidth = 1
    letteringContext.strokeRect(rect.left - bounds.left, rect.top - bounds.top, rect.width, rect.height)
  }
  const texts = stage.querySelectorAll<HTMLElement>('.atlas-running-head, .atlas-toolbar, .atlas-introduction, .atlas-discovery, .atlas-running-foot, .atlas-static-opening')
  for (const element of texts) {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
    let node: Node | null
    while ((node = walker.nextNode())) {
      const parent = node.parentElement
      if (!parent || parent.closest('svg') || !node.textContent?.trim()) { continue }
      let opacity = 1
      for (let current: HTMLElement | null = parent; current && current !== stage; current = current.parentElement) {
        const style = getComputedStyle(current)
        if (style.display === 'none') { opacity = 0; break }
        opacity *= Number(style.opacity)
      }
      if (opacity < 0.01) { continue }
      const style = getComputedStyle(parent)
      letteringContext.font = style.fontStyle + ' ' + style.fontWeight + ' ' + style.fontSize + ' ' + style.fontFamily
      letteringContext.fillStyle = style.color
      letteringContext.globalAlpha = opacity
      letteringContext.textBaseline = 'alphabetic'
      const ascent = letteringContext.measureText('Hg').fontBoundingBoxAscent || Number.parseFloat(style.fontSize) * 0.85
      const range = document.createRange()
      let offset = 0
      for (const character of node.textContent) {
        range.setStart(node, offset)
        offset += character.length
        range.setEnd(node, offset)
        const rect = range.getBoundingClientRect()
        if (rect.width > 0 && rect.height > 0) {
          const glyph = style.textTransform === 'uppercase' ? character.toUpperCase() : character
          letteringContext.fillText(glyph, rect.left - bounds.left, rect.top - bounds.top + ascent)
        }
      }
    }
  }
  letteringContext.globalAlpha = 1

  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' }))
  try {
    const image = new Image()
    image.src = url
    await image.decode()
    const drawing = document.createElement('canvas')
    drawing.width = Math.ceil(treeBounds.width * ratio)
    drawing.height = Math.ceil(treeBounds.height * ratio)
    const ink = drawing.getContext('2d')!
    ink.drawImage(image, 0, 0, drawing.width, drawing.height)
    if (tree.closest('.atlas-drawing')) {
      ink.globalCompositeOperation = 'destination-in'
      const fade = ink.createLinearGradient(0, 0, drawing.width, 0)
      fade.addColorStop(0, 'transparent')
      fade.addColorStop(0.15, '#000')
      fade.addColorStop(0.85, '#000')
      fade.addColorStop(1, 'transparent')
      ink.fillStyle = fade
      ink.fillRect(0, 0, drawing.width, drawing.height)
    }
    context.drawImage(drawing, treeBounds.left - bounds.left, treeBounds.top - bounds.top, treeBounds.width, treeBounds.height)
  } finally { URL.revokeObjectURL(url) }

  context.drawImage(lettering, 0, 0, width, height)
  return { front: front.canvas, back: back.canvas, width, height }
}
