---
title: 'Элементальный урон'
description: 'Знакомство с механикой элементального урона.'
date: '2026-10-13 16:50:21'
navigation:
  icon: 'lucide:atom'
---
<!-- Machine translation draft; pending human review. Source: content/en-US/docs/2.mechanics/elemental-debuff.md -->

Everglow добавляет систему элементального урона, вдохновлённую [_Arknights_](https://prts.wiki/w/%E5%85%83%E7%B4%A0).

## Обзор

Некоторые атаки вызывают накопление элементов у врагов. Когда значение достигает порога, накопление сбрасывается и начинается фаза всплеска. Во время этой фазы цель не может накапливать тот же элемент. Накопление возобновляется после окончания фазы всплеска.

Каждый элемент накапливается независимо, поэтому у врага могут одновременно отображаться несколько индикаторов элементальных состояний.

<img src="/images/docs/elemental-debuff/ElementalDebuff.gif" alt="Демонстрация накопления элементов и всплесков в игре" width="350" height="346" style="display: block; max-width: 100%; height: auto; margin: 1.5rem auto; border-radius: 5px; image-rendering: pixelated;">

### Отображение элементов

Когда враг начинает накапливать элемент, рядом с его телом появляется индикатор состояния этого элемента.

Во время накопления круговая шкала заполняется по часовой стрелке, показывая приближение к порогу. Она достаточно яркая, чтобы оставаться заметной в тёмных местах.

После срабатывания всплеска круговая шкала показывает оставшуюся длительность его действия и убывает против часовой стрелки. В этой фазе шкала становится тусклее.

<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.5rem; max-width: 344px; margin: 1.5rem auto;">
  <figure style="margin: 0; text-align: center;">
    <img src="/images/docs/elemental-debuff/ui-buildup.png" alt="Накопление ожога с яркой круговой шкалой" width="160" height="160" style="display: block; width: 100%; height: auto; image-rendering: pixelated;">
    <figcaption style="margin-top: 0.5rem; font-size: 0.85em; line-height: 1.5;">Накопление</figcaption>
  </figure>
  <figure style="margin: 0; text-align: center;">
    <img src="/images/docs/elemental-debuff/ui-active.png" alt="Активный всплеск ожога с тусклой круговой шкалой" width="160" height="160" style="display: block; width: 100%; height: auto; image-rendering: pixelated;">
    <figcaption style="margin-top: 0.5rem; font-size: 0.85em; line-height: 1.5;">Активный всплеск</figcaption>
  </figure>
</div>

## Виды элементов

Элементальные всплески наносят дополнительный урон, а каждый элемент также обладает собственными эффектами:

| Значок | Элемент | Эффект всплеска |
| :---: | --- | --- |
| <img src="/images/docs/elemental-debuff/Burn.png" alt="Значок ожога" width="28" height="28"> | Урон ожогом | Поджигает цель. |
| <img src="/images/docs/elemental-debuff/Corrosion.png" alt="Значок коррозии" width="28" height="28"> | Урон коррозией | Выращивает фиолетовые щупальца, которые при попадании по ближайшим врагам также вызывают у них накопление коррозии. |
| <img src="/images/docs/elemental-debuff/NervousImpairment.png" alt="Значок нервного поражения" width="28" height="28"> | Нервное поражение | Накладывает на врагов замешательство. |
| <img src="/images/docs/elemental-debuff/Necrosis.png" alt="Значок некроза" width="28" height="28"> | Урон некрозом | Наносит взрывной урон, сопровождаемый чёрным дымом. |

## Применение элементального урона в бою

Некоторые враги обладают сопротивлением элементам, которое снижает скорость накопления, но подходящий элемент полезен в большинстве ситуаций. Вот несколько примеров оружия с элементальным уроном:

### Поцелуй Ктулху

Поцелуй Ктулху — оружие дальнего боя, которое при каждом выстреле с некоторой вероятностью выпускает дополнительный особый снаряд. При попадании этот снаряд вызывает накопление коррозии. Когда порог достигнут, из цели вырастают фиолетовые щупальца. Они также могут поражать ближайших врагов и вызывать у них накопление коррозии.

<img src="/images/docs/elemental-debuff/KissOfCthulhu.gif" alt="Поцелуй Ктулху вызывает накопление коррозии и всплески" width="500" height="400" style="display: block; max-width: 100%; height: auto; margin: 1.5rem auto; border-radius: 5px; image-rendering: pixelated;">

### Остатки зловещей партитуры

Остатки зловещей партитуры — оружие призывателя, снаряды которого призывают прислужников при убийстве врагов. Когда прислужник попадает по врагу, у цели накапливается нервное поражение. При достижении порога на цель накладывается замешательство.

<img src="/images/docs/elemental-debuff/EvilScoreRemains.gif" alt="Прислужники Остатков зловещей партитуры вызывают нервное поражение" width="336" height="320" style="display: block; max-width: 100%; height: auto; margin: 1.5rem auto; border-radius: 5px; image-rendering: pixelated;">
