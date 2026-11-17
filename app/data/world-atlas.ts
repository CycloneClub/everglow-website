/** Editorial copy based on the terrain plans; sources and naming decisions are recorded in docs/world-atlas.md. */
type Text = { 'zh-cn': string, 'zh-hk': string, 'en-us': string }
const words = (cn: string, hk: string, en: string): Text => ({ 'zh-cn': cn, 'zh-hk': hk, 'en-us': en })

export type AtlasDetail = {
  id: string
  label: Text
  name: Text
  description?: Text
  image?: string
  portrait?: boolean
  framed?: boolean
  sprite?: { width: number, height: number, frames: number, fps?: number }
  artwork?: {
    width: number
    height: number
    overflow?: boolean
    parts: {
      image: string
      sheetWidth: number
      sheetHeight: number
      x?: number
      y?: number
      crop?: { x: number, y: number, width: number, height: number }
    }[]
  }
}

export function atlasDetailImageSources (detail: AtlasDetail) {
  return [...new Set([...(detail.image ? [detail.image] : []), ...(detail.artwork?.parts.map(part => part.image) ?? [])])]
}

export const atlasCopy = {
  title: words('天穹树', '天穹樹', 'Yggdrasil'),
  enter: words('进入世界树手记', '進入世界樹手記', 'Enter the world atlas'),
  previous: words('上一则', '上一則', 'Previous'),
  next: words('下一则', '下一則', 'Next'),
  continue: words('继续旅程', '繼續旅程', 'Continue'),
  skip: words('略过手记', '略過手記', 'Skip the atlas'),
  static: words('静态阅读', '靜態閱讀', 'Read without motion'),
  animated: words('返回地图', '返回地圖', 'Return to the map'),
  unknown: words('未至之境', '未至之境', 'Beyond the known'),
  unknownNote: words('墨迹到此为止。枝条仍在向上延伸。', '墨跡到此為止。枝條仍在向上延伸。', 'The ink ends here. The branches do not.'),
  continuation: words('↓继续浏览', '↓繼續瀏覽', '↓ Continue browsing'),
  download: words('开始旅程', '開始旅程', 'Begin your journey'),
}

export const atlasNodes = [
  { id: 'town', numeral: 'I', x: 500, y: 920 },
  { id: 'kelp', numeral: 'II', x: 500, y: 750 },
  { id: 'hive', numeral: 'III', x: 335, y: 635 },
  { id: 'maze', numeral: 'IV', x: 665, y: 635 },
  { id: 'core', numeral: 'V', x: 500, y: 525 },
  { id: 'forest', numeral: 'VI', x: 320, y: 410 },
  { id: 'flowers', numeral: 'VII', x: 680, y: 410 },
  { id: 'city', numeral: 'VIII', x: 350, y: 235 },
  { id: 'lake', numeral: 'IX', x: 650, y: 235 },
  { id: 'tip', numeral: 'X', x: 500, y: 115 },
]

export const atlasLayers = [
  {
    id: 'town',
    name: words('天穹镇', '天穹鎮', 'Yggdrasil Town'),
    english: 'Yggdrasil Town',
    imageAlt: words('Everglow 流光无际：天穹镇的层叠建筑与巨型晶塔场景', 'Everglow 流光無際：天穹鎮的層疊建築與巨型晶塔場景', 'Everglow: terraced buildings and the giant crystal pylon in Yggdrasil Town'),
    description: words('巨型晶塔悬在沼泽上方，石桥通往层层叠起的天穹镇。缆车环线连接高低街区，镇外分布着灯木森林。', '巨型晶塔懸在沼澤上方，石橋通往層層疊起的天穹鎮。纜車環線連接高低街區，鎮外分布著燈木森林。', 'A vast crystal pylon hangs above the swamp. A stone bridge leads to the terraced town, where a cable car loop connects the upper and lower streets. Lampwood forest grows beyond the town.'),
    place: words('聚落摹写 · 层叠的天穹镇', '聚落摹寫 · 層疊的天穹鎮', 'Town study · terraces of Yggdrasil'),
    details: [
      {
        id: 'origin-pylon', label: words('地标', '地標', 'LANDMARK'),
        name: words('原初晶塔', '原初晶塔', 'Origin Pylon'),
        description: words('出入世界的门径，悬浮在黑沉沼泽的石桥上，闪烁着奇异的光芒。', '出入世界的門徑，懸浮在黑沉沼澤的石橋上，閃爍著奇異的光芒。', 'A gateway into and out of the world, hovering above the stone bridge in the dark swamp and shimmering with a strange light.'),
        artwork: {
          // Scale against the crystal's visible bounds, with chains extending outside.
          width: 181.239, height: 276.723, overflow: true,
          parts: [{ image: '/images/atlas/origin-pylon-scene.png', sheetWidth: 660, sheetHeight: 660, x: -230.319, y: -162.959 }],
        },
      },
      {
        id: 'betty', label: words('居民', '居民', 'RESIDENT'),
        name: words('餐厅女仆贝蒂', '餐廳女僕貝蒂', 'Canteen Maid Betty'),
        image: '/images/atlas/betty-portrait.png',
      },
      {
        id: 'squamous-shell', label: words('首领', '首領', 'BOSS'),
        name: words('龙鳞古壳', '龍鱗古殼', 'Squamous Shell'),
        framed: true,
        artwork: {
          width: 342, height: 152,
          parts: [
            { image: '/images/atlas/squamous-seal-back.png', sheetWidth: 342, sheetHeight: 1064, crop: { x: 0, y: 0, width: 342, height: 152 } },
            { image: '/images/atlas/squamous-shell-dormant.png', sheetWidth: 342, sheetHeight: 152 },
            { image: '/images/atlas/squamous-seal-front.png', sheetWidth: 342, sheetHeight: 2128, crop: { x: 0, y: 0, width: 342, height: 152 } },
          ],
        },
      },
    ] as AtlasDetail[],
    landscape: '/images/atlas/town.png', sky: '/images/atlas/town-sky.png', foreground: '',
  },
  {
    id: 'kelp',
    name: words('苍苔帘幕', '蒼苔簾幕', 'Kelp Curtain'),
    english: 'Kelp Curtain',
    imageAlt: words('Everglow 流光无际：苍苔帘幕的垂苔与巨植洞穴场景', 'Everglow 流光無際：蒼苔簾幕的垂苔與巨植洞穴場景', 'Everglow: hanging moss and ancient plant caves in Kelp Curtain'),
    description: words('苔藓沿洞壁垂落，远古巨植的筛管形成向上的通道。亡碧湖之外，分布着碧绿苔原、朽木王庭与森雨幽谷，植被一直蔓延到洞穴深处。', '苔蘚沿洞壁垂落，遠古巨植的篩管形成向上的通道。亡碧湖之外，分布著碧綠苔原、朽木王庭與森雨幽谷，植被一直蔓延到洞穴深處。', 'Moss drapes the cave walls, and ancient plant vessels form passages upward. Beyond Death Jade Lake lie Green Tundra, Town of Decaying Wood and Valley of Lush and Moist. Vegetation reaches deep into the caves.'),
    place: words('地貌摹写 · 垂苔与爬升洞穴', '地貌摹寫 · 垂苔與爬升洞穴', 'Terrain study · hanging moss & climbing caves'),
    details: [
      {
        id: 'black-awning-boat', label: words('交通', '交通', 'TRANSPORT'),
        name: words('乌篷船', '烏篷船', 'Black Awning Boat'),
        description: words('岸边陈旧的船只，也许可以乘坐它渡过可怕的湖面。', '岸邊陳舊的船隻，也許可以乘坐它渡過可怕的湖面。', 'An old boat rests by the shore. Perhaps it could carry you across the fearsome lake.'),
        artwork: {
          width: 100, height: 50,
          parts: [{ image: '/images/atlas/black-awning-boat.png', sheetWidth: 200, sheetHeight: 100, crop: { x: 0, y: 0, width: 100, height: 50 } }],
        },
      },
      {
        id: 'isle-of-bloom', label: words('地点', '地點', 'PLACE'),
        name: words('夭华洲', '夭華洲', 'Isle of Bloom'),
        description: words('亡碧湖中心的小洲，繁茂的竹林里似乎有一片桃园。', '亡碧湖中心的小洲，繁茂的竹林裡似乎有一片桃園。', 'A small isle at the center of Death Jade Lake. A peach grove seems to lie within its dense bamboo forest.'),
        artwork: {
          width: 182, height: 142,
          parts: [{ image: '/images/atlas/isle-peach-tree.png', sheetWidth: 712, sheetHeight: 168, crop: { x: 0, y: 26, width: 182, height: 142 } }],
        },
      },
      {
        id: 'vampire-mat', label: words('首领', '首領', 'BOSS'),
        name: words('吸血魔毯', '吸血魔毯', 'Vampire Mat'),
        description: words('水下洞穴中隐藏的杀手，对鲜血极度渴望。', '水下洞穴中隱藏的殺手，對鮮血極度渴望。', 'A killer lurking in underwater caves, with an insatiable thirst for blood.'),
        image: '/images/atlas/vampire-mat.png',
        sprite: { width: 346, height: 106, frames: 11, fps: 24 },
      },
    ] as AtlasDetail[],
    landscape: '/images/atlas/kelp.png', sky: '/images/atlas/kelp-sky.png', foreground: '/images/atlas/kelp-close.png',
  },
].map((layer) => {
  const node = atlasNodes.find(node => node.id === layer.id)
  if (!node) { throw new Error(`Missing atlas node: ${layer.id}`) }
  return { ...layer, ...node }
})

// All ten levels retain their geographic positions, including uncharted ones.
export const unchartedLayers = atlasNodes.filter(node => !atlasLayers.some(layer => layer.id === node.id))

export function atlasText (text: Text, locale: string) {
  return text[locale as keyof Text] ?? text['en-us']
}
