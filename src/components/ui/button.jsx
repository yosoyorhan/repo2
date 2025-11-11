import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import React from 'react';

const buttonVariants = cva(
	'inline-flex items-center justify-center rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
	{
		variants: {
			variant: {
				default: 'bg-gradient-to-r from-[#7b3fe4] to-[#e53dd2] text-white shadow-[0_8px_24px_rgba(123,63,228,0.18)] hover:shadow-[0_18px_34px_rgba(123,63,228,0.22)] hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98]',
				destructive:
          'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0',
				outline:
          'border border-[rgba(16,24,40,0.12)] bg-transparent hover:bg-[rgba(123,63,228,0.05)] hover:border-[#7b3fe4]',
				secondary:
          'bg-[rgba(255,255,255,0.2)] backdrop-blur-lg border border-white/40 hover:bg-[rgba(255,255,255,0.3)]',
				ghost: 'hover:bg-[rgba(123,63,228,0.08)]',
				link: 'text-[#7b3fe4] underline-offset-4 hover:underline',
			},
			size: {
				default: 'h-11 px-5 py-2',
				sm: 'h-9 px-3',
				lg: 'h-12 px-8',
				icon: 'h-11 w-11',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	const Comp = asChild ? Slot : 'button';
	return (
		<Comp
			className={cn(buttonVariants({ variant, size, className }))}
			ref={ref}
			{...props}
		/>
	);
});
Button.displayName = 'Button';

export { Button, buttonVariants };