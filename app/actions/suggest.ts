"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function getMacroSuggestions(remaining: { protein: number; carbs: number; fats: number }) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash-lite",
      generationConfig: { responseMimeType: "application/json" } 
    });

    const prompt = `
      I have the following macro targets remaining for the day:
      Protein: ${remaining.protein}g
      Carbohydrates: ${remaining.carbs}g
      Fats: ${remaining.fats}g

      Suggest 3 quick, realistic whole-food meals or snacks that hit these remaining macros as closely as possible. 
      Return ONLY a JSON object in this exact format:
      {
        "suggestions": [
          {
            "name": "Food Name",
            "description": "Short description of what to eat",
            "protein": number,
            "carbs": number,
            "fats": number,
            "calories": number
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const data = JSON.parse(result.response.text());

    return { success: true, suggestions: data.suggestions };
  } catch (error) {
    console.error("AI Suggestion Error:", error);
    return { success: false, error: "Failed to generate suggestions." };
  }
}