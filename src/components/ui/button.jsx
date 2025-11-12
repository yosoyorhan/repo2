import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import React from 'react';

const buttonVariants = cva(
	'inline-flex items-center justify-center rounded-lg text-sm font-bold transition-all duration-300 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 font-mono',
	{
		variants: {
			variant: {
				default: 'bg-neon-pink hover:bg-neon-pinkDark text-white shadow-neon-pink hover:shadow-neon-pink-md hover:scale-105 active:scale-95 border border-neon-pink/20',
				destructive:
          'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95',
				outline:
          'border border-cyber-border bg-cyber-surface hover:border-neon-cyan hover:text-neon-cyan text-gray-300',
				secondary:
          'bg-neon-cyan hover:bg-neon-cyan/80 text-cyber-dark shadow-neon-cyan hover:shadow-neon-cyan-md hover:scale-105 active:scale-95 border border-neon-cyan/20',
				ghost: 'hover:bg-cyber-surface text-gray-300 hover:text-white',
				link: 'text-neon-cyan underline-offset-4 hover:underline hover:text-neon-pink',
			},
			size: {
				default: 'h-11 px-5 py-2',
				sm: 'h-9 px-3 text-xs',
				lg: 'h-12 px-8 text-base',
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