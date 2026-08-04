<script setup lang="ts">
	import { MathUtils } from 'three';

	const { onBeforeRender } = useLoop();

	const lightRef = ref();
	const ambientLightRef = ref();
	const skyRef = ref();
	const elevation = ref(1);

	const directionalLightIntensity = 5;
	const ambientLightIntensity = 40;
	onBeforeRender(({ delta }) => {
		const angle = (elevation.value + 20 * delta) % 360;
		const rad = MathUtils.degToRad(angle);
		if (skyRef.value) {
			elevation.value = angle;
		}
		if (lightRef.value) {
			lightRef.value.position.y = Math.sin(rad);
			lightRef.value.position.z = -Math.cos(rad);
			if (lightRef.value.position.y < 0) {
				lightRef.value.intensity = 0;
			} else {
				lightRef.value.intensity = directionalLightIntensity * Math.sin(rad);
			}
		}
		if (ambientLightRef.value) {
			const intensity = ambientLightIntensity * Math.sin(rad);
			ambientLightRef.value.intensity = intensity > 5 ? intensity : 5;
		}
	});
</script>

<template>
	<Sky
		ref="skyRef"
		:elevation="elevation"
		turbidity="10"
		rayleigh="2"
		mie-coefficient="0.005"
		mie-directional-g="0.8"
		cast-shadow
	/>
	<TresDirectionalLight
		ref="lightRef"
		:args="[0xffffff, directionalLightIntensity]"
	/>
	<TresAmbientLight
		ref="ambientLightRef"
		:args="[0x404040, ambientLightIntensity]"
	/>
</template>
