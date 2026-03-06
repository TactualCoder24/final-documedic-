import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// ============================================================================
// REUSABLE EMPTY STATE COMPONENT
// ============================================================================

interface EmptyStateProps {
    icon: string;
    title: string;
    description: string;
    features?: string[];
    ctaText: string;
    onCtaClick?: () => void;
    ctaRoute?: string;
    secondaryCtaText?: string;
    secondaryCtaRoute?: string;
    onSecondaryClick?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    features,
    ctaText,
    onCtaClick,
    ctaRoute,
    secondaryCtaText,
    secondaryCtaRoute,
    onSecondaryClick,
}) => {
    const navigate = useNavigate();

    const handlePrimaryClick = () => {
        if (onCtaClick) {
            onCtaClick();
        } else if (ctaRoute) {
            navigate(ctaRoute);
        }
    };

    const handleSecondaryClick = () => {
        if (onSecondaryClick) {
            onSecondaryClick();
        } else if (secondaryCtaRoute) {
            navigate(secondaryCtaRoute);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex flex-col items-center justify-center text-center py-16 px-6 max-w-md mx-auto"
        >
            {/* Animated Icon */}
            <div className="empty-float text-7xl mb-6">{icon}</div>

            {/* Title */}
            <h3 className="text-2xl font-bold font-heading mb-3">{title}</h3>

            {/* Description */}
            <p className="text-muted-foreground mb-6 leading-relaxed">{description}</p>

            {/* Feature List */}
            {features && features.length > 0 && (
                <div className="text-left w-full space-y-2.5 mb-8">
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * i, duration: 0.3 }}
                            className="flex items-start gap-3"
                        >
                            <span className="text-green-500 mt-0.5 font-bold">✓</span>
                            <span className="text-sm text-muted-foreground">{feature}</span>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Primary CTA */}
            <button
                onClick={handlePrimaryClick}
                className="px-6 py-3 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/25 hover-lift"
            >
                {ctaText}
            </button>

            {/* Secondary CTA */}
            {secondaryCtaText && (
                <button
                    onClick={handleSecondaryClick}
                    className="mt-4 text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                    {secondaryCtaText}
                </button>
            )}
        </motion.div>
    );
};

export default EmptyState;
