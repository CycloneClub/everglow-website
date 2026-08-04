<script setup lang="ts">
	const { src } = defineProps<{
		src: string;
	}>();
</script>

<template>
	<section
		class="parallex-scroll-base"
		:style="[`background-image: url(${src});`]"
	>
		<slot />
	</section>
</template>

<style>
	.parallex-scroll-base {
		height: 100dvh;
		display: flex;
		justify-content: center;
		align-items: center;

		background-attachment: fixed;
		background-size: cover;
		background-position: center center;
	}
</style>
