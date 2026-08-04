<script setup lang="ts">
	const subMenuVisible = ref(false);

	const { name, link, visible } = defineProps({
		name: {
			type: String,
			default: '',
		},
		link: {
			type: String,
			default: '',
		},
		visible: {
			type: Boolean,
			default: true,
		},
	});

	const emit = defineEmits(['navigate', 'showMenu', 'hideMenu']);

	const handleClickItem = () => {
		if (name !== 'docs') {
			emit('navigate');
		} else {
			subMenuVisible.value = true;
			emit('hideMenu');
		}
	};

	const handleReturnToMenu = () => {
		subMenuVisible.value = false;
		emit('showMenu');
	};
</script>

<template>
	<li :class="['main-menu-item', visible ? '' : 'hide']">
		<div class="main-menu-item-content">
			<NuxtLinkLocale
				:to="link"
				:target="link[0] !== '/' ? '_blank' : '_self'"
				style="width: 100%"
				@click="handleClickItem"
			>
				<div class="text">
					{{ $t(`body.header.${name}`) }}
				</div>
			</NuxtLinkLocale>
			<div class="chevron">
				<Icon name="line-md:chevron-small-right" />
			</div>
		</div>
		<CommonHeaderSubMenuDocs
			v-if="name == 'docs'"
			:sub-menu-visible="subMenuVisible"
			@return="handleReturnToMenu"
			@navigate="emit('navigate')"
		/>
	</li>
</template>

<style lang="scss" scoped>
	.main-menu-item {
		line-height: 1.5rem;
		width: 100%;

		.text {
			transition: color 0.3s;
		}

		.chevron {
			display: none;
			align-items: center;
			opacity: 0;
			transform-origin: center;
			animation: globalnav-chevron-hover-off 0.24s cubic-bezier(0.4, 0, 0.6, 1)
				both;
		}

		&:hover {
			cursor: pointer;

			.text {
				color: var(--everglow-blue-5) !important;
			}
		}
	}
	@media only screen and (max-width: 833px) {
		.main-menu-item {
			&.hide {
				visibility: hidden;
				pointer-events: none;
			}

			.main-menu-item-content {
				height: var(--header-height);
				line-height: var(--header-height);
				font-size: 2rem;

				display: flex;
				justify-content: space-between;

				.chevron {
					display: flex;
				}

				&:hover {
					.chevron {
						opacity: 1;
						animation: globalnav-chevron-slide-in-hover 0.24s
							cubic-bezier(0.4, 0, 0.6, 1) both;
					}
				}
			}
		}
	}

	@keyframes globalnav-chevron-slide-in-hover {
		0% {
			opacity: 0;
			transform: translate(-4px);
		}

		to {
			opacity: 1;
			transform: translate(0);
		}
	}

	@keyframes globalnav-chevron-hover-off {
		0% {
			opacity: 1;
			transform: scale(1);
		}

		100% {
			opacity: 0;
			transform: scale(0.8);
		}
	}
</style>
