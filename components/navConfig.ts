import { HeartPulse, FileText, Pill, BrainCircuit, Bell, Lightbulb, Settings, CalendarDays } from './icons/Icons';

export const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: HeartPulse },
  { path: '/records', label: 'Medical Records', icon: FileText },
  { path: '/medications', label: 'Medication Tracker', icon: Pill },
  { path: '/summary', label: 'Smart Summary', icon: BrainCircuit },
  { path: '/reminders', label: 'Reminders & Alerts', icon: Bell },
  { path: '/appointments', label: 'Appointments', icon: CalendarDays },
  { path: '/tips', label: 'Lifestyle Tips', icon: Lightbulb },
  { path: '/settings', label: 'Settings', icon: Settings },
];