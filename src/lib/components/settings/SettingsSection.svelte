<script lang="ts">
	let { id, title, children }: { id: string; title: string; children: import('svelte').Snippet } =
		$props();
</script>

<section {id} class="scroll-mt-6" aria-labelledby={`${id}-title`}>
	<h2
		id={`${id}-title`}
		class="mb-2.5 flex items-center gap-3 font-editorial text-xl tracking-[.04em] text-text uppercase sm:text-2xl"
	>
		<span class="h-6 w-0.5 bg-red" aria-hidden="true"></span>{title}
	</h2>
	<div
		class="overflow-hidden rounded-sm border border-border bg-[linear-gradient(100deg,var(--color-surface-2),var(--color-surface))]"
	>
		{@render children()}
	</div>
</section>
