"use server";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const DUMMY_USER_ID = "00000000-0000-0000-0000-000000000000";

export async function updateUserTargets(targets: {
  tdee: number;
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fats: number;
}) {
  try {
    const { error } = await supabase
      .from('users')
      .upsert({
        id: DUMMY_USER_ID,
        baseline_tdee: targets.tdee,
        caloric_target: targets.target_calories,
        target_protein: targets.target_protein,
        target_carbs: targets.target_carbs,
        target_fats: targets.target_fats,
      }); // Removed the .eq() because upsert uses the primary key automatically

    if (error) {
      console.error("Supabase Error Details:", error);
      throw error;
    }
    return { success: true };
  } catch (error) {
    console.error("Profile Update Error:", error);
    return { success: false, error: "Failed to update profile." };
  }
}