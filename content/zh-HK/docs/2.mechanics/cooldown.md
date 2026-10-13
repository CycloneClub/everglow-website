---
title: '冷卻時間'
description: '本頁面介紹冷卻時間的遊戲機制。'
date: '2026-10-13'
navigation:
  icon: 'lucide:clock-9'
---

Everglow 會為部分裝備效果與技能顯示冷卻提示，方便你判斷它們何時可以再次觸發。

## 概述

部分效果觸發後，需要等待一段冷卻時間，才能再次觸發。冷卻結束時，對應的提示圖示會消失。

冷卻時間與效果的持續時間不一定相同：效果已經結束，並不代表它已經可以再次觸發。

### 冷卻 UI

冷卻圖示顯示在螢幕左上方的增益圖示下方，多個冷卻會橫向排列。圖示上的圓形進度與指針表示剩餘進度，下方的文字顯示剩餘時間。

將滑鼠移到圖示上，可以查看對應的名稱與說明，圖示也會逐漸變亮。Boss 戰期間，圖示會保持較高亮度，方便在戰鬥中辨認。

打開背包時，這組冷卻提示會暫時隱藏；關閉背包後，可以繼續查看尚未結束的冷卻。

<img src="/images/docs/cooldown-ui.png" alt="冷卻圖示的圓形進度、剩餘 3 秒的文字及滑鼠懸停時的名稱提示" width="401" height="109" style="display: block; max-width: 100%; height: auto; margin: 1.5rem auto; border-radius: 5px; image-rendering: pixelated;">
