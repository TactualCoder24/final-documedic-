// Lightweight static reference data for the prescription module.
// Used for autocomplete suggestions; not a substitute for a full drug/ICD database.

import { ClinicalTemplateType } from '../types';

export interface DrugReference {
  name: string;
  commonDosages: string[];
  defaultFrequency: string;
}

export const COMMON_DRUGS: DrugReference[] = [
  { name: 'Paracetamol', commonDosages: ['500mg', '650mg'], defaultFrequency: '1-1-1' },
  { name: 'Ibuprofen', commonDosages: ['200mg', '400mg'], defaultFrequency: '1-0-1' },
  { name: 'Amoxicillin', commonDosages: ['250mg', '500mg'], defaultFrequency: '1-1-1' },
  { name: 'Azithromycin', commonDosages: ['250mg', '500mg'], defaultFrequency: '0-1-0' },
  { name: 'Metformin', commonDosages: ['500mg', '1000mg'], defaultFrequency: '1-0-1' },
  { name: 'Amlodipine', commonDosages: ['2.5mg', '5mg', '10mg'], defaultFrequency: '1-0-0' },
  { name: 'Atorvastatin', commonDosages: ['10mg', '20mg', '40mg'], defaultFrequency: '0-0-1' },
  { name: 'Omeprazole', commonDosages: ['20mg', '40mg'], defaultFrequency: '1-0-0' },
  { name: 'Pantoprazole', commonDosages: ['40mg'], defaultFrequency: '1-0-0' },
  { name: 'Cetirizine', commonDosages: ['5mg', '10mg'], defaultFrequency: '0-0-1' },
  { name: 'Levothyroxine', commonDosages: ['25mcg', '50mcg', '100mcg'], defaultFrequency: '1-0-0' },
  { name: 'Losartan', commonDosages: ['25mg', '50mg'], defaultFrequency: '1-0-0' },
  { name: 'Azathioprine', commonDosages: ['50mg'], defaultFrequency: '1-0-0' },
  { name: 'Salbutamol Inhaler', commonDosages: ['100mcg'], defaultFrequency: 'As needed' },
  { name: 'Vitamin D3', commonDosages: ['60000 IU'], defaultFrequency: 'Once weekly' },
  { name: 'Vitamin B12', commonDosages: ['1500mcg'], defaultFrequency: '1-0-0' },
  { name: 'Iron + Folic Acid', commonDosages: ['100mg'], defaultFrequency: '1-0-0' },
  { name: 'Ondansetron', commonDosages: ['4mg', '8mg'], defaultFrequency: 'As needed' },
  { name: 'Diclofenac', commonDosages: ['50mg'], defaultFrequency: '1-0-1' },
  { name: 'Ranitidine', commonDosages: ['150mg'], defaultFrequency: '1-0-1' },
  { name: 'Cefixime', commonDosages: ['200mg'], defaultFrequency: '1-0-1' },
  { name: 'Doxycycline', commonDosages: ['100mg'], defaultFrequency: '1-0-1' },
  { name: 'Montelukast', commonDosages: ['10mg'], defaultFrequency: '0-0-1' },
  { name: 'Prednisolone', commonDosages: ['5mg', '10mg', '20mg'], defaultFrequency: '1-0-0' },
  { name: 'Insulin Glargine', commonDosages: ['10 units', '20 units'], defaultFrequency: 'Once nightly' },
  { name: 'Aspirin', commonDosages: ['75mg', '150mg'], defaultFrequency: '1-0-0' },
  { name: 'Clopidogrel', commonDosages: ['75mg'], defaultFrequency: '1-0-0' },
  { name: 'Multivitamin', commonDosages: ['Standard'], defaultFrequency: '1-0-0' },
  { name: 'ORS Sachet', commonDosages: ['1 sachet'], defaultFrequency: 'After each loose stool' },
  { name: 'Zinc Sulphate', commonDosages: ['20mg'], defaultFrequency: '1-0-0' },
];

export const COMMON_FREQUENCIES = [
  '1-0-0', '0-1-0', '0-0-1', '1-0-1', '1-1-1', '1-1-1-1', 'Once daily',
  'Twice daily', 'Thrice daily', 'Once weekly', 'As needed', 'Before bed',
];

export const COMMON_DURATIONS = [
  '3 days', '5 days', '7 days', '10 days', '14 days', '1 month', '3 months', '6 months', 'Ongoing',
];

export const COMMON_INSTRUCTIONS = [
  'After food', 'Before food', 'With water', 'Empty stomach', 'At bedtime', 'As needed for pain',
];

export interface IcdCodeReference {
  code: string;
  description: string;
}

// A small curated subset of frequently-used ICD-10 codes for quick lookup.
export const COMMON_ICD10_CODES: IcdCodeReference[] = [
  { code: 'J06.9', description: 'Acute upper respiratory infection, unspecified' },
  { code: 'J00', description: 'Acute nasopharyngitis (common cold)' },
  { code: 'J02.9', description: 'Acute pharyngitis, unspecified' },
  { code: 'J18.9', description: 'Pneumonia, unspecified organism' },
  { code: 'J45.909', description: 'Unspecified asthma, uncomplicated' },
  { code: 'A09', description: 'Infectious gastroenteritis and colitis, unspecified' },
  { code: 'K21.9', description: 'Gastro-esophageal reflux disease without esophagitis' },
  { code: 'K29.70', description: 'Gastritis, unspecified, without bleeding' },
  { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications' },
  { code: 'E10.9', description: 'Type 1 diabetes mellitus without complications' },
  { code: 'I10', description: 'Essential (primary) hypertension' },
  { code: 'E78.5', description: 'Hyperlipidemia, unspecified' },
  { code: 'E03.9', description: 'Hypothyroidism, unspecified' },
  { code: 'M54.5', description: 'Low back pain' },
  { code: 'M25.50', description: 'Pain in unspecified joint' },
  { code: 'R51', description: 'Headache' },
  { code: 'G43.909', description: 'Migraine, unspecified, not intractable' },
  { code: 'R50.9', description: 'Fever, unspecified' },
  { code: 'B34.9', description: 'Viral infection, unspecified' },
  { code: 'L30.9', description: 'Dermatitis, unspecified' },
  { code: 'L23.9', description: 'Allergic contact dermatitis, unspecified cause' },
  { code: 'J30.9', description: 'Allergic rhinitis, unspecified' },
  { code: 'N39.0', description: 'Urinary tract infection, site not specified' },
  { code: 'D64.9', description: 'Anemia, unspecified' },
  { code: 'F41.9', description: 'Anxiety disorder, unspecified' },
  { code: 'F32.9', description: 'Major depressive disorder, single episode, unspecified' },
  { code: 'R10.4', description: 'Other and unspecified abdominal pain' },
  { code: 'R11.10', description: 'Vomiting, unspecified' },
  { code: 'H66.90', description: 'Otitis media, unspecified' },
  { code: 'Z00.00', description: 'General adult medical examination without abnormal findings' },
  { code: 'N18.9', description: 'Chronic kidney disease, unspecified' },
  { code: 'N20.0', description: 'Calculus of kidney' },
  { code: 'J44.9', description: 'Chronic obstructive pulmonary disease, unspecified' },
  { code: 'G40.909', description: 'Epilepsy, unspecified, not intractable' },
  { code: 'R42', description: 'Dizziness and giddiness' },
  { code: 'E05.90', description: 'Thyrotoxicosis, unspecified without thyrotoxic crisis' },
  { code: 'N40.0', description: 'Benign prostatic hyperplasia without lower urinary tract symptoms' },
  { code: 'H52.4', description: 'Presbyopia' },
  { code: 'H40.9', description: 'Unspecified glaucoma' },
  { code: 'H10.9', description: 'Unspecified conjunctivitis' },
];

// Specialty-specific quick clinical templates ("Rx-groups", chief-complaint
// shortcuts, and test panels) for one-click loading in the Prescription
// Writer. Doctors can also save their own custom templates of any of these
// types (stored in clinical_templates).
export interface QuickTemplate {
  type: ClinicalTemplateType;
  name: string;
  diagnosis?: string;
  diagnosisCodes?: IcdCodeReference[];
  medications?: { name: string; dosage: string; frequency: string; duration: string; instructions?: string }[];
  tests?: string[];
  advice?: string;
}

export const SPECIALTY_QUICK_TEMPLATES: Record<string, QuickTemplate[]> = {
  'General Physician': [
    {
      type: 'rx_group',
      name: 'Common Cold / URI',
      diagnosis: 'Acute upper respiratory infection',
      diagnosisCodes: [{ code: 'J06.9', description: 'Acute upper respiratory infection, unspecified' }],
      medications: [
        { name: 'Paracetamol', dosage: '500mg', frequency: '1-1-1', duration: '3 days', instructions: 'After food' },
        { name: 'Cetirizine', dosage: '10mg', frequency: '0-0-1', duration: '5 days', instructions: 'At bedtime' },
      ],
      advice: 'Warm fluids, steam inhalation, rest.',
    },
    {
      type: 'rx_group',
      name: 'Acute Gastroenteritis',
      diagnosis: 'Infectious gastroenteritis and colitis, unspecified',
      diagnosisCodes: [{ code: 'A09', description: 'Infectious gastroenteritis and colitis, unspecified' }],
      medications: [
        { name: 'ORS Sachet', dosage: '1 sachet', frequency: 'After each loose stool', duration: '3 days' },
        { name: 'Ondansetron', dosage: '4mg', frequency: 'As needed', duration: '3 days', instructions: 'For nausea/vomiting' },
        { name: 'Zinc Sulphate', dosage: '20mg', frequency: '1-0-0', duration: '10 days' },
      ],
      advice: 'Plenty of oral fluids, light diet (BRAT), avoid dairy.',
    },
    {
      type: 'rx_group',
      name: 'Fever / Viral Infection',
      diagnosis: 'Fever, unspecified',
      diagnosisCodes: [{ code: 'R50.9', description: 'Fever, unspecified' }],
      medications: [
        { name: 'Paracetamol', dosage: '650mg', frequency: '1-1-1', duration: '3 days', instructions: 'After food, if fever > 100°F' },
      ],
      advice: 'Hydration, rest. Return if fever persists beyond 3 days.',
    },
    { type: 'complaint', name: 'Fever', diagnosis: 'Fever, unspecified', diagnosisCodes: [{ code: 'R50.9', description: 'Fever, unspecified' }] },
    { type: 'complaint', name: 'Headache', diagnosis: 'Headache', diagnosisCodes: [{ code: 'R51', description: 'Headache' }] },
    { type: 'complaint', name: 'Abdominal Pain', diagnosis: 'Other and unspecified abdominal pain', diagnosisCodes: [{ code: 'R10.4', description: 'Other and unspecified abdominal pain' }] },
    { type: 'test_panel', name: 'Routine Fever Workup', tests: ['Complete Blood Count (CBC)', 'Widal Test', 'Malaria Antigen', 'Urine Routine'] },
    { type: 'test_panel', name: 'General Health Checkup', tests: ['CBC', 'Fasting Blood Sugar', 'Lipid Profile', 'Liver Function Test', 'Kidney Function Test', 'Urine Routine'] },
  ],
  'Cardiology': [
    {
      type: 'rx_group',
      name: 'Hypertension — Initiation',
      diagnosis: 'Essential (primary) hypertension',
      diagnosisCodes: [{ code: 'I10', description: 'Essential (primary) hypertension' }],
      medications: [
        { name: 'Amlodipine', dosage: '5mg', frequency: '1-0-0', duration: '1 month', instructions: 'Morning' },
        { name: 'Aspirin', dosage: '75mg', frequency: '0-0-1', duration: '1 month', instructions: 'After dinner' },
      ],
      advice: 'Low-salt diet, regular BP monitoring, 30 min daily walk.',
    },
    {
      type: 'rx_group',
      name: 'Dyslipidemia',
      diagnosis: 'Hyperlipidemia, unspecified',
      diagnosisCodes: [{ code: 'E78.5', description: 'Hyperlipidemia, unspecified' }],
      medications: [
        { name: 'Atorvastatin', dosage: '20mg', frequency: '0-0-1', duration: '1 month', instructions: 'At bedtime' },
      ],
      advice: 'Low-fat diet, repeat lipid profile in 6 weeks.',
    },
    { type: 'complaint', name: 'Chest Pain', diagnosis: 'Chest pain, unspecified' },
    { type: 'complaint', name: 'Palpitations', diagnosis: 'Palpitations' },
    { type: 'test_panel', name: 'Cardiac Workup', tests: ['ECG', 'Echocardiogram', 'Lipid Profile', 'Troponin-I', 'Chest X-Ray'] },
    { type: 'test_panel', name: 'Hypertension Follow-up', tests: ['BP Monitoring Log', 'Kidney Function Test', 'ECG', 'Lipid Profile'] },
  ],
  'Diabetology': [
    {
      type: 'rx_group',
      name: 'Type 2 Diabetes — Initiation',
      diagnosis: 'Type 2 diabetes mellitus without complications',
      diagnosisCodes: [{ code: 'E11.9', description: 'Type 2 diabetes mellitus without complications' }],
      medications: [
        { name: 'Metformin', dosage: '500mg', frequency: '1-0-1', duration: '1 month', instructions: 'After food' },
      ],
      advice: 'Diabetic diet, 30 min exercise daily, recheck fasting/PP sugar in 2 weeks.',
    },
    { type: 'complaint', name: 'Increased Thirst/Urination', diagnosis: 'Type 2 diabetes mellitus without complications', diagnosisCodes: [{ code: 'E11.9', description: 'Type 2 diabetes mellitus without complications' }] },
    { type: 'test_panel', name: 'Diabetes Workup', tests: ['Fasting Blood Sugar', 'Post-Prandial Blood Sugar', 'HbA1c', 'Lipid Profile', 'Kidney Function Test', 'Urine Microalbumin'] },
  ],
  'Pediatrics': [
    {
      type: 'rx_group',
      name: 'Pediatric Fever',
      diagnosis: 'Fever, unspecified',
      diagnosisCodes: [{ code: 'R50.9', description: 'Fever, unspecified' }],
      medications: [
        { name: 'Paracetamol', dosage: 'as per weight (15mg/kg)', frequency: 'Every 6 hours as needed', duration: '3 days', instructions: 'If fever > 100°F' },
      ],
      advice: 'Tepid sponging, adequate fluids, review if fever > 3 days or red-flag symptoms.',
    },
    {
      type: 'rx_group',
      name: 'Acute Otitis Media',
      diagnosis: 'Otitis media, unspecified',
      diagnosisCodes: [{ code: 'H66.90', description: 'Otitis media, unspecified' }],
      medications: [
        { name: 'Amoxicillin', dosage: 'as per weight', frequency: '1-1-1', duration: '7 days', instructions: 'After food' },
        { name: 'Paracetamol', dosage: 'as per weight', frequency: 'Every 6 hours as needed', duration: '3 days', instructions: 'For pain/fever' },
      ],
      advice: 'Keep ear dry, follow up in 1 week.',
    },
    { type: 'complaint', name: 'Cough & Cold', diagnosis: 'Acute upper respiratory infection', diagnosisCodes: [{ code: 'J06.9', description: 'Acute upper respiratory infection, unspecified' }] },
    { type: 'test_panel', name: 'Pediatric Fever Workup', tests: ['CBC', 'CRP', 'Urine Routine', 'Malaria Antigen'] },
  ],
  'Dermatology': [
    {
      type: 'rx_group',
      name: 'Allergic Dermatitis',
      diagnosis: 'Allergic contact dermatitis, unspecified cause',
      diagnosisCodes: [{ code: 'L23.9', description: 'Allergic contact dermatitis, unspecified cause' }],
      medications: [
        { name: 'Cetirizine', dosage: '10mg', frequency: '0-0-1', duration: '5 days', instructions: 'At bedtime' },
      ],
      advice: 'Avoid known irritants/allergens, use mild soap-free cleanser.',
    },
    { type: 'complaint', name: 'Itchy Rash', diagnosis: 'Dermatitis, unspecified', diagnosisCodes: [{ code: 'L30.9', description: 'Dermatitis, unspecified' }] },
    { type: 'test_panel', name: 'Allergy Workup', tests: ['Total IgE', 'Skin Prick Test', 'CBC with Eosinophil Count'] },
  ],
  'ENT': [
    {
      type: 'rx_group',
      name: 'Allergic Rhinitis',
      diagnosis: 'Allergic rhinitis, unspecified',
      diagnosisCodes: [{ code: 'J30.9', description: 'Allergic rhinitis, unspecified' }],
      medications: [
        { name: 'Cetirizine', dosage: '10mg', frequency: '0-0-1', duration: '10 days', instructions: 'At bedtime' },
        { name: 'Montelukast', dosage: '10mg', frequency: '0-0-1', duration: '10 days' },
      ],
      advice: 'Avoid dust/allergen exposure, steam inhalation.',
    },
    { type: 'complaint', name: 'Sore Throat', diagnosis: 'Acute pharyngitis, unspecified', diagnosisCodes: [{ code: 'J02.9', description: 'Acute pharyngitis, unspecified' }] },
    { type: 'test_panel', name: 'ENT Basic Workup', tests: ['Throat Swab Culture', 'CBC', 'X-Ray Paranasal Sinuses'] },
  ],
  'Orthopedics': [
    {
      type: 'rx_group',
      name: 'Low Back Pain',
      diagnosis: 'Low back pain',
      diagnosisCodes: [{ code: 'M54.5', description: 'Low back pain' }],
      medications: [
        { name: 'Diclofenac', dosage: '50mg', frequency: '1-0-1', duration: '5 days', instructions: 'After food' },
      ],
      advice: 'Avoid heavy lifting, hot fomentation, gentle back-strengthening exercises.',
    },
    { type: 'complaint', name: 'Joint Pain', diagnosis: 'Pain in unspecified joint', diagnosisCodes: [{ code: 'M25.50', description: 'Pain in unspecified joint' }] },
    { type: 'test_panel', name: 'Joint/Back Pain Workup', tests: ['X-Ray (relevant region)', 'Vitamin D', 'CBC', 'ESR', 'Uric Acid'] },
  ],
  'Gynecology': [
    {
      type: 'rx_group',
      name: 'Routine Antenatal — Iron/Folate',
      medications: [
        { name: 'Iron + Folic Acid', dosage: '100mg', frequency: '1-0-0', duration: '1 month', instructions: 'After food' },
        { name: 'Vitamin D3', dosage: '60000 IU', frequency: 'Once weekly', duration: '1 month' },
      ],
      advice: 'Continue routine antenatal checkups and balanced diet.',
    },
    { type: 'test_panel', name: 'Antenatal Routine Panel', tests: ['CBC', 'Blood Group & Rh', 'HIV/HBsAg/VDRL', 'Urine Routine', 'Obstetric Ultrasound', 'Thyroid Profile'] },
  ],
  'Psychiatry': [
    {
      type: 'rx_group',
      name: 'Generalized Anxiety',
      diagnosis: 'Anxiety disorder, unspecified',
      diagnosisCodes: [{ code: 'F41.9', description: 'Anxiety disorder, unspecified' }],
      medications: [],
      advice: 'CBT referral if available, sleep hygiene, follow-up in 2 weeks.',
    },
    { type: 'complaint', name: 'Low Mood', diagnosis: 'Major depressive disorder, single episode, unspecified', diagnosisCodes: [{ code: 'F32.9', description: 'Major depressive disorder, single episode, unspecified' }] },
    { type: 'test_panel', name: 'Mood Disorder Workup', tests: ['Thyroid Profile', 'Vitamin B12', 'Vitamin D', 'CBC'] },
  ],
  'Gastroenterology': [
    {
      type: 'rx_group',
      name: 'GERD',
      diagnosis: 'Gastro-esophageal reflux disease without esophagitis',
      diagnosisCodes: [{ code: 'K21.9', description: 'Gastro-esophageal reflux disease without esophagitis' }],
      medications: [
        { name: 'Pantoprazole', dosage: '40mg', frequency: '1-0-0', duration: '2 weeks', instructions: 'Before breakfast' },
      ],
      advice: 'Avoid late meals, caffeine, and lying down right after eating.',
    },
    { type: 'complaint', name: 'Acidity / Heartburn', diagnosis: 'Gastro-esophageal reflux disease without esophagitis', diagnosisCodes: [{ code: 'K21.9', description: 'Gastro-esophageal reflux disease without esophagitis' }] },
    { type: 'test_panel', name: 'GI Workup', tests: ['CBC', 'Liver Function Test', 'Abdominal Ultrasound', 'Stool Routine'] },
  ],
  'Nephrology': [
    {
      type: 'rx_group',
      name: 'CKD — Conservative Management',
      diagnosis: 'Chronic kidney disease, unspecified',
      diagnosisCodes: [{ code: 'N18.9', description: 'Chronic kidney disease, unspecified' }],
      medications: [
        { name: 'Sodium Bicarbonate', dosage: '500mg', frequency: '1-1-1', duration: '1 month', instructions: 'After food' },
        { name: 'Calcium Carbonate', dosage: '500mg', frequency: '1-0-1', duration: '1 month', instructions: 'With meals' },
      ],
      advice: 'Low-salt, low-potassium, protein-restricted diet; strict BP control; avoid NSAIDs.',
    },
    { type: 'complaint', name: 'Reduced Urine Output', diagnosis: 'Chronic kidney disease, unspecified', diagnosisCodes: [{ code: 'N18.9', description: 'Chronic kidney disease, unspecified' }] },
    { type: 'complaint', name: 'Flank Pain', diagnosis: 'Calculus of kidney', diagnosisCodes: [{ code: 'N20.0', description: 'Calculus of kidney' }] },
    { type: 'test_panel', name: 'Renal Workup', tests: ['Kidney Function Test', 'Electrolytes', 'Urine Routine', 'Urine Albumin-Creatinine Ratio', 'Renal Ultrasound'] },
  ],
  'Pulmonology': [
    {
      type: 'rx_group',
      name: 'COPD — Maintenance',
      diagnosis: 'Chronic obstructive pulmonary disease, unspecified',
      diagnosisCodes: [{ code: 'J44.9', description: 'Chronic obstructive pulmonary disease, unspecified' }],
      medications: [
        { name: 'Tiotropium Inhaler', dosage: '18mcg', frequency: 'Once daily', duration: '1 month', instructions: 'Via inhaler, same time daily' },
        { name: 'Salbutamol Inhaler', dosage: '100mcg', frequency: 'As needed', duration: '1 month', instructions: 'For breathlessness' },
      ],
      advice: 'Smoking cessation, pulmonary rehab, flu/pneumococcal vaccination.',
    },
    {
      type: 'rx_group',
      name: 'Bronchial Asthma — Step-up',
      diagnosis: 'Unspecified asthma, uncomplicated',
      diagnosisCodes: [{ code: 'J45.909', description: 'Unspecified asthma, uncomplicated' }],
      medications: [
        { name: 'Budesonide + Formoterol Inhaler', dosage: '200/6mcg', frequency: '1-0-1', duration: '1 month', instructions: 'Via inhaler with spacer' },
      ],
      advice: 'Avoid known triggers, demonstrate inhaler technique, peak flow monitoring.',
    },
    { type: 'complaint', name: 'Breathlessness', diagnosis: 'Unspecified asthma, uncomplicated', diagnosisCodes: [{ code: 'J45.909', description: 'Unspecified asthma, uncomplicated' }] },
    { type: 'complaint', name: 'Chronic Cough', diagnosis: 'Chronic obstructive pulmonary disease, unspecified', diagnosisCodes: [{ code: 'J44.9', description: 'Chronic obstructive pulmonary disease, unspecified' }] },
    { type: 'test_panel', name: 'Respiratory Workup', tests: ['Chest X-Ray', 'Spirometry (PFT)', 'SpO2', 'CBC', 'Sputum Culture'] },
  ],
  'Neurology': [
    {
      type: 'rx_group',
      name: 'Migraine — Acute + Prophylaxis',
      diagnosis: 'Migraine, unspecified, not intractable',
      diagnosisCodes: [{ code: 'G43.909', description: 'Migraine, unspecified, not intractable' }],
      medications: [
        { name: 'Sumatriptan', dosage: '50mg', frequency: 'As needed', duration: '1 month', instructions: 'At onset of headache' },
        { name: 'Propranolol', dosage: '20mg', frequency: '1-0-1', duration: '1 month', instructions: 'For prophylaxis' },
      ],
      advice: 'Identify and avoid triggers, maintain headache diary, adequate sleep/hydration.',
    },
    {
      type: 'rx_group',
      name: 'Epilepsy — Maintenance',
      diagnosis: 'Epilepsy, unspecified, not intractable',
      diagnosisCodes: [{ code: 'G40.909', description: 'Epilepsy, unspecified, not intractable' }],
      medications: [
        { name: 'Levetiracetam', dosage: '500mg', frequency: '1-0-1', duration: '1 month', instructions: 'After food' },
      ],
      advice: 'Adherence counselling, avoid sleep deprivation/alcohol, driving precautions.',
    },
    { type: 'complaint', name: 'Recurrent Headache', diagnosis: 'Migraine, unspecified, not intractable', diagnosisCodes: [{ code: 'G43.909', description: 'Migraine, unspecified, not intractable' }] },
    { type: 'complaint', name: 'Dizziness / Vertigo', diagnosis: 'Dizziness and giddiness', diagnosisCodes: [{ code: 'R42', description: 'Dizziness and giddiness' }] },
    { type: 'test_panel', name: 'Neuro Workup', tests: ['MRI Brain', 'EEG', 'CBC', 'Vitamin B12', 'Electrolytes'] },
  ],
  'Endocrinology': [
    {
      type: 'rx_group',
      name: 'Hypothyroidism — Initiation',
      diagnosis: 'Hypothyroidism, unspecified',
      diagnosisCodes: [{ code: 'E03.9', description: 'Hypothyroidism, unspecified' }],
      medications: [
        { name: 'Levothyroxine', dosage: '50mcg', frequency: '1-0-0', duration: '1 month', instructions: 'Empty stomach, 30 min before breakfast' },
      ],
      advice: 'Repeat TSH in 6 weeks, take on empty stomach away from calcium/iron supplements.',
    },
    {
      type: 'rx_group',
      name: 'Hyperthyroidism — Initiation',
      diagnosis: 'Thyrotoxicosis, unspecified without thyrotoxic crisis',
      diagnosisCodes: [{ code: 'E05.90', description: 'Thyrotoxicosis, unspecified without thyrotoxic crisis' }],
      medications: [
        { name: 'Carbimazole', dosage: '5mg', frequency: '1-0-1', duration: '1 month', instructions: 'After food' },
        { name: 'Propranolol', dosage: '20mg', frequency: '1-0-1', duration: '2 weeks', instructions: 'For symptom control' },
      ],
      advice: 'Repeat thyroid profile in 4-6 weeks, watch for fever/sore throat (report immediately).',
    },
    { type: 'complaint', name: 'Weight Gain / Fatigue', diagnosis: 'Hypothyroidism, unspecified', diagnosisCodes: [{ code: 'E03.9', description: 'Hypothyroidism, unspecified' }] },
    { type: 'test_panel', name: 'Thyroid Workup', tests: ['Thyroid Profile (TSH, T3, T4)', 'Anti-TPO Antibody', 'CBC'] },
    { type: 'test_panel', name: 'Endocrine Metabolic Panel', tests: ['Fasting Blood Sugar', 'HbA1c', 'Lipid Profile', 'Cortisol', 'Vitamin D'] },
  ],
  'Urology': [
    {
      type: 'rx_group',
      name: 'Benign Prostatic Hyperplasia',
      diagnosis: 'Benign prostatic hyperplasia without lower urinary tract symptoms',
      diagnosisCodes: [{ code: 'N40.0', description: 'Benign prostatic hyperplasia without lower urinary tract symptoms' }],
      medications: [
        { name: 'Tamsulosin', dosage: '0.4mg', frequency: '0-0-1', duration: '1 month', instructions: 'After dinner' },
      ],
      advice: 'Avoid excessive fluids before bedtime, limit caffeine/alcohol, follow up with PSA if not done.',
    },
    {
      type: 'rx_group',
      name: 'Uncomplicated UTI',
      diagnosis: 'Urinary tract infection, site not specified',
      diagnosisCodes: [{ code: 'N39.0', description: 'Urinary tract infection, site not specified' }],
      medications: [
        { name: 'Nitrofurantoin', dosage: '100mg', frequency: '1-0-1', duration: '5 days', instructions: 'After food' },
      ],
      advice: 'Increase oral fluid intake, complete the full course of antibiotics.',
    },
    { type: 'complaint', name: 'Burning Micturition', diagnosis: 'Urinary tract infection, site not specified', diagnosisCodes: [{ code: 'N39.0', description: 'Urinary tract infection, site not specified' }] },
    { type: 'complaint', name: 'Flank Pain', diagnosis: 'Calculus of kidney', diagnosisCodes: [{ code: 'N20.0', description: 'Calculus of kidney' }] },
    { type: 'test_panel', name: 'Urology Workup', tests: ['Urine Routine & Culture', 'Kidney Function Test', 'PSA', 'Ultrasound KUB'] },
  ],
  'Ophthalmology': [
    {
      type: 'rx_group',
      name: 'Allergic Conjunctivitis',
      diagnosis: 'Unspecified conjunctivitis',
      diagnosisCodes: [{ code: 'H10.9', description: 'Unspecified conjunctivitis' }],
      medications: [
        { name: 'Olopatadine Eye Drops', dosage: '0.1%', frequency: '1-0-1', duration: '2 weeks', instructions: 'One drop each eye' },
      ],
      advice: 'Avoid eye rubbing, cold compresses, avoid contact lens use until resolved.',
    },
    {
      type: 'rx_group',
      name: 'Glaucoma — Maintenance',
      diagnosis: 'Unspecified glaucoma',
      diagnosisCodes: [{ code: 'H40.9', description: 'Unspecified glaucoma' }],
      medications: [
        { name: 'Timolol Eye Drops', dosage: '0.5%', frequency: '0-0-1', duration: '1 month', instructions: 'One drop each eye at bedtime' },
      ],
      advice: 'Regular IOP monitoring, adherence to drops is critical, avoid missing doses.',
    },
    { type: 'complaint', name: 'Red / Itchy Eyes', diagnosis: 'Unspecified conjunctivitis', diagnosisCodes: [{ code: 'H10.9', description: 'Unspecified conjunctivitis' }] },
    { type: 'complaint', name: 'Blurred Near Vision', diagnosis: 'Presbyopia', diagnosisCodes: [{ code: 'H52.4', description: 'Presbyopia' }] },
    { type: 'test_panel', name: 'Eye Workup', tests: ['Visual Acuity Test', 'Intraocular Pressure (IOP)', 'Fundus Examination', 'Refraction'] },
  ],
};

export const getQuickTemplatesForSpecialty = (specialty?: string, type?: ClinicalTemplateType): QuickTemplate[] => {
  const all = (specialty && SPECIALTY_QUICK_TEMPLATES[specialty]) || SPECIALTY_QUICK_TEMPLATES['General Physician'] || [];
  return type ? all.filter(t => t.type === type) : all;
};

export const searchDrugs = (query: string): DrugReference[] => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return COMMON_DRUGS.filter(d => d.name.toLowerCase().includes(q)).slice(0, 8);
};

export const searchIcd10 = (query: string): IcdCodeReference[] => {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return COMMON_ICD10_CODES.filter(
    c => c.code.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
  ).slice(0, 8);
};
