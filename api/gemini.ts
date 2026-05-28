import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Pass the entire body directly to the generateContent method
    const response = await ai.models.generateContent(req.body);

    return res.status(200).json({ text: response.text });
  } catch (error: any) {
    console.error('Error in /api/gemini:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate content' });
  }
}
