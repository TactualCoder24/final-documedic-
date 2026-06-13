import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Pill, BrainCircuit, Bell, Lightbulb, QrCode, HeartPulse, Activity, ClipboardList, Moon, Utensils, Users, CalendarDays, ShieldCheck, MessageCircle, Brain, ScanLine, MessageSquare, FileDown, Star, Video, Mic, Share2, ClipboardCheck, KeyRound, Globe, TrendingUp, Calendar, Smile, BedDouble, TestTube2, Wrench, Boxes, Building2, AlertTriangle, Sparkles } from '../components/icons/Icons';
import Logo from '../components/icons/Logo';
import Button from '../components/ui/Button';
import ThemeToggle from '../components/ui/ThemeToggle';
import Modal from '../components/ui/Modal';

interface Feature {
  icon: React.FC<{ className?: string }>;
  title: string;
  tag: string;
  color: string;
  iconColor: string;
  description: string;
  whyItHelps: string;
}

const patientFeatures: Feature[] = [
  {
    icon: FileText,
    title: 'Medical Records',
    tag: 'Records',
    color: 'from-blue-500/20 to-blue-600/10',
    iconColor: 'text-blue-600 dark:text-blue-400',
    description: 'Securely upload, organise, and access all your health reports, prescriptions, and consultation notes in one place. Works with photos, PDFs, and scanned documents.',
    whyItHelps: "Think of it as one folder for your entire health history — no more digging through old WhatsApp chats or hospital files to find a report when you need it most.",
  },
  {
    icon: Pill,
    title: 'Medication Tracking',
    tag: 'Medications',
    color: 'from-emerald-500/20 to-emerald-600/10',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    description: 'Log your medications, set dosage schedules, and mark each dose as taken or missed. See your 30-day adherence percentage at a glance, and get an automatic refill reminder before your supply runs out.',
    whyItHelps: "Never wonder 'did I take that pill today?' again — and get a heads-up before you run out, so a refill is never a last-minute scramble.",
  },
  {
    icon: BrainCircuit,
    title: 'AI Health Summary',
    tag: 'AI-Powered',
    color: 'from-violet-500/20 to-violet-600/10',
    iconColor: 'text-violet-600 dark:text-violet-400',
    description: 'Get an AI-powered, plain-language summary of your entire health profile — lab results, vitals, medications — ready to share with any doctor in seconds.',
    whyItHelps: "Walk into any appointment — even with a doctor you've never met — with a one-page summary of your health, instead of trying to remember everything yourself.",
  },
  {
    icon: HeartPulse,
    title: 'Vitals Tracking',
    tag: 'Monitoring',
    color: 'from-rose-500/20 to-rose-600/10',
    iconColor: 'text-rose-600 dark:text-rose-400',
    description: 'Track blood pressure, blood sugar, heart rate, and more. See trends over time with beautiful charts and get instant alerts for out-of-range readings.',
    whyItHelps: "Spot warning signs early by seeing how your numbers change over weeks and months — not just on the one day a year you visit a doctor.",
  },
  {
    icon: Bell,
    title: 'Smart Reminders',
    tag: 'Reminders',
    color: 'from-amber-500/20 to-amber-600/10',
    iconColor: 'text-amber-600 dark:text-amber-400',
    description: 'Set personalised reminders for medications, appointments, and wellness habits. DocuMedic nudges you at the right time so you stay on track effortlessly.',
    whyItHelps: "A gentle nudge at exactly the right moment, so healthy habits actually stick instead of slipping through the cracks of a busy day.",
  },
  {
    icon: QrCode,
    title: 'Emergency QR Card',
    tag: 'Safety',
    color: 'from-cyan-500/20 to-cyan-600/10',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    description: 'Generate a secure, scannable QR code linking to your emergency health profile. Share critical info like allergies and blood type with first responders instantly.',
    whyItHelps: "If something happens and you can't speak for yourself, a single scan tells first responders exactly what they need to know — allergies, blood type, conditions, and emergency contacts.",
  },
  {
    icon: Lightbulb,
    title: 'AI Lifestyle Tips',
    tag: 'Wellness',
    color: 'from-orange-500/20 to-orange-600/10',
    iconColor: 'text-orange-600 dark:text-orange-400',
    description: 'Receive personalised wellness suggestions powered by your actual health data — not generic advice. Better sleep, diet, and activity guidance tailored to you.',
    whyItHelps: "Like having a wellness coach who actually knows your medical history, not just generic internet advice that may not apply to you.",
  },
  {
    icon: Activity,
    title: 'Symptom Tracker',
    tag: 'Tracking',
    color: 'from-pink-500/20 to-pink-600/10',
    iconColor: 'text-pink-600 dark:text-pink-400',
    description: 'Log symptoms with severity scores and timestamps. Spot patterns over time and share a complete symptom history with your doctor before your next visit.',
    whyItHelps: "Turn 'it's been bothering me for a while, on and off' into a clear timeline with dates and severity — something your doctor can actually act on.",
  },
  {
    icon: Moon,
    title: 'Sleep Tracker',
    tag: 'Wellness',
    color: 'from-indigo-500/20 to-indigo-600/10',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    description: 'Log sleep duration and quality each night. Understand how rest affects your vitals and mood with weekly trend visualisations.',
    whyItHelps: "See the real connection between how you sleep and how you feel the next day — backed by your own data, not guesswork.",
  },
  {
    icon: Utensils,
    title: 'Food Journal',
    tag: 'Nutrition',
    color: 'from-green-500/20 to-green-600/10',
    iconColor: 'text-green-600 dark:text-green-400',
    description: 'Log meals by type and track your nutritional habits over time. See how your diet correlates with energy levels, blood sugar, and weight.',
    whyItHelps: "Understand how what you eat actually affects your energy, blood sugar, and weight over time — not just in theory, but in your own numbers.",
  },
  {
    icon: Users,
    title: 'Family Access',
    tag: 'Caregiving',
    color: 'from-teal-500/20 to-teal-600/10',
    iconColor: 'text-teal-600 dark:text-teal-400',
    description: 'Manage health records for your entire family from a single account. Perfect for parents looking after children or caregivers supporting elderly relatives.',
    whyItHelps: "One login to look after everyone — from your kids' vaccination records to your parents' prescriptions — without juggling separate accounts.",
  },
  {
    icon: CalendarDays,
    title: 'Appointment Manager',
    tag: 'Scheduling',
    color: 'from-sky-500/20 to-sky-600/10',
    iconColor: 'text-sky-600 dark:text-sky-400',
    description: 'Schedule, track, and prepare for medical appointments. Get pre-visit summaries and post-visit notes to make every doctor interaction more productive.',
    whyItHelps: "Stop double-booking or forgetting visits entirely — and walk in already knowing what you wanted to ask.",
  },
  {
    icon: MessageCircle,
    title: 'Community Support',
    tag: 'Community',
    color: 'from-sky-500/20 to-sky-600/10',
    iconColor: 'text-sky-600 dark:text-sky-400',
    description: 'Connect with others on similar health journeys. Share experiences, ask questions, and find support in a safe, moderated environment.',
    whyItHelps: "You're not the only one going through this — connect with people who genuinely get it, in a space that's moderated and safe.",
  },
  {
    icon: Brain,
    title: 'Mentibot Companion',
    tag: 'Mental Health',
    color: 'from-purple-500/20 to-purple-600/10',
    iconColor: 'text-purple-600 dark:text-purple-400',
    description: 'Your AI mental health companion providing empathetic chat, guided exercises, mood tracking, and journaling for holistic well-being.',
    whyItHelps: "A judgement-free space to talk things through, try guided exercises, and notice patterns in your mood — available whenever you need it.",
  },
  {
    icon: Video,
    title: 'Video Teleconsultation',
    tag: 'Telehealth',
    color: 'from-blue-500/20 to-cyan-600/10',
    iconColor: 'text-blue-600 dark:text-blue-400',
    description: 'Join secure, in-browser video visits with your doctor directly from your appointment list — no extra apps or downloads needed.',
    whyItHelps: "See your doctor without leaving home — just click 'Join' on your appointment, no extra apps to download or accounts to set up.",
  },
  {
    icon: Bell,
    title: 'Notification Center',
    tag: 'Updates',
    color: 'from-amber-500/20 to-yellow-600/10',
    iconColor: 'text-amber-600 dark:text-amber-400',
    description: 'Get real-time alerts for new prescriptions, invoices, messages, referrals, and appointment updates — all in one place.',
    whyItHelps: "Everything important — a new prescription, a message from your doctor, an upcoming appointment — lands in one place, so nothing slips through the cracks.",
  },
  {
    icon: Star,
    title: 'Doctor Reviews & Feedback',
    tag: 'Feedback',
    color: 'from-yellow-500/20 to-amber-600/10',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    description: 'Rate your visits and share feedback with your doctor after every appointment, helping clinics improve patient experience.',
    whyItHelps: "A quick rating after your visit helps your clinic get better — and helps other patients choose the right doctor for them.",
  },
];

const doctorFeatures: Feature[] = [
  {
    icon: ScanLine,
    title: 'AI-Powered OCR',
    tag: 'Digitisation',
    color: 'from-blue-500/20 to-indigo-600/10',
    iconColor: 'text-blue-600 dark:text-blue-400',
    description: 'Instantly scan and convert old, handwritten physical prescriptions and unstructured lab reports into clean, categorised digital formats.',
    whyItHelps: "Turn that drawer full of old paper prescriptions and lab slips into searchable, organised digital records in minutes — not weeks of data entry.",
  },
  {
    icon: MessageSquare,
    title: 'Patient Chat',
    tag: 'Data Retrieval',
    color: 'from-violet-500/20 to-purple-600/10',
    iconColor: 'text-violet-600 dark:text-violet-400',
    description: 'Use an intuitive conversational interface to pull up specific past records, blood tests, or old prescriptions instantly without clicking through folders.',
    whyItHelps: "Just type 'what was their last HbA1c?' instead of clicking through years of folders — get the answer in seconds, mid-consultation.",
  },
  {
    icon: ClipboardList,
    title: 'Pre-Appointment Briefing',
    tag: 'Insights',
    color: 'from-emerald-500/20 to-teal-600/10',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    description: 'Get a centralised dashboard overview with AI-powered insights summarizing the patient\'s history before they even step into your office.',
    whyItHelps: "Walk into the room already knowing what matters for this patient — recent changes, open issues, and anything that needs follow-up.",
  },
  {
    icon: ShieldCheck,
    title: 'CDSS',
    tag: 'Decision Support',
    color: 'from-rose-500/20 to-red-600/10',
    iconColor: 'text-rose-600 dark:text-rose-400',
    description: 'Clinical Decision Support System analyzing longitudinal health records to provide real-time guidance, flag drug interactions, and suggest lab investigations.',
    whyItHelps: "A second pair of eyes that quietly flags risky drug interactions and suggests relevant tests, based on the patient's full history — before you sign off.",
  },
  {
    icon: BrainCircuit,
    title: 'MediSaathi',
    tag: 'Ambient AI',
    color: 'from-indigo-500/20 to-blue-600/10',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    description: 'An always-on AI panel on every patient chart that surfaces key history highlights, answers natural-language questions about the record, and flags drug interactions or allergy conflicts live as you write a prescription.',
    whyItHelps: "An assistant sitting quietly on every chart — it surfaces what's worth knowing, answers your questions in plain English, and double-checks your prescription as you write it.",
  },
  {
    icon: FileDown,
    title: 'EMR Export',
    tag: 'Interoperability',
    color: 'from-amber-500/20 to-orange-600/10',
    iconColor: 'text-amber-600 dark:text-amber-400',
    description: 'Generate standardized, portable clinical summaries in one click, ready to be sent to other healthcare providers or added to external systems.',
    whyItHelps: "One click to hand off a clean, standardised summary to another doctor, hospital, or system — no retyping, no formatting headaches.",
  },
  {
    icon: Mic,
    title: 'Voice-to-Prescription',
    tag: 'AI-Powered',
    color: 'from-violet-500/20 to-fuchsia-600/10',
    iconColor: 'text-violet-600 dark:text-violet-400',
    description: 'Dictate diagnoses, medications, and instructions naturally — DocuMedic transcribes and structures them into a ready-to-sign prescription instantly.',
    whyItHelps: "Just speak the diagnosis and medications naturally, like you would to an assistant — DocuMedic structures it into a ready-to-sign prescription instantly.",
  },
  {
    icon: Pill,
    title: 'Prescription Writer & History',
    tag: 'e-Prescriptions',
    color: 'from-emerald-500/20 to-green-600/10',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    description: 'Write digital prescriptions with dosage, frequency, and duration, generate printable PDFs, and access a full history for every patient. One-click quick-templates for 16 specialties — plus your own saved, renameable, reorderable templates for diagnoses, complaints, and test panels.',
    whyItHelps: "Write prescriptions faster with one-click templates for your specialty, and never lose track of what you prescribed last time — it's all in the patient's history.",
  },
  {
    icon: TrendingUp,
    title: 'Billing & Invoicing',
    tag: 'Billing',
    color: 'from-amber-500/20 to-yellow-600/10',
    iconColor: 'text-amber-600 dark:text-amber-400',
    description: 'Generate itemised invoices with tax calculations, track payments, and give patients instant access to their billing history.',
    whyItHelps: "Generate clean, itemised invoices and track who's paid — without needing a separate billing tool or spreadsheet.",
  },
  {
    icon: Share2,
    title: 'Referral Management',
    tag: 'Care Coordination',
    color: 'from-sky-500/20 to-blue-600/10',
    iconColor: 'text-sky-600 dark:text-sky-400',
    description: 'Refer patients to specialists with notes and history attached, and track referral status from sent to completed.',
    whyItHelps: "Send a patient to a specialist with full context attached — and actually know whether they showed up and what happened next.",
  },
  {
    icon: MessageSquare,
    title: 'Secure Patient Messaging',
    tag: 'Communication',
    color: 'from-purple-500/20 to-violet-600/10',
    iconColor: 'text-purple-600 dark:text-purple-400',
    description: 'Send secure messages and reminders directly to patients, with automatic notifications so nothing gets missed.',
    whyItHelps: "Answer a quick question or send a reminder directly to a patient's app — no phone tag, no messages lost in personal WhatsApp.",
  },
  {
    icon: Smile,
    title: 'Dental Chart',
    tag: 'Specialty Tools',
    color: 'from-cyan-500/20 to-teal-600/10',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    description: 'Interactive tooth-by-tooth charting for dental practices to record conditions, treatments, and history per patient.',
    whyItHelps: "A visual, tooth-by-tooth record that's far quicker to read and update than hand-written notes — built specifically for dental practice.",
  },
  {
    icon: Activity,
    title: 'Medical Calculators',
    tag: 'Clinical Tools',
    color: 'from-rose-500/20 to-pink-600/10',
    iconColor: 'text-rose-600 dark:text-rose-400',
    description: 'Quick-access clinical calculators (BMI, dosage, eGFR, and more) built right into your workflow.',
    whyItHelps: "Common calculations like BMI, dosage, and eGFR right where you're already working — no switching to a separate app mid-consultation.",
  },
  {
    icon: Building2,
    title: 'Multi-Clinic Switching',
    tag: 'Workflow',
    color: 'from-sky-500/20 to-blue-600/10',
    iconColor: 'text-sky-600 dark:text-sky-400',
    description: 'Work across multiple clinics from one account. Switch your active clinic from the sidebar and see a live Clinic Queue for that location, with one-click "Call" and "Complete" actions.',
    whyItHelps: "If you practice at more than one clinic, switch between them from the sidebar — without logging out and back in for each location.",
  },
  {
    icon: AlertTriangle,
    title: 'No-Show Prediction',
    tag: 'Scheduling',
    color: 'from-orange-500/20 to-red-600/10',
    iconColor: 'text-orange-600 dark:text-orange-400',
    description: "Today's appointment list flags patients with a history of no-shows, showing their past no-show rate so you can double-confirm or plan for overbooking that slot.",
    whyItHelps: "Know in advance which slots are likely to go empty, based on a patient's history — so you can send a reminder or plan for overbooking.",
  },
];

const clinicFeatures: Feature[] = [
  {
    icon: Users,
    title: 'Multi-Doctor Staff Management',
    tag: 'Clinic Admin',
    color: 'from-blue-500/20 to-indigo-600/10',
    iconColor: 'text-blue-600 dark:text-blue-400',
    description: 'Invite doctors, nurses, and front-desk staff, organise them into departments, and manage their access from one dashboard.',
    whyItHelps: "Bring your whole team — doctors, nurses, front-desk — onto one platform, organised into departments, with the right access for each person.",
  },
  {
    icon: KeyRound,
    title: 'Roles & Permission Matrix',
    tag: 'Access Control',
    color: 'from-slate-500/20 to-zinc-600/10',
    iconColor: 'text-slate-600 dark:text-slate-400',
    description: 'Define granular, role-based permissions — including custom roles — to control exactly what each staff member can view and do.',
    whyItHelps: "Decide exactly who can see billing, who can edit charts, and who should only manage the front-desk queue — down to the individual permission.",
  },
  {
    icon: Calendar,
    title: 'Scheduler Configuration',
    tag: 'Operations',
    color: 'from-sky-500/20 to-cyan-600/10',
    iconColor: 'text-sky-600 dark:text-sky-400',
    description: 'Set per-doctor appointment slot durations, buffer times, overbooking rules, and walk-in queue priority.',
    whyItHelps: "Set the scheduling rules once — slot lengths, buffer time between patients, walk-in priority — and every doctor's calendar follows them automatically.",
  },
  {
    icon: TrendingUp,
    title: 'Rate Card & Billing Config',
    tag: 'Revenue',
    color: 'from-amber-500/20 to-orange-600/10',
    iconColor: 'text-amber-600 dark:text-amber-400',
    description: 'Maintain a centralised price list for consultations, procedures, and diagnostics with tax rates, ready to use across invoices.',
    whyItHelps: "Set your prices and tax rates once, in one place — every invoice across the clinic picks them up automatically, with no manual re-entry.",
  },
  {
    icon: ClipboardCheck,
    title: 'Intake Form Builder & e-Signature',
    tag: 'Patient Intake',
    color: 'from-emerald-500/20 to-teal-600/10',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    description: 'Design custom pre-visit intake forms with text, dropdown, and checkbox fields, plus consent text and digital signature capture.',
    whyItHelps: "Patients fill in their details and sign consent forms before they even arrive — less paperwork at the front desk, faster check-ins.",
  },
  {
    icon: Globe,
    title: 'Public Booking Page',
    tag: 'Patient Acquisition',
    color: 'from-violet-500/20 to-purple-600/10',
    iconColor: 'text-violet-600 dark:text-violet-400',
    description: 'Give your clinic a shareable public booking page so new and existing patients can request appointments online, 24/7.',
    whyItHelps: "A page you can share anywhere — WhatsApp, Google, Instagram — so patients can book themselves in, any time of day, without calling the front desk.",
  },
  {
    icon: ShieldCheck,
    title: 'Audit Log',
    tag: 'Compliance',
    color: 'from-rose-500/20 to-red-600/10',
    iconColor: 'text-rose-600 dark:text-rose-400',
    description: 'A tamper-evident record of staff and configuration changes across your clinic, for accountability and compliance.',
    whyItHelps: "A clear, tamper-evident record of who changed what and when — useful for accountability, disputes, and compliance checks.",
  },
  {
    icon: BrainCircuit,
    title: 'Practice Analytics',
    tag: 'Insights',
    color: 'from-indigo-500/20 to-blue-600/10',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    description: 'Track patient volume, revenue, completion rates, top diagnoses, and patient reviews across your entire clinic.',
    whyItHelps: "See how your clinic is actually doing — patient volume, revenue, what's working and what isn't — at a glance, without building your own spreadsheets.",
  },
];

const hospitalFeatures: Feature[] = [
  {
    icon: BedDouble,
    title: 'IPD & Bed Management',
    tag: 'In-Patient Care',
    color: 'from-cyan-500/20 to-sky-600/10',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    description: 'Manage wards and beds by type, admit and discharge in-patients, and keep real-time occupancy status across the hospital.',
    whyItHelps: "Know which beds are free, occupied, or being prepped, in real time — across every ward, without phone calls or whiteboards.",
  },
  {
    icon: Pill,
    title: 'Pharmacy & Inventory',
    tag: 'Pharmacy',
    color: 'from-emerald-500/20 to-green-600/10',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    description: 'Track medicine stock levels, get reorder alerts, and dispense medicines directly against inventory with a full dispense log.',
    whyItHelps: "Dispense medicines straight from stock and get alerted before something runs out — so a shortage never becomes a surprise.",
  },
  {
    icon: TestTube2,
    title: 'Lab Order Management',
    tag: 'Diagnostics',
    color: 'from-purple-500/20 to-fuchsia-600/10',
    iconColor: 'text-purple-600 dark:text-purple-400',
    description: 'Route lab test orders from request through sample collection, processing, and result entry — all in one tracker.',
    whyItHelps: "Track a test from 'ordered' to 'results ready' in one place — no more chasing the lab by phone to find out where a sample is.",
  },
  {
    icon: ShieldCheck,
    title: 'Insurance & Claims Tracking',
    tag: 'Billing',
    color: 'from-amber-500/20 to-yellow-600/10',
    iconColor: 'text-amber-600 dark:text-amber-400',
    description: 'Track insurance claims per patient and payer from draft through submission, approval, and settlement, with claim totals by status.',
    whyItHelps: "Keep tabs on every insurance claim's status — draft, submitted, approved, settled — so nothing gets forgotten or delayed for weeks.",
  },
  {
    icon: Wrench,
    title: 'Equipment & Asset Tracking',
    tag: 'Facilities',
    color: 'from-slate-500/20 to-gray-600/10',
    iconColor: 'text-slate-600 dark:text-slate-400',
    description: 'Keep a register of medical equipment with location, status, and service schedules, with alerts for assets due for service.',
    whyItHelps: "Know where your equipment is, what condition it's in, and when it's due for servicing — before it breaks down mid-procedure.",
  },
  {
    icon: Boxes,
    title: 'Clinic Commerce Settings',
    tag: 'Configuration',
    color: 'from-teal-500/20 to-emerald-600/10',
    iconColor: 'text-teal-600 dark:text-teal-400',
    description: 'Toggle pharmacy and lab fulfillment on or off for your clinic, and configure markup percentages and delivery fees.',
    whyItHelps: "Turn on pharmacy or lab delivery for your patients and set your markup and delivery fees — all from one settings screen.",
  },
];

const FeatureCard: React.FC<{ feature: Feature; index: number; onSelect: (f: Feature) => void }> = ({ feature, index, onSelect }) => (
  <motion.button
    type="button"
    onClick={() => onSelect(feature)}
    key={feature.title}
    className={`group text-left p-7 rounded-2xl bg-gradient-to-br ${feature.color} border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50`}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.4, delay: (index % 6) * 0.06 }}
  >
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-xl bg-white dark:bg-card flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
        <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-base font-heading">{feature.title}</h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20 text-muted-foreground">{feature.tag}</span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
      </div>
    </div>
  </motion.button>
);

const FeaturesPage: React.FC = () => {
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

  return (
  <motion.div
    className="min-h-screen bg-background text-foreground"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
  >
    {/* Nav */}
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
            <Logo className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold font-heading">DocuMedic</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/who-its-for" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Who It's For</Link>
          <Link to="/security" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Security</Link>
          <ThemeToggle />
          <Button asChild size="sm">
            <Link to="/login">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>

    {/* Hero */}
    <section className="relative py-20 text-center overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-primary/5 dark:via-background dark:to-background" />
      <motion.div
        className="container mx-auto px-4 max-w-3xl"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-semibold text-primary mb-6">
          <ShieldCheck className="h-4 w-4" /> All Features
        </span>
        <h1 className="text-5xl sm:text-6xl font-black font-heading leading-tight">
          Everything you need for <span className="text-gradient">smarter health</span>
        </h1>
        <p className="mt-6 text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          DocuMedic brings together 35+ powerful features to give you complete visibility and control over your health — from day-to-day tracking to emergency preparedness, plus full practice management tools for doctors, clinics, and hospitals.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Tap any feature below for a quick, plain-English explanation of what it does.
        </p>
        <div className="mt-8 flex gap-3 justify-center">
          <Button asChild variant="gradient" size="lg">
            <Link to="/login">Start for Free</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/">← Back to Home</Link>
          </Button>
        </div>
      </motion.div>
    </section>

    {/* Patient Features Grid */}
    <section className="py-16 pb-12">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold font-heading">For Patients & Families</h2>
          <p className="text-muted-foreground mt-2 text-lg">Everything you need to manage your personal health journey.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {patientFeatures.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} onSelect={setSelectedFeature} />
          ))}
        </div>
      </div>
    </section>

    {/* Doctor Features Grid */}
    <section className="py-12 pb-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold font-heading">For Doctors & Clinics</h2>
          <p className="text-muted-foreground mt-2 text-lg">Advanced AI tools to streamline your practice and improve patient care.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {doctorFeatures.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} onSelect={setSelectedFeature} />
          ))}
        </div>
      </div>
    </section>

    {/* Clinic Admin Features Grid */}
    <section className="py-12 pb-24">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold font-heading">For Clinics & Practice Admins</h2>
          <p className="text-muted-foreground mt-2 text-lg">Run your entire practice — staff, scheduling, billing, and compliance — from one place.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {clinicFeatures.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} onSelect={setSelectedFeature} />
          ))}
        </div>
      </div>
    </section>

    {/* Hospital Operations Features Grid */}
    <section className="py-12 pb-24">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold font-heading">Hospital Operations</h2>
          <p className="text-muted-foreground mt-2 text-lg">For larger facilities — beds and in-patient care, pharmacy, lab, insurance, and equipment, all in one place.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {hospitalFeatures.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} onSelect={setSelectedFeature} />
          ))}
        </div>
      </div>
    </section>

    {/* CTA Banner */}
    <section className="pb-24">
      <div className="container mx-auto px-4">
        <motion.div
          className="mt-16 rounded-3xl p-12 text-center animated-gradient shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold font-heading text-white">Ready to get started?</h2>
          <p className="mt-3 text-white/80 max-w-lg mx-auto">Join DocuMedic today and take control of your health journey.</p>
          <Button asChild size="lg" variant="white" className="mt-8 font-bold shadow-xl">
            <Link to="/login">Create Free Account →</Link>
          </Button>
        </motion.div>
      </div>
    </section>

    {/* Footer */}
    <footer className="py-8 border-t border-border">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} DocuMedic. All rights reserved.</p>
        <div className="flex gap-4">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <Link to="/who-its-for" className="hover:text-foreground transition-colors">Who It's For</Link>
          <Link to="/security" className="hover:text-foreground transition-colors">Security</Link>
          <Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
        </div>
      </div>
    </footer>

    {/* Feature Explanation Modal */}
    <Modal
      isOpen={!!selectedFeature}
      onClose={() => setSelectedFeature(null)}
      title={selectedFeature?.title || ''}
    >
      {selectedFeature && (
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${selectedFeature.color} flex items-center justify-center shrink-0 shadow-sm`}>
              <selectedFeature.icon className={`h-7 w-7 ${selectedFeature.iconColor}`} />
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-muted text-muted-foreground">{selectedFeature.tag}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">What it does</p>
            <p className="text-sm leading-relaxed">{selectedFeature.description}</p>
          </div>
          <div className={`rounded-xl p-4 bg-gradient-to-br ${selectedFeature.color} border border-border/50`}>
            <p className="text-sm font-semibold flex items-center gap-1.5 mb-1.5">
              <Sparkles className={`h-4 w-4 ${selectedFeature.iconColor}`} /> Why it helps
            </p>
            <p className="text-sm leading-relaxed text-foreground/90">{selectedFeature.whyItHelps}</p>
          </div>
          <Button asChild variant="gradient" className="w-full">
            <Link to="/login">Try it now →</Link>
          </Button>
        </div>
      )}
    </Modal>
  </motion.div>
  );
};

export default FeaturesPage;
