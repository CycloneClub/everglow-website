<script setup lang="ts">
	import type { NavigationTree } from '#shared/types';

	const { links } = defineProps<{ links: NavigationTree[] }>();

	const route = useRoute();
</script>

<template>
	<div class="navigation-links">
		<NuxtLink
			v-for="(link, index) in links"
			:key="index"
			:to="link.to"
			:class="['navigation-link', route.path !== link.to || 'active']"
		>
			<Icon
				v-if="link.icon"
				:name="link.icon"
			/>
			<span>{{ link.label }}</span>
		</NuxtLink>
	</div>
</template>

<style lang="scss" scoped>
	.navigation-links {
		font-size: 1.125rem;
		font-family:
			DM Sans,
			DM Sans fallback,
			ui-sans-serif,
			system-ui,
			sans-serif,
			Apple Color Emoji,
			Segoe UI Emoji,
			Segoe UI Symbol,
			Noto Color Emoji;
		line-height: 2rem;

		& > *:not([hidden]) ~ :not([hidden]) {
			margin-top: 0.5rem;
		}

		.navigation-link {
			color: var(--everglow-font-color-0);
			margin-left: -1px;
			padding-left: 1.25rem;
			border-width: 0;
			border-left: 1px solid #0000;

			display: flex;
			gap: 0.5rem;
			align-items: center;

			cursor: pointer;

			transition: color 0.2s ease;

			&:hover {
				color: var(--everglow-font-color-3);
				border-color: currentColor;
			}

			&.active {
				color: var(--everglow-blue-5) !important;
				border-color: currentColor;
			}
		}
	}
</style>
