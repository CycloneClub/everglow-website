<script setup lang="ts"></script>

<template>
	<div class="horizontal-scroll-base">
		<main>
			<div class="pin-wrap-sticky">
				<ul class="pin-wrap">
					<li class="pin-item"></li>
					<li class="pin-item"></li>
					<li class="pin-item"></li>
					<li class="pin-item"></li>
					<li class="pin-item"></li>
				</ul>
			</div>
		</main>
	</div>
</template>

<style lang="scss" scoped>
	main {
		height: 100dvh;
		display: flex;
		background: var(--everglow-trans-blue-2);
		color: black;
		overflow: scroll;
	}

	.pin-wrap-sticky {
		background: url('/images/starry-night-sky.jpg');
		background-size: cover;
	}

	@supports (animation-timeline: view()) {
		@keyframes move {
			to {
				transform: translateX(calc(-100% + 100vw));
			}
		}

		main {
			height: 1000dvh;
			overflow: visible;
			view-timeline-name: --section-pin-tl;
			scroll-timeline: --main-scroll inline;
			view-timeline-axis: block;
		}

		.pin-wrap-sticky {
			height: 100dvh;
			width: 100vw;
			position: sticky;
			top: 0;
			width: 100vw;
			overflow-x: hidden;
		}

		.pin-wrap {
			height: 100dvh;
			width: 500vmax;

			display: flex;

			will-change: transform;
			animation: linear move forwards;
			animation-timeline: --section-pin-tl;
			animation-range: contain 0% contain 100%;
			white-space: nowrap;
			scroll-snap-type: x mandatory;
		}

		.pin-item {
			height: 100dvh;
			width: 100vmax;
			scroll-snap-align: center;
			border-right: 1px solid black;

			&:last-child {
				border: none;
			}
		}
	}
</style>
