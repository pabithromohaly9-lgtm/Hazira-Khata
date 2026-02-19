
import { GoogleGenAI, Type } from "@google/genai";
import { Worker, AttendanceRecord } from "../types.ts";

export const getAIInsights = async (workers: Worker[], records: AttendanceRecord[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    Based on the following worker data and attendance records, provide a summary in Bengali (max 3 sentences).
    Workers: ${JSON.stringify(workers)}
    Recent Attendance: ${JSON.stringify(records.slice(-20))}
    Highlight any worker with poor attendance or give a general encouragement message for the team.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a professional business assistant. Speak in polite Bengali.",
        temperature: 0.7,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "এআই ইনসাইট বর্তমানে পাওয়া যাচ্ছে না।";
  }
};
