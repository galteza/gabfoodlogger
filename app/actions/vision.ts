"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function scanNutritionLabel(formData: FormData) {
  try {
    // 1. Extract the file from the FormData
    const file = formData.get("image") as File;
    if (!file) {
      return { success: false, error: "No image provided" };
    }

    // 2. Convert the File to an ArrayBuffer, then to a Base64 string for Gemini
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    // 3. Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash-lite",
      generationConfig: { responseMimeType: "application/json" } 
    });

    const prompt = `
      Analyze this nutrition facts label. Extract the values per serving, as well as the serving size and unit.
      Return ONLY a JSON object with exactly these keys: "portionsize", "unit", "calories", "protein", "carbs", "fats".
      The values (except for the unit, which must be string) must be numbers only (no 'g' or 'kcal').
      If you cannot read a value, return 0 for it. If portion size or unit cannot be determined, return 1 and "serving" respectively.
    `;

    // 4. Send to Gemini
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: file.type, // Use the actual mime type from the file
        },
      },
    ]);

    const data = JSON.parse(result.response.text());

    return {
      success: true,
      foodName: "Scanned Label",
      portionsize: data.portionsize || 1,
      unit: data.unit || "serving",
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fats: data.fats,
    };
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return { success: false, error: "Failed to read the nutrition label" };
  }
}


export async function estimateMacrosFromText(prompt: string) {
  try {

    // 3. Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash-lite",
      generationConfig: { responseMimeType: "application/json" } 
    });

    const base_prompt = `
      Analyze this the following information the user gave. Extract an estimated values per serving, as well as the serving size and unit if they haven't asked for it yet.
      Your job is to make a best and logical guess based on the information provided.
      Return ONLY a JSON object with exactly these keys: "portionsize", "unit", "calories", "protein", "carbs", "fats".
      The values (except for the unit, which must be string) must be numbers only (no 'g' or 'kcal').
      If you cannot read a value, return 0 for it. If portion size or unit cannot be determined, return 1 and "serving" respectively.
    `;

    prompt = `${base_prompt}\n\n${prompt}`;

    // 4. Send to Gemini
    const result = await model.generateContent([
      prompt,
    ]);

    const data = JSON.parse(result.response.text());

    return {
      success: true,
      foodName: "Scanned Label",
      portionsize: data.portionsize || 1,
      unit: data.unit || "serving",
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fats: data.fats,
    };
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return { success: false, error: "Failed to provide" };
  }
}