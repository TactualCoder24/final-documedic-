import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, X } from '../icons/Icons';
import { useToast, Toast as ToastType } from '../../hooks/useToast';

const variantStyles: Record<ToastType['variant'], { bg: string; border: string; icon: React.FC<React.SVGProps<SVGSVGElement>>; iconColor: string }> = {
    success: {
        bg: 'bg-green-500/10 dark:bg-green-500/20',
        border: 'border-green-500/30',
        icon: CheckCircle2,
        iconColor: 'text-green-500',
    },
    error: {
        bg: 'bg-red-500/10 dark:bg-red-500/20',
        border: 'border-red-500/30',
        icon: AlertTriangle,
        iconColor: 'text-red-500',
    },
    warning: {
        bg: 'bg-yellow-500/10 dark:bg-yellow-500/20',
        border: 'border-yellow-500/30',
        icon: AlertTriangle,
        iconColor: 'text-yellow-500',
    },
    info: {
        bg: 'bg-blue-500/10 dark:bg-blue-500/20',
        border: 'border-blue-500/30',
        icon: Info,
        iconColor: 'text-blue-500',
    },
};

const ToastItem: React.FC<{ toast: ToastType; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
    const style = variantStyles[toast.variant];
    const Icon = style.icon;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-xl shadow-lg min-w-[300px] max-w-[420px] ${style.bg} ${style.border}`}
            role="alert"
        >
            <Icon className={`h-5 w-5 flex-shrink-0 ${style.iconColor}`} />
            <p className="flex-1 text-sm font-medium text-foreground">{toast.message}</p>
            <button
                onClick={() => onDismiss(toast.id)}
                className="flex-shrink-0 p-1 rounded-md hover:bg-foreground/10 transition-colors"
                aria-label="Dismiss notification"
            >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
        </motion.div>
    );
};

const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToast();

    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map(toast => (
                    <div key={toast.id} className="pointer-events-auto">
                        <ToastItem toast={toast} onDismiss={removeToast} />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ToastContainer;
