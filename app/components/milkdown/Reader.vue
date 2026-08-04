<script setup lang="ts">
	import {
		Editor,
		rootCtx,
		defaultValueCtx,
		editorViewOptionsCtx,
	} from '@milkdown/kit/core';
	import { Milkdown, useEditor } from '@milkdown/vue';
	import { commonmark } from '@milkdown/kit/preset/commonmark';
	import { gfm } from '@milkdown/kit/preset/gfm';

	import { nord } from '@milkdown/theme-nord';
	import '@milkdown/theme-nord/style.css';
	import '@/assets/css/milkdown/classic.scss';
	import 'prism-themes/themes/prism-nord.css';

	import { prism, prismConfig } from '@milkdown/plugin-prism';
	import { cursor } from '@milkdown/plugin-cursor';
	import { tooltipFactory } from '@milkdown/plugin-tooltip';
	import { math } from '@milkdown/plugin-math';
	import { emoji } from '@milkdown/plugin-emoji';

	import c from 'refractor/c';
	import cpp from 'refractor/cpp';
	import csharp from 'refractor/csharp';
	import css from 'refractor/css';
	import go from 'refractor/go';
	import haskell from 'refractor/haskell';
	import python from 'refractor/python';
	import java from 'refractor/java';
	import javascript from 'refractor/javascript';
	import typescript from 'refractor/typescript';
	import jsx from 'refractor/jsx';
	import kotlin from 'refractor/kotlin';
	import r from 'refractor/r';
	import rust from 'refractor/rust';
	import scala from 'refractor/scala';
	import sql from 'refractor/sql';
	import tsx from 'refractor/tsx';
	import markdown from 'refractor/markdown';

	const tootip = tooltipFactory('Tooltip');

	const defaultValue: string = 'data.data.value';

	useEditor((root: HTMLElement) =>
		Editor.make()
			.config((ctx) => {
				ctx.set(rootCtx, root);
				ctx.set(defaultValueCtx, defaultValue);
				ctx.update(editorViewOptionsCtx, (prev) => ({
					...prev,
					editable: () => false,
				}));
				ctx.set(prismConfig.key, {
					configureRefractor: (refractor) => {
						refractor.register(c);
						refractor.register(cpp);
						refractor.register(csharp);
						refractor.register(css);
						refractor.register(go);
						refractor.register(haskell);
						refractor.register(python);
						refractor.register(markdown);
						refractor.register(java);
						refractor.register(javascript);
						refractor.register(typescript);
						refractor.register(jsx);
						refractor.register(kotlin);
						refractor.register(r);
						refractor.register(rust);
						refractor.register(scala);
						refractor.register(sql);
						refractor.register(tsx);
					},
				});
			})
			.config(nord)
			.use(commonmark)
			.use(gfm)
			.use(prism)
			.use(math)
			.use(emoji)
			.use(cursor)
			.use(tootip),
	);
</script>

<template>
	<Milkdown />
</template>
