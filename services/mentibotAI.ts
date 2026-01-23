import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (API_KEY) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
}

export interface MentalHealthResponse {
    text: string;
    sentiment: 'positive' | 'neutral' | 'negative' | 'anxious' | 'depressed' | 'stable';
    isCrisis: boolean;
    recommendation?: string;
}

const CRISIS_KEYWORDS = [
    'suicide', 'kill myself', 'end my life', 'better off dead',
    'self harm', 'hurt myself', 'don\'t want to live', 'jump',
    'overdose', 'hang myself', 'cutting myself'
];

export const chatWithMentibot = async (message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]): Promise<MentalHealthResponse> => {
    if (!ai) {
        return {
            text: "I'm sorry, my AI processing is currently offline. Please check your configuration.",
            sentiment: 'neutral',
            isCrisis: false
        };
    }

    // Quick crisis check locally for speed
    const isCrisisLocal = CRISIS_KEYWORDS.some(keyword => message.toLowerCase().includes(keyword));

    try {
        const systemPrompt = `You are Mentibot, an empathetic AI mental health companion for Documedic. 
Your goal is to provide supportive, non-judgmental conversation and helpful coping strategies.

**CORE DIRECTIVES:**
1. **CRITICAL:** If the user expresses thoughts of self-harm, suicide, or severe local distress, you MUST detect it as a crisis.
2. If it's a crisis: Acknowledge their pain, provide immediate crisis resources (National Suicide Prevention Lifeline 988 in the US, or local emergency services), and strongly recommend speaking to a professional or trusted friend. BE DIRECT AND FIRM ABOUT SAFETY.
3. If it's NOT a crisis: Provide a fully helpful, empathetic answer to their concerns using techniques from CBT or mindfulness where appropriate.
4. **Sentiment Analysis:** Analyze the emotional tone of the user's message.
5. **Output Format:** You MUST respond in a JSON format with these exact fields:
   {
     "text": "Your empathetic response string",
     "sentiment": "positive" | "neutral" | "negative" | "anxious" | "depressed" | "stable",
     "isCrisis": boolean,
     "recommendation": "Optional string recommending a specific Documedic tool or professional help"
   }
6. NEVER provide a medical diagnosis.
7. Tone should be warm, editorial (retro-futuristic Documedic style), and professional.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                ...history,
                { role: 'user', parts: [{ text: message }] }
            ],
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                temperature: 0.7,
            }
        });

        const result = JSON.parse(response.text);

        // Safety fallback: if local check found crisis but AI missed it
        if (isCrisisLocal) {
            result.isCrisis = true;
            if (!result.text.includes('988') && !result.text.includes('Emergency')) {
                result.text = "I'm hearing that you're in a lot of pain right now. Please know that you're not alone and support is available. " +
                    "If you're in immediate danger, please contact emergency services or call/text 988 (in the US) or your local crisis line immediately. " +
                    "Your safety is the most important thing right now. " + result.text;
            }
        }

        return result as MentalHealthResponse;

    } catch (error) {
        console.error("Mentibot AI Error:", error);
        return {
            text: "I'm here for you, but I'm having trouble processing that right now. Could you tell me more about how you're feeling?",
            sentiment: 'neutral',
            isCrisis: isCrisisLocal,
            recommendation: isCrisisLocal ? "Please seek immediate professional help." : undefined
        };
    }
};
