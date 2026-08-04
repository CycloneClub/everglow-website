<script setup lang="ts">
	import { Vector3 } from 'three';

	const { onBeforeRender } = useLoop();

	const { position, color } = defineProps({
		position: {
			type: Vector3,
			default: new Vector3(30, 30, 30),
		},
		color: {
			type: String,
			default: 'orange',
		},
	});

	const boxRef = ref();

	onBeforeRender(({ elapsed }) => {
		if (boxRef.value) {
			boxRef.value.position.y = Math.sin(elapsed) * 20 + 5;
			boxRef.value.rotation.x = elapsed * 0.5;
			boxRef.value.rotation.z = elapsed * 0.51;
		}
	});
</script>

<template>
	<TresMesh
		ref="boxRef"
		receive-shadow
	>
		<TresBoxGeometry :args="[position.x, position.y, position.z]" />
		<TresMeshStandardMaterial
			:color="color"
			:roughness="0"
		/>
	</TresMesh>
</template>
