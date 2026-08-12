<script setup lang="ts">
definePageMeta({
  validate: route =>
    ['scene', 'hlsl-preview'].includes(String(route.params.workspace)),
})
</script>

<template>
  <PlaygroundWorkspace />
</template>
