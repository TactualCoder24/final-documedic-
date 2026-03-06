import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

export interface Toast {
    id: string;
    message: string;
    variant: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (message: string, variant?: Toast['variant'], duration?: number) => void;
    removeToast: (id: string) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    const removeToast = useCallback((id: string) => {
        const timer = timersRef.current.get(id);
        if (timer) {
            clearTimeout(timer);
            timersRef.current.delete(id);
        }
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((message: string, variant: Toast['variant'] = 'info', duration = 5000) => {
        const id = crypto.randomUUID();
        const toast: Toast = { id, message, variant, duration };
        setToasts(prev => [...prev, toast]);

        if (duration > 0) {
            const timer = setTimeout(() => {
                removeToast(id);
            }, duration);
            timersRef.current.set(id, timer);
        }
    }, [removeToast]);

    const success = useCallback((message: string) => addToast(message, 'success'), [addToast]);
    const error = useCallback((message: string) => addToast(message, 'error'), [addToast]);
    const warning = useCallback((message: string) => addToast(message, 'warning'), [addToast]);
    const info = useCallback((message: string) => addToast(message, 'info'), [addToast]);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
            {children}
        </ToastContext.Provider>
    );
};

export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
