<script lang="ts">
	import {
		ArrowDown,
		ArrowUp,
		Copy,
		Image,
		MessageCircle,
		Pause,
		Plus,
		Sparkles,
		Trash2,
		Volume2
	} from '@lucide/svelte';
	import type { InteractiveStoryContent, InteractiveStoryEvent } from '$lib/types';
	import { createInteractiveId } from '$lib/types/interactive-story';
	import { uploadAudio, uploadImage } from '$lib/cloudinary/client';
	import InteractiveCharacterPanel from './InteractiveCharacterPanel.svelte';
	import InteractiveStoryPlayer from './InteractiveStoryPlayer.svelte';
	let {
		storyId,
		chapterId,
		value = $bindable(),
		uploading = $bindable(false)
	}: {
		storyId: string;
		chapterId: string;
		value: InteractiveStoryContent;
		uploading?: boolean;
	} = $props();
	let senderId = $state(value.characters[0]?.id ?? '');
	let message = $state('');
	let showPreview = $state(false);
	let errorMessage = $state('');
	const normalized = $derived({
		...value,
		events: value.events.map((event, order) => ({ ...event, order }))
	});
	function replaceEvents(events: InteractiveStoryEvent[]) {
		value = { ...value, events: events.map((event, order) => ({ ...event, order })) };
	}
	function addMessage() {
		if (!message.trim() || !senderId) return;
		replaceEvents([
			...value.events,
			{
				id: createInteractiveId('event'),
				order: value.events.length,
				type: 'message',
				senderId,
				content: message.trim()
			}
		]);
		message = '';
	}
	function addEvent(type: 'choice' | 'system' | 'typing' | 'delay') {
		const id = createInteractiveId('event');
		const order = value.events.length;
		if (type === 'choice')
			replaceEvents([
				...value.events,
				{
					id,
					order,
					type,
					prompt: 'Bạn sẽ trả lời thế nào?',
					options: [
						{ id: createInteractiveId('option'), text: 'Lựa chọn thứ nhất' },
						{ id: createInteractiveId('option'), text: 'Lựa chọn thứ hai' }
					]
				}
			]);
		else if (type === 'system')
			replaceEvents([
				...value.events,
				{ id, order, type, content: 'Một điều gì đó vừa thay đổi.' }
			]);
		else if (type === 'typing')
			replaceEvents([
				...value.events,
				{ id, order, type, characterId: senderId, durationMs: 2000 }
			]);
		else replaceEvents([...value.events, { id, order, type, durationMs: 2000 }]);
	}
	function move(index: number, offset: number) {
		const target = index + offset;
		if (target < 0 || target >= value.events.length) return;
		const events = [...value.events];
		[events[index], events[target]] = [events[target], events[index]];
		replaceEvents(events);
	}
	function remove(index: number) {
		replaceEvents(value.events.filter((_, itemIndex) => itemIndex !== index));
	}
	function duplicate(event: InteractiveStoryEvent, index: number) {
		const copy = structuredClone(event);
		copy.id = createInteractiveId('event');
		const events = [...value.events];
		events.splice(index + 1, 0, copy);
		replaceEvents(events);
	}
	function updateEvent(index: number, patch: Partial<InteractiveStoryEvent>) {
		const events = [...value.events];
		events[index] = { ...events[index], ...patch } as InteractiveStoryEvent;
		replaceEvents(events);
	}
	async function upload(event: Event, kind: 'image' | 'audio') {
		const file = (event.currentTarget as HTMLInputElement).files?.[0];
		if (!file) return;
		uploading = true;
		errorMessage = '';
		try {
			const slot = value.events.length + 1;
			const id = createInteractiveId('event');
			if (kind === 'image') {
				const image = await uploadImage(file, {
					kind: 'interactive-image',
					resourceId: storyId,
					chapterId,
					slot
				});
				replaceEvents([
					...value.events,
					{ id, order: value.events.length, type: 'image', senderId, image, caption: '' }
				]);
			} else {
				const audio = await uploadAudio(file, {
					storyId,
					chapterId,
					kind: 'interactive-audio',
					slot
				});
				replaceEvents([
					...value.events,
					{ id, order: value.events.length, type: 'audio', senderId, audio }
				]);
			}
		} catch (reason) {
			errorMessage = reason instanceof Error ? reason.message : 'Không thể tải media.';
		} finally {
			uploading = false;
			(event.currentTarget as HTMLInputElement).value = '';
		}
	}
</script>

<section class="border border-border-red bg-surface-2">
	<div class="grid gap-3 p-3 lg:grid-cols-[220px_minmax(0,1fr)]">
		<InteractiveCharacterPanel
			{storyId}
			bind:characters={value.characters}
			events={value.events}
			onuploadstate={(state) => (uploading = state)}
		/>
		<div class="min-w-0 border border-border bg-[#070707] p-3 sm:p-4">
			<div
				class="mb-4 grid gap-3 border-b border-border pb-4 sm:grid-cols-[10rem_minmax(0,1fr)_auto] sm:items-end"
			>
				<label
					><span class="mb-1 block text-[10px] tracking-wider text-text-muted uppercase"
						>Kiểu header</span
					><select
						value={value.conversationType ?? 'direct'}
						onchange={(event) => {
							const conversationType = event.currentTarget.value as 'direct' | 'group';
							value = {
								...value,
								conversationType,
								conversationCharacterId:
									conversationType === 'direct'
										? (value.conversationCharacterId ??
											value.characters.find((item) => item.role !== 'player')?.id ??
											null)
										: value.conversationCharacterId
							};
						}}
						class="h-9 w-full border border-border bg-background px-2 text-xs text-text outline-none focus:border-red"
						><option value="direct">Cá nhân</option><option value="group">Nhóm</option></select
					></label
				>
				{#if (value.conversationType ?? 'direct') === 'direct'}<label class="min-w-52 flex-1"
						><span class="mb-1 block text-[10px] tracking-wider text-text-muted uppercase"
							>Người trên header</span
						><select
							value={value.conversationCharacterId ?? ''}
							onchange={(event) =>
								(value = { ...value, conversationCharacterId: event.currentTarget.value || null })}
							class="h-9 w-full border border-border bg-background px-2 text-xs text-text outline-none focus:border-red"
							><option value="">Tự động chọn</option
							>{#each value.characters.filter((item) => item.role !== 'player') as character (character.id)}<option
									value={character.id}>{character.name}</option
								>{/each}</select
						></label
					>
				{:else}<label class="min-w-52 flex-1"
						><span class="mb-1 block text-[10px] tracking-wider text-text-muted uppercase"
							>Tên nhóm</span
						><input
							bind:value={value.conversationTitle}
							placeholder="Ví dụ: Ký túc xá 404"
							class="w-full border-b border-border bg-transparent py-2 text-sm text-text outline-none focus:border-red"
						/><span class="mt-1 block truncate text-[10px] text-text-muted"
							>{value.characters.map((item) => item.name).join(' · ')}</span
						></label
					>{/if}
				<button
					type="button"
					onclick={() => (showPreview = true)}
					class="border border-red-dark px-3 py-2 text-xs text-red hover:border-red"
					>Xem trước</button
				>
			</div>
			<div class="max-h-[650px] space-y-3 overflow-y-auto pr-1">
				{#if !value.events.length}<div
						class="border border-dashed border-border p-10 text-center text-sm text-text-muted"
					>
						Kịch bản còn trống. Viết tin nhắn đầu tiên ở bên dưới.
					</div>{/if}
				{#each value.events as event, index (event.id)}{@const sender =
						'senderId' in event
							? value.characters.find((item) => item.id === event.senderId)
							: null}
					<article
						class="group relative border border-border bg-surface p-3"
						class:ml-auto={sender?.role === 'player'}
						class:max-w-[88%]={event.type === 'message'}
					>
						<div
							class="absolute top-1 right-1 flex bg-surface opacity-0 group-focus-within:opacity-100 group-hover:opacity-100"
						>
							<button type="button" onclick={() => move(index, -1)} aria-label="Đưa lên" class="p-1"
								><ArrowUp class="size-3" /></button
							><button
								type="button"
								onclick={() => move(index, 1)}
								aria-label="Đưa xuống"
								class="p-1"><ArrowDown class="size-3" /></button
							><button
								type="button"
								onclick={() => duplicate(event, index)}
								aria-label="Nhân bản"
								class="p-1"><Copy class="size-3" /></button
							><button
								type="button"
								onclick={() => remove(index)}
								aria-label="Xóa"
								class="p-1 text-error"><Trash2 class="size-3" /></button
							>
						</div>
						{#if event.type === 'message'}<select
								value={event.senderId}
								onchange={(e) => updateEvent(index, { senderId: e.currentTarget.value })}
								class="mb-1 bg-transparent text-xs text-red"
								>{#each value.characters as character (character.id)}<option value={character.id}
										>{character.name}</option
									>{/each}</select
							><textarea
								value={event.content}
								oninput={(e) => updateEvent(index, { content: e.currentTarget.value })}
								class="min-h-16 w-full resize-y bg-transparent text-sm leading-6 text-text outline-none"
								aria-label="Nội dung tin nhắn"></textarea>
						{:else if event.type === 'choice'}<p
								class="mb-2 text-[10px] tracking-wider text-red uppercase"
							>
								Lựa chọn
							</p>
							<input
								value={event.prompt}
								oninput={(e) => updateEvent(index, { prompt: e.currentTarget.value })}
								class="mb-2 w-full border-b border-border bg-transparent py-1 text-sm text-text"
							/>{#each event.options as option, optionIndex (option.id)}<input
									value={option.text}
									oninput={(e) => {
										const options = [...event.options];
										options[optionIndex] = { ...option, text: e.currentTarget.value };
										updateEvent(index, { options });
									}}
									class="mb-1 w-full border border-border bg-background px-2 py-1.5 text-xs text-text"
								/>{/each}
						{:else if event.type === 'system'}<p class="text-[10px] text-red uppercase">System</p>
							<input
								value={event.content}
								oninput={(e) => updateEvent(index, { content: e.currentTarget.value })}
								class="w-full bg-transparent py-2 text-center text-sm text-text-muted italic"
							/>
						{:else if event.type === 'typing'}<p class="text-sm text-text-muted">
								{value.characters.find((item) => item.id === event.characterId)?.name} đang nhập…
							</p>
							<input
								type="range"
								min="250"
								max="10000"
								step="250"
								value={event.durationMs}
								oninput={(e) => updateEvent(index, { durationMs: Number(e.currentTarget.value) })}
								aria-label="Thời gian đang nhập"
							/> <span class="text-xs text-text-muted">{event.durationMs / 1000}s</span>
						{:else if event.type === 'delay'}<p class="text-center text-xs text-text-muted">
								— Đợi {event.durationMs / 1000} giây —
							</p>
							<input
								class="w-full"
								type="range"
								min="250"
								max="10000"
								step="250"
								value={event.durationMs}
								oninput={(e) => updateEvent(index, { durationMs: Number(e.currentTarget.value) })}
								aria-label="Thời gian tạm dừng"
							/>
						{:else if event.type === 'image'}<p class="mb-1 text-xs text-red">{sender?.name}</p>
							<img src={event.image.url} alt="Media sự kiện" class="max-h-64 object-cover" /><input
								value={event.caption}
								oninput={(e) => updateEvent(index, { caption: e.currentTarget.value })}
								placeholder="Chú thích (không bắt buộc)"
								class="mt-2 w-full bg-transparent text-xs text-text"
							/>
						{:else}<p class="mb-2 text-xs text-red">{sender?.name} · Audio</p>
							<audio controls src={event.audio.url} class="h-8 max-w-full"></audio>{/if}
					</article>{/each}
			</div>
			<div class="mt-4 border-t border-border pt-4">
				<div class="flex gap-2">
					<select
						bind:value={senderId}
						class="max-w-36 border border-border bg-background px-2 text-xs text-text"
						>{#each value.characters as character (character.id)}<option value={character.id}
								>{character.name}</option
							>{/each}</select
					><textarea
						bind:value={message}
						onkeydown={(event) => {
							if (event.key === 'Enter' && !event.shiftKey) {
								event.preventDefault();
								addMessage();
							}
						}}
						placeholder="Viết tin nhắn…"
						class="min-h-11 flex-1 resize-none border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-red"
					></textarea><button
						type="button"
						onclick={addMessage}
						class="border border-red-dark px-3 text-red"
						aria-label="Thêm tin nhắn"><MessageCircle class="size-4" /></button
					>
				</div>
				<div class="mt-2 flex flex-wrap gap-1 text-xs">
					<button type="button" onclick={() => addEvent('choice')} class="event-button"
						><Plus class="size-3" /> Lựa chọn</button
					><button type="button" onclick={() => addEvent('system')} class="event-button"
						><Sparkles class="size-3" /> System</button
					><button type="button" onclick={() => addEvent('typing')} class="event-button"
						><MessageCircle class="size-3" /> Typing</button
					><button type="button" onclick={() => addEvent('delay')} class="event-button"
						><Pause class="size-3" /> Delay</button
					><label class="event-button cursor-pointer"
						><Image class="size-3" /> Ảnh<input
							type="file"
							accept="image/jpeg,image/png,image/webp"
							class="sr-only"
							onchange={(e) => upload(e, 'image')}
							disabled={uploading}
						/></label
					><label class="event-button cursor-pointer"
						><Volume2 class="size-3" /> Audio<input
							type="file"
							accept="audio/*"
							class="sr-only"
							onchange={(e) => upload(e, 'audio')}
							disabled={uploading}
						/></label
					>
				</div>
				{#if errorMessage}<p class="mt-2 text-xs text-error">{errorMessage}</p>{/if}
			</div>
		</div>
	</div>
</section>
{#if showPreview}<div
		class="fixed inset-0 z-50 overflow-y-auto bg-black/90 p-3 sm:p-8"
		role="dialog"
		aria-modal="true"
		aria-label="Xem trước truyện nhập vai"
	>
		<button
			type="button"
			onclick={() => (showPreview = false)}
			class="mx-auto mb-3 block border border-border px-4 py-2 text-sm text-text"
			>Đóng xem trước</button
		><InteractiveStoryPlayer content={normalized} />
	</div>{/if}

<style>
	.event-button {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		border: 1px solid var(--color-border);
		padding: 0.45rem 0.6rem;
		color: var(--color-text-muted);
	}
	.event-button:hover {
		border-color: var(--color-border-red);
		color: var(--color-red);
	}
</style>
