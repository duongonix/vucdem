<script lang="ts">
	import { Drama, Flame, MessageSquare, ShieldAlert, Skull } from '@lucide/svelte';
	const rules = [
		{
			icon: MessageSquare,
			title: 'Hãy tôn trọng người khác',
			text: 'Không bình luận xúc phạm, công kích cá nhân.'
		},
		{
			icon: Drama,
			title: 'Không tiết lộ nội dung',
			text: 'Không spoil nội dung quan trọng của truyện.'
		},
		{
			icon: Flame,
			title: 'Giữ không khí u ám',
			text: 'Bình luận liên quan đến truyện và chủ đề đang thảo luận.'
		},
		{
			icon: ShieldAlert,
			title: 'Vi phạm sẽ bị xử lý',
			text: 'Tài khoản vi phạm có thể bị ẩn hoặc khóa.'
		}
	];
</script>

<aside
	class="comment-rules relative border border-border-red bg-surface/80 px-6 pt-9 pb-4"
	aria-labelledby="comment-rules-title"
>
	<div
		class="absolute -top-5 left-1/2 grid size-10 -translate-x-1/2 place-items-center bg-background text-red"
	>
		<Skull size={29} strokeWidth={1.4} />
	</div>
	<h3
		id="comment-rules-title"
		class="text-center font-editorial text-2xl tracking-wider text-red uppercase"
	>
		Quy tắc bình luận
	</h3>
	<div class="mx-auto mt-5 h-px w-20 bg-red-muted"></div>
	<div class="mt-2 divide-y divide-border-red/50">
		{#each rules as rule (rule.title)}
			<div class="grid grid-cols-[2rem_1fr] gap-3 py-5">
				<rule.icon class="mt-1 text-red" size={21} strokeWidth={1.6} />
				<div>
					<p class="font-editorial text-lg leading-6 text-text-secondary">{rule.title}</p>
					<p class="mt-1 text-xs leading-5 text-text-muted">{rule.text}</p>
				</div>
			</div>
		{/each}
	</div>
</aside>

<style>
	.comment-rules::before,
	.comment-rules::after {
		content: '';
		position: absolute;
		width: 2rem;
		height: 2rem;
		border-color: var(--red-dark);
	}
	.comment-rules::before {
		top: 0.35rem;
		left: 0.35rem;
		border-top: 1px solid;
		border-left: 1px solid;
	}
	.comment-rules::after {
		right: 0.35rem;
		bottom: 0.35rem;
		border-right: 1px solid;
		border-bottom: 1px solid;
	}
</style>
