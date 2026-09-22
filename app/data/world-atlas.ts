/** Editorial copy; proper names and layer order follow Yggdrasil/README.md. */
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
    description: words('巨树之下，灯火汇成聚落。向上的旅程，从这里开始。', '巨樹之下，燈火匯成聚落。向上的旅程，從這裡開始。', 'At the foot of the great tree, lights gather into a town. The ascent begins here.'),
    place: words('聚落建筑 · 灯火与石桥', '聚落建築 · 燈火與石橋', 'Town study · lanterns & stone bridges'),
    note: words('灯木森林、幽暗的水岸……城镇并不是这一层的全部。', '燈木森林、幽暗的水岸……城鎮並不是這一層的全部。', 'Lampwood forest, shadowed shores… the town is only part of this layer.'),
    specimen: words('关口保安', '關口保安', 'Guard of Yggdrasil Town'),
    specimenNote: words('抵达关口时，别忘了留意这里的居民。', '抵達關口時，別忘了留意這裡的居民。', 'At the gate, take a moment to meet the people who live here.'),
    mechanism: words('另记：镇中的竞技场，值得再访。', '另記：鎮中的競技場，值得再訪。', 'A note for later: return to the town arena.'),
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
    description: words('离开灯火，沿巨树向上。枝蔓垂落，另一重世界在苍绿之中展开。', '離開燈火，沿巨樹向上。枝蔓垂落，另一重世界在蒼綠之中展開。', 'Leave the lanterns below. Hanging growth opens onto another world, folded in green.'),
    place: words('地貌摹写 · 交错的枝蔓', '地貌摹寫 · 交錯的枝蔓', 'Terrain study · interwoven boughs'),
    note: words('枝条遮住的地方，是否还藏着另一条路？', '枝條遮住的地方，是否還藏著另一條路？', 'Where the branches obscure the page, could there be another path?'),
    specimen: words('巨树人', '巨樹人', 'Giant Tree Man'),
    specimenNote: words('刺苔庭园的稀有敌怪。一株巨大树人的残骸。', '刺苔庭園的稀有敵怪。一株巨大樹人的殘骸。', 'A rare enemy of Spiny Moss Court: the remains of an enormous tree being.'),
    mechanism: words('观察：重击落下后，拳头会短暂陷入地面。', '觀察：重擊落下後，拳頭會短暫陷入地面。', 'Observed: after a heavy strike, its fist remains lodged in the ground.'),
    encounter: words('尚未写尽的见闻', '尚未寫盡的見聞', 'An unfinished field record'),
    encounterNote: words('湖岸、庭园、枝蔓深处……这一页，仍有许多空白。', '湖岸、庭園、枝蔓深處……這一頁，仍有許多空白。', 'The lakeshore, the court, the tangled depths… much of this page remains unwritten.'),
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
