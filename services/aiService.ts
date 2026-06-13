import { Type } from "@google/genai";
import { DocumentAnalysis } from "../types";

const ai = {
  models: {
    generateContent: async (payload: any) => {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch AI API');
      }
      return await response.json();
    }
  }
};

export const getHealthSummary = async (healthData: string): Promise<string> => {
  // Gracefully handle the case where the AI client could not be initialized.
  if (!ai) {
    return "AI features are currently unavailable. Please ensure your API key is configured.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Based on the following health data, provide a concise and easy-to-understand summary for a patient. Use simple markdown for formatting (headings and lists). Health Data: ${healthData}`,
      config: {
        systemInstruction: "You are a helpful medical assistant. You summarize health data for patients in a clear, positive, and encouraging tone. Do not provide medical advice. Start the summary by addressing the patient directly, e.g., 'Hello Alex, here is a summary of your health.'.",
        temperature: 0.5,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating health summary:", error);
    return "Sorry, we couldn't generate a summary at this time. Please try again later.";
  }
};

/**
 * Enhanced AI Health Summary: cross-data correlation, anomaly detection.
 */
export const getEnhancedHealthSummary = async (healthData: string): Promise<string> => {
  if (!ai) {
    return "AI features are currently unavailable. Please ensure your API key is configured.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following comprehensive health data and provide a detailed cross-correlated health analysis. Health Data:\n${healthData}`,
      config: {
        systemInstruction: `You are an advanced medical data analyst AI. Perform the following analysis on the patient's health data:

## Your Analysis Should Include:

### 1. Cross-Data Correlations
- Correlate symptoms with medications (identify possible side effects)
- Track how vitals respond to medication changes or additions
- Link food journal entries to symptom patterns

### 2. Anomaly Detection & Flags
- Flag any sudden changes in vitals (e.g., "Your blood sugar spiked on X date")
- Identify patterns like consistently elevated readings
- Note medication adherence concerns

### 3. Trend Analysis
- Summarize trends in vitals over the recorded period
- Highlight improvements or deteriorations

### 4. Actionable Insights
- Suggest topics to discuss with their doctor
- Recommend areas for improvement in self-care

Format your response with clear markdown headings (##) and bullet points. Be specific with dates and values. Use a professional but caring tone. Add a '⚠️' emoji before any important flags or warnings. Always include the disclaimer that this is AI-generated analysis and not medical advice.`,
        temperature: 0.4,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating enhanced summary:", error);
    return "Sorry, we couldn't generate the enhanced analysis at this time. Please try again later.";
  }
};

/**
 * AI-powered extraction of visit summary from clinical notes.
 */
export const extractVisitSummary = async (visitNotes: string): Promise<{ visitReason: string; clinicalNotes: string; followUpInstructions: string }> => {
  if (!ai) {
    return { visitReason: 'Visit', clinicalNotes: visitNotes, followUpInstructions: 'Please consult your provider.' };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Extract and organize the following visit notes into structured sections. Visit Notes:\n"""${visitNotes}"""`,
      config: {
        systemInstruction: `You are a medical documentation assistant. Extract visit notes into three structured sections:
1. visitReason - A brief 1-sentence reason for the visit
2. clinicalNotes - The main clinical observations, diagnoses, and findings (formatted with bullet points)
3. followUpInstructions - Clear follow-up instructions for the patient (formatted with bullet points)

If a section can't be determined from the notes, provide a reasonable default. Be concise and professional.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            visitReason: { type: Type.STRING },
            clinicalNotes: { type: Type.STRING },
            followUpInstructions: { type: Type.STRING },
          },
          required: ['visitReason', 'clinicalNotes', 'followUpInstructions']
        },
        temperature: 0.2,
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error extracting visit summary:", error);
    return { visitReason: 'Visit', clinicalNotes: visitNotes, followUpInstructions: 'Please consult your provider for follow-up instructions.' };
  }
};

/**
 * Voice-to-prescription: turn a doctor's spoken dictation into structured
 * prescription fields (diagnosis, medications, advice, notes, follow-up date).
 */
export interface DictatedPrescription {
  diagnosis?: string;
  medications: { name: string; dosage: string; frequency: string; duration: string; instructions?: string }[];
  advice?: string;
  notes?: string;
  followUpDate?: string; // YYYY-MM-DD if mentioned, else empty
}

export const parsePrescriptionFromDictation = async (transcript: string, todayDateISO: string): Promise<DictatedPrescription> => {
  if (!ai) {
    return { medications: [] };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Today's date is ${todayDateISO}. Convert this doctor's spoken dictation into a structured prescription. Dictation:\n"""${transcript}"""`,
      config: {
        systemInstruction: `You are a medical scribe assistant. Extract a structured prescription from a doctor's spoken dictation.
- diagnosis: short diagnosis text, if mentioned.
- medications: array of { name, dosage, frequency, duration, instructions }. Use standard abbreviations the doctor said (e.g. "1-0-1", "twice daily", "5 days"). Leave a field as an empty string if not mentioned.
- advice: lifestyle/dietary advice, if mentioned.
- notes: any other clinical notes, if mentioned.
- followUpDate: an absolute date in YYYY-MM-DD format if the doctor mentioned a follow-up (e.g. "follow up in one week" -> compute from today's date), else an empty string.
Only include information explicitly present in the dictation. Do not invent medications or details.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diagnosis: { type: Type.STRING },
            medications: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  dosage: { type: Type.STRING },
                  frequency: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  instructions: { type: Type.STRING },
                },
                required: ['name', 'dosage', 'frequency', 'duration', 'instructions'],
              },
            },
            advice: { type: Type.STRING },
            notes: { type: Type.STRING },
            followUpDate: { type: Type.STRING },
          },
          required: ['medications'],
        },
        temperature: 0.2,
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error parsing dictated prescription:", error);
    return { medications: [] };
  }
};

export const getLifestyleTips = async (userInfo: string): Promise<string> => {
  // Gracefully handle the case where the AI client could not be initialized.
  if (!ai) {
    return "[]"; // Return an empty JSON array string as the function expects a JSON string.
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate 5 actionable and personalized lifestyle tips for a person with the following profile. User Profile: ${userInfo}`,
      config: {
        systemInstruction: "You are a health and wellness coach. Provide encouraging and practical tips based on the user's profile. Do not provide medical advice.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: 'A short, catchy title for the tip.',
              },
              description: {
                type: Type.STRING,
                description: 'A detailed, actionable description of the lifestyle tip.',
              },
            },
            required: ["title", "description"]
          },
        },
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating lifestyle tips:", error);
    return "[]"; // Return empty array string on error
  }
};

export const analyzeMedicalDocument = async (base64Data: string, mimeType: string): Promise<DocumentAnalysis | null> => {
  if (!ai) return null;

  try {
    const documentPart = {
      inlineData: { data: base64Data, mimeType },
    };
    const textPart = {
      text: "Extract all text and structured data from this medical document. Be highly accurate, especially with numbers, reference ranges, and test names.",
    };

    const analysisResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [documentPart, textPart] },
      config: {
        systemInstruction: "You are an expert medical data extractor. Your job is to parse lab reports, prescriptions, and medical records into highly structured JSON data. You must classify the document, extract Personally Identifiable Information (PII) if present, assess the clinical urgency (triage), extract test results, and extract any prescribed medications.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            classification: { type: Type.STRING, description: 'Classify the document type.', enum: ['Lab Report', 'Prescription', 'Imaging', 'Consultation Note', 'Visit Summary', 'Other'] },
            pii: {
              type: Type.OBJECT,
              description: 'Personally Identifiable Information found in the document header.',
              properties: {
                patientName: { type: Type.STRING },
                age: { type: Type.STRING },
                gender: { type: Type.STRING },
                dob: { type: Type.STRING }
              }
            },
            triage: {
              type: Type.OBJECT,
              description: 'Medical triaging assessment based on the document contents.',
              properties: {
                urgency: { type: Type.STRING, enum: ['Routine', 'Urgent', 'Emergency'] },
                recommendedSpecialist: { type: Type.STRING, description: 'E.g., Cardiologist, Endocrinologist' },
                reason: { type: Type.STRING, description: 'Brief reason for the urgency score' }
              },
              required: ['urgency']
            },
            summary: { type: Type.STRING, description: 'A simple, easy-to-understand summary of the document for a patient.' },
            definitions: {
              type: Type.ARRAY,
              description: 'An array of objects defining complex medical terms found in the text.',
              items: {
                type: Type.OBJECT,
                properties: { term: { type: Type.STRING }, definition: { type: Type.STRING } },
                required: ['term', 'definition']
              }
            },
            vitals: {
              type: Type.ARRAY,
              description: 'Key vital signs (Blood Pressure, Heart Rate, Temperature, Blood Sugar, etc) for quick syncing.',
              items: {
                type: Type.OBJECT,
                properties: { name: { type: Type.STRING }, value: { type: Type.STRING }, unit: { type: Type.STRING } },
                required: ['name', 'value']
              }
            },
            labResults: {
              type: Type.ARRAY,
              description: 'Detailed array of all lab test results extracted from the document.',
              items: {
                type: Type.OBJECT,
                properties: {
                  testName: { type: Type.STRING },
                  value: { type: Type.STRING },
                  unit: { type: Type.STRING },
                  referenceRange: { type: Type.STRING },
                  interpretation: { type: Type.STRING, enum: ['Normal', 'High', 'Low', 'Critical', 'Unknown'] }
                },
                required: ['testName', 'value', 'interpretation']
              }
            },
            medications: {
              type: Type.ARRAY,
              description: 'Array of medications prescribed or mentioned in the document, especially if the document is a prescription.',
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: 'Name of the medication' },
                  dosage: { type: Type.STRING, description: 'Dosage amount (e.g., 500mg)' },
                  frequency: { type: Type.STRING, description: 'How often to take it (e.g., Twice daily)' }
                },
                required: ['name', 'dosage', 'frequency']
              }
            }
          },
          required: ['summary']
        }
      }
    });

    const analysisJson = JSON.parse(analysisResponse.text);
    return analysisJson as DocumentAnalysis;

  } catch (error) {
    console.error("Error analyzing medical document:", error);
    return null;
  }
};

export const checkMedicationInteractions = async (medications: string[]): Promise<string> => {
  if (!ai) return "AI features are currently unavailable.";
  if (medications.length < 2) return "No significant interactions found.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following list of medications for potentially significant drug-drug interactions. List any major interactions clearly and concisely. If no significant interactions are found, respond ONLY with the text "No significant interactions found.". Medications: ${medications.join(', ')}`,
      config: {
        systemInstruction: "You are a pharmacology assistant providing information for educational purposes. You are not giving medical advice. Be direct and to the point.",
        temperature: 0.2,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error checking medication interactions:", error);
    return "Could not check for interactions at this time.";
  }
};

export const chatWithSymptomChecker = async (conversationText: string, userProfileInfo: string): Promise<string> => {
  if (!ai) return JSON.stringify({
    type: "result",
    title: "System Error",
    recommendation: "AI features are currently unavailable.",
    triageLevel: "Routine",
    action: "Reset"
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `User Profile Info: ${userProfileInfo}\n\nConversation so far:\n${conversationText}\n\nBased on the conversation, if you need more information to suggest a triage level, output a JSON object with type "question" and the "question" text. If you have enough information (usually after 2-3 questions), output a JSON object with type "result", "title", "recommendation", "triageLevel" (Emergency, Urgent, Routine, or Self-care), and "action" (FindER, ScheduleAppointment, or SelfCare). Do not provide medical diagnosis. Your response MUST be valid JSON only.`,
      config: {
        systemInstruction: "You are an intelligent clinical triage assistant. You ask 1-3 targeted questions to understand the severity of the symptoms. Then you output a JSON schema to direct the user to the correct level of care.",
        responseMimeType: "application/json",
        temperature: 0.1,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error chatting with symptom checker:", error);
    return JSON.stringify({
      type: "result",
      title: "Error",
      recommendation: "Could not process symptoms at this time.",
      triageLevel: "Routine",
      action: "Reset"
    });
  }
};

export const chatWithSwasthya = async (message: string): Promise<string> => {
  if (!ai) return "AI features are currently unavailable.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction: "You are Swasthya (स्वास्थ्य), a friendly and knowledgeable AI health assistant for the DocuMedic web application. Your purpose is to answer user questions about DocuMedic's features and provide general health and wellness information. \n\n**Rules:**\n1.  **Scope:** Strictly limit your responses to questions about the DocuMedic app (e.g., 'How do I upload a record?', 'What is the Smart Summary?') and general health topics (e.g., 'What are the benefits of hydration?', 'Tips for a balanced diet').\n2.  **Medical Disclaimer:** NEVER provide medical advice, diagnoses, or treatment recommendations. If a user asks for medical advice, you MUST decline and strongly recommend they consult a healthcare professional. For example, say 'I cannot provide medical advice, but I recommend speaking with a doctor about your symptoms.'\n3.  **Tone:** Be empathetic, encouraging, and clear in your communication.\n4.  **Format:** Use simple markdown (like lists or bold text) to make your answers easy to read.\n5.  **Refusal:** If a question is outside your scope (e.g., about politics, technology outside of DocuMedic, etc.), politely decline to answer.",
        temperature: 0.7,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error chatting with Swasthya:", error);
    return "I'm having a little trouble connecting right now. Please try again in a moment.";
  }
};

/**
 * Feature 3: AI-Powered OCR
 * Reads a handwritten/unstructured medical image and extracts structured info.
 */
export const ocrMedicalDocument = async (base64Data: string, mimeType: string): Promise<string> => {
  if (!ai) return JSON.stringify({ error: 'AI features are currently unavailable.' });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          {
            text: `You are an expert medical OCR assistant. Carefully read this image of a medical document (which may be handwritten, a prescription, or a lab report). Extract ALL text and structure it into a clean JSON response with the following fields:
- documentType: "Prescription" | "Lab Report" | "Clinical Note" | "Other"
- patientName: (if visible)
- doctorName: (if visible)
- date: (if visible)
- medications: array of { name, dosage, frequency, duration } (for prescriptions)
- labResults: array of { testName, value, unit, referenceRange, status: "Normal"|"High"|"Low"|"Critical" } (for lab reports)
- rawText: the full verbatim text extracted from the image
- summary: a 1-2 sentence plain English summary of what this document contains

Be highly accurate. If a field is not present, omit it from the JSON. Return ONLY valid JSON.`
          }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      }
    });
    return response.text;
  } catch (error) {
    console.error('Error in OCR:', error);
    return JSON.stringify({ error: 'OCR processing failed. Please try again.' });
  }
};

/**
 * Feature 4: Conversational Chat for Patient Data Retrieval
 * Doctor asks a natural language question; AI answers using the patient's data as context.
 */
export const chatWithPatientData = async (query: string, patientContextJSON: string, chatHistory: {role: string, text: string}[]): Promise<string> => {
  if (!ai) return 'AI features are currently unavailable.';

  const historyText = chatHistory.map(m => `${m.role === 'doctor' ? 'Doctor' : 'AI'}: ${m.text}`).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Patient Record (JSON):
${patientContextJSON}

${historyText ? `Previous conversation:\n${historyText}\n` : ''}Doctor's question: ${query}`,
      config: {
        systemInstruction: `You are an intelligent medical records assistant for a doctor. You have been given a patient's complete health record in JSON format. Answer the doctor's questions concisely and accurately using ONLY the data provided. 
Rules:
- Be direct and clinical in your tone.
- If data is missing, say so clearly.
- Use bullet points for lists.
- Never fabricate data that isn't in the patient record.
- Always cite the source field (e.g. "From medications list: ...").`,
        temperature: 0.2,
      }
    });
    return response.text;
  } catch (error) {
    console.error('Error in patient chat:', error);
    return 'Unable to retrieve data at this time. Please try again.';
  }
};

/**
 * Feature 5: Pre-Appointment AI Briefing
 * Generates a structured pre-visit summary for a doctor before seeing a patient.
 */
export const generatePreAppointmentBriefing = async (patientProfileJSON: string, appointmentReason?: string): Promise<string> => {
  if (!ai) return 'AI features are currently unavailable.';

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a pre-appointment clinical briefing for the following patient.
${appointmentReason ? `Reason for today's visit: ${appointmentReason}` : ''}

Patient Data:
${patientProfileJSON}`,
      config: {
        systemInstruction: `You are a clinical decision support AI. Generate a concise pre-appointment briefing for a doctor. Structure it with these exact markdown sections:

## 👤 Patient Overview
(Name, age, gender, key conditions in 1-2 sentences)

## 💊 Active Medications
(Bullet list of current medications with dosage)

## 📊 Recent Vitals & Labs
(Most notable recent values with dates, flag anything abnormal with ⚠️)

## 🎯 Key Concerns for This Visit
(Bullet list of things the doctor should pay particular attention to)

## 💬 Suggested Topics
(2-3 clinical questions or topics the doctor might want to raise)

---
*This is an AI-generated briefing for informational purposes only. Always review the full patient record.*

Be specific with values and dates from the data. Keep each section brief and scannable.`,
        temperature: 0.3,
      }
    });
    return response.text;
  } catch (error) {
    console.error('Error generating briefing:', error);
    return 'Unable to generate briefing at this time. Please try again.';
  }
};

/**
 * Feature 6: EMR Export
 * Formats patient data into a standard EMR-compatible format (FHIR JSON or CSV).
 */
export const generateEMRExport = async (patientProfileJSON: string, format: 'FHIR' | 'CSV'): Promise<string> => {
  if (!ai) return format === 'FHIR' ? '{}' : '';

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Convert this patient health record into a ${format === 'FHIR' ? 'HL7 FHIR R4 compliant JSON Bundle' : 'CSV format with headers'}.

Patient Data:
${patientProfileJSON}

${format === 'FHIR' ? 
  'Create a valid FHIR R4 Bundle resource containing Patient, MedicationStatement, Observation, and Condition resources as applicable. Use proper FHIR data types and coding systems (SNOMED, LOINC where appropriate). Return ONLY valid JSON.' : 
  'Create a CSV with headers and one row per medication/lab result/condition as appropriate. Separate sections with blank lines and section headers. Return ONLY the CSV text, no markdown.'}`,
      config: {
        responseMimeType: format === 'FHIR' ? 'application/json' : 'text/plain',
        temperature: 0.1,
      }
    });
    return response.text;
  } catch (error) {
    console.error('Error generating EMR export:', error);
    return format === 'FHIR' ? '{"error": "Export failed"}' : 'Export failed';
  }
};

/**
 * Clinical Decision Support System (CDSS)
 * Analyzes patient's full longitudinal health record and returns evidence-based alerts.
 */
export const getCDSSAnalysis = async (patientContextJSON: string): Promise<string> => {
  if (!ai) return JSON.stringify({ alerts: [], summary: 'AI unavailable.' });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following patient's complete health record and generate a Clinical Decision Support (CDSS) report. Patient Data:\n${patientContextJSON}`,
      config: {
        systemInstruction: `You are an expert Clinical Decision Support System (CDSS) AI embedded in a doctor's workflow. Analyze the patient's longitudinal health record and generate structured, evidence-based clinical alerts.

Produce a JSON object with:
- "alerts": array of alert objects, each with:
  - "type": one of "drug_interaction" | "lab_suggestion" | "diagnosis_flag" | "guideline_alert" | "follow_up"
  - "severity": one of "critical" | "warning" | "info"
  - "title": short alert title (max 8 words)
  - "description": clinical rationale (2-3 sentences, cite specific values from the record)
  - "recommendation": specific actionable step for the doctor
  - "evidence": brief evidence basis (e.g., "Based on ADA 2023 guidelines")
- "summary": a 1-2 sentence overall clinical impression

Rules:
- Only flag real issues found in the data. Do NOT fabricate alerts.
- For drug interactions, list the specific drugs involved.
- For lab suggestions, specify the exact test and why.
- Severity "critical" = needs immediate action, "warning" = needs attention this visit, "info" = general guidance.
- If no significant issues found, return an empty alerts array with a clear summary.
- Return ONLY valid JSON.`,
        responseMimeType: 'application/json',
        temperature: 0.1,
      }
    });
    return response.text;
  } catch (error) {
    console.error('Error in CDSS analysis:', error);
    return JSON.stringify({ alerts: [], summary: 'CDSS analysis failed. Please try again.' });
  }
};

export const translateTexts = async (texts: string[], targetLang: string): Promise<string[]> => {

  if (!ai || targetLang === 'English' || texts.length === 0) return texts;

  try {
    const payload: Record<string, string> = {};
    texts.forEach((t, i) => { payload[`t_${i}`] = t; });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a strict translation API. Translate the values of this JSON object from English to ${targetLang}. Return ONLY a valid JSON object with the EXACT same keys. Do not merge or split values. \n\nInput JSON:\n${JSON.stringify(payload)}`,
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
      }
    });

    let textRes = response.text || "{}";
    textRes = textRes.replace(/```json/gi, '').replace(/```/g, '').trim();
    const translatedObj = JSON.parse(textRes);

    return texts.map((t, i) => {
      const key = `t_${i}`;
      return translatedObj[key] ? translatedObj[key] : t;
    });
  } catch (error) {
    console.error("Error translating texts:", error);
    return texts;
  }
};

export interface ChartConfig {
  title: string;
  description: string;
  chartType: 'LineChart' | 'BarChart' | 'AreaChart';
  xAxisKey: string;
  series: { dataKey: string; color: string; name: string }[];
  data: any[];
}

/**
 * DocAssist: Chart Highlights
 * Ambient, at-a-glance summary of what the doctor should know before/during this consult.
 */
export const getChartHighlights = async (patientContextJSON: string): Promise<string[]> => {
  if (!ai) return [];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Patient Record (JSON):\n${patientContextJSON}`,
      config: {
        systemInstruction: `You are an ambient clinical assistant. Scan the patient's record and produce the 3-5 most clinically relevant, actionable highlights a doctor should know before/during this consult (e.g. uncontrolled vitals, active conditions/allergies, medications due for renewal, missing follow-ups, notable trends).
Rules:
- Each highlight is a single short sentence (max ~18 words).
- Be specific, citing values/dates from the record where relevant.
- Only include genuinely useful items; if the record is sparse, return fewer items.
- Return ONLY a JSON array of strings, e.g. ["...", "..."]. No markdown.`,
        responseMimeType: 'application/json',
        temperature: 0.2,
      }
    });
    let textRes = response.text || '[]';
    textRes = textRes.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(textRes);
    return Array.isArray(parsed) ? parsed.filter(x => typeof x === 'string') : [];
  } catch (error) {
    console.error('Error generating chart highlights:', error);
    return [];
  }
};

export interface PrescriptionSafetyAlert {
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
}

/**
 * DocAssist: Prescription Safety Check
 * Checks a draft prescription's medications against the patient's existing
 * medications, allergies, and conditions for interactions/contraindications.
 */
export const checkPrescriptionSafety = async (
  patientContextJSON: string,
  draftMedications: { name: string; dosage?: string }[]
): Promise<{ alerts: PrescriptionSafetyAlert[] }> => {
  if (!ai || draftMedications.length === 0) return { alerts: [] };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Patient Record (JSON):\n${patientContextJSON}\n\nDraft prescription medications to check:\n${JSON.stringify(draftMedications)}`,
      config: {
        systemInstruction: `You are a pharmacology safety-check AI embedded in a prescription writer. Compare the "Draft prescription medications" against the patient's existing medications, recorded allergies, and conditions in the patient record.

Produce a JSON object: { "alerts": [ ... ] } where each alert has:
- "severity": "critical" | "warning" | "info"
- "title": short title (max 8 words), naming the specific drug(s)/allergy/condition involved
- "description": 1-2 sentence clinical rationale

Rules:
- Flag drug-drug interactions between draft meds and existing medications.
- Flag if a draft medication conflicts with a recorded allergy.
- Flag if a draft medication is contraindicated given a recorded condition.
- "critical" = significant safety risk, "warning" = needs review, "info" = minor note.
- Do NOT fabricate issues. If nothing of concern is found, return an empty alerts array.
- Return ONLY valid JSON, no markdown.`,
        responseMimeType: 'application/json',
        temperature: 0.1,
      }
    });
    let textRes = response.text || '{"alerts":[]}';
    textRes = textRes.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(textRes);
    return { alerts: Array.isArray(parsed.alerts) ? parsed.alerts : [] };
  } catch (error) {
    console.error('Error checking prescription safety:', error);
    return { alerts: [] };
  }
};

export const generateVisualTrend = async (query: string, patientContextJSON: string): Promise<ChartConfig | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Doctor's Trend Query: "${query}"\n\nPatient Data:\n${patientContextJSON}`,
      config: {
        systemInstruction: `You are an expert clinical data visualization AI. Analyze the patient's data based on the doctor's query and extract data points over time.
Output a strict JSON object configuring a chart. DO NOT INCLUDE ANY MARKDOWN formatting like \`\`\`json. Return pure JSON.
Schema:
{
  "title": "Short title (e.g. Blood Sugar vs Weight)",
  "description": "1-2 sentence clinical summary of the trend observed.",
  "chartType": "LineChart", // Or BarChart / AreaChart
  "xAxisKey": "date", // The key used in your data array for the X axis
  "series": [
    { "dataKey": "systolic", "color": "#ef4444", "name": "Systolic BP" },
    { "dataKey": "diastolic", "color": "#3b82f6", "name": "Diastolic BP" }
  ],
  "data": [
    { "date": "Jan 10", "systolic": 120, "diastolic": 80 },
    { "date": "Jan 15", "systolic": 130, "diastolic": 85 }
  ]
}

Rules:
1. "data" must be an array of objects sorted chronologically by the xAxisKey.
2. Only include data points that actually exist in the Patient Data.
3. Keep the "description" clinical and insightful.
4. "color" should be valid hex codes or tailwind colors.`,
        responseMimeType: "application/json",
        temperature: 0.1,
      }
    });
    
    let textRes = response.text || "{}";
    textRes = textRes.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(textRes) as ChartConfig;
  } catch (error) {
    console.error("Error generating visual trend:", error);
    return null;
  }
};
