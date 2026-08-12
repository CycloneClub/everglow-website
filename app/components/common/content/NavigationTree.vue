<script setup lang="ts">
import type { NavigationGroup, NavigationTree } from '#shared/types'

const { level, links, defaultOpen } = defineProps({
  level: {
    type: Number,
    default: 0,
  },
  links: {
    type: Array as PropType<NavigationTree[]>,
    default: () => [],
  },
  defaultOpen: {
    type: [Boolean, Number],
    default: undefined,
  },
})

const groups = computed<NavigationGroup[]>(() => {
  const groups: NavigationGroup[] = []

  let group: NavigationGroup = {
    type: undefined,
    children: [],
  }

  for (const link of links) {
    const type = link.children?.length ? 'accordion' : 'link'
    group.type ||= type

    if (group.type === type) {
      group.children.push(link)
    } else {
      groups.push(group)
      group = {
        type,
        children: [link],
      }
    }
  }

  if (group.children.length) {
    groups.push(group)
  }

  return groups
})
</script>

<template>
  <nav
    v-if="groups?.length"
    class="navigation-tree"
  >
    <template
      v-for="(group, index) in groups"
      :key="index"
    >
      <CommonContentNavigationAccordion
        v-if="group.type === 'accordion'"
        :level="level"
        :links="group.children"
        :default-open="defaultOpen"
      />
      <CommonContentNavigationLinks
        v-else
        :links="group.children"
      />
    </template>
  </nav>
</template>
