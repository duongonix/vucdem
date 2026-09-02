<script lang="ts">
	import { Copyright, ScrollText, ShieldAlert } from '@lucide/svelte';

	const rules = [
		{
			icon: ScrollText,
			title: 'Nội dung giải trí',
			body: 'Tất cả nội dung trên website chỉ mang tính chất giải trí. Vực Đêm không ủng hộ các tư tưởng hoặc hành động mê tín dị đoan.'
		},
		{
			icon: Copyright,
			title: 'Bản quyền và khiếu nại',
			body: 'Nội dung được đăng tải bởi thành viên. Nếu có vấn đề về bản quyền hoặc khiếu nại, vui lòng liên hệ Admin; chúng tôi sẽ xem xét và gỡ bỏ nội dung vi phạm.'
		},
		{
			icon: ShieldAlert,
			title: 'Giới hạn nội dung',
			body: 'Chỉ chia sẻ nội dung liên quan đến kinh dị, huyền huyễn, khoa học siêu nhiên và giả tưởng. Nghiêm cấm nội dung xúc phạm tôn giáo, xuyên tạc chính trị, xúc phạm hoặc xâm hại người khác và nội dung đồi trụy. Vi phạm sẽ bị xóa nội dung và cấm tài khoản vĩnh viễn.'
		}
	];
</script>

<aside
	class="rules-banner relative mb-5 overflow-hidden border border-border-red bg-surface"
	aria-labelledby="community-rules-title"
>
	<div class="pointer-events-none absolute inset-0" aria-hidden="true"></div>
	<header class="relative border-b border-border-red px-5 py-5 sm:px-6">
		<div class="flex items-start gap-4">
			<span
				class="ornament grid size-11 shrink-0 place-items-center border border-red-dark text-red"
			>
				<ShieldAlert class="size-5" strokeWidth={1.5} aria-hidden="true" />
			</span>
			<div>
				<p class="text-[0.65rem] font-semibold tracking-[0.24em] text-red uppercase">
					Quy ước Vực Đêm
				</p>
				<h1
					id="community-rules-title"
					class="mt-1 font-editorial text-2xl font-semibold text-text sm:text-3xl"
				>
					Trước khi bước vào bóng tối
				</h1>
				<p class="mt-1 text-sm text-text-muted">
					Hãy đọc và tôn trọng những nguyên tắc chung của cộng đồng.
				</p>
			</div>
		</div>
	</header>

	<ol class="relative divide-y divide-border/80 px-5 sm:px-6">
		{#each rules as rule, index (rule.title)}
			{@const Icon = rule.icon}
			<li class="grid gap-3 py-4 sm:grid-cols-[2.25rem_minmax(0,1fr)]">
				<span
					class="flex size-8 items-center justify-center border border-border-red bg-background text-red"
					aria-hidden="true"
				>
					<Icon class="size-4" strokeWidth={1.5} />
				</span>
				<div>
					<div class="flex items-baseline gap-2">
						<span class="font-editorial text-sm text-red-dark">0{index + 1}</span>
						<h2 class="font-editorial text-lg font-semibold text-text">{rule.title}</h2>
					</div>
					<p class="mt-1 text-sm leading-6 text-text-secondary">{rule.body}</p>
				</div>
			</li>
		{/each}
	</ol>
	<div
		class="relative flex items-center gap-3 px-5 pb-4 text-[0.65rem] tracking-[0.16em] text-red-dark uppercase sm:px-6"
		aria-hidden="true"
	>
		<span class="h-px flex-1 bg-border-red"></span><span>V • Đ</span><span
			class="h-px flex-1 bg-border-red"
		></span>
	</div>
</aside>

<style>
	.rules-banner {
		background-image:
			radial-gradient(circle at 92% 5%, rgb(122 16 16 / 20%), transparent 18rem),
			linear-gradient(115deg, rgb(13 13 13 / 98%), rgb(5 5 5 / 96%)),
			url('/images/ui/home-right-gothic.png');
		background-position:
			center,
			center,
			right center;
		background-size: auto, auto, cover;
	}
	.rules-banner::before,
	.rules-banner::after {
		position: absolute;
		z-index: 2;
		width: 1.25rem;
		height: 1.25rem;
		content: '';
		pointer-events: none;
	}
	.rules-banner::before {
		top: 0.35rem;
		left: 0.35rem;
		border-top: 1px solid var(--color-red-dark);
		border-left: 1px solid var(--color-red-dark);
	}
	.rules-banner::after {
		right: 0.35rem;
		bottom: 0.35rem;
		border-right: 1px solid var(--color-red-dark);
		border-bottom: 1px solid var(--color-red-dark);
	}
	.ornament {
		box-shadow: inset 0 0 1.5rem rgb(122 16 16 / 16%);
		transform: rotate(45deg);
	}
	.ornament :global(svg) {
		transform: rotate(-45deg);
	}
</style>
