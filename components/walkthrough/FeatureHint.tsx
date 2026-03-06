import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding } from '../../hooks/useOnboarding';
import { discoveryRules } from './tourSteps';
import { useNavigate } from 'react-router-dom';

// ============================================================================
// INLINE TIP (Dashboard pro-tip cards)
// ============================================================================

export const InlineTip: React.FC<{
    ruleId: string;
    title: string;
    message: string;
    ctaText: string;
    ctaRoute: string;
}> = ({ ruleId, title, message, ctaText, ctaRoute }) => {
    const { dismissHint, isHintDismissed } = useOnboarding();
    const navigate = useNavigate();

    if (isHintDismissed(ruleId)) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="hint-enter rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 p-4 flex items-start gap-3"
        >
            <span className="text-xl flex-shrink-0">💡</span>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{message}</p>
                <div className="flex items-center gap-3 mt-3">
                    <button
                        onClick={() => { navigate(ctaRoute); dismissHint(ruleId); }}
                        className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                        {ctaText} →
                    </button>
                </div>
            </div>
            <button
                onClick={() => dismissHint(ruleId)}
                className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none flex-shrink-0"
                aria-label="Dismiss tip"
            >
                ×
            </button>
        </motion.div>
    );
};

// ============================================================================
// FLOATING HINT CARD ("Did you know?" popup)
// ============================================================================

export const FloatingHintCard: React.FC<{
    ruleId: string;
    title: string;
    message: string;
    ctaText: string;
    ctaRoute: string;
}> = ({ ruleId, title, message, ctaText, ctaRoute }) => {
    const { dismissHint, isHintDismissed } = useOnboarding();
    const navigate = useNavigate();

    if (isHintDismissed(ruleId)) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass-card rounded-2xl shadow-xl p-5 w-72 border border-primary/20"
        >
            <div className="flex items-start justify-between mb-2">
                <h4 className="font-bold text-sm">{title}</h4>
                <button
                    onClick={() => dismissHint(ruleId)}
                    className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
                    aria-label="Dismiss hint"
                >
                    ×
                </button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">{message}</p>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => { navigate(ctaRoute); dismissHint(ruleId); }}
                    className="px-3 py-1.5 rounded-lg gradient-primary text-white text-xs font-semibold hover:opacity-90 transition-all"
                >
                    {ctaText}
                </button>
                <button
                    onClick={() => dismissHint(ruleId)}
                    className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted transition-all"
                >
                    Dismiss
                </button>
            </div>
        </motion.div>
    );
};

// ============================================================================
// PULSING DISCOVERY DOT (for sidebar items)
// ============================================================================

export const DiscoveryDot: React.FC<{ featureId: string }> = ({ featureId }) => {
    const { isFeatureDiscovered } = useOnboarding();

    if (isFeatureDiscovered(featureId)) return null;

    return (
        <span className="relative flex h-2.5 w-2.5 ml-auto">
            <span className="discovery-dot absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
        </span>
    );
};

// ============================================================================
// FEATURE HINT MANAGER
// Shows relevant hints for the current page
// ============================================================================

const FeatureHint: React.FC<{ currentPage?: string }> = ({ currentPage = 'dashboard' }) => {
    const { state, isHintDismissed } = useOnboarding();

    if (!state.welcomeCompleted || !state.showHints) return null;

    // Filter rules relevant to the current context
    const activeRules = discoveryRules.filter(rule => {
        if (isHintDismissed(rule.id)) return false;
        if (rule.trigger === 'first_visit' && currentPage === 'dashboard') return true;
        return false;
    });

    if (activeRules.length === 0) return null;

    // Show at most 1 inline hint at a time
    const hint = activeRules[0];

    return (
        <AnimatePresence>
            {hint.type === 'inline' && (
                <InlineTip
                    key={hint.id}
                    ruleId={hint.id}
                    title={hint.title}
                    message={hint.message}
                    ctaText={hint.ctaText}
                    ctaRoute={hint.ctaRoute}
                />
            )}
        </AnimatePresence>
    );
};

export default FeatureHint;
