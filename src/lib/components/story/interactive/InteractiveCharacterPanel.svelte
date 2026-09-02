<script lang="ts">
	import { Plus, Trash2, UserRound } from '@lucide/svelte';
	import type { InteractiveCharacter, InteractiveStoryEvent } from '$lib/types';
	import { createInteractiveId } from '$lib/types/interactive-story';
	import { uploadImage } from '$lib/cloudinary/client';
	let {
		storyId,
		characters = $bindable(),
		events,
		onuploadstate
	}: {
		storyId: string;
		characters: InteractiveCharacter[];
		events: InteractiveStoryEvent[];
		onuploadstate: (uploading: boolean) => void;
	} = $props();
	let errorMessage = $state('');
	function add() {
		characters = [
			...characters,
			{
				id: createInteractiveId('character'),
				name: `Nhân vật ${characters.length}`,
				avatar: null,
				role: 'character'
			}
		];
	}
	function remove(character: InteractiveCharacter) {
		if (character.role === 'player') {
			errorMessage = 'Không thể xóa nhân vật người đọc.';
			return;
		}
		const usage = events.filter(
			(event) =>
				('senderId' in event && event.senderId === character.id) ||
				(event.type === 'typing' && event.characterId === character.id)
		).length;
		if (usage) {
			errorMessage = `Nhân vật này đang được sử dụng trong ${usage} sự kiện.`;
			return;
		}
		characters = characters.filter((item) => item.id !== character.id);
		errorMessage = '';
	}
	async function uploadAvatar(event: Event, character: InteractiveCharacter, index: number) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		onuploadstate(true);
		errorMessage = '';
		try {
			const avatar = await uploadImage(file, {
				kind: 'interactive-avatar',
				resourceId: storyId,
				slot: index + 1
			});
			characters = characters.map((item) =>
				item.id === character.id ? { ...item, avatar } : item
			);
		} catch (reason) {
			errorMessage = reason instanceof Error ? reason.message : 'Không thể tải avatar.';
		} finally {
			onuploadstate(false);
			input.value = '';
		}
	}
</script>

<aside class="border border-border bg-background p-3">
	<div class="mb-3 flex items-center justify-between">
		<h3 class="text-xs font-semibold tracking-[.18em] text-red uppercase">Nhân vật</h3>
		<button
			type="button"
			onclick={add}
			class="p-1 text-text-muted hover:text-red"
			aria-label="Thêm nhân vật"><Plus class="size-4" /></button
		>
	</div>
	<div class="space-y-2">
		{#each characters as character, index (character.id)}<div
				class="group flex items-center gap-2 border border-border bg-surface p-2"
			>
				<label
					class="grid size-8 shrink-0 cursor-pointer place-items-center overflow-hidden border border-border-red bg-surface-2"
					title="Đổi avatar"
					>{#if character.avatar}<img
							src={character.avatar.url}
							alt=""
							class="size-full object-cover"
						/>{:else}<UserRound class="size-4 text-red" />{/if}<input
						class="sr-only"
						type="file"
						accept="image/jpeg,image/png,image/webp"
						onchange={(event) => uploadAvatar(event, character, index)}
					/></label
				><label class="min-w-0 flex-1"
					><span class="sr-only">Tên nhân vật</span><input
						bind:value={character.name}
						maxlength="48"
						class="w-full bg-transparent text-sm text-text outline-none focus:border-b focus:border-red"
					/>{#if character.role === 'player'}<span
							class="text-[9px] tracking-wider text-red uppercase">Player</span
						>{/if}</label
				>{#if character.role !== 'player'}<button
						type="button"
						onclick={() => remove(character)}
						class="p-1 text-text-muted opacity-0 group-hover:opacity-100 focus:opacity-100"
						aria-label={`Xóa ${character.name}`}><Trash2 class="size-3.5" /></button
					>{/if}
			</div>{/each}
	</div>
	<button
		type="button"
		onclick={add}
		class="mt-3 flex w-full items-center justify-center gap-2 border border-dashed border-border px-2 py-2 text-xs text-text-muted hover:border-red-dark hover:text-red"
		><Plus class="size-3.5" /> Thêm nhân vật</button
	>
	{#if errorMessage}<p class="mt-2 text-xs text-error" role="alert">{errorMessage}</p>{/if}
</aside>
