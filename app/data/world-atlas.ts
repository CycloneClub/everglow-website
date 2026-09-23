/** Editorial copy based on the terrain plans; sources and naming decisions are recorded in docs/world-atlas.md. */
type Text = { 'zh-cn': string, 'zh-hk': string, 'en-us': string }
const words = (cn: string, hk: string, en: string): Text => ({ 'zh-cn': cn, 'zh-hk': hk, 'en-us': en })

export const atlasCopy = {
  title: words('一树，万境。', '一樹，萬境。', 'One tree. Worlds within.'),
  subtitle: words('天穹树 · 世界考察手记', '天穹樹 · 世界考察手記', 'YGGDRASIL · FIELD NOTES'),
  intro: words('顺着根系，读向未知。', '順著根系，讀向未知。', 'Follow the roots. Read into the unknown.'),
  scroll: words('向下翻阅 · 向上探索', '向下翻閱 · 向上探索', 'SCROLL TO READ · ASCEND TO EXPLORE'),
  enter: words('进入世界树手记', '進入世界樹手記', 'Enter the world atlas'),
  previous: words('上一则', '上一則', 'Previous'),
  next: words('下一则', '下一則', 'Next'),
  continue: words('继续旅程', '繼續旅程', 'Continue'),
  skip: words('略过手记', '略過手記', 'Skip the atlas'),
  static: words('静态阅读', '靜態閱讀', 'Read without motion'),
  animated: words('返回地图', '返回地圖', 'Return to the map'),
  unknown: words('未至之境', '未至之境', 'Beyond the known'),
  unknownNote: words('墨迹到此为止。枝条仍在向上延伸。', '墨跡到此為止。枝條仍在向上延伸。', 'The ink ends here. The branches do not.'),
  mapNote: words('树纹之间，另有天地。', '樹紋之間，另有天地。', 'Between these lines, entire worlds.'),
  observation: words('边注', '邊註', 'MARGINALIA'),
  specimen: words('见闻记录', '見聞記錄', 'FIELD OBSERVATION'),
  encounter: words('重要遭遇', '重要遭遇', 'ENCOUNTER'),
  continuation: words('走出手记，进入世界。', '走出手記，進入世界。', 'Step off the page. Into the world.'),
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
    description: words('巨型晶塔悬在沼泽之上，残存的石桥通向层层叠起的天穹镇。攀升者在这里整装，向树中更高处出发。', '巨型晶塔懸在沼澤之上，殘存的石橋通向層層疊起的天穹鎮。攀升者在這裡整裝，向樹中更高處出發。', 'A vast crystal pylon hangs above the swamp. An ancient bridge leads to the terraced town, where climbers prepare for the ascent.'),
    place: words('聚落摹写 · 层叠的天穹镇', '聚落摹寫 · 層疊的天穹鎮', 'Town study · terraces of Yggdrasil'),
    note: words('石桥下是黑沉沼泽，镇外还有灯木森林。灯火照亮的，只是这一层的一角。', '石橋下是黑沉沼澤，鎮外還有燈木森林。燈火照亮的，只是這一層的一角。', 'Dark swamp lies beneath the bridge; lampwood forest grows beyond the town. Lanterns light only a corner of this layer.'),
    specimen: words('关口保安', '關口保安', 'Guard of Yggdrasil Town'),
    specimenNote: words('抵达关口时，别忘了留意这里的居民。', '抵達關口時，別忘了留意這裡的居民。', 'At the gate, take a moment to meet the people who live here.'),
    mechanism: words('行路记：缆车环线串起高低街区，城镇本身也是一段向上的路。', '行路記：纜車環線串起高低街區，城鎮本身也是一段向上的路。', 'Route note: a cable car loop links the upper and lower streets. Even the town is an ascent.'),
    encounter: words('龙鳞古壳', '龍鱗古殼', 'Squamous Shell'),
    encounterNote: words('在灯木之间，记下这道庞大的身影。', '在燈木之間，記下這道龐大的身影。', 'Among the lampwood, a vast silhouette enters the record.'),
    specimenImage: '/images/atlas/guard.png',
    encounterImage: '/images/news/2024-11-16_SquamousShell.png',
    landscape: '/images/atlas/town.png', sky: '/images/atlas/town-sky.png', foreground: '',
  },
  {
    id: 'kelp',
    name: words('苍苔帘幕', '蒼苔簾幕', 'Kelp Curtain'),
    english: 'Kelp Curtain',
    description: words('苔藓沿洞壁垂落，远古巨植的筛管化作向上的通道。亡碧湖之外，苔原、王庭与幽谷藏在苍绿深处。', '苔蘚沿洞壁垂落，遠古巨植的篩管化作向上的通道。亡碧湖之外，苔原、王庭與幽谷藏在蒼綠深處。', 'Moss drapes the caves; ancient plant vessels form climbing passages. Beyond Death Jade Lake lie mosslands, a decaying court and misty valleys.'),
    place: words('地貌摹写 · 垂苔与爬升洞穴', '地貌摹寫 · 垂苔與爬升洞穴', 'Terrain study · hanging moss & climbing caves'),
    note: words('沿亡碧湖岸记下去：碧绿苔原、朽木王庭、森雨幽谷。连洞穴深处，也有植被蔓生。', '沿亡碧湖岸記下去：碧綠苔原、朽木王庭、森雨幽谷。連洞穴深處，也有植被蔓生。', 'Beyond the lake: Green Tundra, Town of Decaying Wood, Valley of Lush and Moist. Greenery reaches even into the caves.'),
    specimen: words('巨树人', '巨樹人', 'Giant Tree Man'),
    specimenNote: words('刺苔庭园的稀有敌怪。一株巨大树人的残骸。', '刺苔庭園的稀有敵怪。一株巨大樹人的殘骸。', 'A rare enemy of Spiny Moss Court: the remains of an enormous tree being.'),
    mechanism: words('观察：重击落下后，拳头会短暂陷入地面。', '觀察：重擊落下後，拳頭會短暫陷入地面。', 'Observed: after a heavy strike, its fist remains lodged in the ground.'),
    encounter: words('湖中一页 · 夭华洲', '湖中一頁 · 夭華洲', 'Isle of Bloom'),
    encounterNote: words('竹林围住湖中小洲，桃枝探向洞口。垂苔之下，洞内藏着宗派旧址。', '竹林圍住湖中小洲，桃枝探向洞口。垂苔之下，洞內藏著宗派舊址。', 'Bamboo encloses the lake isle; peach branches lean over a cave entrance. Beneath the moss lie the remains of a sect settlement.'),
    specimenImage: '/images/atlas/giant-tree-man.png',
    encounterImage: '',
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
