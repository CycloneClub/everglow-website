<template>
	<div class="news-list">
		<ul class="news-list-content">
			<slot />
		</ul>
	</div>
</template>

<style lang="scss" scoped>
	.news-list {
		.news-list-content {
			display: flex;
			flex-direction: column;
			align-items: center;
			-moz-column-gap: 0.5rem;
			column-gap: 0.5rem;
		}
	}
</style>
