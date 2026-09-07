<script lang="ts">
	import { authStore } from '$lib/stores/auth.svelte';
	import { watchNotifications } from '$lib/services/notifications';
	import { watchConversations } from '$lib/services/messages';
	import { showToast } from '$lib/stores/toast';

	const notificationCopy: Record<string, string> = {
		comment: 'đã bình luận về nội dung của bạn',
		reply: 'đã trả lời bình luận của bạn',
		follow: 'đã theo dõi bạn',
		upvote: 'đã thích bài viết của bạn',
		story_update: 'đã đăng chương truyện mới',
		mention: 'đã nhắc đến bạn',
		story_rating: 'đã đánh giá truyện của bạn',
		story_status: 'đã cập nhật trạng thái truyện bạn theo dõi',
		content_reported: 'đã ghi nhận báo cáo về nội dung của bạn',
		content_hidden: 'đã điều chỉnh trạng thái nội dung của bạn',
		system_announcement: 'đã gửi thông báo hệ thống',
		reading_reminder: 'có chương mới trong truyện bạn đang đọc dở',
		content_approved: 'đã phê duyệt nội dung của bạn',
		content_rejected: 'đã gửi phản hồi kiểm duyệt',
		author_post: 'đã đăng bài viết mới',
		author_story: 'đã đăng truyện mới',
		author_chapter: 'đã đăng chương truyện mới'
	};
	function notificationDescription(item: {
		type: string;
		targetType: string;
		message?: string | null;
	}): string {
		if (item.message) return item.message;
		if (item.type === 'follow' && item.targetType === 'story') return 'đã theo dõi truyện của bạn';
		return notificationCopy[item.type] ?? 'đã tương tác với bạn';
	}

	$effect(() => {
		if (authStore.status !== 'authenticated') return;
		let initialized = false;
		let known = new Set<string>();
		return watchNotifications(
			(value) => {
				const unread = value.notifications.filter((item) => !item.isRead);
				if (initialized) {
					for (const item of unread.filter((entry) => !known.has(entry.id)).slice(0, 3)) {
						showToast({
							kind: 'notification',
							title: 'Thông báo mới',
							description: `${item.actorName} ${notificationDescription(item)}`,
							href: '/notifications'
						});
					}
				}
				known = new Set(unread.map((item) => item.id));
				initialized = true;
			},
			{ unread: true }
		);
	});

	$effect(() => {
		if (authStore.status !== 'authenticated') return;
		let initialized = false;
		let unreadByConversation = new Map<string, number>();
		return watchConversations((value) => {
			if (initialized) {
				for (const conversation of value.conversations) {
					const previous = unreadByConversation.get(conversation.id) ?? 0;
					if (conversation.unreadCount > previous && !conversation.muted) {
						showToast({
							kind: 'message',
							title: `Tin nhắn từ ${conversation.participant.displayName}`,
							description: conversation.lastMessage,
							href: '/messages'
						});
					}
				}
			}
			unreadByConversation = new Map(
				value.conversations.map((conversation) => [conversation.id, conversation.unreadCount])
			);
			initialized = true;
		});
	});
</script>
