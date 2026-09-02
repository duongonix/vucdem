<script lang="ts">
	import {
		BatteryMedium,
		ChevronLeft,
		MoreVertical,
		Phone,
		RotateCcw,
		Signal,
		Video,
		Volume2,
		Wifi
	} from '@lucide/svelte';
	import { onDestroy, onMount, untrack } from 'svelte';
	import type {
		InteractiveCharacter,
		InteractiveStoryContent,
		InteractiveStoryEvent
	} from '$lib/types';
	let { content, title = 'Cuộc trò chuyện' }: { content: InteractiveStoryContent; title?: string } =
		$props();
	type VisibleEvent =
		| InteractiveStoryEvent
		| { id: string; order: number; type: 'message'; senderId: string; content: string };
	let visible = $state<VisibleEvent[]>([]);
	let index = $state(0);
	let activeChoice = $state<Extract<InteractiveStoryEvent, { type: 'choice' }> | null>(null);
	let typing = $state<InteractiveCharacter | null>(null);
	let waitingType = $state<'typing' | 'delay' | null>(null);
	let phoneTime = $state('03:33');
	let timer: ReturnType<typeof setTimeout> | undefined;
	let clockTimer: ReturnType<typeof setInterval> | undefined;
	let viewport = $state<HTMLDivElement>();
	let phoneScreen = $state<HTMLElement>();
	const player = $derived(content.characters.find((item) => item.role === 'player'));
	const conversationType = $derived(content.conversationType ?? 'direct');
	const contact = $derived(
		(conversationType === 'direct' && content.conversationCharacterId
			? content.characters.find((item) => item.id === content.conversationCharacterId)
			: null) ??
			content.characters.find((item) => item.role !== 'player') ??
			player
	);
	const groupMembers = $derived(content.characters);
	const headerTitle = $derived(
		conversationType === 'group'
			? content.conversationTitle || title
			: contact?.name || content.conversationTitle || title
	);
	const characterMap = $derived(new Map(content.characters.map((item) => [item.id, item])));
	const finished = $derived(
		index >= content.events.length && !activeChoice && !typing && !waitingType
	);
	function scrollToLatest() {
		requestAnimationFrame(() =>
			viewport?.scrollTo({
				top: viewport.scrollHeight,
				behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
			})
		);
	}
	function advance() {
		if (activeChoice || finished) return;
		if (waitingType === 'typing') return;
		if (waitingType === 'delay') {
			clearTimeout(timer);
			waitingType = null;
			return;
		}
		const event = content.events[index];
		if (!event) return;
		index += 1;
		if (event.type === 'choice') {
			activeChoice = event;
			scrollToLatest();
			return;
		}
		if (event.type === 'typing') {
			typing = characterMap.get(event.characterId) ?? null;
			waitingType = 'typing';
			timer = setTimeout(() => {
				typing = null;
				waitingType = null;
				advance();
			}, event.durationMs);
			scrollToLatest();
			return;
		}
		if (event.type === 'delay') {
			waitingType = 'delay';
			timer = setTimeout(() => {
				waitingType = null;
			}, event.durationMs);
			return;
		}
		visible = [...visible, event];
		scrollToLatest();
	}
	function choose(option: { id: string; text: string }) {
		if (!player || !activeChoice) return;
		visible = [
			...visible,
			{
				id: `answer_${activeChoice.id}_${option.id}`,
				order: activeChoice.order,
				type: 'message',
				senderId: player.id,
				content: option.text
			}
		];
		activeChoice = null;
		scrollToLatest();
	}
	function restart() {
		clearTimeout(timer);
		visible = [];
		index = 0;
		activeChoice = null;
		typing = null;
		waitingType = null;
	}
	function handleScreenTap(event: MouseEvent) {
		if (!phoneScreen?.contains(event.target as Node)) return;
		if ((event.target as HTMLElement).closest('button, a, audio, input, select, textarea')) return;
		advance();
	}
	function updateClock() {
		phoneTime = new Intl.DateTimeFormat('vi-VN', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		}).format(new Date());
	}
	onMount(() => {
		updateClock();
		clockTimer = setInterval(updateClock, 30_000);
	});
	$effect(() => {
		const currentContent = content;
		untrack(() => {
			if (currentContent) restart();
		});
		return () => clearTimeout(timer);
	});
	onDestroy(() => {
		clearTimeout(timer);
		clearInterval(clockTimer);
	});
</script>

<svelte:window onclick={handleScreenTap} />

<div class="phone-shell mx-auto" aria-label="Trình đọc truyện nhập vai">
	<div class="phone-hardware" aria-hidden="true">
		<span class="volume-up"></span><span class="volume-down"></span><span class="power"></span>
	</div>
	<section class="phone-screen" bind:this={phoneScreen} aria-label="Màn hình cuộc trò chuyện">
		<div class="status-bar" aria-hidden="true">
			<time>{phoneTime}</time>
			<div class="dynamic-island"><span class="camera"></span></div>
			<div class="status-icons"><Signal /><Wifi /><BatteryMedium /></div>
		</div>
		<header class="chat-header">
			<span class="back-icon" aria-hidden="true"><ChevronLeft /></span>
			<div class:group-avatar={conversationType === 'group'} class="contact-avatar">
				{#if conversationType === 'group'}{#each groupMembers.slice(0, 4) as member (member.id)}<span
							>{member.name.charAt(0)}</span
						>{/each}{:else if contact?.avatar}<img src={contact.avatar.url} alt="" />{:else}<span
						>{contact?.name.charAt(0) ?? '?'}</span
					>{/if}<i></i>
			</div>
			<div class="contact-copy">
				<p>{headerTitle}</p>
				<span
					>{conversationType === 'group'
						? `${groupMembers.length} thành viên · ${groupMembers.map((item) => item.name).join(', ')}`
						: 'đang hoạt động'}</span
				>
			</div>
			<div class="header-actions" aria-hidden="true"><Phone /><Video /><MoreVertical /></div>
		</header>
		<div class="message-viewport" bind:this={viewport} aria-live="polite">
			{#if visible.length === 0 && index === 0}<div class="conversation-start">
					<div class="start-sigil">V</div>
					<p>{headerTitle}</p>
					<span>Chạm vào màn hình để bắt đầu</span>
				</div>{/if}
			{#each visible as event (event.id)}
				{@const sender = 'senderId' in event ? characterMap.get(event.senderId) : null}
				{#if event.type === 'system'}<p class="system-event">{event.content}</p>
				{:else if event.type === 'message'}<div
						class:outgoing={sender?.role === 'player'}
						class="message-row"
					>
						{#if sender?.role !== 'player'}<div class="mini-avatar">
								{#if sender?.avatar}<img
										src={sender.avatar.url}
										alt=""
									/>{:else}{sender?.name.charAt(0) ?? '?'}{/if}
							</div>{/if}
						<div class="message-wrap">
							<span>{sender?.name ?? 'Người lạ'}</span>
							<p class="message-bubble">{event.content}</p>
						</div>
					</div>
				{:else if event.type === 'image'}<div
						class:outgoing={sender?.role === 'player'}
						class="message-row media-row"
					>
						<div class="message-wrap">
							<span>{sender?.name}</span>
							<figure class="image-message">
								<img
									src={event.image.url}
									alt={event.caption || `Ảnh từ ${sender?.name ?? 'nhân vật'}`}
									loading="lazy"
								/>{#if event.caption}<figcaption>{event.caption}</figcaption>{/if}
							</figure>
						</div>
					</div>
				{:else if event.type === 'audio'}<div
						class:outgoing={sender?.role === 'player'}
						class="message-row media-row"
					>
						<div class="message-wrap">
							<span>{sender?.name}</span>
							<div class="voice-message">
								<Volume2 />
								<div class="voice-wave" aria-hidden="true">
									{#each [8, 15, 22, 12, 25, 18, 10, 20, 14, 8] as height, bar (bar)}<i
											style:height={`${height}px`}
										></i>{/each}
								</div>
								<audio controls preload="metadata" src={event.audio.url}
									>Thiết bị không hỗ trợ audio.</audio
								>
							</div>
						</div>
					</div>{/if}
			{/each}
			{#if typing}<div class="message-row">
					<div class="mini-avatar">
						{#if typing.avatar}<img src={typing.avatar.url} alt="" />{:else}{typing.name.charAt(
								0
							)}{/if}
					</div>
					<div class="message-wrap">
						<span>{typing.name}</span>
						<div class="typing-bubble"><i></i><i></i><i></i></div>
					</div>
				</div>{/if}
			{#if activeChoice}<div class="choice-panel">
					<p>{activeChoice.prompt || 'Bạn sẽ trả lời thế nào?'}</p>
					{#each activeChoice.options as option (option.id)}<button onclick={() => choose(option)}
							>{option.text}</button
						>{/each}
				</div>{/if}
			{#if finished && visible.length}<div class="story-ended">
					<span>Kết thúc cuộc trò chuyện</span><button onclick={restart}
						><RotateCcw /> Đọc lại từ đầu</button
					>
				</div>{/if}
		</div>
		<footer class="phone-composer">
			<button
				onclick={advance}
				disabled={!!activeChoice || finished || waitingType === 'typing'}
				aria-label={waitingType === 'typing'
					? 'Nhân vật đang nhập'
					: waitingType === 'delay'
						? 'Bỏ qua thời gian chờ'
						: 'Hiện sự kiện tiếp theo'}
				><span
					>{activeChoice
						? 'Hãy chọn một câu trả lời'
						: finished
							? 'Cuộc trò chuyện đã kết thúc'
							: waitingType === 'typing'
								? `${typing?.name ?? 'Nhân vật'} đang nhập…`
								: waitingType === 'delay'
									? 'Chạm để bỏ qua'
									: 'Chạm để tiếp tục câu chuyện'}</span
				><i aria-hidden="true"></i></button
			>
			<div class="home-indicator" aria-hidden="true"></div>
		</footer>
	</section>
</div>

<style>
	.phone-shell {
		position: relative;
		width: min(100%, 420px, calc(47.6dvh - 2.618rem));
		height: auto;
		aspect-ratio: 77.6 / 163;
		padding: 8px;
		border: 1px solid #3a3637;
		border-radius: 45px;
		background: linear-gradient(145deg, #242122 0%, #070707 22%, #1b1819 78%, #050505 100%);
		box-shadow:
			0 30px 90px #000,
			0 0 0 2px #090909,
			0 0 45px rgba(126, 10, 15, 0.18),
			inset 0 0 0 1px #494345;
	}
	.phone-shell:before {
		content: '';
		position: absolute;
		inset: 4px;
		border: 1px solid #080808;
		border-radius: 41px;
		pointer-events: none;
	}
	.phone-hardware span {
		position: absolute;
		display: block;
		background: linear-gradient(#343031, #111);
		box-shadow: inset 0 0 0 1px #4a4445;
	}
	.volume-up {
		left: -4px;
		top: 145px;
		width: 4px;
		height: 54px;
		border-radius: 3px 0 0 3px;
	}
	.volume-down {
		left: -4px;
		top: 210px;
		width: 4px;
		height: 78px;
		border-radius: 3px 0 0 3px;
	}
	.power {
		right: -4px;
		top: 180px;
		width: 4px;
		height: 92px;
		border-radius: 0 3px 3px 0;
	}
	.phone-screen {
		position: relative;
		display: flex;
		height: 100%;
		flex-direction: column;
		overflow: hidden;
		border: 1px solid #111;
		border-radius: 37px;
		background: radial-gradient(circle at 50% 8%, rgba(105, 8, 14, 0.13), transparent 34%), #050505;
		color: #e8e5e5;
		touch-action: manipulation;
		cursor: pointer;
	}
	.status-bar {
		position: relative;
		display: grid;
		height: 39px;
		flex: none;
		grid-template-columns: 1fr 118px 1fr;
		align-items: center;
		padding: 0 20px;
		font: 600 11px/1 system-ui;
		color: #eee;
	}
	.dynamic-island {
		height: 27px;
		border-radius: 18px;
		background: #000;
		box-shadow: 0 0 0 1px #171717;
	}
	.camera {
		position: absolute;
		right: calc(50% - 44px);
		top: 15px;
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: radial-gradient(circle at 35% 35%, #26334d, #050608 70%);
		box-shadow: 0 0 5px #172744;
	}
	.status-icons {
		display: flex;
		justify-content: flex-end;
		gap: 5px;
	}
	.status-icons :global(svg) {
		width: 13px;
		height: 13px;
		stroke-width: 2;
	}
	.chat-header {
		display: flex;
		height: 65px;
		flex: none;
		align-items: center;
		gap: 9px;
		border-bottom: 1px solid #271316;
		background: rgba(8, 6, 6, 0.94);
		padding: 8px 11px;
		backdrop-filter: blur(14px);
	}
	.back-icon {
		width: 20px;
		color: #cf252b;
	}
	.back-icon :global(svg) {
		width: 20px;
	}
	.contact-avatar,
	.mini-avatar {
		position: relative;
		display: grid;
		place-items: center;
		overflow: hidden;
		border: 1px solid #5a171a;
		border-radius: 50%;
		background: #16090b;
		color: #ed3339;
		font: 600 16px Georgia;
	}
	.contact-avatar {
		width: 39px;
		height: 39px;
	}
	.contact-avatar.group-avatar {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1px;
		padding: 2px;
		border-radius: 12px;
	}
	.contact-avatar.group-avatar > span {
		display: grid;
		height: 100%;
		place-items: center;
		background: #250c0f;
		font-size: 8px;
	}
	.contact-avatar img,
	.mini-avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.contact-avatar i {
		position: absolute;
		right: 0;
		bottom: 0;
		width: 9px;
		height: 9px;
		border: 2px solid #090707;
		border-radius: 50%;
		background: #35a765;
	}
	.contact-copy {
		min-width: 0;
		flex: 1;
	}
	.contact-copy p {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font: 600 16px/1.2 Georgia;
		color: #f0eded;
	}
	.contact-copy span {
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 10px;
		color: #b92a2f;
	}
	.header-actions {
		display: flex;
		gap: 13px;
		color: #a9252a;
	}
	.header-actions :global(svg) {
		width: 17px;
	}
	.message-viewport {
		min-height: 0;
		flex: 1;
		overflow-y: auto;
		padding: 22px 13px 28px;
		scrollbar-width: none;
		cursor: pointer;
	}
	.message-viewport::-webkit-scrollbar {
		display: none;
	}
	.conversation-start {
		display: grid;
		min-height: 100%;
		place-content: center;
		text-align: center;
		color: #777;
	}
	.start-sigil {
		display: grid;
		width: 58px;
		height: 58px;
		margin: 0 auto 12px;
		place-items: center;
		border: 1px solid #66151a;
		border-radius: 50%;
		background: radial-gradient(circle, #351014, #090505 68%);
		font: 700 30px Georgia;
		color: #c4262c;
		box-shadow: 0 0 30px rgba(157, 20, 27, 0.17);
	}
	.conversation-start p {
		font: 600 19px Georgia;
		color: #d7d2d2;
	}
	.conversation-start span {
		margin-top: 7px;
		font-size: 11px;
		letter-spacing: 0.04em;
	}
	.message-row {
		display: flex;
		max-width: 88%;
		align-items: flex-end;
		gap: 7px;
		margin: 0 0 13px;
		animation: message-in 0.22s ease-out;
	}
	.message-row.outgoing {
		margin-left: auto;
		justify-content: flex-end;
	}
	.mini-avatar {
		width: 28px;
		height: 28px;
		flex: none;
		font-size: 11px;
	}
	.message-wrap {
		min-width: 0;
	}
	.message-wrap > span {
		display: block;
		margin: 0 0 3px 3px;
		font-size: 10px;
		color: #a78385;
	}
	.outgoing .message-wrap > span {
		text-align: right;
		color: #b62b30;
	}
	.message-bubble {
		border: 1px solid #242122;
		border-radius: 5px 14px 14px 14px;
		background: linear-gradient(145deg, #151314, #0c0b0b);
		padding: 9px 12px;
		font-size: 13px;
		line-height: 1.55;
		white-space: pre-wrap;
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.22);
	}
	.outgoing .message-bubble {
		border-color: #64171b;
		border-radius: 14px 5px 14px 14px;
		background: linear-gradient(145deg, #6f171c, #3c0d10);
		color: #fff;
	}
	.system-event {
		margin: 17px auto;
		max-width: 85%;
		text-align: center;
		font-size: 10px;
		line-height: 1.5;
		color: #746d6e;
	}
	.system-event:before,
	.system-event:after {
		content: ' — ';
	}
	.image-message {
		overflow: hidden;
		border: 1px solid #31181a;
		border-radius: 5px 14px 14px;
		background: #0b0909;
		padding: 3px;
	}
	.image-message img {
		display: block;
		max-height: 330px;
		width: 100%;
		border-radius: 3px 10px 4px 4px;
		object-fit: cover;
	}
	.image-message figcaption {
		padding: 7px 6px 5px;
		font-size: 11px;
		color: #b6acad;
	}
	.media-row {
		max-width: 84%;
	}
	.voice-message {
		display: flex;
		min-width: 255px;
		align-items: center;
		gap: 9px;
		border: 1px solid #37171a;
		border-radius: 5px 14px 14px;
		background: #100c0d;
		padding: 9px;
		color: #c9272d;
	}
	.voice-message :global(svg) {
		width: 18px;
		flex: none;
	}
	.voice-message audio {
		width: 84px;
		height: 25px;
		opacity: 0.7;
	}
	.voice-wave {
		display: flex;
		flex: 1;
		align-items: center;
		gap: 2px;
	}
	.voice-wave i {
		width: 2px;
		border-radius: 2px;
		background: #8b2025;
	}
	.typing-bubble {
		display: flex;
		gap: 4px;
		border: 1px solid #242122;
		border-radius: 5px 14px 14px;
		background: #121010;
		padding: 12px 14px;
	}
	.typing-bubble i {
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: #9a8f90;
		animation: typing 1s infinite;
	}
	.typing-bubble i:nth-child(2) {
		animation-delay: 0.16s;
	}
	.typing-bubble i:nth-child(3) {
		animation-delay: 0.32s;
	}
	.choice-panel {
		margin: 20px 2px;
		padding-top: 12px;
		border-top: 1px solid #371416;
	}
	.choice-panel p {
		text-align: center;
		font: 600 16px Georgia;
		color: #dfd9d9;
	}
	.choice-panel button {
		display: block;
		width: 100%;
		margin-top: 8px;
		border: 1px solid #5a171b;
		border-radius: 9px;
		background: #0b0809;
		padding: 10px 12px;
		text-align: left;
		font-size: 12px;
		color: #d7cfd0;
	}
	.choice-panel button:hover,
	.choice-panel button:focus-visible {
		border-color: #d42a30;
		background: #190a0c;
		color: #fff;
		outline: none;
	}
	.story-ended {
		margin: 28px auto;
		text-align: center;
		font-size: 10px;
		color: #696263;
	}
	.story-ended button {
		display: flex;
		margin: 10px auto 0;
		align-items: center;
		gap: 6px;
		border: 1px solid #441417;
		border-radius: 8px;
		padding: 7px 10px;
		color: #b9272c;
	}
	.story-ended :global(svg) {
		width: 13px;
	}
	.phone-composer {
		flex: none;
		border-top: 1px solid #211113;
		background: #080606;
		padding: 8px 12px 7px;
	}
	.phone-composer button {
		display: flex;
		width: 100%;
		height: 38px;
		align-items: center;
		justify-content: space-between;
		border: 1px solid #282324;
		border-radius: 20px;
		background: #0e0c0d;
		padding: 0 13px;
		color: #817a7b;
	}
	.phone-composer button:not(:disabled):hover {
		border-color: #5c171a;
		color: #c92b31;
	}
	.phone-composer button span {
		font-size: 11px;
	}
	.phone-composer button i {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: #9f2025;
		box-shadow: 0 0 8px #a91f24;
	}
	.home-indicator {
		width: 112px;
		height: 4px;
		margin: 8px auto 0;
		border-radius: 3px;
		background: #d1cdcd;
	}
	@keyframes typing {
		0%,
		60%,
		100% {
			transform: translateY(0);
			opacity: 0.35;
		}
		30% {
			transform: translateY(-3px);
			opacity: 1;
		}
	}
	@keyframes message-in {
		from {
			transform: translateY(7px);
			opacity: 0;
		}
	}
	@media (max-width: 640px) {
		.phone-shell {
			width: min(100%, calc(47.6dvh - 2.38rem));
			height: auto;
			aspect-ratio: 77.6 / 163;
			padding: 5px;
			border-radius: 38px;
		}
		.phone-screen {
			border-radius: 33px;
		}
		.status-bar {
			grid-template-columns: 1fr 102px 1fr;
		}
		.phone-shell:before {
			border-radius: 35px;
		}
		.volume-up,
		.volume-down,
		.power {
			display: none;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.message-row,
		.typing-bubble i {
			animation: none;
		}
	}
</style>
