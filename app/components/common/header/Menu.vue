<script setup lang="ts">
	const { menuListVisible, menuList } = defineProps({
		menuListVisible: Boolean,
		menuList: {
			type: Array<{ name: string; link: string }>,
			default: [],
		},
	});

	const menuItemVisible = ref(true);

	const emit = defineEmits(['close']);
</script>

<template>
	<ul :class="['main-menu', menuListVisible ? 'active' : '']">
		<CommonHeaderMenuItem
			v-for="(item, index) in menuList"
			:key="index"
			:name="item.name"
			:link="item.link"
			:visible="menuItemVisible"
			class="main-menu-content-item"
			@navigate="emit('close')"
			@show-menu="menuItemVisible = true"
			@hide-menu="menuItemVisible = false"
		>
		</CommonHeaderMenuItem>
	</ul>
</template>

<style lang="scss" scoped>
	.main-menu {
		display: flex;
		align-items: center;
		font-family: Public Sans;
		font-weight: var(--font-weight--normal);
		font-size: 1.125rem;
		column-gap: 3rem;
	}

	@media only screen and (max-width: 833px) {
		.main-menu {
			position: absolute;
			top: var(--header-height);
			flex-direction: column;

			width: 100%;

			background-color: var(--everglow-white);

			align-items: baseline;
			justify-content: center;
			padding: 0 40px;

			height: 0;
			opacity: 0;
			overflow: hidden;
			transition:
				all 0.3s ease-in-out,
				background-color 0s;

			&.active {
				display: flex;
				opacity: 1;
				height: calc(100dvh - var(--header-height));
			}
		}
	}
</style>
