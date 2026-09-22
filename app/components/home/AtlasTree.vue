<script setup lang="ts">
import { atlasLayers, unchartedLayers } from '~/data/world-atlas'

defineProps<{
  camera: string
  map: number
  active: number
  focus: number
  illustration: number
  unknown: number
}>()

// Deterministic pen strokes: identical geometry on the server and client.
const drawingId = useId()
const ink = (value: number) => Number(value.toFixed(3))
const pen = (path: string) => path.replace(/-?\d+(?:\.\d+)?(?:e[-+]?\d+)?/gi, value => String(ink(Number(value))))
const branches: { d: string, width: number }[] = []
const leaves: { x: number, y: number, angle: number, size: number }[] = []
let seed = 73
function random () {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}
function branch (x: number, y: number, angle: number, length: number, depth: number, width: number) {
  const ex = x + Math.cos(angle) * length
  const ey = y + Math.sin(angle) * length
  const bend = (random() - 0.5) * length * 0.7
  branches.push({ d: pen(`M${x},${y} Q${(x + ex) / 2 + bend},${(y + ey) / 2 + 12} ${ex},${ey}`), width: ink(width) })
  if (depth > 0) {
    branch(ex, ey, angle - 0.25 - random() * 0.43, length * 0.69, depth - 1, width * 0.62)
    branch(ex, ey, angle + 0.3 + random() * 0.4, length * 0.68, depth - 1, width * 0.62)
  } else {
    for (let i = 0; i < 7; i++) {
      leaves.push({ x: ink(ex + (random() - 0.5) * 35), y: ink(ey + (random() - 0.5) * 28), angle: ink(random() * 180), size: ink(3 + random() * 4) })
    }
  }
}
for (let i = 0; i < 15; i++) {
  const side = i % 2 ? 1 : -1
  branch(500 + side * 12, 690 - i * 33, -Math.PI / 2 + side * (0.65 + random() * 0.55), 92 + random() * 62, 4, 9 - i * 0.35)
}
const roots = Array.from({ length: 23 }, (_, i) => {
  const side = i % 2 ? 1 : -1
  const endX = 500 + side * (80 + random() * 280)
  const endY = 1030 + random() * 105
  return pen(`M${480 + random() * 40},950 C${470 + side * 70},1040 ${endX - side * 50},1010 ${endX},${endY} m-3,-3 q${side * 35},-15 ${side * 60},-9`)
})
const bark = Array.from({ length: 30 }, (_, i) => {
  const x = 454 + i * 3.1
  return pen(`M${x - 16},1010 C${x + 60},890 ${x - 20},780 ${x + 18},650 S${500 + (x - 500) * 0.4},410 ${500 + (x - 500) * 0.3},230`)
})
const rays = Array.from({ length: 100 }, (_, i) => {
  const angle = i / 100 * Math.PI * 2
  const inner = 305 + random() * 30
  const outer = inner + 12 + random() * 42
  return pen(`M${500 + Math.cos(angle) * inner},${385 + Math.sin(angle) * inner * 0.83} L${500 + Math.cos(angle) * outer},${385 + Math.sin(angle) * outer * 0.83}`)
})
</script>

<template>
  <svg
    class="atlas-tree"
    viewBox="0 0 1000 1200"
    fill="none"
    aria-hidden="true"
  >
    <defs>
      <pattern
        :id="`${drawingId}-hatch`"
        width="7"
        height="7"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(28)"
      >
        <path
          d="M0 0V7"
          stroke="#68553c"
          stroke-width="0.65"
          opacity="0.28"
        />
      </pattern>
      <clipPath
        v-for="layer in atlasLayers"
        :id="`${drawingId}-window-${layer.id}`"
        :key="layer.id"
      >
        <path :d="`M342 ${layer.y - 65} Q420 ${layer.y - 94} 498 ${layer.y - 72} T660 ${layer.y - 66} L674 ${layer.y + 63} Q560 ${layer.y + 83} 490 ${layer.y + 62} T332 ${layer.y + 59}Z`" />
      </clipPath>
    </defs>
    <g :transform="camera">
      <g
        stroke="#806b47"
        stroke-width="0.65"
        :opacity="0.24 * (1 - map * 0.6)"
      >
        <path
          v-for="(ray, index) in rays"
          :key="index"
          :d="ray"
        />
      </g>
      <g
        stroke="#89734d"
        stroke-width="0.8"
        opacity="0.28"
      >
        <ellipse
          cx="500"
          cy="555"
          rx="433"
          ry="508"
          stroke-dasharray="2 9"
        />
        <ellipse
          cx="500"
          cy="555"
          rx="449"
          ry="524"
        />
        <path
          d="M30 600H970 M500 17V1168 M185 195L815 975 M170 960L845 210"
          stroke-dasharray="5 12"
        />
        <circle
          cx="500"
          cy="345"
          r="225"
        />
      </g>
      <g
        :opacity="1 - map * 0.3 - focus * 0.54"
        stroke="#584932"
        stroke-linecap="round"
      >
        <path
          d="M413 1020 Q470 956 449 875 Q433 801 466 680 Q487 539 489 387 L504 154 Q510 396 523 521 Q542 656 531 767 Q559 900 570 980 L604 1032 Q529 1005 495 1025 Q455 1039 413 1020Z"
          fill="#a28a5b"
          fill-opacity="0.12"
          stroke-width="2"
        />
        <path
          d="M413 1020 Q470 956 449 875 Q433 801 466 680 L504 154 Q510 396 523 521 Q542 656 531 767 Q559 900 570 980 L604 1032Z"
          :fill="`url(#${drawingId}-hatch)`"
          stroke="none"
        />
        <path
          v-for="(line, i) in bark"
          :key="`b${i}`"
          :d="line"
          stroke-width="0.65"
          opacity="0.54"
        />
        <path
          v-for="(line, i) in roots"
          :key="`r${i}`"
          :d="line"
          :stroke-width="i % 4 === 0 ? 2.4 : 0.8"
        />
        <path
          v-for="(line, i) in branches"
          :key="i"
          :d="line.d"
          :stroke-width="line.width"
          :opacity="line.width > 3 ? 0.8 : 0.63"
        />
        <g
          fill="#7f8050"
          fill-opacity="0.2"
          stroke-width="0.45"
        >
          <ellipse
            v-for="(leaf, i) in leaves"
            :key="i"
            :cx="leaf.x"
            :cy="leaf.y"
            :rx="leaf.size"
            :ry="leaf.size * 0.37"
            :transform="`rotate(${leaf.angle} ${leaf.x} ${leaf.y})`"
          />
        </g>
      </g>
      <g
        v-for="(layer, index) in atlasLayers"
        :key="layer.id"
        :transform="`translate(${layer.x - 500} 0)`"
        :opacity="0.18 + map * (active === index ? 0.82 : 0.82 - focus * 0.7)"
      >
        <g
          :opacity="(1 - illustration) * 0.65"
          stroke="#756044"
          fill="none"
        >
          <circle
            cx="500"
            :cy="layer.y"
            r="84"
            stroke-width="1.5"
          />
          <circle
            cx="500"
            :cy="layer.y"
            r="78"
            stroke-width="0.7"
          />
          <circle
            cx="500"
            :cy="layer.y"
            r="72"
            stroke-width="0.6"
            stroke-dasharray="1 4"
          />
        </g>
        <g
          stroke="#64543b"
          stroke-width="1.2"
        >
          <path
            :d="`M290 ${layer.y + 70} Q370 ${layer.y + 35} 449 ${layer.y + 68} T718 ${layer.y + 56} Q625 ${layer.y + 116} 508 ${layer.y + 95} T290 ${layer.y + 70}Z`"
            :fill="`url(#${drawingId}-hatch)`"
          />
          <path :d="`M295 ${layer.y + 63} Q386 ${layer.y + 15} 483 ${layer.y + 57} T710 ${layer.y + 52} M320 ${layer.y + 84} Q470 ${layer.y + 119} 680 ${layer.y + 77}`" />
          <path
            v-if="index === 0"
            :d="`M378 ${layer.y + 41} v-49 l24 -29 26 29 v53 m-57 -49 h63 m-41 46 v-26 h17 v28 M539 ${layer.y + 53} v-68 l22 -37 23 37 v68 m-50 -70 h54 m-40 24 h24 m-12 -23 v68 M603 ${layer.y + 40} v-32 l22 -18 20 18 v32`"
          />
          <path
            v-else
            :d="`M338 ${layer.y - 54} Q454 ${layer.y - 108} 491 ${layer.y - 49} T666 ${layer.y - 55} M373 ${layer.y - 56} q-15 55 4 91 m24 -94 q-15 30 -2 53 m170 -34 q-19 32 -1 59 m51 -93 q22 72 -13 113`"
          />
        </g>
        <g
          :clip-path="`url(#${drawingId}-window-${layer.id})`"
          :opacity="active === index ? illustration : 0"
        >
          <image
            :href="layer.sky"
            x="330"
            :y="layer.y - 95"
            width="350"
            height="185"
            preserveAspectRatio="xMidYMid slice"
          />
          <image
            :href="layer.landscape"
            x="330"
            :y="layer.y - 95"
            width="350"
            height="185"
            preserveAspectRatio="xMidYMid slice"
          />
          <image
            v-if="layer.foreground"
            :href="layer.foreground"
            x="330"
            :y="layer.y - 95"
            width="350"
            height="185"
            preserveAspectRatio="xMidYMid slice"
          />
        </g>
        <g
          :opacity="map * (1 - focus)"
          fill="#804f39"
          font-family="Georgia, serif"
        >
          <path
            :d="`M279 ${layer.y} H331 M669 ${layer.y} H732`"
            stroke="#9e6650"
            stroke-width="0.9"
            stroke-dasharray="2 4"
          />
          <circle
            cx="268"
            :cy="layer.y"
            r="12"
            fill="none"
            stroke="#9e6650"
            stroke-width="0.7"
          />
          <text
            x="268"
            :y="layer.y + 4"
            text-anchor="middle"
            font-size="11"
          >{{ layer.numeral }}</text>
          <text
            x="685"
            :y="layer.y - 10"
            font-size="8"
            letter-spacing="1"
          >{{ layer.english }}</text>
        </g>
      </g>
      <g
        :opacity="map * (0.18 + unknown * 0.62)"
        stroke="#806c4d"
        stroke-width="0.7"
      >
        <path
          d="M500 920V750L335 635L500 525L665 635L500 750 M335 635V410L500 525L680 410V635 M320 410L350 235L500 115L650 235L680 410 M350 235L680 410 M650 235L320 410 M500 115V525"
          stroke-width="2.5"
          stroke-opacity="0.5"
        />
        <path
          d="M492 916V752L330 634 M508 750L670 634 M330 630V412L347 236 M673 630V412L653 236"
          stroke-width="0.7"
        />
        <g
          v-for="layer in unchartedLayers"
          :key="layer.numeral"
        >
          <circle
            :cx="layer.x"
            :cy="layer.y"
            r="40"
            fill="#e5d8b6"
            stroke-width="1.3"
          />
          <circle
            :cx="layer.x"
            :cy="layer.y"
            r="34"
            stroke-dasharray="1 3"
          />
          <circle
            :cx="layer.x"
            :cy="layer.y"
            r="24"
            stroke-width="0.5"
          />
          <text
            :x="layer.x"
            :y="layer.y - 1"
            text-anchor="middle"
            fill="#78664a"
            stroke="none"
            font-size="12"
            font-family="Georgia, serif"
          >{{ layer.numeral }}</text>
          <text
            :x="layer.x"
            :y="layer.y + 15"
            text-anchor="middle"
            fill="#78664a"
            stroke="none"
            font-size="10"
            font-style="italic"
          >?</text>
        </g>
      </g>
      <g
        transform="translate(800 1010)"
        stroke="#816b49"
        opacity="0.65"
      >
        <circle
          r="38"
          stroke-width="0.6"
        /><circle
          r="30"
          stroke-width="0.5"
        />
        <path
          d="M0 -50V50 M-50 0H50 M0 -35L7 0 0 35 -7 0Z"
          stroke-width="0.9"
        />
        <path
          d="M-26 -26L26 26 M26 -26L-26 26"
          stroke-width="0.5"
        />
        <text
          y="-56"
          text-anchor="middle"
          fill="#816b49"
          stroke="none"
          font-size="12"
        >N</text>
      </g>
    </g>
  </svg>
</template>

<style scoped>
.atlas-tree { display: block; width: 100%; height: 100%; overflow: visible; }
</style>
