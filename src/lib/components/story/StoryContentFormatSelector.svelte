<script lang="ts">
	import { FileText, Headphones, MessageCircle } from '@lucide/svelte';
	let { value = $bindable<'text' | 'audio' | 'interactive'>('text') } = $props();
</script>

<fieldset>
	<legend class="mb-2 text-xs font-semibold tracking-wider text-text-muted uppercase"
		>Nội dung truyện</legend
	>
	<div class="grid grid-cols-3 border border-border bg-background p-1">
		{#each [{ id: 'text' as const, label: 'Văn bản', icon: FileText }, { id: 'audio' as const, label: 'Audio', icon: Headphones }, { id: 'interactive' as const, label: 'Nhập vai', icon: MessageCircle }] as option (option.id)}
			{@const Icon = option.icon}
			<button
				type="button"
				class:border-red={value === option.id}
				class:bg-red-muted={value === option.id}
				class:text-text={value === option.id}
				class="inline-flex min-h-11 items-center justify-center gap-2 border border-transparent text-sm text-text-muted hover:text-text"
				onclick={() => (value = option.id)}
				aria-pressed={value === option.id}
			>
				<Icon size={17} />
				{option.label}
			</button>
		{/each}
	</div>
</fieldset>
