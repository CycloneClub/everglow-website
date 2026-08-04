<script setup lang="ts">
	import {
		type ShaderMaterial,
		MirroredRepeatWrapping,
		PlaneGeometry,
		TextureLoader,
		Vector3,
		MathUtils,
	} from 'three';
	import { Water } from '~/assets/three/objects/water';

	const waterGeometry = new PlaneGeometry(10000, 10000);

	const water = new Water(waterGeometry, {
		textureWidth: 512,
		textureHeight: 512,
		waterNormals: new TextureLoader().load(
			'/three/normals/waternormals.jpg',
			(texture) => {
				texture.wrapS = texture.wrapT = MirroredRepeatWrapping;
			},
		),
		sunDirection: new Vector3(),
		sunColor: 0xffffff,
		waterColor: 0x001e0f,
		distortionScale: 3.7,
		size: 10,
		fog: false,
	});

	water.rotation.x = -Math.PI / 2;
	water.rotation.z = 0;

	const sun = new Vector3();
	const elevation = ref(1);
	const { onBeforeRender } = useLoop();
	onBeforeRender(({ delta }) => {
		(water.material as ShaderMaterial).uniforms['time'].value += 1.0 / 60.0;

		elevation.value = (elevation.value + 20 * delta) % 360;
		const phi = MathUtils.degToRad(90 - elevation.value);
		const theta = MathUtils.degToRad(180);
		sun.setFromSphericalCoords(1, phi, theta);
		(water.material as ShaderMaterial).uniforms['sunDirection'].value
			.copy(sun)
			.normalize();
	});
</script>

<template>
	<primitive :object="water" />
</template>
