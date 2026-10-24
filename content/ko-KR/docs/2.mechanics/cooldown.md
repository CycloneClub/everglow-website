---
title: '재사용 대기시간'
description: '재사용 대기시간 시스템을 소개합니다.'
date: '2026-10-13'
navigation:
  icon: 'lucide:clock-9'
---
<!-- Machine translation draft; pending human review. Source: content/en-US/docs/2.mechanics/cooldown.md -->

Everglow는 일부 장비 효과와 능력의 재사용 대기시간을 표시하여 언제 다시 발동할 수 있는지 알려줍니다.

## 개요

일부 효과는 발동 후 재사용 대기시간이 지나야 다시 발동할 수 있습니다. 대기시간이 끝나면 해당 표시가 사라집니다.

재사용 대기시간이 효과의 지속 시간과 항상 같지는 않습니다. 효과가 끝났다고 해서 곧바로 다시 발동할 수 있는 것은 아닙니다.

### 재사용 대기시간 UI

재사용 대기시간 아이콘은 화면 왼쪽 위의 버프 아이콘 아래에 나타납니다. 여러 개가 있으면 가로로 나열됩니다. 원형 표시와 바늘은 남은 진행 정도를 보여 주며, 아래의 텍스트는 남은 시간을 표시합니다.

아이콘에 마우스를 올리면 이름과 설명을 확인할 수 있습니다. 마우스를 올려 둔 동안 아이콘이 점차 밝아집니다. 보스전에서는 전투 중에도 쉽게 확인할 수 있도록 밝은 상태를 유지합니다.

인벤토리를 열면 이 표시가 일시적으로 숨겨집니다. 인벤토리를 닫으면 아직 진행 중인 재사용 대기시간이 다시 나타납니다.

<img src="/images/docs/cooldown-ui.png" alt="원형 진행 표시와 남은 시간 3초가 표시되고, 마우스를 올리면 이름이 나타나는 재사용 대기시간 아이콘" width="401" height="109" style="display: block; max-width: 100%; height: auto; margin: 1.5rem auto; border-radius: 5px; image-rendering: pixelated;">
