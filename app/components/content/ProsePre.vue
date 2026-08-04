<script setup lang="ts">
	const props = defineProps({
		code: {
			type: String,
			default: '',
		},
		language: {
			type: String,
			default: null,
		},
		filename: {
			type: String,
			default: null,
		},
		highlights: {
			type: Array as () => number[],
			default: () => [],
		},
		meta: {
			type: String,
			default: null,
		},
		class: {
			type: String,
			default: null,
		},
	});

	const copy = async () => {
		await navigator.clipboard.writeText(props.code);
		alert('Copy successfully!');
	};
</script>

<template>
	<div class="pre-wrap">
		<div
			v-if="filename"
			class="pre-head"
		>
			<div class="head">
				<Icon :name="`vscode-icons:file-type-${props.language}`" />
				<span>{{ filename }}</span>
			</div>
		</div>
		<pre :class="$props.class">
      <slot />
    </pre>
		<div
			v-if="code"
			class="pre-utils"
			@click="copy()"
		>
			<Icon name="lucide:copy" />
		</div>
	</div>
</template>

<style>
	.pre-wrap {
		display: flex;
		flex-direction: column;
		border-radius: 8px;
		border: var(--crepe-color-secondary) solid 1px;
		overflow: hidden;

		&:hover .pre-utils {
			opacity: 1;
		}

		.pre-head {
			height: 5rem;

			display: flex;
			position: relative;
			align-items: center;

			background-color: var(--everglow-background-color);
			border-bottom: var(--crepe-color-secondary) solid 1px;
			border-radius: 4px 4px 0 0;
			padding-block: calc(var(--spacing) * 6);
			padding-inline: calc(var(--spacing) * 8);

			--shiki-default-bg: inherit;

			.head {
				display: flex;
				gap: 10px;
				font-size: 1.2rem;

				.iconify {
					width: 1.4rem;
					height: 1.4rem;
				}
			}
		}

		.pre-utils {
			width: 2.4rem;
			height: 2.4rem;

			display: inline-flex;
			align-items: center;
			justify-content: center;

			position: absolute;
			right: 11px;
			top: calc(5rem / 2 - 1.2rem);

			background-color: var(--crepe-color-background);
			border: var(--crepe-color-secondary) solid 1px;
			border-radius: 4px;

			opacity: 0;
			transition:
				opacity 0.2s ease-out,
				background-color 0.2s ease-out;

			&:hover {
				background-color: var(--crepe-color-secondary);
			}

			span {
				width: 1.4rem;
				height: 1.4rem;
			}
		}

		pre {
			code .line {
				display: block;
			}
		}
	}
</style>
