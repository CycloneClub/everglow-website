<script setup lang="ts">
	import type { PropType } from 'vue';
	import type { TocLink } from '@nuxt/content';

	const { title, links } = defineProps({
		title: {
			type: String,
			default: '',
		},
		links: {
			type: Array as PropType<TocLink[]>,
			default: () => [],
		},
	});

	const open = ref(false);
</script>

<template>
	<nav class="content-toc-wrapper">
		<div class="content-toc-container">
			<slot name="top" />

			<button
				v-if="links?.length"
				class="content-toc-button"
				tabindex="-1"
				@click="open = !open"
			>
				<span class="label">{{ title || $t('common.toc.title') }}</span>
				<Icon
					:class="['chevron', open ? 'active' : '']"
					name="lucide:chevron-right"
				/>
			</button>

			<CommonContentTocLinks
				:links="links"
				:class="['lg:block', open ? '' : 'hidden']"
			/>

			<slot name="bottom" />
		</div>
	</nav>
</template>

<style lang="scss" scoped>
	.content-toc-wrapper {
		overflow-x: hidden;

		.content-toc-container {
			padding: 0.75rem 0;
			border-bottom: 1px dashed var(--everglow-trans-black-3);

			.content-toc-button {
				align-items: center;
				width: 100%;
				cursor: pointer;

				display: flex;
				justify-content: space-between;

				color: var(--everglow-font-color-3);

				.label {
					font-weight: 600;
					font-size: 1.33rem;
					line-height: 2rem;

					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}

				.chevron {
					font-size: 1.33rem;
					transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);

					&.active {
						transform: rotate(90deg);
					}
				}
			}
		}
	}

	.hidden {
		display: none;
	}

	@media only screen and (min-width: 1024px) {
		.hidden {
			display: block;
		}

		.content-toc-wrapper {
			.content-toc-container {
				padding: 3rem 0 2rem;

				.content-toc-button {
					user-select: text;
					cursor: text;

					.chevron {
						display: none;
					}
				}
			}
		}
	}
</style>
