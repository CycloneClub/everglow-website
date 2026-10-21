---
title: '원소 피해'
description: '원소 피해 시스템을 소개합니다.'
date: '2026-10-13 16:50:21'
navigation:
  icon: 'lucide:atom'
---
<!-- Machine translation draft; pending human review. Source: content/en-US/docs/2.mechanics/elemental-debuff.md -->

Everglow에는 [_Arknights_(명일방주)](https://prts.wiki/w/%E5%85%83%E7%B4%A0)에서 영감을 받은 원소 피해 시스템이 있습니다.

## 개요

특정 공격은 적에게 원소 피해를 축적합니다. 한 원소의 축적량이 임계치에 도달하면 축적량이 초기화되고 폭발 상태가 시작됩니다. 이 상태에서는 대상에게 같은 원소를 더 축적할 수 없습니다. 폭발 상태가 끝나면 다시 축적할 수 있습니다.

각 원소는 독립적으로 축적되므로 하나의 적에게 여러 원소 상태 표시가 동시에 나타날 수 있습니다.

<img src="/images/docs/elemental-debuff/ElementalDebuff.gif" alt="원소 축적과 폭발을 보여 주는 게임플레이 영상" width="350" height="346" style="display: block; max-width: 100%; height: auto; margin: 1.5rem auto; border-radius: 5px; image-rendering: pixelated;">

### 원소 UI

적에게 원소가 축적되기 시작하면 해당 원소의 상태를 보여 주는 진행 표시가 적의 몸 근처에 나타납니다.

축적 중에는 원형 게이지가 임계치까지의 진행도를 보여 주며 시계 방향으로 차오릅니다. 게이지는 어두운 곳에서도 보일 만큼 밝게 표시됩니다.

폭발이 발생하면 원형 게이지가 폭발 상태의 남은 시간을 표시하며 반시계 방향으로 줄어듭니다. 이 상태에서는 게이지가 어두워집니다.

<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.5rem; max-width: 344px; margin: 1.5rem auto;">
  <figure style="margin: 0; text-align: center;">
    <img src="/images/docs/elemental-debuff/ui-buildup.png" alt="밝은 원형 게이지로 표시된 소각 피해 축적" width="160" height="160" style="display: block; width: 100%; height: auto; image-rendering: pixelated;">
    <figcaption style="margin-top: 0.5rem; font-size: 0.85em; line-height: 1.5;">축적 중</figcaption>
  </figure>
  <figure style="margin: 0; text-align: center;">
    <img src="/images/docs/elemental-debuff/ui-active.png" alt="어두운 원형 게이지로 표시된 소각 피해 폭발 상태" width="160" height="160" style="display: block; width: 100%; height: auto; image-rendering: pixelated;">
    <figcaption style="margin-top: 0.5rem; font-size: 0.85em; line-height: 1.5;">폭발 상태</figcaption>
  </figure>
</div>

## 원소 종류

원소 폭발은 추가 피해를 주며, 각 원소에는 고유한 효과도 있습니다.

| 아이콘 | 원소 | 폭발 효과 |
| :---: | --- | --- |
| <img src="/images/docs/elemental-debuff/Burn.png" alt="소각 피해 아이콘" width="28" height="28"> | 소각 피해(Burn Damage) | 연소 효과를 부여합니다. |
| <img src="/images/docs/elemental-debuff/Corrosion.png" alt="침식 피해 아이콘" width="28" height="28"> | 침식 피해(Corrosion Damage) | 보라색 촉수가 자라납니다. 촉수가 주변 적을 맞히면 해당 적에게도 침식 피해가 축적됩니다. |
| <img src="/images/docs/elemental-debuff/NervousImpairment.png" alt="신경 손상 아이콘" width="28" height="28"> | 신경 손상(Nervous Impairment) | 적에게 혼란(Confused)을 부여합니다. |
| <img src="/images/docs/elemental-debuff/Necrosis.png" alt="괴사 피해 아이콘" width="28" height="28"> | 괴사 피해(Necrosis Damage) | 검은 연기와 함께 순간적인 피해를 줍니다. |

## 전투에서 원소 피해 활용하기

일부 적은 원소 저항이 있어 실제 축적량이 줄어들지만, 상황에 맞는 원소를 선택하면 대부분의 전투에서 도움이 됩니다. 원소 피해를 사용하는 무기의 예시는 다음과 같습니다.

### Kiss of Cthulhu

Kiss of Cthulhu는 사격할 때마다 일정 확률로 특수 투사체를 추가로 발사하는 원거리 무기입니다. 이 투사체가 명중하면 침식 피해가 축적됩니다. 임계치에 도달하면 대상에게서 보라색 촉수가 자라납니다. 촉수는 주변 적도 공격할 수 있으며, 적중한 적에게 침식 피해를 축적합니다.

<img src="/images/docs/elemental-debuff/KissOfCthulhu.gif" alt="Kiss of Cthulhu로 발생하는 침식 피해 축적과 폭발" width="500" height="400" style="display: block; max-width: 100%; height: auto; margin: 1.5rem auto; border-radius: 5px; image-rendering: pixelated;">

### Evil Score Remains

Evil Score Remains는 투사체로 적을 처치하면 미니언을 소환하는 소환 무기입니다. 미니언이 적을 공격하면 신경 손상이 축적됩니다. 임계치에 도달하면 대상이 혼란 상태에 빠집니다.

<img src="/images/docs/elemental-debuff/EvilScoreRemains.gif" alt="Evil Score Remains의 미니언이 가하는 신경 손상" width="336" height="320" style="display: block; max-width: 100%; height: auto; margin: 1.5rem auto; border-radius: 5px; image-rendering: pixelated;">
