import { cn } from '@/lib/utils';
import React from 'react';

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
	return (
		<input
			type={type}
			className={cn(
				'flex h-10 w-full rounded-lg border border-cyber-border bg-cyber-surface px-3 py-2 text-sm text-white font-mono placeholder:text-gray-500 focus-visible:outline-none focus-visible:border-neon-pink focus-visible:shadow-neon-pink transition-all disabled:cursor-not-allowed disabled:opacity-50',
				className,
			)}
			ref={ref}
			{...props}
		/>
	);
});
Input.displayName = 'Input';

export { Input };