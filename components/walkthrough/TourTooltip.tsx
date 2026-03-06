import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// TYPES
// ============================================================================

interface TourTooltipProps {
    stepNumber: number;
    totalSteps: number;
    title: string;
    description: string;
    tip?: string;
    position: 'top' | 'bottom' | 'left' | 'right';
    targetRect: DOMRect;
    onNext: () => void;
    onPrev: () => void;
    onClose: () => void;
    isFirst: boolean;
    isLast: boolean;
}

// ============================================================================
// POSITIONING
// ============================================================================

function getTooltipStyle(position: string, targetRect: DOMRect): React.CSSProperties {
    const gap = 16;
    const isMobile = window.innerWidth < 400;
    const tooltipWidth = isMobile ? window.innerWidth - 40 : 340;

    switch (position) {
        case 'right':
            return {
                position: 'fixed',
                left: Math.min(targetRect.right + gap, window.innerWidth - tooltipWidth - 20),
                top: targetRect.top + targetRect.height / 2,
                transform: 'translateY(-50%)',
            };
        case 'left':
            return {
                position: 'fixed',
                right: window.innerWidth - targetRect.left + gap,
                top: targetRect.top + targetRect.height / 2,
                transform: 'translateY(-50%)',
            };
        case 'bottom':
            return {
                position: 'fixed',
                left: Math.max(20, Math.min(targetRect.left + targetRect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - 20)),
                top: targetRect.bottom + gap,
            };
        case 'top':
        default:
            return {
                position: 'fixed',
                left: Math.max(20, Math.min(targetRect.left + targetRect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - 20)),
                bottom: window.innerHeight - targetRect.top + gap,
            };
    }
}

// ============================================================================
// COMPONENT
// ============================================================================

const TourTooltip: React.FC<TourTooltipProps> = ({
    stepNumber,
    totalSteps,
    title,
    description,
    tip,
    position,
    targetRect,
    onNext,
    onPrev,
    onClose,
    isFirst,
    isLast,
}) => {
    const style = getTooltipStyle(position, targetRect);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: position === 'bottom' ? -10 : 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="glass-card rounded-2xl shadow-2xl p-4 sm:p-5 z-[10000] w-[calc(100vw-40px)] sm:w-[340px] max-h-[85vh] overflow-y-auto"
            style={style}
        >
            {/* Step counter */}
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                    📍 Step {stepNumber} of {totalSteps}
                </span>
                <button
                    onClick={onClose}
                    className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none p-1"
                    aria-label="Close tour"
                >
                    ×
                </button>
            </div>

            {/* Content */}
            <h3 className="text-lg font-bold font-heading mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">{description}</p>

            {/* Pro tip */}
            {tip && (
                <div className="bg-accent/10 rounded-xl px-3 py-2.5 mb-4 flex items-start gap-2">
                    <span className="text-sm">💡</span>
                    <p className="text-xs text-accent-foreground font-medium leading-relaxed">{tip}</p>
                </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <div className="flex gap-1">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                        <div
                            key={i}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${i === stepNumber - 1 ? 'bg-primary w-5' : 'bg-muted'
                                }`}
                        />
                    ))}
                </div>
                <div className="flex gap-2">
                    {!isFirst && (
                        <button
                            onClick={onPrev}
                            className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted transition-all"
                        >
                            ← Back
                        </button>
                    )}
                    <button
                        onClick={onNext}
                        className="px-4 py-1.5 rounded-lg gradient-primary text-white text-xs font-semibold hover:opacity-90 transition-all shadow-sm shadow-primary/25"
                    >
                        {isLast ? 'Finish ✓' : 'Next →'}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default TourTooltip;
