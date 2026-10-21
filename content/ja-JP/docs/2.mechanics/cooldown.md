---
title: 'クールダウン'
description: 'クールダウンの仕組みを紹介します。'
date: '2026-10-13'
navigation:
  icon: 'lucide:clock-9'
---
<!-- Machine translation draft; pending human review. Source: content/en-US/docs/2.mechanics/cooldown.md -->

Everglowでは、一部の装備効果やアビリティのクールダウンが表示され、再び発動できるまでの時間を確認できます。

## 概要

一部の効果は、発動後にクールダウンを経てから再び発動できるようになります。クールダウンが終了すると、その表示は消えます。

クールダウンの長さは、効果の持続時間と同じとは限りません。効果が終了しても、すぐに再発動できるとは限らない点に注意してください。

### クールダウンのUI

クールダウンのアイコンは、画面左上のバフアイコンの下に表示されます。複数のクールダウンがある場合は横に並びます。円形の表示と針で残りの進み具合を示し、その下のテキストで残り時間を確認できます。

アイコンにカーソルを合わせると、名前と説明が表示されます。カーソルを合わせている間はアイコンが徐々に明るくなります。ボス戦中は戦闘中でも見やすいように、常に明るく表示されます。

インベントリを開くと、これらの表示は一時的に隠れます。閉じると、まだ続いているクールダウンが再び表示されます。

<img src="/images/docs/cooldown-ui.png" alt="円形の進行表示と残り3秒の表示があり、カーソルを合わせると名前が表示されるクールダウンアイコン" width="401" height="109" style="display: block; max-width: 100%; height: auto; margin: 1.5rem auto; border-radius: 5px; image-rendering: pixelated;">
