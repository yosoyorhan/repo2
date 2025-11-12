import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import React from 'react';

const buttonVariants = cva(
	'inline-flex items-center justify-center rounded-full text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 disabled:pointer-events-none disabled:opacity-50',
	{
		variants: {
			variant: {
				default: 'bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white shadow hover:shadow-lg hover:opacity-90',
				destructive:
          'bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow',
				outline:
          'border border-gray-300 bg-white text-[#1a1333] hover:bg-gray-50',
				secondary:
          'bg-purple-100 text-purple-700 hover:bg-purple-200',
				ghost: 'bg-transparent hover:bg-gray-100 text-[#4a4475]',
				link: 'bg-transparent text-purple-600 underline-offset-4 hover:underline hover:text-pink-500',
			},
			size: {
				default: 'h-11 px-6',
				sm: 'h-9 px-4 text-xs',
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