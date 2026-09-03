import { getFirebaseAuth } from '$lib/firebase/auth';
import type { DiscussionMessage } from '$lib/types';

async function parse(
	response: Response
): Promise<{ messages?: DiscussionMessage[]; message?: string }> {
	const body = (await response.json().catch(() => ({}))) as {
		messages?: DiscussionMessage[];
		message?: DiscussionMessage | string;
	};
	if (!response.ok)
		throw new Error(typeof body.message === 'string' ? body.message : 'Không thể tải phòng chat.');
	return body as { messages?: DiscussionMessage[]; message?: string };
}

export async function listDiscussionMessages(after?: string): Promise<DiscussionMessage[]> {
	const query = new URLSearchParams();
	if (after) query.set('after', after);
	const response = await fetch(`/api/discussion${query.size ? `?${query}` : ''}`);
	const body = await parse(response);
	return body.messages ?? [];
}

export async function sendDiscussionMessage(content: string): Promise<DiscussionMessage> {
	const user = getFirebaseAuth().currentUser;
	if (!user) throw new Error('Bạn cần đăng nhập để gửi tin nhắn.');
	const response = await fetch('/api/discussion', {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			authorization: `Bearer ${await user.getIdToken()}`
		},
		body: JSON.stringify({ content })
	});
	const body = (await response.json().catch(() => ({}))) as {
		message?: DiscussionMessage | string;
	};
	if (!response.ok || !body.message || typeof body.message === 'string')
		throw new Error(typeof body.message === 'string' ? body.message : 'Không thể gửi tin nhắn.');
	window.dispatchEvent(new Event('vucdem:discussion-changed'));
	return body.message;
}

export function watchDiscussionMessages(
	callback: (messages: DiscussionMessage[]) => void,
	onError?: (reason: unknown) => void
): () => void {
	let stopped = false;
	let pending = false;
	let messages: DiscussionMessage[] = [];
	let after: string | undefined;
	const refresh = async () => {
		if (stopped || pending || document.hidden) return;
		pending = true;
		try {
			const incoming = await listDiscussionMessages(after);
			const byId = new Map(messages.map((message) => [message.id, message]));
			for (const message of incoming) byId.set(message.id, message);
			messages = [...byId.values()].sort(
				(left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt)
			);
			after = messages.at(-1)?.createdAt;
			callback(messages);
		} catch (reason) {
			onError?.(reason);
		} finally {
			pending = false;
		}
	};
	const timer = window.setInterval(refresh, 2_500);
	const changed = () => void refresh();
	window.addEventListener('focus', changed);
	window.addEventListener('vucdem:discussion-changed', changed);
	document.addEventListener('visibilitychange', changed);
	void refresh();
	return () => {
		stopped = true;
		window.clearInterval(timer);
		window.removeEventListener('focus', changed);
		window.removeEventListener('vucdem:discussion-changed', changed);
		document.removeEventListener('visibilitychange', changed);
	};
}
