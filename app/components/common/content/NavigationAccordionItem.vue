<script setup lang="ts">
	const {
		label = 'label',
		icon = '',
		disabled,
		defaultOpen,
	} = defineProps({
		label: String,
		icon: String,
		disabled: Boolean,
		defaultOpen: Boolean,
	});

	const linkOpen = ref<boolean>(defaultOpen);
	const content = ref<HTMLElement>();
	const contentHeight = ref<string>();
	const i18n = useI18n();

	const localLabel = () => {
		return i18n.t(`docs.label.${label}`);
	};

	onMounted(() => {
		contentHeight.value = `${content.value.getBoundingClientRect().height}px`;
	});
</script>

<template>
	<div
		ref="content"
		class="navigation-accordion-item"
	>
		<button
			class="title"
			@click="linkOpen = !linkOpen"
		>
			<Icon
				v-if="icon"
				:name="icon"
			/>
			<span>{{ localLabel() }}</span>
			<Icon
				v-if="!disabled"
				name="lucide:chevron-right"
				:class="['chevron', linkOpen ? 'active' : '']"
			/>
		</button>
		<Transition name="expand">
			<div
				v-show="linkOpen"
				class="links"
			>
				<div class="links-container">
					<slot name="links" />
				</div>
			</div>
		</Transition>
	</div>
</template>

<style lang="scss" scoped>
	.navigation-accordion-item {
		display: flex;
		flex-direction: column;
		width: 100%;

		& > *:not([hidden]) ~ :not([hidden]) {
			margin-top: 1rem;
		}

		button {
			display: flex;
			align-items: center;
			width: 100%;
			gap: 0.5rem;
			color: var(--everglow-font-color-3);
			font-size: 1.33rem;

			.chevron {
				transition: transform 0.2s ease;

				&.active {
					transform: rotate(90deg);
				}
			}
		}

		.links {
			overflow: hidden;
			height: auto;
			transition: all 0.3s ease;

			.links-container {
				margin-left: 0.75rem;

				& > nav {
					margin-left: 0.75rem;
					border-style: solid;
					border-width: 0;
					border-left-width: 1px;
					border-color: var(--everglow-trans-black-3);
				}
			}
		}
	}

	.expand-enter-to,
	.expand-leave-from {
		max-height: v-bind(contentHeight);
	}
</style>
