---
title: '元素伤害'
description: '本页面是有关游戏机制-元素伤害的部分'
date: '2026-10-13 16:50:21'
navigation:
  icon: 'lucide:atom'
---

Everglow 引入了元素伤害系统，参考自[_明日方舟_](https://prts.wiki/w/%E5%85%83%E7%B4%A0)。

## 概述

部分攻击会对敌人积累元素值，当一种元素的积累达到阈值后，会清空并进入一段爆发期。这段时间内，目标不会继续积累同一种元素；在爆发期结束后，才能开始下一轮积累。

不同元素分别积累，不互相影响，因此，一个敌人身上可以同时出现多种元素的状态提示。

<img src="/images/docs/elemental-debuff/ElementalDebuff.gif" alt="元素积累与爆发的游戏内演示" width="350" height="346" style="display: block; max-width: 100%; height: auto; margin: 1.5rem auto; border-radius: 5px; image-rendering: pixelated;">

### 元素 UI

敌人被积累了元素值后，身体附近会显示对应元素的进度条，提示各元素的状态。

积累中，环形进度条表示元素积累的比例，以顺时针方向前进。此时进度条较亮，在黑暗环境下也能看见。

爆发后，环形进度条表示爆发期的剩余时长，以逆时针方向回退。此时进度条会变得黯淡。

<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.5rem; max-width: 344px; margin: 1.5rem auto;">
  <figure style="margin: 0; text-align: center;">
    <img src="/images/docs/elemental-debuff/ui-buildup.png" alt="灼烧元素积累中，带亮色环形积累条" width="160" height="160" style="display: block; width: 100%; height: auto; image-rendering: pixelated;">
    <figcaption style="margin-top: 0.5rem; font-size: 0.85em; line-height: 1.5;">积累中</figcaption>
  </figure>
  <figure style="margin: 0; text-align: center;">
    <img src="/images/docs/elemental-debuff/ui-active.png" alt="灼烧元素爆发期间，环形进度条变暗" width="160" height="160" style="display: block; width: 100%; height: auto; image-rendering: pixelated;">
    <figcaption style="margin-top: 0.5rem; font-size: 0.85em; line-height: 1.5;">爆发中</figcaption>
  </figure>
</div>

## 元素类型

元素爆发会造成额外伤害，不同元素还会带来不同的效果：

| 图标 | 元素 | 爆发效果 |
| :---: | --- | --- |
| <img src="/images/docs/elemental-debuff/Burn.png" alt="灼烧图标" width="28" height="28"> | 灼燃损伤 | 附加燃烧效果。 |
| <img src="/images/docs/elemental-debuff/Corrosion.png" alt="侵蚀图标" width="28" height="28"> | 侵蚀损伤 | 长出紫色触须，命中附近敌人时，也会积累侵蚀。 |
| <img src="/images/docs/elemental-debuff/NervousImpairment.png" alt="神经损伤图标" width="28" height="28"> | 神经损伤 | 使敌人陷入困惑。 |
| <img src="/images/docs/elemental-debuff/Necrosis.png" alt="坏死图标" width="28" height="28"> | 凋亡损伤 | 造成爆发伤害，并伴随黑色烟雾。 |

## 战斗中如何利用元素伤害

部分敌人的元素抗性会减少有效积累，但在大多数情况下，选取适合的元素都能取得很好的效果。以下是一些使用元素伤害的武器案例：

### 克苏鲁之吻

克苏鲁之吻是一把远程武器，每次开火有概率额外射出特殊射弹。特殊射弹命中时，会为目标积累侵蚀元素值；积累达到阈值后，目标身上会长出紫色触须，触须还能伤及附近敌人积累侵蚀。

<img src="/images/docs/elemental-debuff/KissOfCthulhu.gif" alt="克苏鲁之吻造成侵蚀积累与爆发的演示" width="500" height="400" style="display: block; max-width: 100%; height: auto; margin: 1.5rem auto; border-radius: 5px; image-rendering: pixelated;">

### 魔律残章

魔律残章是一件召唤武器，射弹击败敌人后召唤仆从。当仆从命中敌人时，会为目标积累神经损伤元素值；积累达到阈值后，目标会陷入混乱状态。

<img src="/images/docs/elemental-debuff/EvilScoreRemains.gif" alt="魔律残章仆从造成神经损伤的演示" width="336" height="320" style="display: block; max-width: 100%; height: auto; margin: 1.5rem auto; border-radius: 5px; image-rendering: pixelated;">
