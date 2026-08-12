<script setup lang="ts">
	import type { editor, IDisposable } from 'monaco-editor';
	import { GEOM_THEME_DARK, GEOM_THEME_LIGHT, registerCsharpLanguage } from './register-csharp';
	import { registerHlslLanguage } from './register-hlsl';

	const props = defineProps<{
		modelValue: string;
		label: string;
		language: 'hlsl' | 'csharp';
	}>();
	const emit = defineEmits<{ 'update:modelValue': [value: string] }>();
	const container = ref<HTMLElement>();
	let instance: editor.IStandaloneCodeEditor | null = null;
	let valueSubscription: IDisposable | null = null;

	const colorMode = useColorMode();
	const languageId = computed(() =>
		props.language === 'csharp' ? 'csharp-geom' : 'hlsl',
	);

	watch(
		() => props.modelValue,
		(value) => {
			if (instance && instance.getValue() !== value) instance.setValue(value);
		},
	);

	watch(
		() => colorMode.value,
		(value) => {
			instance?.updateOptions({ theme: value === 'dark' ? GEOM_THEME_DARK : GEOM_THEME_LIGHT });
		},
	);

	onMounted(async () => {
		if (!container.value) return;
		const monaco = await import('monaco-editor');
		registerCsharpLanguage(monaco);
		registerHlslLanguage(monaco);
		instance = monaco.editor.create(container.value, {
			value: props.modelValue,
			language: languageId.value,
			theme: colorMode.value === 'dark' ? GEOM_THEME_DARK : GEOM_THEME_LIGHT,
			fontSize: 13,
			fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
			minimap: { enabled: false },
			scrollBeyondLastLine: false,
			automaticLayout: true,
			tabSize: 4,
			wordWrap: 'on',
			renderLineHighlight: 'line',
			padding: { top: 8,
bottom: 8 },
		});
		valueSubscription = instance.onDidChangeModelContent(() =>
			emit('update:modelValue', instance?.getValue() ?? ''),
		);
		instance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {});
	});

	watch(languageId, (value) => {
		const model = instance?.getModel();
		if (model) void import('monaco-editor').then((monaco) => monaco.editor.setModelLanguage(model, value));
	});

	onBeforeUnmount(() => {
		valueSubscription?.dispose();
		instance?.dispose();
	});
</script>

<template>
	<section class="hlsl-editor">
		<div class="hlsl-editor__label">{{ label }}</div>
		<div ref="container" class="hlsl-editor__frame" />
	</section>
</template>

<style lang="scss" scoped>
	.hlsl-editor {
		display: grid;
		grid-template-rows: auto minmax(12rem, 1fr);
		min-height: 20rem;
		overflow: hidden;
		background: #111827;
		border: 1px solid #334155;
		border-radius: 0.5rem;
	}

	.hlsl-editor__label {
		padding: 0.625rem 0.75rem;
		color: #cbd5e1;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		background: #1e293b;
		border-bottom: 1px solid #334155;
	}

	.hlsl-editor__frame {
		min-width: 0;
		min-height: 0;
	}
</style>
