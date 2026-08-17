<script setup lang="ts">
const { name } = defineProps<{
  name: 'bilibili' | 'discord' | 'github' | 'qq'
}>()
</script>

<template>
  <Icon
    :name="`simple-icons:${name}`"
    mode="svg"
  />
</template>
