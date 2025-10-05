import { GoogleGenAI, Type } from "@google/genai";

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
