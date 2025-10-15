import { HeartPulse, FileText, Pill, BrainCircuit, Bell, Lightbulb, Settings, CalendarDays, Activity, Utensils, Users } from './icons/Icons';

export const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: HeartPulse },
  { path: '/records', label: 'Medical Records', icon: FileText },
  { path: '/medications', label: 'Medication Tracker', icon: Pill },
  { path: '/symptoms', label: 'Symptom Log', icon: Activity },
  { path: '/food-journal', label: 'Food Journal', icon: Utensils },
  { path: '/summary', label: 'Smart Summary', icon: BrainCircuit },
  { path: '/reminders', label: 'Reminders & Alerts', icon: Bell },
  { path: '/appointments', label: 'Appointments', icon: CalendarDays },
  { path: '/tips', label: 'Lifestyle Tips', icon: Lightbulb },
  { path: '/community', label: 'Community', icon: Users },
  { path: '/settings', label: 'Settings', icon: Settings },
];
