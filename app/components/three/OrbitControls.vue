<script setup lang="ts">
	const { camera, renderer } = useTresContext();
</script>

<template>
	<TresOrbitControls
		v-if="renderer"
		:args="[camera, renderer?.domElement]"
	/>
</template>
