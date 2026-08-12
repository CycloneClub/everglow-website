<script setup lang="ts">
	definePageMeta({
		validate: (route) =>
			['scene'].includes(String(route.params.workspace)),
	});
</script>

<template>
	<PlaygroundWorkspace />
</template>
