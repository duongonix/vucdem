<script lang="ts">
	import { KeyRound, Mail, ShieldCheck } from '@lucide/svelte';
	import { requestPasswordReset } from '$lib/services/auth';
	import { authStore } from '$lib/stores/auth.svelte';
	import SettingRow from './SettingRow.svelte';

	let sending = $state(false);
	let message = $state('');
	let errorMessage = $state('');
	const hasPassword = $derived(
		authStore.firebaseUser?.providerData.some((provider) => provider.providerId === 'password') ??
			false
	);
	const providers = $derived(
		authStore.firebaseUser?.providerData
			.map((provider) => (provider.providerId === 'google.com' ? 'Google' : 'Email và mật khẩu'))
			.join(', ') ?? 'Không xác định'
	);

	async function resetPassword() {
		if (!authStore.firebaseUser?.email || !hasPassword || sending) return;
		sending = true;
		message = '';
		errorMessage = '';
		try {
			await requestPasswordReset(authStore.firebaseUser.email);
			message = 'Đã gửi liên kết đặt lại mật khẩu tới email của bạn.';
		} catch {
			errorMessage = 'Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại.';
		} finally {
			sending = false;
		}
	}
</script>

<SettingRow
	icon={Mail}
	title="Email"
	description={authStore.firebaseUser?.email ?? 'Không có email'}
>
	<span class="text-xs text-text-muted">Không thể thay đổi</span>
</SettingRow>
<SettingRow icon={ShieldCheck} title="Phương thức đăng nhập" description={providers}>
	<span class="text-xs text-success">Đã xác minh</span>
</SettingRow>
{#if hasPassword}
	<SettingRow
		icon={KeyRound}
		title="Đặt lại mật khẩu"
		description="Nhận liên kết đặt lại mật khẩu qua email"
		interactive
		onclick={resetPassword}
	>
		<span class="text-xs text-red">{sending ? 'Đang gửi…' : 'Gửi liên kết'}</span>
	</SettingRow>
{:else}
	<SettingRow
		icon={KeyRound}
		title="Mật khẩu"
		description="Tài khoản Google không sử dụng mật khẩu riêng trên Vực Đêm"
	>
		<span class="text-xs text-text-muted">Quản lý qua Google</span>
	</SettingRow>
{/if}
{#if message}<p class="border-t border-success/30 px-5 py-3 text-sm text-success" role="status">
		{message}
	</p>{/if}
{#if errorMessage}<p class="border-t border-error/30 px-5 py-3 text-sm text-error" role="alert">
		{errorMessage}
	</p>{/if}
