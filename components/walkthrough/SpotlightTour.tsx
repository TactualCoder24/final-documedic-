import React, { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useOnboarding } from '../../hooks/useOnboarding';
import { dashboardTourSteps } from './tourSteps';
import TourTooltip from './TourTooltip';

// ============================================================================
// SPOTLIGHT TOUR COMPONENT
// ============================================================================

const SpotlightTour: React.FC = () => {
    const { state, nextTourStep, prevTourStep, endTour } = useOnboarding();
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    const currentStepData = dashboardTourSteps[state.tourStep];
    const totalSteps = dashboardTourSteps.length;

    const handleNext = useCallback(() => {
        if (state.tourStep >= totalSteps - 1) {
            endTour();
        } else {
            nextTourStep();
        }
    }, [state.tourStep, totalSteps, nextTourStep, endTour]);

    const handlePrev = useCallback(() => {
        if (state.tourStep > 0) {
            prevTourStep();
        }
    }, [state.tourStep, prevTourStep]);

    // Find and measure the target element
    useEffect(() => {
        if (!state.tourActive || !currentStepData) return;

        let retryCount = 0;
        let timer: any;

        const findTarget = () => {
            const el = document.querySelector(currentStepData.target);
            if (el) {
                const rect = el.getBoundingClientRect();
                // If element is hidden (0 width/height), skip it.
                // We no longer skip if just off-screen, because we want to scroll to it!
                if (rect.width === 0 || rect.height === 0) {
                    handleNext();
                    return;
                }
                setTargetRect(rect);
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else if (retryCount < 20) {
                // Retry finding the element (it may take a moment to mount)
                retryCount++;
                timer = setTimeout(findTarget, 200);
            } else {
                // Element genuinely missing — skip to next step gracefully
                console.warn(`Tour target ${currentStepData.target} missing. Skipping to next step.`);
                handleNext();
            }
        };

        timer = setTimeout(findTarget, 100);
        window.addEventListener('resize', findTarget);
        window.addEventListener('scroll', findTarget, true);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', findTarget);
            window.removeEventListener('scroll', findTarget, true);
        };
    }, [state.tourActive, state.tourStep, currentStepData, handleNext]);

    // Keyboard navigation
    useEffect(() => {
        if (!state.tourActive) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === 'Enter') {
                e.preventDefault();
                handleNext();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                handlePrev();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                endTour();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [state.tourActive, state.tourStep, handleNext, handlePrev, endTour]);

    if (!state.tourActive || !currentStepData) return null;

    const padding = 8;

    return (
        <div className="fixed inset-0 z-[9999]" role="dialog" aria-label="Interactive tour">
            {/* Dark overlay with cutout */}
            <svg
                className="absolute inset-0 w-full h-full"
                style={{ pointerEvents: 'none' }}
            >
                <defs>
                    <mask id="spotlight-mask">
                        <rect width="100%" height="100%" fill="white" />
                        {targetRect && (
                            <rect
                                x={targetRect.x - padding}
                                y={targetRect.y - padding}
                                width={targetRect.width + padding * 2}
                                height={targetRect.height + padding * 2}
                                rx="12"
                                fill="black"
                            />
                        )}
                    </mask>
                </defs>
                <rect
                    width="100%"
                    height="100%"
                    fill="rgba(0,0,0,0.75)"
                    mask="url(#spotlight-mask)"
                    style={{ pointerEvents: 'auto' }}
                />
            </svg>

            {/* Pulsing border around target */}
            {targetRect && (
                <motion.div
                    className="absolute border-2 border-primary rounded-xl spotlight-ring pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        left: targetRect.x - padding,
                        top: targetRect.y - padding,
                        width: targetRect.width + padding * 2,
                        height: targetRect.height + padding * 2,
                    }}
                    key={`ring-${state.tourStep}`}
                    transition={{ duration: 0.3 }}
                />
            )}

            {/* Tooltip */}
            <AnimatePresence mode="wait">
                {targetRect && (
                    <TourTooltip
                        key={state.tourStep}
                        stepNumber={state.tourStep + 1}
                        totalSteps={totalSteps}
                        title={currentStepData.title}
                        description={currentStepData.description}
                        tip={currentStepData.tip}
                        position={currentStepData.position}
                        targetRect={targetRect}
                        onNext={handleNext}
                        onPrev={handlePrev}
                        onClose={endTour}
                        isFirst={state.tourStep === 0}
                        isLast={state.tourStep === totalSteps - 1}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default SpotlightTour;
