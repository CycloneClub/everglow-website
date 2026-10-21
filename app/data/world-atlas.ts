/** Editorial copy based on the terrain plans; sources and naming decisions are recorded in docs/world-atlas.md. */
type Text = { 'zh-cn': string, 'zh-hk': string, 'en-us': string, 'ja-jp': string, 'ko-kr': string, 'ru-ru': string }
const words = (cn: string, hk: string, en: string, ja: string, ko: string, ru: string): Text => ({ 'zh-cn': cn, 'zh-hk': hk, 'en-us': en, 'ja-jp': ja, 'ko-kr': ko, 'ru-ru': ru })

export const atlasCopy = {
  title: words('一树，万境。', '一樹，萬境。', 'One tree. Worlds within.', '一本の樹に、幾多の世界。', '한 그루의 나무, 그 안의 수많은 세계.', 'Одно дерево. Множество миров.'),
  subtitle: words('天穹树 · 世界考察手记', '天穹樹 · 世界考察手記', 'YGGDRASIL · FIELD NOTES', 'ユグドラシル · 世界探訪の手記', '위그드라실 · 세계 탐사 수첩', 'ИГГДРАСИЛЬ · ПУТЕВЫЕ ЗАМЕТКИ'),
  intro: words('顺着根系，读向未知。', '順著根系，讀向未知。', 'Follow the roots. Read into the unknown.', '根をたどり、未知を読み解く。', '뿌리를 따라 미지의 세계로.', 'Следуйте за корнями навстречу неизведанному.'),
  scroll: words('向下翻阅 · 向上探索', '向下翻閱 · 向上探索', 'SCROLL TO READ · ASCEND TO EXPLORE', '下へ読み進め、上へ探る', '아래로 읽으며 위로 탐험하세요', 'ЛИСТАЙТЕ ВНИЗ · ИССЛЕДУЙТЕ ВЫСОТЫ'),
  enter: words('进入世界树手记', '進入世界樹手記', 'Enter the world atlas', '世界樹の手記を開く', '세계수 탐사 수첩 열기', 'Открыть атлас мирового дерева'),
  previous: words('上一则', '上一則', 'Previous', '前へ', '이전', 'Назад'),
  next: words('下一则', '下一則', 'Next', '次へ', '다음', 'Далее'),
  continue: words('继续旅程', '繼續旅程', 'Continue', '旅を続ける', '여정 계속하기', 'Продолжить путешествие'),
  skip: words('略过手记', '略過手記', 'Skip the atlas', '手記をスキップ', '수첩 건너뛰기', 'Пропустить атлас'),
  static: words('静态阅读', '靜態閱讀', 'Read without motion', '動きのない表示で読む', '정적 화면으로 읽기', 'Читать без анимации'),
  animated: words('返回地图', '返回地圖', 'Return to the map', '地図に戻る', '지도로 돌아가기', 'Вернуться к карте'),
  unknown: words('未至之境', '未至之境', 'Beyond the known', '未踏の地', '미지의 땅', 'За пределами известного'),
  unknownNote: words('墨迹到此为止。枝条仍在向上延伸。', '墨跡到此為止。枝條仍在向上延伸。', 'The ink ends here. The branches do not.', '記録はここで途切れる。枝はなお、空へと伸びている。', '기록은 여기서 끝난다. 가지는 여전히 위로 뻗어 나간다.', 'Здесь обрываются записи. Но ветви тянутся дальше.'),
  mapNote: words('树纹之间，另有天地。', '樹紋之間，另有天地。', 'Between these lines, entire worlds.', '樹の模様の間に、別の世界がある。', '나무의 결 사이로 또 다른 세계가 펼쳐진다.', 'Между линиями древесного узора — целые миры.'),
  observation: words('边注', '邊註', 'MARGINALIA', '欄外の記録', '여백의 기록', 'ЗАМЕТКИ НА ПОЛЯХ'),
  specimen: words('见闻记录', '見聞記錄', 'FIELD OBSERVATION', '観察記録', '관찰 기록', 'ПОЛЕВЫЕ НАБЛЮДЕНИЯ'),
  encounter: words('重要遭遇', '重要遭遇', 'ENCOUNTER', '遭遇', '조우', 'ВСТРЕЧА'),
  continuation: words('走出手记，进入世界。', '走出手記，進入世界。', 'Step off the page. Into the world.', '手記の先へ、世界の中へ。', '수첩을 넘어, 세계 속으로.', 'Со страниц — навстречу миру.'),
  download: words('开始旅程', '開始旅程', 'Begin your journey', '旅を始める', '여정 시작하기', 'Начать путешествие'),
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
    name: words('天穹镇', '天穹鎮', 'Yggdrasil Town', 'ユグドラシルの町', '위그드라실 마을', 'Город Иггдрасиля'),
    english: 'Yggdrasil Town',
    description: words('巨型晶塔悬在沼泽之上，残存的石桥通向层层叠起的天穹镇。攀升者在这里整装，向树中更高处出发。', '巨型晶塔懸在沼澤之上，殘存的石橋通向層層疊起的天穹鎮。攀升者在這裡整裝，向樹中更高處出發。', 'A vast crystal pylon hangs above the swamp. An ancient bridge leads to the terraced town, where climbers prepare for the ascent.', '巨大なクリスタルの塔が沼地の上に浮かぶ。古びた石橋の先には幾層にも重なる町があり、登りゆく者たちはここで旅支度を整える。', '거대한 수정 탑이 늪 위에 떠 있다. 오래된 돌다리는 층층이 쌓인 마을로 이어지고, 등반자들은 이곳에서 더 높은 곳으로 향할 채비를 한다.', 'Огромный кристальный пилон парит над болотом. Древний каменный мост ведёт к многоярусному городу, где путники готовятся к восхождению.'),
    place: words('聚落摹写 · 层叠的天穹镇', '聚落摹寫 · 層疊的天穹鎮', 'Town study · terraces of Yggdrasil', '集落の写生 · 幾層にも重なる町', '마을 스케치 · 층층이 이어진 위그드라실', 'Зарисовка поселения · террасы Иггдрасиля'),
    note: words('石桥下是黑沉沼泽，镇外还有灯木森林。灯火照亮的，只是这一层的一角。', '石橋下是黑沉沼澤，鎮外還有燈木森林。燈火照亮的，只是這一層的一角。', 'Dark swamp lies beneath the bridge; lampwood forest grows beyond the town. Lanterns light only a corner of this layer.', '石橋の下には暗い沼地が広がり、町の外には灯木の森が茂る。灯りが照らすのは、この階層のほんの一角にすぎない。', '돌다리 아래에는 어두운 늪이, 마을 밖에는 등불나무 숲이 펼쳐진다. 불빛이 밝히는 곳은 이 층의 작은 한 모퉁이뿐이다.', 'Под мостом простирается тёмное болото, за городом растёт лес фонарных деревьев. Свет фонарей озаряет лишь уголок этого яруса.'),
    specimen: words('关口保安', '關口保安', 'Guard of Yggdrasil Town', 'ユグドラシルの町の衛兵', '위그드라실 마을 경비병', 'Страж города Иггдрасиля'),
    specimenNote: words('抵达关口时，别忘了留意这里的居民。', '抵達關口時，別忘了留意這裡的居民。', 'At the gate, take a moment to meet the people who live here.', '関所に着いたら、ここに暮らす人々にも目を向けてみよう。', '관문에 도착하면 이곳의 주민들도 만나 보자.', 'У городских ворот найдите минутку, чтобы познакомиться с местными жителями.'),
    mechanism: words('行路记：缆车环线串起高低街区，城镇本身也是一段向上的路。', '行路記：纜車環線串起高低街區，城鎮本身也是一段向上的路。', 'Route note: a cable car loop links the upper and lower streets. Even the town is an ascent.', '道の記録：環状のケーブルカーが高低の街路を結ぶ。町そのものが、上へと続く道になっている。', '경로 기록: 순환 케이블카가 위아래 거리를 잇는다. 마을 자체가 위로 향하는 길이다.', 'Заметка о пути: кольцевая канатная дорога соединяет верхние и нижние улицы. Сам город — уже часть восхождения.'),
    encounter: words('龙鳞古壳', '龍鱗古殼', 'Squamous Shell', 'Squamous Shell', 'Squamous Shell', 'Squamous Shell'),
    encounterNote: words('在灯木之间，记下这道庞大的身影。', '在燈木之間，記下這道龐大的身影。', 'Among the lampwood, a vast silhouette enters the record.', '灯木の間に現れた、巨大な影を記録する。', '등불나무 사이로 나타난 거대한 형체를 기록한다.', 'Среди фонарных деревьев в записях появляется огромный силуэт.'),
    specimenImage: '/images/atlas/guard.png',
    encounterImage: '/images/news/2024-11-16_SquamousShell.png',
    landscape: '/images/atlas/town.png', sky: '/images/atlas/town-sky.png', foreground: '',
  },
  {
    id: 'kelp',
    name: words('苍苔帘幕', '蒼苔簾幕', 'Kelp Curtain', '苔の帳', '이끼 장막', 'Моховой занавес'),
    english: 'Kelp Curtain',
    description: words('苔藓沿洞壁垂落，远古巨植的筛管化作向上的通道。亡碧湖之外，苔原、王庭与幽谷藏在苍绿深处。', '苔蘚沿洞壁垂落，遠古巨植的篩管化作向上的通道。亡碧湖之外，苔原、王庭與幽谷藏在蒼綠深處。', 'Moss drapes the caves; ancient plant vessels form climbing passages. Beyond Death Jade Lake lie mosslands, a decaying court and misty valleys.', '苔が洞窟の壁を垂れ、太古の巨木の篩管が上へ続く通路となる。Death Jade Lakeの先には、苔の原野、朽ちた王庭、霧深い谷が潜んでいる。', '이끼가 동굴 벽을 따라 드리우고, 고대 거대 식물의 체관이 위로 향하는 통로가 된다. Death Jade Lake 너머에는 이끼 들판과 쇠락한 궁정, 안개 낀 골짜기가 숨어 있다.', 'Мох свисает со стен пещер, а сосуды древних гигантских растений становятся проходами вверх. За озером Мёртвого нефрита скрываются мшистые равнины, ветшающий двор и туманные долины.'),
    place: words('地貌摹写 · 垂苔与爬升洞穴', '地貌摹寫 · 垂苔與爬升洞穴', 'Terrain study · hanging moss & climbing caves', '地形の写生 · 垂れる苔と登る洞窟', '지형 스케치 · 늘어진 이끼와 오르는 동굴', 'Зарисовка рельефа · свисающий мох и пещерные подъёмы'),
    note: words('沿亡碧湖岸记下去：碧绿苔原、朽木王庭、森雨幽谷。连洞穴深处，也有植被蔓生。', '沿亡碧湖岸記下去：碧綠苔原、朽木王庭、森雨幽谷。連洞穴深處，也有植被蔓生。', 'Beyond the lake: Green Tundra, Town of Decaying Wood, Valley of Lush and Moist. Greenery reaches even into the caves.', '湖の先にはGreen Tundra、Town of Decaying Wood、Valley of Lush and Moist。洞窟の奥深くにまで、緑は広がっている。', '호수 너머로 Green Tundra, Town of Decaying Wood, Valley of Lush and Moist가 이어진다. 동굴 깊은 곳까지도 초목이 뻗어 있다.', 'За озером лежат Зелёная тундра, Город гниющей древесины и Долина пышной зелени и влаги. Растительность проникает даже в глубины пещер.'),
    specimen: words('巨树人', '巨樹人', 'Giant Tree Man', '巨大な樹人', '거대 나무인간', 'Гигантский древень'),
    specimenNote: words('刺苔庭园的稀有敌怪。一株巨大树人的残骸。', '刺苔庭園的稀有敵怪。一株巨大樹人的殘骸。', 'A rare enemy of Spiny Moss Court: the remains of an enormous tree being.', 'Spiny Moss Courtにまれに現れる敵。巨大な樹人のなれの果て。', 'Spiny Moss Court에서 드물게 나타나는 적. 거대한 나무 존재의 잔해다.', 'Редкий враг Двора колючего мха — останки огромного древесного существа.'),
    mechanism: words('观察：重击落下后，拳头会短暂陷入地面。', '觀察：重擊落下後，拳頭會短暫陷入地面。', 'Observed: after a heavy strike, its fist remains lodged in the ground.', '観察：強烈な一撃の後、拳はしばらく地面に埋まったままになる。', '관찰: 강한 일격을 내리친 뒤에는 주먹이 잠시 땅에 박혀 있다.', 'Наблюдение: после тяжёлого удара его кулак ненадолго застревает в земле.'),
    encounter: words('湖中一页 · 夭华洲', '湖中一頁 · 夭華洲', 'Isle of Bloom', '湖の一頁 · 花咲く島', '호수의 한 페이지 · 꽃피는 섬', 'Остров цветения'),
    encounterNote: words('竹林围住湖中小洲，桃枝探向洞口。垂苔之下，洞内藏着宗派旧址。', '竹林圍住湖中小洲，桃枝探向洞口。垂苔之下，洞內藏著宗派舊址。', 'Bamboo encloses the lake isle; peach branches lean over a cave entrance. Beneath the moss lie the remains of a sect settlement.', '湖の小島を竹林が囲み、桃の枝が洞窟の入口へと伸びる。垂れる苔の下、洞窟にはかつての宗派の拠点が眠っている。', '호수의 작은 섬을 대나무 숲이 감싸고, 복숭아나무 가지가 동굴 입구로 뻗는다. 드리운 이끼 아래에는 옛 문파의 터가 잠들어 있다.', 'Бамбук окружает островок посреди озера, ветви персика склоняются ко входу в пещеру. Под мхом скрываются руины поселения древней школы.'),
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
