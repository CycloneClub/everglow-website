<script setup lang="ts">
	const i18n = useI18n();

	useHead({
		title: i18n.t('head.subtitles.playground'),
	});
</script>

<template>
	<div class="test">
		<div class="canvas-container">
			<TresCanvas
				preset="realistic"
				:tone-mapping-exposure="0.3"
				shadows
			>
				<TresPerspectiveCamera
					:position="[30, 30, 100]"
					:fov="55"
					:look-at="[0, 0, 0]"
				/>

				<OrbitControls />
				<ThreeBox />
				<ThreeSky />
				<ThreeWater />
			</TresCanvas>
		</div>
	</div>
</template>

<style lang="scss" scoped>
	.test {
		margin-top: var(--header-height);
		height: 100dvh;

		.canvas-container {
			width: 1000px;
			height: 600px;
			margin: auto;
			background-color: #fff;
		}
	}
</style>
