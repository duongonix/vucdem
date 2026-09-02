<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { LogOut } from '@lucide/svelte';
	import { logout } from '$lib/services/auth';
	import AccountSettings from './AccountSettings.svelte';
	import SecuritySettings from './SecuritySettings.svelte';
	import SettingsHeader from './SettingsHeader.svelte';
	import SettingsSection from './SettingsSection.svelte';

	let signingOut = $state(false);
	async function signOut() {
		if (signingOut) return;
		signingOut = true;
		try {
			await logout();
			await goto(resolve('/'));
		} finally {
			signingOut = false;
		}
	}
</script>

<div class="mx-auto w-full max-w-4xl pb-12">
	<SettingsHeader />
	<div class="mt-7 grid gap-5">
		<SettingsSection id="account" title="Hồ sơ cá nhân"><AccountSettings /></SettingsSection>
		<SettingsSection id="security" title="Đăng nhập và bảo mật"
			><SecuritySettings /></SettingsSection
		>
		<section
			class="border border-border bg-surface/85 p-5 sm:flex sm:items-center sm:justify-between"
		>
			<div>
				<h2 class="font-editorial text-xl font-semibold text-text">Phiên đăng nhập</h2>
				<p class="mt-1 text-sm text-text-muted">
					Đăng xuất an toàn khỏi tài khoản trên thiết bị này.
				</p>
			</div>
			<button
				type="button"
				onclick={signOut}
				disabled={signingOut}
				class="mt-4 inline-flex min-h-10 items-center gap-2 border border-border-red px-4 text-sm text-red transition-colors hover:bg-red-muted/20 disabled:opacity-60 sm:mt-0"
			>
				<LogOut class="size-4" />
				{signingOut ? 'Đang đăng xuất…' : 'Đăng xuất'}
			</button>
		</section>
	</div>
</div>
