<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';

	export const buttonVariants = tv({
		base: 'inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap border text-sm font-medium transition-[color,background-color,border-color] outline-none focus-visible:ring-2 focus-visible:ring-red/40 disabled:pointer-events-none disabled:opacity-45',
		variants: {
			variant: {
				primary: 'border-red-dark bg-red-dark text-text hover:border-red hover:bg-red',
				outline:
					'border-border bg-surface text-text hover:border-border-red hover:bg-surface-hover',
				ghost:
					'border-transparent bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text',
				destructive:
					'border-red-dark bg-red-muted/40 text-red-bright hover:border-red hover:bg-red-dark hover:text-text'
			},
			size: {
				default: 'px-4 py-2',
				sm: 'min-h-8 px-3 py-1.5 text-xs',
				lg: 'min-h-11 px-5 py-2.5',
				icon: 'size-10 min-h-10 p-0'
			}
		},
		defaultVariants: {
			variant: 'primary',
			size: 'default'
		}
	});

	export type ButtonVariant = VariantProps<typeof buttonVariants>['variant'];
	export type ButtonSize = VariantProps<typeof buttonVariants>['size'];
</script>

<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	let {
		class: className,
		variant = 'primary',
		size = 'default',
		children,
		...restProps
	}: HTMLButtonAttributes & {
		variant?: ButtonVariant;
		size?: ButtonSize;
	} = $props();
</script>

<button data-slot="button" class={cn(buttonVariants({ variant, size }), className)} {...restProps}>
	{@render children?.()}
</button>
