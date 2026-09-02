<script lang="ts">
	import { ChevronsDown, SlidersHorizontal } from '@lucide/svelte';
	let { count }: { count: number } = $props();
</script>

<header>
	<div class="flex items-center gap-3">
		<span
			class="grid size-9 place-items-center border border-border-red text-red"
			aria-hidden="true">✦</span
		>
		<h2
			id="comments-title"
			class="shrink-0 font-editorial text-3xl font-semibold tracking-wide whitespace-nowrap text-text uppercase"
		>
			Bình luận
		</h2>
		<span class="h-px flex-1 bg-gradient-to-r from-red-muted/80 to-transparent"></span>
	</div>
	<div class="mt-8 flex items-center justify-between gap-4">
		<p class="font-editorial text-xl text-text-muted">
			<strong class="font-normal text-red">{count}</strong> bình luận
		</p>
		<div class="flex items-center">
			<label class="sr-only" for="comment-sort">Sắp xếp bình luận</label>
			<div class="relative">
				<select
					id="comment-sort"
					class="h-11 appearance-none border border-border bg-surface pr-10 pl-4 text-xs tracking-widest text-text-secondary uppercase hover:border-border-red"
					aria-label="Sắp xếp bình luận"
				>
					<option>Mới nhất</option>
				</select>
				<ChevronsDown
					class="pointer-events-none absolute top-3.5 right-3 text-text-muted"
					size={15}
				/>
			</div>
			<span
				class="grid size-11 place-items-center border border-l-0 border-border text-red"
				aria-hidden="true"><SlidersHorizontal size={17} /></span
			>
		</div>
	</div>
</header>
