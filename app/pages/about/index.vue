<script setup lang="ts">
	const route = useRoute();
	const i18n = useI18n();
	useHead({
		title: i18n.t('head.subtitles.about'),
	});

	const { data: page } = await useAsyncData(route.path, () =>
		queryCollection('content').path(route.path).first(),
	);
</script>

<template>
	<div class="about">
		<div class="about-content">
			<div class="article">
				<div class="article-title">
					<img
						src="/images/everglow.jpg"
						alt="A boss preview of Everglow mod"
					/>
					<div class="title-container">
						<h2 class="text">
							{{ page.title }}
						</h2>
					</div>
				</div>
				<ContentRenderer
					:value="page"
					class="markdown"
				/>
			</div>
			<div class="toc">
				<CommonContentToc :links="page.body.toc?.links" />
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
	.about {
		margin-top: var(--header-height);

		.about-content {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			width: 90%;
			max-width: 1200px;
			margin: 0 auto;

			.article {
				padding: 3rem 0;

				display: flex;
				flex-direction: column;

				.article-title {
					font-size: 3.5rem;
					height: 25rem;
					position: relative;

					border: 1px solid var(--everglow-trans-blue-1);
					border-radius: 1rem;
					backdrop-filter: blur(16px);
					background-color: var(--everglow-trans-white-3);
					overflow: hidden;
					user-select: none;

					img {
						height: 100%;
						width: 100%;
						object-fit: cover;
						object-position: center;
					}

					.title-container {
						position: absolute;
						display: flex;
						width: 100%;
						bottom: 0;

						h2 {
							font-size: 3rem;
							user-select: all;
							margin: 1.5rem;
							padding: 0.75rem 1rem;
							color: var(--everglow-font-color-3);
							border: 1px solid var(--everglow-trans-blue-1);
							border-radius: 1rem;
							backdrop-filter: blur(16px);
							background-color: var(--everglow-trans-blue-0);
						}
					}
				}
			}

			.toc {
				position: sticky;
				top: var(--header-height);
				backdrop-filter: blur(8px);
				overflow-y: auto;
				max-height: calc(100dvh - var(--header-height));

				width: 100%;
				order: -9999;
			}
		}
	}

	@media only screen and (min-width: 833px) {
		.about {
			.about-content {
				width: 80%;
			}
		}
	}

	@media only screen and (min-width: 1024px) {
		.about {
			.about-content {
				flex-direction: row;

				.article {
					width: calc(100% - 210px - 40px);
				}

				.toc {
					width: 210px;
					padding-left: 40px;
					order: 9999;
				}
			}
		}
	}
</style>
