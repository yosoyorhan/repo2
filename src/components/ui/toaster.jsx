import {
	Toast,
	ToastClose,
	ToastDescription,
	ToastProvider,
	ToastTitle,
	ToastViewport,
} from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';
import { Rocket, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import React from 'react';

export function Toaster() {
	const { toasts } = useToast();

	const getIcon = (variant) => {
		switch (variant) {
			case 'destructive':
				return <AlertCircle size={18} className="text-red-300" />;
			case 'success':
				return <CheckCircle2 size={18} className="text-green-400" />;
			default:
				return <Rocket size={18} className="text-neon-cyan" />;
		}
	};

	return (
		<ToastProvider>
			{toasts.map(({ id, title, description, action, variant, ...props }) => {
				return (
					<Toast key={id} variant={variant} {...props}>
						{/* İkon */}
						<div className="flex-shrink-0 w-9 h-9 flex items-center justify-center bg-gradient-to-br from-neon-pink to-neon-cyan rounded-xl shadow-md">
							{getIcon(variant)}
						</div>

						{/* İçerik */}
						<div className="flex-1">
							{title && <ToastTitle>{title}</ToastTitle>}
							{description && (
								<ToastDescription>{description}</ToastDescription>
							)}
						</div>

						{action}
						<ToastClose />
					</Toast>
				);
			})}
			<ToastViewport />
		</ToastProvider>
	);
}