<script setup lang="ts">
	const config = useRuntimeConfig();
	const colorModeCookie = useCookie(
		config.public.colorModeStorageKey ?? 'nuxt-color-mode',
	);
	const bg = ref<string>(
		colorModeCookie.value === 'light'
			? '/images/light-sky.jpg'
			: '/images/star-sky.jpg',
	);

	watch(useColorMode(), () => {
		bg.value =
			useColorMode().value === 'light'
				? '/images/light-sky.jpg'
				: '/images/star-sky.jpg';
	});
</script>

<template>
	<HomeParallexScrollBase :src="bg">
		<div class="home-welcome">
			<section class="parallex-scroll">
				<div>This website is still work in progress.</div>
				<NuxtLink
					to="https://github.com/Solaestas/Everglow"
					target="_blank"
				>
					<div class="git-link">Go to everglow github page</div>
				</NuxtLink>
			</section>
		</div>
	</HomeParallexScrollBase>
</template>

<style lang="scss" scoped>
	.git-link {
		margin-top: 10px;
		font-size: 1.125rem;
		font-weight: var(--font-weight--normal);
		border: 2px solid var(--everglow-black);
		border-radius: 8px;
		padding: 5px;
		text-align: center;

		&:hover {
			border-color: var(--everglow-blue-5);
			color: var(--everglow-blue-5);
		}
	}
</style>
