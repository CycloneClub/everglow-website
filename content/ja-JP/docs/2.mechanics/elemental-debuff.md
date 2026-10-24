---
title: '元素ダメージ'
description: '元素ダメージの仕組みを紹介します。'
date: '2026-10-13 16:50:21'
navigation:
  icon: 'lucide:atom'
---
<!-- Machine translation draft; pending human review. Source: content/en-US/docs/2.mechanics/elemental-debuff.md -->

Everglowには、[_Arknights_（アークナイツ）](https://prts.wiki/w/%E5%85%83%E7%B4%A0)に着想を得た元素ダメージシステムがあります。

## 概要

特定の攻撃を当てると、敵に元素ダメージが蓄積します。ある元素の蓄積値がしきい値に達すると、その蓄積値がリセットされ、爆発状態に入ります。この状態の間、対象には同じ元素をさらに蓄積できません。爆発状態が終了すると、再び蓄積できるようになります。

各元素は独立して蓄積するため、1体の敵に複数の元素の状態表示が同時に現れることがあります。

<img src="/images/docs/elemental-debuff/ElementalDebuff.gif" alt="元素の蓄積と爆発を示すゲームプレイ映像" width="350" height="346" style="display: block; max-width: 100%; height: auto; margin: 1.5rem auto; border-radius: 5px; image-rendering: pixelated;">

### 元素のUI

敵への元素の蓄積が始まると、敵の体の近くにその元素の状態を示す表示が現れます。

蓄積中は、円形のゲージがしきい値までの進行度を示し、時計回りに進みます。ゲージは暗い場所でも見える明るさで表示されます。

爆発が発生すると、円形のゲージは爆発状態の残り時間を示し、反時計回りに減っていきます。この状態の間はゲージが暗くなります。

<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.5rem; max-width: 344px; margin: 1.5rem auto;">
  <figure style="margin: 0; text-align: center;">
    <img src="/images/docs/elemental-debuff/ui-buildup.png" alt="明るい円形ゲージで表示された灼熱損傷の蓄積" width="160" height="160" style="display: block; width: 100%; height: auto; image-rendering: pixelated;">
    <figcaption style="margin-top: 0.5rem; font-size: 0.85em; line-height: 1.5;">蓄積中</figcaption>
  </figure>
  <figure style="margin: 0; text-align: center;">
    <img src="/images/docs/elemental-debuff/ui-active.png" alt="暗い円形ゲージで表示された灼熱損傷の爆発状態" width="160" height="160" style="display: block; width: 100%; height: auto; image-rendering: pixelated;">
    <figcaption style="margin-top: 0.5rem; font-size: 0.85em; line-height: 1.5;">爆発状態</figcaption>
  </figure>
</div>

## 元素の種類

元素の爆発は追加ダメージを与え、元素ごとに固有の効果も発生します。

| アイコン | 元素 | 爆発時の効果 |
| :---: | --- | --- |
| <img src="/images/docs/elemental-debuff/Burn.png" alt="灼熱損傷のアイコン" width="28" height="28"> | 灼熱損傷（Burn Damage） | 燃焼効果を付与します。 |
| <img src="/images/docs/elemental-debuff/Corrosion.png" alt="侵蝕損傷のアイコン" width="28" height="28"> | 侵蝕損傷（Corrosion Damage） | 紫色の触手が生えます。触手が周囲の敵に当たると、その敵にも侵蝕損傷が蓄積します。 |
| <img src="/images/docs/elemental-debuff/NervousImpairment.png" alt="神経損傷のアイコン" width="28" height="28"> | 神経損傷（Nervous Impairment） | 敵に混乱（Confused）を付与します。 |
| <img src="/images/docs/elemental-debuff/Necrosis.png" alt="壊死損傷のアイコン" width="28" height="28"> | 壊死損傷（Necrosis Damage） | 黒い煙とともに瞬間的なダメージを与えます。 |

## 戦闘での元素ダメージの活用

敵によっては元素耐性を持ち、実際の蓄積量が減ることがあります。それでも、状況に合った元素を選ぶことは多くの場面で役立ちます。元素ダメージを与える武器の例を紹介します。

### Kiss of Cthulhu

Kiss of Cthulhuは、射撃するたびに一定の確率で特殊な弾を追加発射する遠距離武器です。この弾が命中すると侵蝕損傷が蓄積します。蓄積値がしきい値に達すると、対象から紫色の触手が生えます。この触手は周囲の敵にも当たり、侵蝕損傷を蓄積させます。

<img src="/images/docs/elemental-debuff/KissOfCthulhu.gif" alt="Kiss of Cthulhuによる侵蝕損傷の蓄積と爆発" width="500" height="400" style="display: block; max-width: 100%; height: auto; margin: 1.5rem auto; border-radius: 5px; image-rendering: pixelated;">

### Evil Score Remains

Evil Score Remainsは、発射した弾で敵を倒すとミニオンを召喚する召喚武器です。ミニオンの攻撃が敵に当たると神経損傷が蓄積し、しきい値に達すると対象は混乱状態になります。

<img src="/images/docs/elemental-debuff/EvilScoreRemains.gif" alt="Evil Score Remainsのミニオンによる神経損傷" width="336" height="320" style="display: block; max-width: 100%; height: auto; margin: 1.5rem auto; border-radius: 5px; image-rendering: pixelated;">
