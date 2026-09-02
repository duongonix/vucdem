<script lang="ts">
	import { Search } from '@lucide/svelte';
</script>

<form
	action="/search"
	method="get"
	class="relative hidden w-full max-w-72 min-[900px]:block"
	role="search"
>
	<label class="sr-only" for="global-search">Tìm kiếm trên VỰC ĐÊM</label>
	<input
		id="global-search"
		name="q"
		type="search"
		placeholder="Tìm kiếm…"
		class="h-10 w-full border border-border bg-surface pr-10 pl-4 text-sm text-text outline-none placeholder:text-text-muted hover:border-zinc-700 focus-visible:border-red focus-visible:ring-2 focus-visible:ring-red/25"
	/>
	<Search
		class="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-text-muted"
		aria-hidden="true"
	/>
</form>
