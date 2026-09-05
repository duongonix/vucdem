import { getFirebaseAuth } from '$lib/firebase/auth';
import type { InteractiveStoryContent } from '$lib/types';

export interface ApprovalPost {
	id: string;
	title: string;
	content: string;
	excerpt: string;
	authorName: string;
	category: string;
	tags: string[];
	thumbnail: { url: string } | null;
	images: { url: string }[];
	submissionVersion: number;
	submittedAt: number | null;
}

export interface ApprovalStory {
	id: string;
	title: string;
	slug: string;
	description: string;
	authorName: string;
	format: 'short' | 'serial';
	contentFormat: string;
	tags: string[];
	cover: { url: string } | null;
	submissionVersion: number;
	submittedAt: number | null;
}

export interface ApprovalChapter {
	id: string;
	title: string;
	chapterNumber: number;
	content: string;
	contentFormat: string;
	audio: { url: string; duration?: number } | null;
	submissionVersion: number;
	submittedAt: number | null;
}

export interface ApprovalQueue {
	posts: ApprovalPost[];
	shortStories: { story: ApprovalStory; chapter: ApprovalChapter | null }[];
	serialStories: ApprovalStory[];
	serialChapters: { story: ApprovalStory | null; chapter: ApprovalChapter }[];
}

async function headers(json = false) {
	const user = getFirebaseAuth().currentUser;
	if (!user) throw new Error('Bạn cần đăng nhập.');
	return {
		authorization: `Bearer ${await user.getIdToken()}`,
		...(json ? { 'content-type': 'application/json' } : {})
	};
}

export async function listApprovalQueue(): Promise<ApprovalQueue> {
	const response = await fetch('/api/admin/approvals', { headers: await headers() });
	const body = await response.json().catch(() => ({}));
	if (!response.ok) throw new Error(body.message ?? 'Không thể tải hàng chờ phê duyệt.');
	return body as ApprovalQueue;
}

export async function reviewApproval(input: {
	kind: 'post' | 'short_story' | 'serial_story' | 'chapter';
	id: string;
	storyId?: string;
	decision: 'approved' | 'rejected';
	reason: string | null;
	expectedSubmissionVersion: number;
}) {
	const response = await fetch('/api/admin/approvals/review', {
		method: 'PATCH',
		headers: await headers(true),
		body: JSON.stringify(input)
	});
	const body = await response.json().catch(() => ({}));
	if (!response.ok) throw new Error(body.message ?? 'Không thể xét duyệt nội dung.');
}

export async function getApprovalDetail(
	kind: string,
	id: string,
	storyId?: string
): Promise<{
	reviews: {
		id: string;
		decision: 'approved' | 'rejected';
		reason: string | null;
		reviewerName: string;
		submissionVersion: number;
		createdAt: number;
	}[];
	interactive: InteractiveStoryContent | null;
}> {
	const query = new URLSearchParams({ kind, id });
	if (storyId) query.set('storyId', storyId);
	const response = await fetch(`/api/admin/approvals/detail?${query}`, {
		headers: await headers()
	});
	const body = await response.json().catch(() => ({}));
	if (!response.ok) throw new Error(body.message ?? 'Không thể tải chi tiết xét duyệt.');
	return body;
}
