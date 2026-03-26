// ============================================================================
// SPOTLIGHT TOUR STEPS
// ============================================================================

export interface SpotlightStep {
    target: string;           // CSS selector of element to highlight
    title: string;
    description: string;
    tip?: string;             // Optional pro-tip
    position: 'top' | 'bottom' | 'left' | 'right';
}

export const dashboardTourSteps: SpotlightStep[] = [
    {
        target: '[data-tour="sidebar-dashboard"]',
        title: 'Your Home Base',
        description: "This is your Dashboard — your daily health overview at a glance. Everything important is right here.",
        tip: 'You can always come back here by clicking the DocuMedic logo.',
        position: 'right',
    },
    {
        target: '[data-tour="quick-actions"]',
        title: 'Quick Actions',
        description: 'Schedule appointments, find nearby care, or log your vitals — all in one tap. These shortcuts save you time.',
        position: 'bottom',
    },
    {
        target: '[data-tour="water-intake"]',
        title: 'Track Your Water',
        description: "Track your daily water intake here. Tap the + button to log each glass — we'll track your progress toward your daily goal.",
        tip: 'You can also say "add 2 glasses of water" to Swasthya!',
        position: 'bottom',
    },
    {
        target: '[data-tour="blood-pressure"]',
        title: 'Vitals at a Glance',
        description: "Your latest vitals are always visible. We'll alert you if anything looks off or if your readings trend in an unusual direction.",
        position: 'bottom',
    },
    {
        target: '[data-tour="search-bar"]',
        title: 'Instant Search',
        description: 'Search across all your records, medications, and reminders instantly. Just start typing!',
        position: 'bottom',
    },
    {
        target: '[data-tour="tour-button"]',
        title: "You're All Set!",
        description: "That's the basics! You can replay this tour anytime from here. Explore each section at your own pace — we're here to help.",
        tip: 'Try asking Swasthya "show me around" for a conversational walkthrough!',
        position: 'bottom',
    },
];

// ============================================================================
// FEATURE DISCOVERY RULES
// ============================================================================

export interface DiscoveryRule {
    id: string;
    feature: string;
    trigger: 'first_visit' | 'days_inactive' | 'after_action';
    daysThreshold?: number;
    afterAction?: string;
    title: string;
    message: string;
    ctaText: string;
    ctaRoute: string;
    maxShows: number;
    type: 'card' | 'dot' | 'inline';
}

export const discoveryRules: DiscoveryRule[] = [
    {
        id: 'discover-doc-analysis',
        feature: 'document_analysis',
        trigger: 'first_visit',
        title: '✨ Did you know?',
        message: 'Upload a medical report and let AI analyze it for you in seconds — extracting key data and flagging abnormal values.',
        ctaText: 'Upload Document',
        ctaRoute: '/documents',
        maxShows: 3,
        type: 'inline',
    },
    {
        id: 'discover-symptom-checker',
        feature: 'symptom_checker',
        trigger: 'days_inactive',
        daysThreshold: 3,
        title: '🩺 AI Symptom Checker',
        message: "Describe your symptoms and our AI will help you understand possible causes and next steps.",
        ctaText: 'Check Symptoms',
        ctaRoute: '/symptom-checker',
        maxShows: 2,
        type: 'card',
    },
    {
        id: 'discover-mentibot',
        feature: 'mentibot',
        trigger: 'days_inactive',
        daysThreshold: 5,
        title: '🧠 Mental Wellness',
        message: 'Feeling stressed? Mentibot can help with guided exercises, mood tracking, and journaling.',
        ctaText: 'Talk to Mentibot',
        ctaRoute: '/dashboard/mentibot',
        maxShows: 2,
        type: 'card',
    },
    {
        id: 'discover-health-trends',
        feature: 'health_trends',
        trigger: 'after_action',
        afterAction: 'logged_vitals',
        title: '📊 Health Trends',
        message: "You've started logging vitals! View your health trends over time to spot patterns.",
        ctaText: 'View Trends',
        ctaRoute: '/health-trends',
        maxShows: 1,
        type: 'card',
    },
];

// ============================================================================
// EMPTY STATE CONFIGS
// ============================================================================

export interface EmptyStateConfig {
    icon: string;
    title: string;
    description: string;
    features: string[];
    ctaText: string;
    ctaRoute?: string;
    secondaryCtaText?: string;
    secondaryCtaRoute?: string;
}

export const emptyStateConfigs: Record<string, EmptyStateConfig> = {
    documents: {
        icon: '📋',
        title: 'No medical records yet',
        description: 'Your health records are organized here. Upload a report and our AI will:',
        features: [
            'Extract key information automatically',
            'Define medical terms in simple language',
            'Flag abnormal values',
            'Auto-save vitals to your dashboard',
        ],
        ctaText: 'Upload Your First Report',
    },
    medications: {
        icon: '💊',
        title: 'No medications tracked',
        description: "Keep track of your medications in one place. Add your current medications and we'll help you:",
        features: [
            'Set daily medication reminders',
            'Track which ones you\'ve taken today',
            'Check for potential drug interactions',
            'Share your medication list with doctors',
        ],
        ctaText: 'Add Your First Medication',
    },
    symptoms: {
        icon: '🩺',
        title: 'No symptoms logged',
        description: 'Track your symptoms to help identify patterns and share with your doctor:',
        features: [
            'Log symptoms with severity ratings',
            'Track symptom patterns over time',
            'Share logs with your healthcare provider',
            'Get AI-powered insights',
        ],
        ctaText: 'Log a Symptom',
        secondaryCtaText: 'Or tell Swasthya',
    },
    foodJournal: {
        icon: '🍽️',
        title: 'No meals logged',
        description: 'Keep a food journal to track your nutrition and identify dietary patterns:',
        features: [
            'Log meals throughout the day',
            'Track eating patterns',
            'Correlate diet with health data',
            'Get personalized nutrition tips',
        ],
        ctaText: 'Log a Meal',
        secondaryCtaText: 'Try voice input',
    },
    appointments: {
        icon: '📅',
        title: 'No appointments scheduled',
        description: 'Manage all your healthcare appointments in one place:',
        features: [
            'Schedule in-person and video visits',
            'Set appointment reminders',
            'Complete e-check-in before visits',
            'View after-visit summaries',
        ],
        ctaText: 'Schedule an Appointment',
    },
    community: {
        icon: '👥',
        title: 'Join the conversation',
        description: 'Connect with others on their health journey. The community is a safe space to:',
        features: [
            'Share health tips and experiences',
            'Ask questions anonymously',
            'Find support groups',
            'Learn from others\' experiences',
        ],
        ctaText: 'Write Your First Post',
        secondaryCtaText: 'See trending topics',
    },
    reminders: {
        icon: '🔔',
        title: 'No reminders set',
        description: "Never miss an important health task. Set reminders for:",
        features: [
            'Medication schedules',
            'Doctor appointments',
            'Health screenings',
            'Daily health habits',
        ],
        ctaText: 'Create a Reminder',
        secondaryCtaText: 'Or add a medication',
    },
    healthTrends: {
        icon: '📈',
        title: 'No health data yet',
        description: 'Start tracking to see your health trends over time. We can visualize:',
        features: [
            'Blood sugar levels',
            'Blood pressure readings',
            'Weight & BMI changes',
            'Symptom frequency patterns',
        ],
        ctaText: 'Start Logging Data',
    },
};
