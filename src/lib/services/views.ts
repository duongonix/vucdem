interface ViewResult {
	counted: boolean;
	viewCount: number;
	storyCounted?: boolean;
	storyViewCount?: number;
}

async function record(body: Record<string, string>): Promise<ViewResult> {
	const response = await fetch('/api/views', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!response.ok) throw new Error('Không thể cập nhật lượt đọc.');
	return response.json() as Promise<ViewResult>;
}

export const recordPostView = (targetId: string) => record({ type: 'post', targetId });
export const recordStoryView = (targetId: string) => record({ type: 'story', targetId });
export const recordChapterView = (storyId: string, targetId: string) =>
	record({ type: 'chapter', storyId, targetId });
