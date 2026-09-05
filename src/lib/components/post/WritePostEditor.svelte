<script lang="ts">
	import { beforeNavigate } from '$app/navigation';
	import { LoaderCircle, Save, Send } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { createPostId, getPost, saveNewPost, updatePost } from '$lib/services/posts';
	import { listCommunities } from '$lib/services/communities';
	import { listPostCategories } from '$lib/services/post-categories';
	import type {
		CloudinaryAsset,
		Community,
		PostCategory,
		PostCategoryDefinition
	} from '$lib/types';
	import {
		POST_CONTENT_MAX_LENGTH,
		POST_TITLE_MAX_LENGTH,
		validatePublishablePost
	} from '$lib/validation/post';
	import PostMediaUploader from './PostMediaUploader.svelte';
	import PostTagEditor from './PostTagEditor.svelte';

	let postId = $state('');
	let title = $state('');
	let content = $state('');
	let category = $state<PostCategory>('');
	let categories = $state<PostCategoryDefinition[]>([]);
	let tags = $state<string[]>([]);
	let thumbnail = $state<CloudinaryAsset | null>(null);
	let images = $state<CloudinaryAsset[]>([]);
	let communityId = $state<string | null>(null);
	let communities = $state<Community[]>([]);
	let saved = $state(false);
	let dirty = $state(false);
	let pending = $state(false);
	let errorMessage = $state('');
	let successMessage = $state('');
	let moderationStatus = $state<'not_submitted' | 'pending' | 'approved' | 'rejected'>(
		'not_submitted'
	);
	let rejectionReason = $state<string | null>(null);
	let submissionVersion = $state(0);
	let mediaUploader = $state<{ isUploading(): boolean }>();

	const meaningful = $derived(
		Boolean(title.trim() || content.trim() || tags.length || thumbnail || images.length)
	);

	onMount(async () => {
		try {
			[categories, communities] = await Promise.all([
				listPostCategories(),
				listCommunities().catch(() => [])
			]);
			const editId = new URLSearchParams(location.search).get('edit');
			if (editId) {
				const post = await getPost(editId);
				postId = post.id;
				title = post.title;
				content = post.content;
				category = post.category;
				tags = post.tags;
				thumbnail = post.thumbnail;
				images = post.images;
				communityId = post.communityId;
				moderationStatus = post.moderationStatus;
				rejectionReason = post.rejectionReason;
				submissionVersion = post.submissionVersion;
				saved = true;
				dirty = false;
			} else {
				postId = createPostId();
				category = categories[0]?.id ?? '';
			}
		} catch (reason) {
			errorMessage =
				reason instanceof Error ? reason.message : 'Firebase chưa được cấu hình để tạo bài viết.';
		}
	});

	$effect(() => {
		void [title, content, category, tags, thumbnail, images];
		if (meaningful) dirty = true;
	});

	beforeNavigate(({ cancel }) => {
		if (dirty && meaningful && !window.confirm('Bạn có thay đổi chưa lưu. Rời khỏi trang?'))
			cancel();
	});

	function input(status: 'draft' | 'published') {
		return {
			title,
			content,
			category,
			tags,
			communityId,
			thumbnail,
			images,
			status
		} as const;
	}

	async function persist(status: 'draft' | 'published') {
		if (moderationStatus === 'pending') {
			errorMessage = 'Bài viết đang được xét duyệt và tạm thời không thể chỉnh sửa.';
			return;
		}
		if (!postId) {
			errorMessage = 'Chưa thể tạo ID bài viết. Hãy kiểm tra cấu hình Firebase.';
			return;
		}
		if (mediaUploader?.isUploading()) {
			errorMessage = 'Hãy đợi ảnh tải xong trước khi lưu.';
			return;
		}
		if (status === 'published') {
			const problems = validatePublishablePost(input(status));
			if (problems.length) {
				errorMessage = problems[0];
				return;
			}
		}
		pending = true;
		errorMessage = '';
		successMessage = '';
		try {
			const post = saved
				? await updatePost(postId, input(status))
				: await saveNewPost(postId, input(status));
			saved = true;
			moderationStatus = post.moderationStatus;
			rejectionReason = post.rejectionReason;
			submissionVersion = post.submissionVersion;
			dirty = false;
			if (status === 'published') {
				successMessage = 'Nội dung đã được gửi và đang chờ quản trị viên phê duyệt.';
			} else {
				successMessage = 'Bản nháp đã được lưu.';
			}
		} catch (reason) {
			errorMessage = reason instanceof Error ? reason.message : 'Không thể lưu bài viết.';
		} finally {
			pending = false;
		}
	}
</script>

<div class="mx-auto w-full max-w-6xl py-5 sm:py-8">
	{#if moderationStatus === 'pending'}<div
			class="mb-5 border border-border-red bg-red-muted/15 p-4"
		>
			<p class="font-semibold text-red">ĐANG CHỜ PHÊ DUYỆT</p>
			<p class="mt-1 text-sm text-text-secondary">
				Nội dung sẽ được hiển thị công khai sau khi được quản trị viên phê duyệt. Bản gửi lần {submissionVersion}
				đang được khóa chỉnh sửa.
			</p>
		</div>{:else if moderationStatus === 'rejected'}<div
			class="mb-5 border border-error/50 bg-error/5 p-4"
		>
			<p class="font-semibold text-error">BỊ TỪ CHỐI</p>
			<p class="mt-2 text-sm text-text-secondary">Phản hồi từ quản trị viên: {rejectionReason}</p>
		</div>{/if}
	<header class="mb-6 border-b border-border pb-5">
		<p class="text-[0.68rem] font-semibold tracking-[0.25em] text-red uppercase">Phòng viết</p>
		<div class="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<h1 class="font-editorial text-4xl font-semibold text-text sm:text-5xl">
					Kể lại điều đã xảy ra
				</h1>
				<p class="mt-1 text-sm text-text-muted">
					Nội dung được lưu dưới dạng văn bản thuần, an toàn và dễ đọc.
				</p>
			</div>
		</div>
	</header>

	<fieldset
		disabled={moderationStatus === 'pending'}
		class:opacity-75={moderationStatus === 'pending'}
		class="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]"
	>
		<section class="border border-border bg-surface p-5 sm:p-7">
			<label class="block"
				><span class="sr-only">Tiêu đề bài viết</span><input
					bind:value={title}
					maxlength={POST_TITLE_MAX_LENGTH}
					class="w-full border-0 border-b border-border bg-transparent pb-4 font-editorial text-3xl font-semibold text-text outline-none placeholder:text-text-muted focus:border-red sm:text-4xl"
					placeholder="Tiêu đề câu chuyện…"
				/></label
			>
			<div class="mt-6">
				<label
					for="post-content"
					class="mb-2 block text-xs font-semibold tracking-wider text-text-muted uppercase"
					>Nội dung</label
				><Textarea
					id="post-content"
					bind:value={content}
					maxlength={POST_CONTENT_MAX_LENGTH}
					class="min-h-[28rem] resize-y border-0 bg-transparent px-0 text-[1rem] leading-8 focus-visible:ring-0"
					placeholder="Bắt đầu từ khoảnh khắc mọi thứ trở nên không bình thường…"
				/>
			</div>
			<p class="mt-2 text-right text-xs text-text-muted">
				{content.length.toLocaleString('vi-VN')} / {POST_CONTENT_MAX_LENGTH.toLocaleString('vi-VN')}
			</p>
		</section>

		<aside class="space-y-6 border border-border bg-surface p-5 lg:sticky lg:top-24 lg:self-start">
			<div>
				<label
					for="post-category"
					class="mb-2 block text-xs font-semibold tracking-wider text-text-muted uppercase"
					>Danh mục</label
				><select
					id="post-category"
					bind:value={category}
					class="h-10 w-full border border-border bg-surface-2 px-3 text-sm text-text outline-none focus:border-red"
					>{#if categories.length === 0}<option value="">Chưa có danh mục</option>{/if}
					{#each categories as item (item.id)}<option value={item.id}>{item.name}</option
						>{/each}</select
				>
			</div>
			<div>
				<label
					for="post-community"
					class="mb-2 block text-xs font-semibold tracking-wider text-text-muted uppercase"
					>Cộng đồng</label
				><select
					bind:value={communityId}
					id="post-community"
					class="h-10 w-full border border-border bg-surface-2 px-3 text-sm text-text-secondary"
					><option value={null}>Không chọn cộng đồng</option
					>{#each communities as community (community.id)}<option value={community.id}
							>{community.name}</option
						>{/each}</select
				>
			</div>
			<div>
				<p class="mb-2 text-xs font-semibold tracking-wider text-text-muted uppercase">Thẻ</p>
				<PostTagEditor bind:tags />
			</div>
			<PostMediaUploader bind:this={mediaUploader} {postId} bind:thumbnail bind:images />
			{#if errorMessage}<p
					role="alert"
					class="border-l-2 border-error bg-error/10 px-3 py-2 text-sm text-error"
				>
					{errorMessage}
				</p>{/if}
			{#if successMessage}<p
					role="status"
					class="border-l-2 border-success bg-success/10 px-3 py-2 text-sm text-success"
				>
					{successMessage}
				</p>{/if}
			<div class="grid gap-2">
				<Button
					type="button"
					variant="outline"
					onclick={() => persist('draft')}
					disabled={pending || moderationStatus === 'pending'}
					><Save class="size-4" /> Lưu bản nháp</Button
				><Button
					type="button"
					onclick={() => persist('published')}
					disabled={pending || moderationStatus === 'pending'}
					>{#if pending}<LoaderCircle class="size-4 animate-spin" />{:else}<Send
							class="size-4"
						/>{/if}
					{moderationStatus === 'rejected' ? 'Gửi phê duyệt lại' : 'Gửi phê duyệt'}</Button
				>
			</div>
		</aside>
	</fieldset>
</div>
