---
title: '环境提示'
description: '游戏中，当玩家进入新环境时，会在屏幕上方显示的环境提示'
date: '2025-08-13 19:00:00'
navigation:
  icon: 'lucide:signpost'
---

### 使用方法

在模组中创建新的`ModBiome`，并重写其`BestiaryIcon`属性即可自动实现，对于无`BestiaryIcon`的`ModBiome`，提示将使用默认图标显示。该系统支持外部模组，通过`Mod.Code`扫描外部模组的程序集，获取所有`ModBiome`。

<div align="center" >

![<img src="image.png" width="250" height="20"/>](/images/docs/biome-label-preview2.png)

<br/>

![](/images/docs/biome-label-preview3.png)

</div >

### 原版适配

通过`Player`中的Zone相关字段区分环境，图标使用经统一处理的原版图标。由于兼容性问题，仅在原版大世界生效，子世界内不生效。

<div align="center" >

![](/images/docs/biome-label-preview1.png)

</div >

### 源码位置

本系统的相关代码位于`Everglow.Function/Mechanics/BiomesText`路径下。
