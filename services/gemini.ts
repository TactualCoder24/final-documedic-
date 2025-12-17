import { GoogleGenAI, Type } from "@google/genai";
import { DocumentAnalysis } from "../types";

// Per security best practices and platform requirements, the API key is
// sourced exclusively from the `process.env.API_KEY` environment variable.
const API_KEY = process.env.API_KEY;

// A single, reusable instance of the GoogleGenAI client is created.
// This is more efficient than creating a new instance for every API call.
let ai: GoogleGenAI | null = null;

// Initialize the client only if the API key is available.
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  // Log a warning to the console if the key is missing. This helps with debugging.
  console.warn(
    "Gemini API key not found. Please set the process.env.API_KEY environment variable. AI features will be disabled."
  );
}

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

export const analyzeMedicalDocument = async (base64Image: string, mimeType: string): Promise<DocumentAnalysis | null> => {
  if (!ai) return null;

  try {
    const imagePart = {
      inlineData: { data: base64Image, mimeType },
    };
    const textPart = {
      text: "Extract all text from this medical document. Be as accurate as possible.",
    };

    // Step 1: Extract text from image
    const visionResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [imagePart, textPart] },
    });
    
    const extractedText = visionResponse.text;
    if (!extractedText || extractedText.trim().length < 10) { // Basic check for meaningful text
      throw new Error("Could not extract sufficient text from the document.");
    }

    // Step 2: Analyze extracted text
    const analysisResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following medical text. Provide a simple summary for the patient, define any complex medical terms, and extract key vital signs. The text: """${extractedText}"""`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: 'A simple, easy-to-understand summary of the document for a patient.' },
            definitions: {
              type: Type.ARRAY,
              description: 'An array of objects, where each object defines a complex medical term found in the text.',
              items: {
                type: Type.OBJECT,
                properties: { term: { type: Type.STRING }, definition: { type: Type.STRING } },
                required: ['term', 'definition']
              }
            },
            vitals: {
              type: Type.ARRAY,
              description: 'An array of objects, where each object represents a key vital sign or lab result found in the text.',
              items: {
                type: Type.OBJECT,
                properties: { name: { type: Type.STRING }, value: { type: Type.STRING }, unit: { type: Type.STRING } },
                required: ['name', 'value']
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

export const chatWithShakti = async (message: string): Promise<string> => {
  if (!ai) return "AI features are currently unavailable.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction: "You are Shakti, a friendly and knowledgeable AI health assistant for the DocuMedic web application. Your purpose is to answer user questions about DocuMedic's features and provide general health and wellness information. \n\n**Rules:**\n1.  **Scope:** Strictly limit your responses to questions about the DocuMedic app (e.g., 'How do I upload a record?', 'What is the Smart Summary?') and general health topics (e.g., 'What are the benefits of hydration?', 'Tips for a balanced diet').\n2.  **Medical Disclaimer:** NEVER provide medical advice, diagnoses, or treatment recommendations. If a user asks for medical advice, you MUST decline and strongly recommend they consult a healthcare professional. For example, say 'I cannot provide medical advice, but I recommend speaking with a doctor about your symptoms.'\n3.  **Tone:** Be empathetic, encouraging, and clear in your communication.\n4.  **Format:** Use simple markdown (like lists or bold text) to make your answers easy to read.\n5.  **Refusal:** If a question is outside your scope (e.g., about politics, technology outside of DocuMedic, etc.), politely decline to answer.",
        temperature: 0.7,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error chatting with Shakti:", error);
    return "I'm having a little trouble connecting right now. Please try again in a moment.";
  }
};
