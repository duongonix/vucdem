<script lang="ts">
	import { BookOpen, FileText } from '@lucide/svelte';

	let {
		title,
		type,
		compact = false
	}: { title: string; type: 'post' | 'story'; compact?: boolean } = $props();

	const label = $derived(type === 'story' ? 'Truyện từ Vực Đêm' : 'Lời kể từ Vực Đêm');
	const mark = $derived(title.trim().charAt(0).toLocaleUpperCase('vi-VN') || 'V');
</script>

<div
	class="cover-fallback relative isolate flex size-full min-h-44 overflow-hidden bg-[#070505] text-center"
	class:compact
	role="img"
	aria-label={`Bìa thay thế cho ${title}`}
>
	<div class="corner corner-top" aria-hidden="true"></div>
	<div class="corner corner-bottom" aria-hidden="true"></div>
	<div class="relative z-10 m-auto flex max-w-[88%] flex-col items-center px-4 py-6">
		<div
			class="sigil grid place-items-center border border-[#5b1719] text-[#c72a2f]"
			aria-hidden="true"
		>
			{#if type === 'story'}<BookOpen />{:else}<FileText />{/if}
		</div>
		<p class="mt-4 text-[.58rem] font-semibold tracking-[.26em] text-[#a92a2e] uppercase">
			{label}
		</p>
		<span class="my-3 flex w-full items-center gap-2" aria-hidden="true">
			<i></i><b>◆</b><i></i>
		</span>
		<p class="title line-clamp-3 font-editorial leading-tight font-semibold text-[#e5dfdc]">
			{title}
		</p>
		<p class="mark mt-3 font-editorial text-[#66171a]" aria-hidden="true">{mark}</p>
	</div>
</div>

<style>
	.cover-fallback {
		background-image:
			radial-gradient(circle at 50% 42%, rgb(93 16 20 / 0.2), transparent 43%),
			repeating-linear-gradient(135deg, transparent 0 12px, rgb(255 255 255 / 0.012) 12px 13px);
		box-shadow: inset 0 0 55px rgb(0 0 0 / 0.88);
	}
	.cover-fallback::before,
	.cover-fallback::after {
		position: absolute;
		inset: 8px;
		content: '';
		border: 1px solid rgb(91 23 25 / 0.7);
		pointer-events: none;
	}
	.cover-fallback::after {
		inset: 12px;
		border-color: rgb(91 23 25 / 0.23);
	}
	.sigil {
		width: 2.6rem;
		height: 2.6rem;
		rotate: 45deg;
	}
	.sigil :global(svg) {
		width: 1.15rem;
		height: 1.15rem;
		rotate: -45deg;
	}
	.title {
		font-size: clamp(1.05rem, 9cqi, 1.65rem);
	}
	.mark {
		font-size: 1.35rem;
	}
	span i {
		height: 1px;
		flex: 1;
		background: linear-gradient(to var(--direction, right), transparent, #5b1719);
	}
	span i:last-child {
		--direction: left;
	}
	span b {
		font-size: 0.42rem;
		color: #8e2226;
	}
	.corner {
		position: absolute;
		z-index: 2;
		width: 2.25rem;
		height: 2.25rem;
		border-color: #8e2226;
	}
	.corner-top {
		top: 8px;
		left: 8px;
		border-top: 2px solid;
		border-left: 2px solid;
	}
	.corner-bottom {
		right: 8px;
		bottom: 8px;
		border-right: 2px solid;
		border-bottom: 2px solid;
	}
	.compact .sigil {
		width: 2.1rem;
		height: 2.1rem;
	}
	.compact .title {
		font-size: 1.05rem;
	}
	.compact .mark {
		display: none;
	}
</style>
