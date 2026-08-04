<script setup lang="ts">
	const { t, locale } = useI18n();
	useHead({
		title: t('head.subtitles.docs'),
	});

	const route = useRoute();
	const { data: page } = await useAsyncData(route.path, () =>
		queryCollection(docsCollectionKey(locale.value)).path(route.path).first(),
	);

	const title = computed(() => page.value?.title ?? t('docs.empty.title'));
	const description = computed(
		() => page.value?.description ?? t('docs.empty.description'),
	);

	const { data: navigation } = await useDocsNav();
	const navLinks = computed(() => {
		return mapContentNavigation(
			mapLocaleDocsNavigation(navigation.value, locale.value),
		);
	});

	const tocLinks = computed(() => {
		return page.value?.body.toc.links ?? [];
	});
</script>

<template>
	<div class="docs">
		<CommonLight class="light" />
		<div class="docs-content">
			<div class="container">
				<div class="aside-container">
					<aside class="aside">
						<CommonContentNavigationTree :links="navLinks" />
					</aside>
				</div>
				<div class="main-container">
					<div class="main">
						<div class="article-container">
							<div class="article">
								<div class="article-head">
									<div class="category">Everglow</div>
									<div class="info">
										<h2 class="title">{{ title }}</h2>
										<div class="description">{{ description }}</div>
									</div>
								</div>
								<div class="article-body">
									<template v-if="page">
										<ContentRenderer
											class="markdown"
											:value="page"
										/>
									</template>
									<template v-else>
										<DocsEmpty />
									</template>
								</div>
							</div>
						</div>
						<div class="navbar-container">
							<CommonContentToc :links="tocLinks" />
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
	.stone {
		border: 1px solid var(--everglow-font-color-3);
		border-top: none;
		height: 50px;

		&:first-child {
			border-top: 1px solid var(--everglow-font-color-3);
		}
	}

	.docs {
		margin-top: var(--header-height);
		position: relative;

		.light {
			top: 0px;
			position: absolute;
			opacity: 0.4;
		}

		.docs-content {
			padding: 0 2rem;
			margin: 0 auto;
			max-width: 120rem;

			.container {
				display: flex;
				flex-direction: column;

				.aside {
					display: none;
					padding-left: 1rem;
					padding-right: 1rem;
					overflow-y: auto;
				}

				.main {
					display: flex;
					flex-direction: column;

					.article {
						.article-head {
							padding: 3rem 0;
							border-bottom: 1px solid var(--everglow-trans-black-3);

							.category {
								display: flex;
								font-size: 1.33rem;
								line-height: 2rem;
								align-items: center;
								margin-bottom: 1rem;
								font-weight: var(--font-weight--normal);
								color: var(--everglow-blue-5);
							}
							.info {
								display: flex;
								flex-direction: column;

								.title {
									font-size: 3rem;
									line-height: 4rem;
									font-weight: var(--font-weight--normal);
								}

								.description {
									font-size: 1.5rem;
									line-height: 2rem;
									margin-top: 1.5rem;

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
								}
							}
						}

						.article-body {
							margin: 3rem 0 6rem;

							.markdown {
								padding: 0 !important;
								background-color: none;
							}
						}
					}

					.navbar-container {
						position: sticky;
						top: var(--header-height);
						backdrop-filter: blur(8px);
						width: 100%;
						overflow-y: auto;
						max-height: calc(100dvh - var(--header-height));
						order: -9999;
					}
				}
			}
		}
	}

	@media only screen and (min-width: 1024px) {
		.docs {
			.docs-content {
				.container {
					display: grid;
					grid-template-columns: repeat(10, minmax(0, 1fr));
					gap: 2rem;

					.aside-container {
						grid-column: span 2 / span 2;

						.aside {
							display: block;
							position: sticky;
							top: var(--header-height);
							max-height: calc(100dvh - var(--header-height));
							padding-top: 3rem;
							padding-bottom: 3rem;
						}
					}

					.main-container {
						grid-column: span 8 / span 8;

						.main {
							display: grid;
							grid-template-columns: repeat(10, minmax(0, 1fr));
							gap: 2rem;

							.article-container {
								grid-column: span 8 / span 8;
							}

							.navbar-container {
								grid-column: span 2 / span 2;

								padding: 0 1rem;
								margin: 0 -1rem;
								order: 9999;
							}
						}
					}
				}
			}
		}
	}
</style>
