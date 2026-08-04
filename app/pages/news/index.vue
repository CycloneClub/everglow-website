<script setup lang="ts">
	const { t, locale } = useI18n();
	useHead({
		title: t('head.subtitles.news'),
	});

	const { path } = useRoute();
	const { data: list } = await useAsyncData(path, () =>
		queryCollection(newsCollectionKey(locale.value))
			.where('path', 'LIKE', path + '%')
			.order('date', 'DESC')
			.all(),
	);
</script>

<template>
	<div class="news">
		<NewsList>
			<NewsItem
				v-for="(item, index) in list"
				:key="index"
				:news-item="item"
			/>
		</NewsList>
	</div>
</template>

<style lang="scss" scoped>
	.news {
		padding: 100px 100px;
	}

	@media only screen and (max-width: 833px) {
		.news {
			padding: 100px 30px;
		}
	}
</style>
