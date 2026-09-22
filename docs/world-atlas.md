# 世界树手记

首页顺序为开场 → 世界树手记 → 旅程入口 → 原有内容速览 → 新闻。首屏向下滚动一次，会用约 700ms 吸附到手记开头：首屏保持原位，完整不透明的羊皮纸从下方覆盖。连续同向滚动不取消吸附，也不重置动画时间；不可取消的滚轮事件造成的位置偏移会在动画及短暂收尾期内校正。动画途中或刚到手记顶部时，向上滚会反向吸附回首屏；退出途中向下滚则重新进入。反向动画从当前位置开始，耗时按剩余距离缩短。支持滚轮、触屏及双向翻页键，收尾期最多 360ms，进入章节后恢复原生上下阅读。点击、调整窗口、离开页面会取消动画及收尾校正；减少动态效果模式保留原生滚动。仅此入口自动吸附，世界树章节内部仍只读取原生滚动位置，不按时间自行播放。

## 时间线与地图

`app/utils/atlas-timeline.ts` 将滚动进度映射为同一棵 SVG 树的镜头坐标、缩放与批注透明度。镜头位置为世界坐标，y 越小代表越高。每个已记录界层占 9 个阅读单位（原来的 1.5 倍），其中各条内容的展开与停留距离同比调整为原来的 1.5 倍。相邻界层之间用 3 个单位拉远、上移并重新聚焦。首段缩短为 3 个单位，取消原有 2 个单位的全景静止段：吸附后继续滚动即推进镜头，标题随之淡出，地图墨线提前显现。尾段 8 个单位。当前两层共 32 个单位，每单位约 46svh 滚动距离。

完整树 → 树纹与地图结构浮现 → 天穹镇 → 拉远并向上 → 苍苔帘幕 → 上方未知节点 → 完整树 → “Hang on to your dreams.” → 纸面退出。所有变化可逆，直接拖动滚动条也会落到对应状态。

层内保留原有渐显节奏：桌面批注各用层内 12% 的区间淡入，陆续留在纸面上，到末段一起淡出；窄屏批注的淡入、淡出各占 6%。窄屏交接时，仅把上一条淡出的后半段与下一条淡入的前半段重叠（层内 3%，约 12svh），不再先退完再出现，也避免两块较浓的文字同时叠放。区域插画始终沿用原来的渐显与退出时机，不受窄屏批注切换影响。总长度与入口吸附保持不变。

地图受用户提供的天穹树草图、Arber Sephirotheca 和 Systema Sephiroticvm 古版画启发；采用树形轮廓、刻线、圆环与分支结构，不复制其宗教文字或原图。参考来源：https://wiki.evageeks.org/Tree_of_Life 。上方八个节点仅显示罗马编号与问号。

## 内容及素材依据

用户提供的模组目录：`Sources/Modules/Yggdrasil/`。

- `README.md`：天穹镇、苍苔帘幕以及上方八个地区的顺序；用户确认当前展示前两层。
- `YggdrasilTown/Background/Town_Close.png` → `public/images/atlas/town.png`。
- `YggdrasilTown/Background/Town_Sky.png` → `public/images/atlas/town-sky.png`。
- `YggdrasilTown/NPCs/TownNPCs/Guard_of_YggdrasilTown_Head.png` → `public/images/atlas/guard.png`。
- `KelpCurtain/Background/KelpCurtainMiddle.png` → `public/images/atlas/kelp.png`。
- `KelpCurtain/Background/KelpCurtainSky.png` → `public/images/atlas/kelp-sky.png`。
- `KelpCurtain/Background/KelpCurtainClose.png` → `public/images/atlas/kelp-close.png`。
- `KelpCurtain/NPCs/GiantDandelion.png` → `public/images/atlas/giant-tree-man.png`。
- 巨树人描述及重击后的停顿来自 `KelpCurtain/NPCs/GiantDandelion.cs`；竞技场来自 `YggdrasilTown/Biomes/YggdrasilTownBiome.cs`。
- 龙鳞古壳采用网站已有的 `public/images/news/2024-11-16_SquamousShell.png`，对应模组 `YggdrasilTown/NPCs/SquamousShell/`。

这些素材均为原样复制；没有修改模组目录。场景图片由游戏背景原图在网页中叠放，并非游戏实录截图。衔接文案与疑问式边注为网站编辑文案，不作为新增官方设定。

## 扩展

`app/data/world-atlas.ts` 中的 `atlasNodes` 保存节点位置与编号；`atlasLayers` 保存已经公开的阅读内容。新增公开层时为对应 id 添加三语内容与素材，节点坐标会自动合并，未知节点列表自动排除该层，时间线随之扩展。旁枝的 x 坐标也参与镜头插值。原十节点之外的新地区需先在 `atlasNodes` 增加位置，并按世界结构补充 SVG 连线。

`AtlasTree.vue` 绘制树与地图，`Lore.vue` 负责滚动生命周期、内容与回退，`world-atlas.css` 负责纸面排版。生成线稿坐标统一为三位小数，避免服务端与浏览器三角函数末位差异造成水合警告；SVG 定义使用实例独立 ID。

## 阅读与验证

手机动态阅读的页脚提供“上一则 / 下一则”：依次停在完整树、每层标题、四条批注、未知界层、完整树结语；结语之后按钮变为“继续旅程”。停靠点由界层时间线生成，位于内容完整可见的区间。按钮使用浏览器平滑滚动，继续经过原有镜头与淡入淡出；连续点按按目标位置递进。触屏滑动、滚轮、其他键盘操作、模式切换或离开页面会取消按钮翻阅，恢复自然滚动，不添加逐项吸附。桌面页脚不变。

窄屏的边注逐条轮换；低于 600px 高的视口、系统减少动态效果偏好以及手动“静态阅读”均显示完整静态手记。无 JavaScript 的服务端输出同样保留全部文字和插图。切换到短横屏时保留当前界层的位置。静态版末尾也回到完整树。

手机地址栏伸缩时，外层 `.atlas-stage` 使用 `100dvh` 铺满当前可见区域，纸面纹理与遮罩随之覆盖；内部 `.atlas-composition` 使用 `100svh` 保持构图稳定。章节高度为固定的阅读距离加 `100dvh`，使 sticky 的有效行程不随地址栏变化。进度只依赖章节顶部偏移和 `svh` 阅读距离；静态回退也以稳定的小视口高度判断，避免仅因工具栏伸缩跨过 600px 而切换模式。真实旋转或窗口尺寸变化仍重新测量。

运行 `pnpm test:atlas` 验证向上探索、连续插值、反向回滚、批注节奏、插入界层和旁枝镜头。其他检查为 `pnpm lint`、`pnpm typecheck`、`pnpm build` 及 `node scripts/smoke-test.mjs`。如 pnpm 自动依赖校验受本机 store 权限影响，可直接使用已安装的 Node CLI；不需要新增运行依赖。
