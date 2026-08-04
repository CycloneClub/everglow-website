<script lang="ts">
	export default defineComponent({
		inheritAttrs: false,
		props: {
			size: {
				type: Number,
				default: 30,
			},
		},
		setup() {},
	});
</script>

<template>
	<img
		src="/icon.png"
		:width="size"
		:height="size"
		alt="Site Logo"
		aria-label="Everglow"
	/>
</template>
