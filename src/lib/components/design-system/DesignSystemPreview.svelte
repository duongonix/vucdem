<script lang="ts">
	import { BookOpen, MoreHorizontal, MoonStar, Plus, Trash2 } from '@lucide/svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import {
		Dialog,
		DialogClose,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle,
		DialogTrigger
	} from '$lib/components/ui/dialog';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuSeparator,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';
	import { Input } from '$lib/components/ui/input';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { Textarea } from '$lib/components/ui/textarea';
</script>

<main class="mx-auto min-h-screen w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
	<header class="mb-10 border-b border-border pb-8 sm:mb-14 sm:pb-10">
		<div class="mb-5 flex items-center gap-3 text-red">
			<MoonStar aria-hidden="true" class="size-6" strokeWidth={1.5} />
			<span class="text-xs tracking-[0.18em] uppercase">Hệ thiết kế VỰC ĐÊM</span>
		</div>
		<h1
			class="font-editorial text-5xl leading-none font-semibold tracking-wide text-text sm:text-7xl"
		>
			Những lời thì thầm<br class="hidden sm:block" /> trong bóng tối
		</h1>
		<p class="mt-6 max-w-2xl text-base leading-7 text-text-secondary">
			Nền thị giác đen sâu, crimson tiết chế và kiểu chữ biên tập dành cho một cộng đồng kể chuyện
			kinh dị — sắc nét, dày thông tin và dễ đọc.
		</p>
	</header>

	<div class="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
		<section aria-labelledby="components-heading" class="min-w-0 space-y-8">
			<div>
				<p class="mb-2 text-xs tracking-[0.14em] text-red uppercase">Primitive</p>
				<h2 id="components-heading" class="font-editorial text-3xl font-semibold text-text">
					Điều khiển và trạng thái
				</h2>
			</div>

			<Tabs value="content">
				<TabsList aria-label="Nhóm kiểm tra hệ thiết kế">
					<TabsTrigger value="content">Nội dung</TabsTrigger>
					<TabsTrigger value="controls">Biểu mẫu</TabsTrigger>
					<TabsTrigger value="states">Trạng thái</TabsTrigger>
				</TabsList>

				<TabsContent value="content">
					<Card>
						<CardHeader>
							<div class="flex items-start justify-between gap-4">
								<div>
									<CardTitle>Căn phòng không có cửa sổ</CardTitle>
									<CardDescription>u/nocturne · 8 phút trước</CardDescription>
								</div>
								<DropdownMenu>
									<DropdownMenuTrigger
										class={buttonVariants({ variant: 'ghost', size: 'icon' })}
										aria-label="Mở menu bài viết"
									>
										<MoreHorizontal aria-hidden="true" class="size-5" />
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem>Sao chép liên kết</DropdownMenuItem>
										<DropdownMenuItem>Báo cáo nội dung</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem class="text-red-bright">
											<Trash2 aria-hidden="true" class="size-4" />
											Xóa bài viết
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</CardHeader>
						<CardContent>
							<p class="leading-7 text-text-secondary">
								Mỗi đêm, tiếng gõ lại vọng lên từ bức tường phía bắc. Tối nay nó gọi đúng tên tôi.
							</p>
						</CardContent>
						<CardFooter class="gap-3">
							<Button size="sm">
								<Plus aria-hidden="true" class="size-4" />
								Theo dõi
							</Button>
							<Dialog>
								<DialogTrigger class={buttonVariants({ variant: 'outline', size: 'sm' })}>
									Đọc cảnh báo
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Rời khỏi vùng an toàn?</DialogTitle>
										<DialogDescription>
											Nội dung tiếp theo có thể chứa mô tả kinh dị mạnh. Bạn có thể quay lại bất cứ
											lúc nào.
										</DialogDescription>
									</DialogHeader>
									<DialogFooter>
										<DialogClose class={buttonVariants({ variant: 'outline' })}>
											Quay lại
										</DialogClose>
										<DialogClose class={buttonVariants({ variant: 'primary' })}>
											Tiếp tục đọc
										</DialogClose>
									</DialogFooter>
								</DialogContent>
							</Dialog>
						</CardFooter>
					</Card>
				</TabsContent>

				<TabsContent value="controls" class="space-y-5">
					<label class="grid gap-2 text-sm text-text-secondary">
						Tiêu đề
						<Input placeholder="Một tiêu đề khiến người đọc mất ngủ…" />
					</label>
					<label class="grid gap-2 text-sm text-text-secondary">
						Lời mở đầu
						<Textarea placeholder="Có những câu chuyện không nên được kể lại…"></Textarea>
					</label>
				</TabsContent>

				<TabsContent value="states">
					<div class="flex flex-wrap gap-3">
						<Button>Primary</Button>
						<Button variant="outline">Secondary</Button>
						<Button variant="ghost">Ghost</Button>
						<Button variant="destructive">Destructive</Button>
						<Button disabled>Disabled</Button>
					</div>
				</TabsContent>
			</Tabs>
		</section>

		<aside class="space-y-6" aria-labelledby="tokens-heading">
			<div>
				<p class="mb-2 text-xs tracking-[0.14em] text-red uppercase">Tokens</p>
				<h2 id="tokens-heading" class="font-editorial text-3xl font-semibold text-text">
					Bảng màu đêm
				</h2>
			</div>
			<div class="grid grid-cols-2 border-t border-l border-border sm:grid-cols-4 lg:grid-cols-2">
				{#each [['Nền', 'bg-background'], ['Bề mặt', 'bg-surface-2'], ['Crimson', 'bg-red'], ['Viền đỏ', 'bg-border-red']] as [label, colorClass] (label)}
					<div class="border-r border-b border-border p-3">
						<div class={`mb-3 h-16 border border-border ${colorClass}`}></div>
						<span class="text-xs text-text-secondary">{label}</span>
					</div>
				{/each}
			</div>

			<blockquote
				class="border-l border-red px-5 py-3 font-editorial text-2xl leading-9 text-text italic"
			>
				“Có những nơi tốt nhất là không nên đặt chân đến.”
			</blockquote>

			<div
				class="flex items-center gap-3 border border-border bg-surface p-4 text-sm text-text-secondary"
			>
				<BookOpen aria-hidden="true" class="size-5 shrink-0 text-red" />
				<span>Serif dành cho lời kể. Sans-serif dành cho hành động.</span>
			</div>
		</aside>
	</div>
</main>
