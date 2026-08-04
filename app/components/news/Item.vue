<script setup lang="ts">
	import type { NewsCollectionItem } from '@nuxt/content';

	const { newsItem: props } = defineProps<{
		newsItem: NewsCollectionItem;
	}>();

	const title = props.title && props.title.trim() ? props.title : 'Title';
	const description =
		props.description && props.description.trim()
			? props.description
			: 'Description';
	const date = props.date.toLocaleString();
	const img = props.image ?? undefined;

	const handleClickLink = () => {
		const localePath = useLocalePath();
		navigateTo(localePath(props.path));
	};
</script>

<template>
	<li class="news-item">
		<div
			v-if="img"
			class="news-item-img"
			:style="`background-image: url('${img}')`"
			@click="handleClickLink"
		></div>
		<div class="news-item-content">
			<h2
				class="news-item-header"
				@click="handleClickLink"
			>
				<NuxtLink :to="props.path">
					<span>{{ title }}</span>
				</NuxtLink>
			</h2>
			<div class="news-item-body">
				{{ description }}
			</div>
			<div class="news-item-footer">
				<div class="info">
					<div class="author">{{ `By ${$t('meta.team')}` }}</div>
					<div class="divider"></div>
					<div class="date">
						<Icon name="line-md:calendar" />
						<div class="text">{{ date }}</div>
					</div>
				</div>
				<NuxtLink
					class="btn"
					:to="props.path"
				>
					<span class="btn-text">{{ $t('news.chevron-text') }}</span>
					<Icon name="lucide:chevron-right" />
				</NuxtLink>
			</div>
		</div>
	</li>
</template>

<style lang="scss" scoped>
	.news-item {
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;
		max-width: 800px;
		margin-top: 40px;
		border-radius: 10px;
		overflow: hidden;
		background-color: var(--everglow-white);
		box-shadow: var(--shadow);

		// animation:
		// 	appear 1s linear forwards,
		// 	disappear 1s linear forwards;
		// animation-timeline: view();
		// animation-range: entry, exit;

		&:first-child {
			margin-top: 0;
		}

		.news-item-img {
			height: 150px;
			width: 100%;
			background-size: cover;
			background-position: center;
			cursor: pointer;
		}

		.news-item-content {
			display: flex;
			flex-direction: column;
			justify-content: space-between;

			row-gap: 2rem;
			width: 100%;

			padding: 1.75rem 2rem;

			.news-item-header {
				line-height: 1.5;

				a {
					cursor: pointer;
					transition: color 0.2s ease-in-out;
					&:hover {
						color: var(--everglow-blue-5) !important;
					}
				}
			}

			.news-item-body {
				font-size: 1.125rem;
				text-overflow: -o-ellipsis-lastline;
				overflow: hidden;
				text-overflow: ellipsis;
				display: -webkit-box;
				-webkit-line-clamp: 3;
				line-clamp: 3;
				-webkit-box-orient: vertical;
			}

			.news-item-footer {
				display: flex;
				justify-content: space-between;
				font-size: 1rem;

				.info {
					display: flex;

					.divider {
						margin: 0 5px;
						width: 2px;
						border: 1px solid var(--everglow-trans-black-3);
					}

					.date {
						display: flex;
						align-items: center;

						.text {
							margin-left: 3px;
						}
					}
				}

				.btn {
					display: flex;
					align-items: center;
					cursor: pointer;
					transition:
						color 0.2s ease-in-out,
						transform 0.2s;

					.btn-chevron {
						display: flex;
					}

					&:hover {
						color: var(--everglow-blue-5);
						transform: scale(1.2);
					}
				}
			}
		}
	}

	@media only screen and (max-width: 833px) {
		.news-item {
			.news-item-content {
				.news-item-footer {
					.info {
						.author {
							display: none;
						}

						.divider {
							display: none;
						}
					}
				}
			}
		}
	}

	@keyframes appear {
		from {
			opacity: 0;
			transform: matrix(0.8, 0, 0, 0.8, 0, 0);
		}

		to {
			opacity: 1;
			transform: matrix(1, 0, 0, 1, 0, 0);
		}
	}

	@keyframes disappear {
		to {
			opacity: 0;
			transform: matrix(0.8, 0, 0, 0.8, 0, 0);
		}

		from {
			opacity: 1;
			transform: matrix(1, 0, 0, 1, 0, 0);
		}
	}
</style>
