import React from 'react';
import {
  HeartPulse, FileText, Pill, BrainCircuit, Bell, Lightbulb, Settings,
  CalendarDays, Activity, Utensils, Users, MessageCircle, TestTube2,
  ClipboardCheck, Target, Syringe, LineChart, Baby, MessageSquareQuestion, Bot, Brain, MapPin
} from './icons/Icons';

export interface NavItem {
  path: string;
  label: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: HeartPulse },
      { path: '/summary', label: 'Smart Summary', icon: BrainCircuit },
    ],
  },
  {
    label: 'My Health Record',
    items: [
      { path: '/health-summary', label: 'Health Summary', icon: ClipboardCheck },
      { path: '/documents', label: 'My Documents', icon: FileText },
      { path: '/test-results', label: 'Test Results', icon: TestTube2 },
      { path: '/medications', label: 'Medications', icon: Pill },
    ],
  },
  {
    label: 'Tools & Tracking',
    items: [
      { path: '/symptom-checker', label: 'Symptom Checker', icon: Bot },
      { path: '/symptoms', label: 'Symptom Log', icon: Activity },
      { path: '/food-journal', label: 'Food Journal', icon: Utensils },
      { path: '/health-trends', label: 'Health Trends', icon: LineChart },
      { path: '/growth-charts', label: 'Growth Charts', icon: Baby },
    ],
  },
  {
    label: 'Care Planning',
    items: [
      { path: '/appointments', label: 'Appointments', icon: CalendarDays },
      { path: '/find-care', label: 'Find Care', icon: MapPin },
      { path: '/preventive-care', label: 'Preventive Care', icon: Target },
      { path: '/plan-of-care', label: 'Plan of Care', icon: Syringe },
      { path: '/questionnaires', label: 'Questionnaires', icon: MessageSquareQuestion },
      { path: '/reminders', label: 'Reminders & Alerts', icon: Bell },
    ],
  },
  {
    label: 'Connect',
    items: [
      { path: '/dashboard/mentibot', label: 'Mentibot', icon: Brain },
      { path: '/family-access', label: 'Family Access', icon: Users },
      { path: '/community', label: 'Community', icon: MessageCircle },
      { path: '/tips', label: 'Lifestyle Tips', icon: Lightbulb },
    ],
  },
];

// Flat list for backward compatibility (used by Breadcrumbs etc.)
export const navItems = navGroups.flatMap(g => g.items).concat([
  { path: '/settings', label: 'Settings', icon: Settings },
]);