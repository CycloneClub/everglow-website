---
title: '元素傷害'
description: '本頁面介紹元素傷害的遊戲機制。'
date: '2026-10-13 16:50:21'
navigation:
  icon: 'lucide:atom'
---

Everglow 引入了元素傷害系統，參考自[_明日方舟_](https://prts.wiki/w/%E5%85%83%E7%B4%A0)。

## 概述

部分攻擊會對敵人累積元素值，當一種元素的累積達到閾值後，會清空並進入一段爆發期。這段時間內，目標不會繼續累積同一種元素；在爆發期結束後，才能開始下一輪累積。

不同元素分別累積，不互相影響，因此，一個敵人身上可以同時出現多種元素的狀態提示。

### 元素 UI

敵人累積了元素值後，身體附近會顯示對應元素的進度條，提示各元素的狀態。

累積中，環形進度條表示元素累積的比例，以順時針方向前進。此時進度條較亮，在黑暗環境下也能看見。

爆發後，環形進度條表示爆發期的剩餘時長，以逆時針方向回退。此時進度條會變得黯淡。

<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.5rem; max-width: 344px; margin: 1.5rem auto;">
  <figure style="margin: 0; text-align: center;">
    <img src="/images/docs/elemental-debuff/ui-buildup.png" alt="灼燒元素累積中，帶亮色環形累積條" width="160" height="160" style="display: block; width: 100%; height: auto; image-rendering: pixelated;">
    <figcaption style="margin-top: 0.5rem; font-size: 0.85em; line-height: 1.5;">累積中</figcaption>
  </figure>
  <figure style="margin: 0; text-align: center;">
    <img src="/images/docs/elemental-debuff/ui-active.png" alt="灼燒元素爆發期間，環形進度條變暗" width="160" height="160" style="display: block; width: 100%; height: auto; image-rendering: pixelated;">
    <figcaption style="margin-top: 0.5rem; font-size: 0.85em; line-height: 1.5;">爆發中</figcaption>
  </figure>
</div>

## 元素類型

元素爆發會造成額外傷害，不同元素還會帶來不同的效果：

| 圖示 | 元素 | 爆發效果 |
| :---: | --- | --- |
| <img src="/images/docs/elemental-debuff/Burn.png" alt="灼燒圖示" width="28" height="28"> | 灼燃損傷 | 附加燃燒效果。 |
| <img src="/images/docs/elemental-debuff/Corrosion.png" alt="侵蝕圖示" width="28" height="28"> | 侵蝕損傷 | 長出紫色觸鬚，命中附近敵人時，也會累積侵蝕。 |
| <img src="/images/docs/elemental-debuff/NervousImpairment.png" alt="神經損傷圖示" width="28" height="28"> | 神經損傷 | 使敵人陷入困惑。 |
| <img src="/images/docs/elemental-debuff/Necrosis.png" alt="壞死圖示" width="28" height="28"> | 凋亡損傷 | 造成爆發傷害，並伴隨黑色煙霧。 |

## 戰鬥中如何利用元素傷害

部分敵人的元素抗性會減少有效累積，但在大多數情況下，選取適合的元素都能取得很好的效果。以下是一些使用元素傷害的武器案例：

### 克蘇魯之吻

克蘇魯之吻是一把遠程武器，每次開火有機率額外射出特殊射彈。特殊射彈命中時，會為目標累積侵蝕元素值；累積達到閾值後，目標身上會長出紫色觸鬚，觸鬚還能傷及附近敵人累積侵蝕。

<!-- 配圖佔位：克蘇魯之吻的特殊彈丸命中，以及侵蝕爆發後的紫色觸鬚。圖註區分武器彈丸與爆發產生的觸鬚。 -->

### 魔律殘章

魔律殘章是一件召喚武器，射彈擊敗敵人後召喚僕從。當僕從命中敵人時，會為目標累積神經損傷元素值；累積達到閾值後，目標會陷入混亂狀態。

<!-- 配圖佔位：魔律殘章的僕從命中敵人，以及神經損傷爆發後的表現，保留僕從與元素進度條；選擇會受到困惑影響的敵人展示。 -->
