import { HeartPulse, FileText, Pill, BrainCircuit, Bell, Lightbulb } from './icons/Icons';

export const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: HeartPulse },
  { path: '/records', label: 'Medical Records', icon: FileText },
  { path: '/medications', label: 'Medication Tracker', icon: Pill },
  { path: '/summary', label: 'Smart Summary', icon: BrainCircuit },
  { path: '/reminders', label: 'Reminders & Alerts', icon: Bell },
  { path: '/tips', label: 'Lifestyle Tips', icon: Lightbulb },
];
