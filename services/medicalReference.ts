// Lightweight static reference data for the prescription module.
// Used for autocomplete suggestions; not a substitute for a full drug/ICD database.

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
];

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
