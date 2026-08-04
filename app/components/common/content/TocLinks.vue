<script setup lang="ts">
	import type { PropType } from 'vue';
	import type { TocLink } from '@nuxt/content';

	const { links } = defineProps({
		links: {
			type: Array as PropType<TocLink[]>,
			default: () => [],
		},
	});

	const emit = defineEmits(['move']);

	const router = useRouter();

	const scrollToHeading = (id: string) => {
		const encodedId = encodeURIComponent(id);
		router.push(`#${encodedId}`);
		emit('move', id);
	};
</script>

<template>
	<ul
		v-if="links?.length"
		class="content-toc-links-wrapper"
	>
		<li
			v-for="(link, index) in links"
			:key="index"
			:class="['content-toc-link-wrapper', link.depth > 2 && 'children']"
		>
			<a
				:href="`#${link.id}`"
				:class="['content-toc-link']"
				@click.prevent="scrollToHeading(link.id)"
			>
				{{ link.text }}
			</a>

			<CommonContentTocLinks
				v-if="link.children"
				:links="link.children"
			/>
		</li>
	</ul>
</template>

<style lang="scss" scoped>
	.content-toc-links-wrapper {
		margin-top: 0.5rem;

		.content-toc-link-wrapper {
			margin-top: 0.25rem;

			&.children {
				margin-left: 0.75rem;
			}

			.content-toc-link {
				display: block;

				font-size: 1.125rem;
				line-height: 2rem;

				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;

				color: var(--everglow-font-color-1);
				font-family:
					DM Sans,
					'DM Sans Fallback: Arial',
					ui-sans-serif,
					system-ui,
					sans-serif,
					Apple Color Emoji,
					Segoe UI Emoji,
					Segoe UI Symbol,
					Noto Color Emoji;
				transition: color 0.1s ease-in;

				&:hover {
					color: var(--everglow-font-color-3);
				}
			}
		}
	}
</style>
