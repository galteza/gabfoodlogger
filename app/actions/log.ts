"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const DUMMY_USER_ID = "00000000-0000-0000-0000-000000000000"; 

export async function logFoodToDb(foodData: any, portion: number, targetDate: string) {
  try {
    const { error } = await supabase
      .from("food_logs")
      .insert([
        {
          user_id: DUMMY_USER_ID,
          date: targetDate, // Inject the selected date here
          food_name: foodData.name,
          calories: Math.round(foodData.calories * portion),
          protein: Number((foodData.protein * portion).toFixed(1)),
          carbs: Number((foodData.carbs * portion).toFixed(1)),
          fats: Number((foodData.fats * portion).toFixed(1)),
          portion_multiplier: portion,
          entry_type: foodData.name === "Scanned Label" ? "ai" : "barcode",
        },
      ]);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Database Insert Error:", error);
    return { success: false, error: "Failed to save food log." };
  }
}

export async function deleteFoodLog(logId: string) {
  try {
    const { error } = await supabase
      .from("food_logs")
      .delete()
      .eq("id", logId)
      .eq("user_id", DUMMY_USER_ID); // Extra safety check

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Database Delete Error:", error);
    return { success: false, error: "Failed to delete food log." };
  }
}