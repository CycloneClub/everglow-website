<script setup lang="ts">
	const { camera, renderer } = useTres();
</script>

<template>
	<TresOrbitControls
		v-if="camera"
		:args="[camera, renderer?.domElement]"
	/>
</template>
