<script setup lang="ts">
	import { MilkdownProvider } from '@milkdown/vue';
	import { ProsemirrorAdapterProvider } from '@prosemirror-adapter/vue';
</script>

<template>
	<div class="milkdown-wrapper">
		<MilkdownProvider>
			<ProsemirrorAdapterProvider>
				<MilkdownReader></MilkdownReader>
			</ProsemirrorAdapterProvider>
		</MilkdownProvider>
	</div>
</template>
