---
title: 'Elemental Damage'
description: 'An introduction to the elemental damage mechanic.'
date: '2026-10-13 16:50:21'
navigation:
  icon: 'lucide:atom'
---

Everglow introduces an elemental damage system inspired by [_Arknights_](https://prts.wiki/w/%E5%85%83%E7%B4%A0).

## Overview

Certain attacks cause elemental buildup on enemies. When an element reaches its threshold, its buildup is cleared and a burst phase begins. During this phase, the target cannot accumulate more of the same element. Buildup can start again once the burst phase ends.

Each element builds up independently, so an enemy can display several elemental status indicators at the same time.

<img src="/images/docs/elemental-debuff/ElementalDebuff.gif" alt="Gameplay demonstration of elemental buildup and bursts" width="350" height="346" style="display: block; max-width: 100%; height: auto; margin: 1.5rem auto; border-radius: 5px; image-rendering: pixelated;">

### Elemental UI

Once an enemy starts accumulating an element, a progress indicator appears near its body to show that element's status.

During buildup, the circular bar shows progress toward the threshold and advances clockwise. The bar is bright enough to remain visible in dark areas.

After a burst is triggered, the circular bar shows the remaining burst duration and recedes counterclockwise. The bar becomes dimmer during this phase.

<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.5rem; max-width: 344px; margin: 1.5rem auto;">
  <figure style="margin: 0; text-align: center;">
    <img src="/images/docs/elemental-debuff/ui-buildup.png" alt="Burn buildup with a bright circular progress bar" width="160" height="160" style="display: block; width: 100%; height: auto; image-rendering: pixelated;">
    <figcaption style="margin-top: 0.5rem; font-size: 0.85em; line-height: 1.5;">Buildup</figcaption>
  </figure>
  <figure style="margin: 0; text-align: center;">
    <img src="/images/docs/elemental-debuff/ui-active.png" alt="An active Burn burst with a dimmed circular progress bar" width="160" height="160" style="display: block; width: 100%; height: auto; image-rendering: pixelated;">
    <figcaption style="margin-top: 0.5rem; font-size: 0.85em; line-height: 1.5;">Burst active</figcaption>
  </figure>
</div>

## Element Types

Elemental bursts deal additional damage, and each element also has its own effects:

| Icon | Element | Burst effect |
| :---: | --- | --- |
| <img src="/images/docs/elemental-debuff/Burn.png" alt="Burn icon" width="28" height="28"> | Burn Damage | Applies a burning effect. |
| <img src="/images/docs/elemental-debuff/Corrosion.png" alt="Corrosion icon" width="28" height="28"> | Corrosion Damage | Grows purple tentacles that also cause Corrosion buildup when they hit nearby enemies. |
| <img src="/images/docs/elemental-debuff/NervousImpairment.png" alt="Nervous Impairment icon" width="28" height="28"> | Nervous Impairment | Inflicts Confused on enemies. |
| <img src="/images/docs/elemental-debuff/Necrosis.png" alt="Necrosis icon" width="28" height="28"> | Necrosis Damage | Deals burst damage accompanied by black smoke. |

## Using Elemental Damage in Combat

Some enemies have elemental resistance that reduces effective buildup, but choosing a suitable element is useful in most situations. Here are some examples of weapons that use elemental damage:

### Kiss of Cthulhu

Kiss of Cthulhu is a ranged weapon with a chance to fire an additional special projectile each time you shoot. This projectile causes Corrosion buildup on hit. Once the threshold is reached, purple tentacles grow from the target. These tentacles can also hit nearby enemies and cause Corrosion buildup on them.

<img src="/images/docs/elemental-debuff/KissOfCthulhu.gif" alt="Kiss of Cthulhu causing Corrosion buildup and bursts" width="500" height="400" style="display: block; max-width: 100%; height: auto; margin: 1.5rem auto; border-radius: 5px; image-rendering: pixelated;">

### Evil Score Remains

Evil Score Remains is a summon weapon whose projectiles summon minions when they defeat enemies. When a minion hits an enemy, it causes Nervous Impairment buildup. Once the threshold is reached, the target becomes Confused.

<img src="/images/docs/elemental-debuff/EvilScoreRemains.gif" alt="Evil Score Remains minions causing Nervous Impairment" width="336" height="320" style="display: block; max-width: 100%; height: auto; margin: 1.5rem auto; border-radius: 5px; image-rendering: pixelated;">
