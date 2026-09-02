<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { LoaderCircle, LogIn } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import {
		createApplicationUser,
		loginWithEmail,
		loginWithGoogle,
		navigateAfterAuth,
		ProfileSetupRequiredError,
		registerWithEmail,
		requestPasswordReset
	} from '$lib/services/auth';
	import { authStore } from '$lib/stores/auth.svelte';
	import { emailSchema, passwordSchema, profileSetupSchema } from '$lib/validation/auth';

	type Mode = 'login' | 'register' | 'onboarding' | 'reset';
	let { mode }: { mode: Mode } = $props();

	let username = $state('');
	let displayName = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let pending = $state(false);
	let errorMessage = $state('');
	let successMessage = $state('');

	const redirect = $derived(page.url.searchParams.get('redirect'));
	const title = $derived(
		mode === 'login'
			? 'Trở lại Vực Đêm'
			: mode === 'register'
				? 'Gia nhập Vực Đêm'
				: mode === 'onboarding'
					? 'Chọn danh tính'
					: 'Khôi phục mật khẩu'
	);
	const description = $derived(
		mode === 'login'
			? 'Đăng nhập để viết, bình luận và lưu những câu chuyện ám ảnh bạn.'
			: mode === 'register'
				? 'Tạo tài khoản để kể lại điều bạn đã thấy trong bóng tối.'
				: mode === 'onboarding'
					? 'Hoàn tất hồ sơ công khai trước khi bước vào cộng đồng.'
					: 'Firebase sẽ gửi một liên kết đặt lại mật khẩu tới email của bạn.'
	);

	$effect(() => {
		if (mode === 'onboarding' && !displayName && authStore.firebaseUser?.displayName) {
			displayName = authStore.firebaseUser.displayName;
		}
	});

	function messageFrom(reason: unknown): string {
		if (reason && typeof reason === 'object' && 'issues' in reason) {
			const issues = (reason as { issues?: { message?: string }[] }).issues;
			return issues?.[0]?.message ?? 'Thông tin chưa hợp lệ.';
		}
		return reason instanceof Error ? reason.message : 'Đã có lỗi xảy ra. Vui lòng thử lại.';
	}

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		pending = true;
		errorMessage = '';
		successMessage = '';
		try {
			if (mode === 'login') {
				emailSchema.parse(email);
				passwordSchema.parse(password);
				await loginWithEmail(email, password);
				await authStore.refresh();
				await navigateAfterAuth(redirect);
			} else if (mode === 'register') {
				emailSchema.parse(email);
				passwordSchema.parse(password);
				profileSetupSchema.parse({ username, displayName });
				if (password !== confirmPassword) throw new Error('Mật khẩu xác nhận không khớp.');
				await registerWithEmail(email, password, { username, displayName });
				await authStore.refresh();
				await navigateAfterAuth(redirect);
			} else if (mode === 'onboarding') {
				if (!authStore.firebaseUser) throw new Error('Phiên đăng nhập đã hết hạn.');
				await createApplicationUser(authStore.firebaseUser, { username, displayName });
				await authStore.refresh();
				await navigateAfterAuth(redirect);
			} else {
				emailSchema.parse(email);
				await requestPasswordReset(email);
				successMessage = 'Nếu email tồn tại, liên kết khôi phục đã được gửi.';
			}
		} catch (reason) {
			if (reason instanceof ProfileSetupRequiredError) {
				window.location.assign(`/auth/onboarding?redirect=${encodeURIComponent(redirect ?? '/')}`);
				return;
			}
			errorMessage = messageFrom(reason);
		} finally {
			pending = false;
		}
	}

	async function googleLogin() {
		pending = true;
		errorMessage = '';
		try {
			const result = await loginWithGoogle();
			if (result.needsProfile) {
				displayName = result.firebaseUser.displayName ?? '';
				window.location.assign(`/auth/onboarding?redirect=${encodeURIComponent(redirect ?? '/')}`);
				return;
			}
			await authStore.refresh();
			await navigateAfterAuth(redirect);
		} catch (reason) {
			errorMessage = messageFrom(reason);
		} finally {
			pending = false;
		}
	}
</script>

<section
	class="mx-auto w-full max-w-md border border-border bg-surface px-6 py-8 shadow-2xl shadow-black/50 sm:px-9 sm:py-10"
>
	<div class="mb-7 border-l-2 border-red-dark pl-4">
		<p class="mb-1 text-[0.68rem] font-semibold tracking-[0.25em] text-red uppercase">Tài khoản</p>
		<h1 class="font-editorial text-4xl font-semibold tracking-tight text-text">{title}</h1>
		<p class="mt-2 text-sm leading-6 text-text-secondary">{description}</p>
	</div>

	{#if mode === 'login' || mode === 'register'}
		<Button
			variant="outline"
			class="mb-5 w-full"
			type="button"
			onclick={googleLogin}
			disabled={pending}
		>
			<LogIn class="size-4" aria-hidden="true" /> Tiếp tục với Google
		</Button>
		<div
			class="mb-5 flex items-center gap-3 text-[0.65rem] tracking-[0.2em] text-text-muted uppercase"
		>
			<span class="h-px flex-1 bg-border"></span><span>hoặc email</span><span
				class="h-px flex-1 bg-border"
			></span>
		</div>
	{/if}

	<form class="space-y-4" onsubmit={submit} novalidate>
		{#if mode === 'register' || mode === 'onboarding'}
			<label class="block text-sm font-medium text-text-secondary">
				Tên người dùng
				<Input
					class="mt-1.5"
					bind:value={username}
					autocomplete="username"
					placeholder="nocturne"
					disabled={pending}
				/>
			</label>
			<label class="block text-sm font-medium text-text-secondary">
				Tên hiển thị
				<Input
					class="mt-1.5"
					bind:value={displayName}
					autocomplete="name"
					placeholder="Tên bạn muốn mọi người thấy"
					disabled={pending}
				/>
			</label>
		{/if}
		{#if mode !== 'onboarding'}
			<label class="block text-sm font-medium text-text-secondary">
				Email
				<Input
					class="mt-1.5"
					bind:value={email}
					type="email"
					autocomplete="email"
					placeholder="ban@example.com"
					disabled={pending}
				/>
			</label>
		{/if}
		{#if mode === 'login' || mode === 'register'}
			<label class="block text-sm font-medium text-text-secondary">
				Mật khẩu
				<Input
					class="mt-1.5"
					bind:value={password}
					type="password"
					autocomplete={mode === 'login' ? 'current-password' : 'new-password'}
					disabled={pending}
				/>
			</label>
		{/if}
		{#if mode === 'register'}
			<label class="block text-sm font-medium text-text-secondary">
				Xác nhận mật khẩu
				<Input
					class="mt-1.5"
					bind:value={confirmPassword}
					type="password"
					autocomplete="new-password"
					disabled={pending}
				/>
			</label>
		{/if}

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

		<Button class="w-full" type="submit" disabled={pending}>
			{#if pending}<LoaderCircle class="size-4 animate-spin" aria-hidden="true" />{/if}
			{mode === 'login'
				? 'Đăng nhập'
				: mode === 'register'
					? 'Tạo tài khoản'
					: mode === 'onboarding'
						? 'Hoàn tất hồ sơ'
						: 'Gửi liên kết'}
		</Button>
	</form>

	<div class="mt-6 flex flex-wrap justify-between gap-3 border-t border-border pt-5 text-sm">
		{#if mode === 'login'}
			<a class="text-text-secondary hover:text-red-bright" href={resolve('/auth/reset-password')}
				>Quên mật khẩu?</a
			>
			<a class="text-red hover:text-red-bright" href={resolve('/auth/register')}>Tạo tài khoản</a>
		{:else if mode === 'register'}
			<span class="text-text-muted">Đã có tài khoản?</span><a
				class="text-red hover:text-red-bright"
				href={resolve('/auth/login')}>Đăng nhập</a
			>
		{:else}
			<a class="text-text-secondary hover:text-red-bright" href={resolve('/auth/login')}
				>Quay lại đăng nhập</a
			>
		{/if}
	</div>
</section>
