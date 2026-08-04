<script setup lang="ts">
	import type { NavigationTree } from '#shared/types';

	const route = useRoute();

	const { level, links, defaultOpen } = defineProps({
		level: {
			type: Number,
			default: 0,
		},
		links: {
			type: Array as PropType<NavigationTree[]>,
			default: () => [],
		},
		defaultOpen: {
			type: [Boolean, Number],
			default: undefined,
		},
	});

	const items = computed(() =>
		links?.map((link) => {
			return {
				label: link.label,
				icon: link.icon,
				disabled: link.disabled,
				defaultOpen:
					!defaultOpen ||
					(typeof defaultOpen === 'number' && level < defaultOpen) ||
					(link.to && route.path.startsWith(link.to.toString())),
				children: link.children,
			};
		}),
	);
</script>

<template>
	<div class="navigation-accordion">
		<CommonContentNavigationAccordionItem
			v-for="(item, index) in items"
			:key="index"
			:open="defaultOpen"
			:label="item.label"
			:icon="item.icon"
			:disabled="item.disabled"
			:default-open="item.defaultOpen"
		>
			<template #links>
				<CommonContentNavigationTree
					:level="level + 1"
					:links="item.children"
					:default-open="defaultOpen"
				/>
			</template>
		</CommonContentNavigationAccordionItem>
	</div>
</template>

<style lang="scss" scoped>
	.navigation-accordion {
		display: flex;
		flex-direction: column;
		width: 100%;

		& > *:not([hidden]) ~ :not([hidden]) {
			margin-top: 1.5rem;
		}
	}
</style>
