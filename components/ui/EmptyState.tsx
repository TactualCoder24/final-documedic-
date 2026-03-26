import React from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import { useNavigate } from 'react-router-dom';

interface EmptyStateProps {
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    title: string;
    description: string;
    ctaText?: string;
    ctaAction?: () => void;
    ctaRoute?: string;
    className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    icon: Icon,
    title,
    description,
    ctaText,
    ctaAction,
    ctaRoute,
    className = '',
}) => {
    const navigate = useNavigate();

    const handleCta = () => {
        if (ctaAction) {
            ctaAction();
        } else if (ctaRoute) {
            navigate(ctaRoute);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className={`flex flex-col items-center justify-center text-center py-16 px-4 ${className}`}
        >
            <div className="relative mb-8 mt-4">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="relative inline-flex items-center justify-center p-6 rounded-[2rem] glass-pro-max text-primary/80 border border-primary/20 shadow-xl shadow-primary/5">
                    <Icon strokeWidth={1.2} className="h-16 w-16 opacity-90" />
                </div>
            </div>
            <h3 className="text-xl font-bold font-heading mb-2">{title}</h3>
            <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
            {ctaText && (
                <Button variant="gradient" onClick={handleCta}>
                    {ctaText}
                </Button>
            )}
        </motion.div>
    );
};

export default EmptyState;
