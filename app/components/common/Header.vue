<script setup lang="ts">
	const blurMaskVisible = () => true;
	const menuListVisible = ref<boolean>(false);

	const openMenu = () => {
		menuListVisible.value = true;
		document.body.style.overflow = 'hidden';
	};

	const closeMenu = () => {
		menuListVisible.value = false;
		document.body.style.overflow = 'auto';
	};

	const mainMenuItemList = [
		{
			name: 'home',
			link: '/',
		},
		{
			name: 'news',
			link: '/news',
		},
		{
			name: 'wiki',
			link: 'https://terrariamods.wiki.gg/wiki/Everglow',
		},
		{
			name: 'docs',
			link: '/docs/getting-started/introduction',
		},
		{
			name: 'playground',
			link: '/playground',
		},
		{
			name: 'about',
			link: '/about',
		},
	];

	const colorMode = useColorMode();

	const changeColorMode = (mode: 'light' | 'dark') => {
		colorMode.value = mode;
		colorMode.preference = mode;
	};
</script>

<template>
	<header
		:class="[
			'common-header',
			'transparent',
			blurMaskVisible() ? 'blur-mask' : '',
		]"
	>
		<div class="common-header-nav">
			<h1 class="logo">
				<NuxtLinkLocale to="/">
					<EverglowLogo :size="30" />
					<div class="logo-text">{{ $t('body.header.name') }}</div>
				</NuxtLinkLocale>
			</h1>
			<CommonHeaderMenu
				:menu-list-visible="menuListVisible"
				:menu-list="mainMenuItemList"
				@close="closeMenu()"
			/>
			<ul class="user-actions">
				<li class="user-actions-item language">
					<CommonHeaderLanguage />
				</li>
				<li class="user-actions-item mode">
					<div class="icon-button">
						<span
							v-show="$colorMode.value === 'light'"
							class="light"
						>
							<Icon
								name="line-md:moon-filled-alt-to-sunny-filled-loop-transition"
								@click="changeColorMode('dark')"
							/>
						</span>
						<span
							v-show="$colorMode.value === 'dark'"
							class="dark"
						>
							<Icon
								name="line-md:sunny-outline-to-moon-loop-transition"
								@click="changeColorMode('light')"
							/>
						</span>
					</div>
				</li>
				<li class="user-actions-item github">
					<div class="icon-button">
						<NuxtLink
							href="https://github.com/Solaestas/Everglow"
							title="Github"
							aria-label="Everglow on Github"
							target="_blank"
						>
							<Icon name="uil:github" />
						</NuxtLink>
					</div>
				</li>
				<li class="user-actions-item main-menu-trigger">
					<div
						v-show="!menuListVisible"
						class="icon-button"
						@click="openMenu()"
					>
						<Icon name="line-md:menu-fold-left" />
					</div>
					<div
						v-show="menuListVisible"
						class="icon-button"
						@click="closeMenu()"
					>
						<Icon name="line-md:close" />
					</div>
				</li>
			</ul>
		</div>
	</header>
</template>

<style lang="scss" scoped>
	.common-header {
		position: fixed;
		top: 0;
		width: 100%;
		z-index: 4000;
		display: -webkit-box;
		display: -webkit-flex;
		display: -moz-box;
		display: -ms-flexbox;
		display: flex;
		-webkit-box-orient: vertical;
		-webkit-box-direction: normal;
		-webkit-flex-direction: column;
		-moz-box-orient: vertical;
		-moz-box-direction: normal;
		-ms-flex-direction: column;
		flex-direction: column;
		background: var(--everglow-black);
		-webkit-transform: translateY(0);
		-moz-transform: translateY(0);
		-ms-transform: translateY(0);
		-o-transform: translateY(0);
		transform: translateY(0);
		-webkit-transition: all ease-in-out 220ms;
		-o-transition: all ease-in-out 220ms;
		-moz-transition: all ease-in-out 220ms;
		transition: all ease-in-out 220ms;

		user-select: none;

		&.transparent {
			background: unset;
			-webkit-backdrop-filter: unset;
			backdrop-filter: unset;
		}

		&.blur-mask::before {
			content: ' ';
			display: block;
			position: absolute;
			left: 0;
			top: 0;
			width: 100%;
			height: 100%;
			background: var(--everglow-trans-white-3);
			-webkit-backdrop-filter: blur(50px);
			backdrop-filter: blur(50px);
		}

		.common-header-nav {
			position: relative;
			height: var(--header-height);
			max-width: 1920px;
			width: 100%;
			margin: 0 auto;
			display: -webkit-box;
			display: -webkit-flex;
			display: -moz-box;
			display: -ms-flexbox;
			display: flex;
			-webkit-box-orient: horizontal;
			-webkit-box-direction: normal;
			-webkit-flex-direction: row;
			-moz-box-orient: horizontal;
			-moz-box-direction: normal;
			-ms-flex-direction: row;
			flex-direction: row;
			-webkit-box-pack: justify;
			-webkit-justify-content: space-between;
			-moz-box-pack: justify;
			-ms-flex-pack: justify;
			justify-content: space-between;

			.logo {
				display: flex;
				align-items: center;
				padding-left: 40px;

				a {
					display: flex;
					align-items: center;
					text-align: center;
					justify-content: center;
				}

				.logo-text {
					padding-left: 10px;
					font-size: 20px;
					font-family: 'Courier New', Courier, monospace;
					font-weight: var(--font-weight--bold);
				}
			}

			.user-actions {
				display: flex;
				margin-right: 40px;
				column-gap: 0.5rem;

				.user-actions-item {
					font-size: 20px;

					display: flex;
					align-items: center;

					cursor: pointer;

					.icon-button {
						display: inline-flex;
						padding: 0.5rem;
						border-radius: 8px;
						overflow: hidden;
						transition: background-color 0.15s ease-in;

						& > * {
							width: 20px;
							height: 20px;
						}

						&:hover {
							background-color: var(--everglow-trans-black-3);
						}
					}
				}

				.mode {
					.light {
						color: var(--everglow-red-4);
					}

					.dark {
						color: var(--everglow-blue-5);
					}
				}

				.main-menu-trigger {
					display: none;
				}
			}
		}
	}

	@media only screen and (max-width: 833px) {
		.common-header {
			.common-header-nav {
				.user-actions {
					margin-right: 0;

					.main-menu-trigger {
						width: 40px;
						display: flex;
					}
				}
			}
		}
	}
</style>
