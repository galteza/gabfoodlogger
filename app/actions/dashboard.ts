"use server";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const DUMMY_USER_ID = "00000000-0000-0000-0000-000000000000";

export async function getDayStats(date: string) {
  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('caloric_target, target_protein, target_carbs, target_fats')
      .eq('id', DUMMY_USER_ID)
      .single();

    if (userError) throw userError;

    const { data: logs, error: logsError } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', DUMMY_USER_ID)
      .eq('date', date)
      .order('created_at', { ascending: true }); // Order by oldest first

    if (logsError) throw logsError;

    const consumed = logs.reduce((acc, log) => ({
      calories: acc.calories + log.calories,
      protein: acc.protein + log.protein,
      carbs: acc.carbs + log.carbs,
      fats: acc.fats + log.fats,
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

    return {
      success: true,
      targets: {
        calories: userData.caloric_target,
        protein: userData.target_protein,
        carbs: userData.target_carbs,
        fats: userData.target_fats,
      },
      consumed,
      logs // We now return the raw logs for the UI list
    };
  } catch (error) {
    console.error("Dashboard Fetch Error:", error);
    return { success: false, error: "Failed to load dashboard data." };
  }
}