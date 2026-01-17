import { 
    HeartPulse, FileText, Pill, BrainCircuit, Bell, Lightbulb, Settings, 
    CalendarDays, Activity, Utensils, Users, MessageCircle, TestTube2,
    ClipboardCheck, Target, Syringe, LineChart, Baby, MessageSquareQuestion, Bot
} from './icons/Icons';

export const navItems = [
  // Overview
  { path: '/dashboard', label: 'Dashboard', icon: HeartPulse },
  { path: '/summary', label: 'Smart Summary', icon: BrainCircuit },
  
  // My Health Record
  { path: '/health-summary', label: 'Health Summary', icon: ClipboardCheck },
  { path: '/documents', label: 'My Documents', icon: FileText },
  { path: '/test-results', label: 'Test Results', icon: TestTube2 },
  { path: '/medications', label: 'Medications', icon: Pill },

  // Tools & Tracking
  { path: '/symptom-checker', label: 'Symptom Checker', icon: Bot },
  { path: '/symptoms', label: 'Symptom Log', icon: Activity },
  { path: '/food-journal', label: 'Food Journal', icon: Utensils },
  { path: '/health-trends', label: 'Health Trends', icon: LineChart },
  { path: '/growth-charts', label: 'Growth Charts', icon: Baby },

  // Care Planning
  { path: '/appointments', label: 'Appointments', icon: CalendarDays },
  { path: '/preventive-care', label: 'Preventive Care', icon: Target },
  { path: '/plan-of-care', label: 'Plan of Care', icon: Syringe },
  { path: '/questionnaires', label: 'Questionnaires', icon: MessageSquareQuestion },
  { path: '/reminders', label: 'Reminders & Alerts', icon: Bell },

  // Connect & Personalize
  { path: '/family-access', label: 'Family Access', icon: Users },
  { path: '/community', label: 'Community', icon: MessageCircle },
  { path: '/tips', label: 'Lifestyle Tips', icon: Lightbulb },
  { path: '/settings', label: 'Settings', icon: Settings },
];