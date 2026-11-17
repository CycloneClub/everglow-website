# 世界树手记

首页顺序为开场 → 世界树手记 → 旅程入口 → 新闻。首屏向下滚动一次，会用约 1500ms 吸附到手记开头：首屏保持原位，完整不透明的羊皮纸从下方覆盖，并停在完整树图。树图上的第一次滚动将聚焦天穹镇与显示标题、正文合成一个完整步骤，停在介绍完全可见的位置；不再设置只有镜头到位而正文尚未出现的独立停靠点。连续同向滚动不取消吸附，也不重置动画时间；不可取消的滚轮事件造成的位置偏移会在动画及短暂收尾期内校正。动画途中或刚到手记顶部时，向上滚会反向吸附回首屏；退出途中向下滚则重新进入。反向动画从当前位置开始，耗时按剩余距离缩短。支持滚轮、触屏及双向翻页键，收尾期最多 360ms，随后把桌面滚轮交给章节停靠点控制。点击、调整窗口、离开页面会取消动画及收尾校正；减少动态效果模式保留原生滚动。入口与章节吸附按顺序接管输入，不同时驱动滚动；触屏滑动仍保留原生阅读。

## 时间线与地图

首屏底部中央的向上双箭头可点击进入手记，复用同一入口吸附控制器；支持键盘和三语可访问名称。箭头轻微上下浮动，减少动态效果偏好下停止浮动并直接定位。无 JavaScript 时保留 `#lore` 锚点跳转。

`app/utils/atlas-timeline.ts` 将滚动进度映射为同一棵 SVG 树的镜头坐标、缩放与内容透明度。镜头位置为世界坐标，y 越小代表越高。各区域按 `details` 的实际数量生成阅读段：区域介绍及停稳后的淡入占 5 个单位，每个详情增加 2 个单位；区域间保留 3 个单位的拉远与上移。开场 3 个单位，尾段 6 个单位，当前两层各有三个详情，共 34 个单位，每单位约 46svh 滚动距离。

完整树 → 树纹与地图结构浮现 → 天穹镇 → 拉远并向上 → 苍苔帘幕 → 上方未知节点 → 拉回完整树并退出纸面（不中途停靠）。所有变化可逆，直接拖动滚动条也会落到对应状态。

开场内容仅保留树图，动态与静态阅读保持一致。不再显示标题、副标题、开场引导语与地图题注；保留区域的无障碍名称和阅读控件，地图展开沿用原有动画节奏。后续各区域介绍不变。

镜头先完成聚焦并保持静止，停顿 0.25 个阅读单位后，区域标题、介绍、场景图与图注再用 2.5 个单位同步渐显，在同一个停靠点完整展示。整个过程仍只需一次滚动，正反向沿同一时间线运行。区域边注和缆车说明并入介绍，不再独立停靠。桌面详情陆续出现并保留到区域末尾；三个详情分别排在右上、左下、右下，避免挤在同一列；窄屏详情依次切换，相邻淡入淡出的尾段重叠，避免空白间隙。动画与静态阅读使用同一份 `details` 数据，减少详情时会同时缩短阅读段并移除对应停靠点。

地图受用户提供的天穹树草图、Arber Sephirotheca 和 Systema Sephiroticvm 古版画启发；采用树形轮廓、刻线、圆环与分支结构，不复制其宗教文字或原图。参考来源：https://wiki.evageeks.org/Tree_of_Life 。上方八个节点仅显示罗马编号与问号。

## 内容及素材依据

用户提供的模组目录：`Sources/Modules/Yggdrasil/`。

- `README.md`：天穹镇、苍苔帘幕以及上方八个地区的顺序；用户确认当前展示前两层。
- `YggdrasilTown/Background/Town_Close.png` → `public/images/atlas/town.png`。
- `YggdrasilTown/Background/Town_Sky.png` → `public/images/atlas/town-sky.png`。
- 原初晶塔展示 `public/images/atlas/origin-pylon-scene.png`：包含晶塔、六条锁链及根部的紫色裂隙（“源头”）。`scripts/render-origin-pylon.mjs <Everglow 源码根目录>` 根据 `YggdrasilTown/Tiles/OriginPylon/OriginPylon_WhiteTriangleDust.cs` 的位置、贴图采样和绘制顺序，以及 `OriginPylon_PurpleCrack.fx` 的着色公式生成 660 × 660 透明静帧（时间取零）。使用原版 `OriginPylon.png`、`OriginPylon_Chain.png` 和 `Everglow.Function/Textures/Noise_Perlin.png`；没有修改游戏素材。六个锚点距中心 290px、相邻相差一弧度，晶塔按原四边形比例覆盖锁链。名称仍为“原初晶塔”。SVG 以晶塔本体可见范围 `(230.319, 162.959, 181.239, 276.723)` 为缩放基准，保持原先本体高度（大屏 150px、较矮桌面 80px、手机 80px / 72px），锁链和裂隙允许溢出 SVG 边界。手机仅扩展横向占位，为伸出的锁链与旁边名称留出空间。
- `KelpCurtain/Background/KelpCurtainMiddle.png` → `public/images/atlas/kelp.png`。
- `KelpCurtain/Background/KelpCurtainSky.png` → `public/images/atlas/kelp-sky.png`。
- `KelpCurtain/Background/KelpCurtainClose.png` → `public/images/atlas/kelp-close.png`。
- `KelpCurtain/NPCs/VampireMat/VampireMat.png` → `public/images/atlas/vampire-mat.png`。原样复制 11 帧精灵图，每帧 346 × 106；网页通过 SVG 视口与 CSS steps 循环播放 Flat 形态，按 `FindFrame` 的 0.4 帧/游戏帧折算为约 24fps，不切换攻击形态或阶段。系统减少动态效果时停在首帧。没有修改或重新绘制原素材。
- 2026-11-04：用户指出巨树人尚未实现，撤下原有巨树人图片、介绍及重击说明，改为吸血魔毯。名称依据 `Sources/Everglow/Localization/{zh-Hans,en-US}/Mods.Everglow.NPCs.hjson` 的 `VampireMat.DisplayName`；首领身份、追击/贴住玩家及潜入背景后的触手攻击依据 `KelpCurtain/NPCs/VampireMat/VampireMat.cs` 的 `SetDefaults`、`ChasePlayer`、`ShortDash`、`TentacleHide`。源码根目录为用户提供的 `C:/Users/Administrator/Documents/My Games/Terraria/tModLoader/ModSources/Everglow`；本次只读取该仓库，不宣称已完成游戏内验证。
- 龙鳞古壳改用封印原始贴图，保留 `SquamousShellSeal_Back.png` 首帧、`NPCs/SquamousShell/DeadSquamousShell.png` 和 `SquamousShellSeal_Front.png` 首帧；按用户要求不显示地面光阵。组合视口为 342 × 152，恢复旧照片的米色边框、细描边与阴影，并以 `xMidYMax meet` 让整幅封印的下边缘贴齐外框内侧下边缘。

除原初晶塔组合静帧外，素材均为原样复制；没有修改模组目录。场景图片由游戏背景原图在网页中叠放，并非游戏实录截图。手记中的衔接语为网站编辑文案，不作为新增官方设定。

### 地形文案依据（2026-09-23）

本次仅更新 `app/data/world-atlas.ts` 中的简体中文、繁体中文及英文文案，沿用现有插图、节点和滚动节奏。

- [地形策划案——第一层](https://kan2skhz3dv.feishu.cn/wiki/NwPIwCHeMiHJbjkkhTecOsicnzf)：巨型晶塔位于第一层底部右侧；遗迹石桥跨过沼泽，向左通往天穹镇；城镇垂直叠起，内部有缆车环线。用于第一层导语、图注、边注与行路记。灯木森林名称同时依据模组 `Sources/Everglow/Localization/zh-Hans/Mods.Everglow.Biomes.hjson`，沼泽及森林对应 `WorldGeneration/YggdrasilTownGeneration.cs`。
- [地形策划案——第二层](https://kan2skhz3dv.feishu.cn/wiki/DA6Gw7bcliKc0tkcB2wcXDyXnHr)：综述中的亡碧湖、碧绿苔原、朽木王庭、森雨幽谷；“爬升洞穴”中的远古巨植筛管结构；“夭华洲”中的地表竹林、洞口桃树、洞内宗派旧址。用于第二层导语、地貌边注及夭华洲见闻，替换原来的疑问式占位文案。
- 层序继续采用当前模组 `README.md`，不采用第二层策划综述中将飓风迷宫称作第三层的旧顺序。区域介绍使用地形策划的“朽木王庭”。英文区域名沿用策划提供的名称，主层名称仍为当前的 `Kelp Curtain`。

这些文字是基于策划的世界导览，不代表全部内容已在发布版实现。未写入尚有分歧的剧情背景、阵法修复、乘船效果、奖励或战斗数值；未新增或替换素材。

## 扩展

### 2026-11-17 节点与素材

- 第一层顺序：区域介绍 → 原初晶塔 → 餐厅女仆贝蒂 → 龙鳞古壳封印。按用户确认，仅加入 Betty 的单张 portrait，未加入其余居民肖像。
- Betty 立绘使用 `YggdrasilTown/NPCs/TownNPCs/CanteenMaid_Portrait.png`（90 × 104）→ `public/images/atlas/betty-portrait.png`。按用户要求，仅保留立绘和名字，不显示描述。
- 第二层顺序：区域介绍 → 乌篷船 → 夭华洲 → 吸血魔毯。魔毯继续循环 Flat 形态的 11 帧，不切换阶段。
- 原初晶塔、乌篷船、夭华洲、吸血魔毯的简体配文采用用户提供的原文，同步繁体与英文；龙鳞古壳不显示描述。按用户确认的反相方案，动态阅读的晶塔名称、标签和描述使用白色 `mix-blend-mode: difference`，随纸面、锁链及裂隙的背景变化；像素纹理会让同一个字局部变色。晶塔本体大小与完整裂隙保持不变，静态阅读为溢出锁链预留文字间距，并停止魔毯动画。
- 乌篷船使用 `KelpCurtain/CustomTiles/BlackAwningBoat.png`（200 × 100）→ `public/images/atlas/black-awning-boat.png`。按 `BlackAwningBoat.Draw` 取左上 100 × 50 的未点灯状态；操纵方向、停船和灯光说明依据 `BlackAwningBoat_ControlUI.cs`。
- 夭华洲使用 `KelpCurtain/Tiles/IsleOfBloom/IslePeachTree_Small_Tree.png`（712 × 168）→ `public/images/atlas/isle-peach-tree.png`。按 `IslePeachTree_Small.DrawPeachTree` 第一种树形裁取 `(0, 26, 182, 142)`，不显示整张树形图集。
- 素材均原样复制，网页通过 `AtlasDetailImage.vue` 的 SVG 视口完成裁切和叠放，不修改模组原图。动态阅读和静态阅读共用图片数据；sitemap 收录全部组成素材。

`app/data/world-atlas.ts` 中的 `atlasNodes` 保存节点位置与编号；`atlasLayers` 保存已经公开的阅读内容。新增公开层时为对应 id 添加三语内容与素材，节点坐标会自动合并，未知节点列表自动排除该层，时间线随之扩展。旁枝的 x 坐标也参与镜头插值。原十节点之外的新地区需先在 `atlasNodes` 增加位置，并按世界结构补充 SVG 连线。

`AtlasTree.vue` 绘制树与地图，`Lore.vue` 负责滚动生命周期、内容与回退，`world-atlas.css` 负责纸面排版。生成线稿坐标统一为三位小数，避免服务端与浏览器三角函数末位差异造成水合警告；SVG 定义使用实例独立 ID。

## 阅读与验证

手机动态阅读的页脚提供“上一则 / 下一则”：依次停在完整树、每层图文介绍、该层配置的详情、未知界层；到达未知界层后按钮变为“继续旅程”。停靠点由界层时间线生成，位于内容完整可见的区间。按钮与 PC 滚轮翻阅共用 `atlas-scroll.ts` 中的翻页控制器：同一界层内部的内容切换为 1500ms，完整树进入第一层介绍及其反向过程为 4500ms，包含 2250ms 移动与 2250ms 停稳/渐显。跨层独立分配 1500ms 上一层退场、2250ms 镜头移动及 2250ms 新层停稳/渐显（共 6000ms），移动与渐显节奏和首次进入一致；反向操作沿同一分段曲线返回，途中反转从当前位置对应的时间继续，不跳变；未知区域与返回完整树等其余大幅镜头移动为 3000ms，正反方向规则一致。采用五次 smootherstep 缓入缓出曲线，起止速度和加速度均为零；继续经过原有镜头与淡入淡出。翻页途中，同向点击或滚轮输入只保留当前目标，不排队，也不重启动画；反向输入交换本次翻页的出发点和目标，从当前位置平滑返回，耗时按剩余距离缩短（最低 180ms）。到位后按钮的新点击才能前进到下一则。PC 竖向滚轮复用同一组停靠点；到位后保留 180ms 的收尾，连续同向尾波将静默等待延长至最近一次输入后 160ms，并校正不能阻止原生滚动的事件造成的偏移。反向滚轮可立即开始上一则。触屏滑动、非翻页键盘操作、拖动滚动条、窗口尺寸变化、模式切换或离开页面会取消翻页。桌面页脚和原有内容布局保持不变。

窄屏的边注逐条轮换；低于 600px 高的视口、系统减少动态效果偏好以及手动“静态阅读”均显示完整静态手记。无 JavaScript 的服务端输出同样保留全部文字和插图。切换到短横屏时保留当前界层的位置。静态版末尾保留完整树，不再显示结语。桌面左下角不再显示滚动提示文字。

手机地址栏伸缩时，外层 `.atlas-stage` 使用 `100dvh` 铺满当前可见区域，纸面纹理与遮罩随之覆盖；内部 `.atlas-composition` 使用 `100svh` 保持构图稳定。章节高度为固定的阅读距离加 `100dvh`，使 sticky 的有效行程不随地址栏变化。进度只依赖章节顶部偏移和 `svh` 阅读距离；静态回退也以稳定的小视口高度判断，避免仅因工具栏伸缩跨过 600px 而切换模式。真实旋转或窗口尺寸变化仍重新测量。

“略过手记”、结尾的“继续旅程”与 PC 最后一个停靠点继续下滚均用 1400ms 缓入缓出滚动，将旅程入口底部（新闻上边界）对齐当前可见视口下沿。末尾 2.5 个时间轴单位采用五次平滑曲线渐暗，让手记柔和地过渡到下方黑色区域；该区域提示为“↓继续浏览”。目标随可见视口变化实时重算，完成后仅转移焦点，不再次滚动；手动输入仍可打断。减少动态效果偏好下直接定位到相同边界。

运行 `pnpm test:atlas` 验证向上探索、连续插值、反向回滚、批注节奏、插入界层和旁枝镜头。其他检查为 `pnpm lint`、`pnpm typecheck`、`pnpm build` 及 `node scripts/smoke-test.mjs`。如 pnpm 自动依赖校验受本机 store 权限影响，可直接使用已安装的 Node CLI；不需要新增运行依赖。
