import { Vital, Medication, Symptom } from '../types';

export interface HealthScoreBreakdown {
  total: number;        // 0–100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  color: string;        // Tailwind text color
  bgColor: string;      // Tailwind bg color
  label: string;        // e.g. "Good"
  components: {
    label: string;
    score: number;      // 0–100 for this component
    maxPoints: number;
    earnedPoints: number;
    icon: string;
  }[];
}

/**
 * Calculates a 0–100 Health Score from the user's real Supabase data.
 * Weights:
 *   - Medication adherence:  30 pts
 *   - Blood pressure:        25 pts
 *   - Blood sugar:           20 pts
 *   - Water intake:          15 pts
 *   - Symptom burden:        10 pts
 */
export function calculateHealthScore(
  vitals: Vital[],
  medications: Medication[],
  symptoms: Symptom[],
  waterIntake: number,
  waterGoal: number,
): HealthScoreBreakdown {
  const components: HealthScoreBreakdown['components'] = [];

  // ── 1. Medication adherence (30 pts) ────────────────────────────────
  const activeMeds = medications.filter(m => m.isActive);
  const takenMeds = activeMeds.filter(m => m.takenToday).length;
  const medScore = activeMeds.length > 0
    ? Math.round((takenMeds / activeMeds.length) * 30)
    : 20; // give partial credit if no meds (no penalty)
  components.push({
    label: 'Medication Adherence',
    score: activeMeds.length > 0 ? Math.round((takenMeds / activeMeds.length) * 100) : 67,
    maxPoints: 30,
    earnedPoints: medScore,
    icon: '💊',
  });

  // ── 2. Blood pressure (25 pts) ───────────────────────────────────────
  const latestBP = [...vitals].reverse().find(v => v.systolic && v.diastolic);
  let bpScore = 17; // neutral if no data
  if (latestBP) {
    const sys = latestBP.systolic!;
    const dia = latestBP.diastolic!;
    if (sys < 120 && dia < 80) bpScore = 25;          // Normal
    else if (sys < 130 && dia < 80) bpScore = 22;     // Elevated
    else if (sys < 140 || dia < 90) bpScore = 16;     // Stage 1 HTN
    else bpScore = 8;                                   // Stage 2 HTN
  }
  components.push({
    label: 'Blood Pressure',
    score: Math.round((bpScore / 25) * 100),
    maxPoints: 25,
    earnedPoints: bpScore,
    icon: '❤️',
  });

  // ── 3. Blood sugar (20 pts) ──────────────────────────────────────────
  const latestSugar = [...vitals].reverse().find(v => v.sugar);
  let sugarScore = 13; // neutral
  if (latestSugar?.sugar) {
    const s = latestSugar.sugar;
    if (s >= 70 && s <= 99) sugarScore = 20;           // Normal fasting
    else if (s >= 100 && s <= 125) sugarScore = 14;    // Pre-diabetic
    else if (s < 70) sugarScore = 10;                  // Hypoglycemia
    else sugarScore = 6;                               // Hyperglycemia
  }
  components.push({
    label: 'Blood Sugar',
    score: Math.round((sugarScore / 20) * 100),
    maxPoints: 20,
    earnedPoints: sugarScore,
    icon: '🩸',
  });

  // ── 4. Water intake (15 pts) ─────────────────────────────────────────
  const goal = waterGoal || 8;
  const ratio = Math.min(waterIntake / goal, 1);
  const waterScore = Math.round(ratio * 15);
  components.push({
    label: 'Hydration',
    score: Math.round(ratio * 100),
    maxPoints: 15,
    earnedPoints: waterScore,
    icon: '💧',
  });

  // ── 5. Symptom burden (10 pts) ───────────────────────────────────────
  const recentSymptoms = symptoms.filter(s => {
    const dayAgo = new Date();
    dayAgo.setDate(dayAgo.getDate() - 7);
    return new Date(s.date) >= dayAgo;
  });
  const avgSeverity = recentSymptoms.length > 0
    ? recentSymptoms.reduce((sum, s) => sum + (s.severity || 5), 0) / recentSymptoms.length
    : 0;
  const symptomScore = recentSymptoms.length === 0
    ? 10 : Math.max(0, Math.round(10 - avgSeverity));
  components.push({
    label: 'Symptom Burden',
    score: Math.round((symptomScore / 10) * 100),
    maxPoints: 10,
    earnedPoints: symptomScore,
    icon: '🤒',
  });

  const total = Math.min(
    100,
    components.reduce((sum, c) => sum + c.earnedPoints, 0)
  );

  let grade: HealthScoreBreakdown['grade'];
  let color: string;
  let bgColor: string;
  let label: string;

  if (total >= 85) { grade = 'A'; color = 'text-emerald-600'; bgColor = 'bg-emerald-50 dark:bg-emerald-900/20'; label = 'Excellent'; }
  else if (total >= 70) { grade = 'B'; color = 'text-blue-600'; bgColor = 'bg-blue-50 dark:bg-blue-900/20'; label = 'Good'; }
  else if (total >= 55) { grade = 'C'; color = 'text-amber-600'; bgColor = 'bg-amber-50 dark:bg-amber-900/20'; label = 'Fair'; }
  else if (total >= 40) { grade = 'D'; color = 'text-orange-600'; bgColor = 'bg-orange-50 dark:bg-orange-900/20'; label = 'Needs Attention'; }
  else { grade = 'F'; color = 'text-red-600'; bgColor = 'bg-red-50 dark:bg-red-900/20'; label = 'Critical'; }

  return { total, grade, color, bgColor, label, components };
}
