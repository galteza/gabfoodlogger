"use server";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const DUMMY_USER_ID = "00000000-0000-0000-0000-000000000000";

export async function lookupBarcode(barcode: string) {
  try {
    // Ping the OpenFoodFacts API
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const data = await response.json();

    if (data.status === 1) {
      const product = data.product;
      const nutriments = product.nutriments;
      
      // Extract the macros (defaulting to 100g values for the prototype)
      return {
        success: true,
        foodName: product.product_name || "Unknown Product",
        calories: nutriments['energy-kcal_100g'] || 0,
        protein: nutriments.proteins_100g || 0,
        carbs: nutriments.carbohydrates_100g || 0,
        fats: nutriments.fat_100g || 0,
        image: product.image_front_url || null,
      };
    } else {
      return { success: false, error: "Food not found in database" };
    }
  } catch (error) {
    return { success: false, error: "API connection failed" };
  }
}

export async function searchSavedFoods(query: string) {
  if (!query) return [];
  
  const { data, error } = await supabase
    .from("saved_foods")
    .select("*")
    .ilike("name", `%${query}%`)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Search Error:", error);
    return [];
  }
  return data;
}

export async function quickAddFood(food: {
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  description?: string;
}) {
  const { data, error } = await supabase
    .from("saved_foods")
    .insert({
      user_id: DUMMY_USER_ID,
      name: food.name,
      calories: food.calories,
      protein: food.protein || 0,
      carbs: food.carbs || 0,
      fats: food.fats || 0,
      description: food.description || "",
    })
    .select()
    .single();

  if (error) {
    console.error("Quick Add Error:", error);
    return { success: false, error: error.message };
  }
  return { success: true, data };
}

// Logs a food item to your daily consumption table (assuming you have a food_logs table)
export async function logFoodToJournal(foodId: string) {
  const { error } = await supabase
    .from("food_logs")
    .insert({
      user_id: DUMMY_USER_ID,
      food_id: foodId,
      logged_at: new Date().toISOString(),
    });

  if (error) {
    console.error("Logging Error:", error);
    return { success: false };
  }
  return { success: true };
}

export async function saveFoodToDatabase(food: {
  id?: string;
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  description?: string;
}) {
  const payload = {
    user_id: DUMMY_USER_ID,
    name: food.name,
    calories: Number(food.calories.toFixed(2)),
    protein: Number((food.protein || 0).toFixed(2)),
    carbs: Number((food.carbs || 0).toFixed(2)),
    fats: Number((food.fats || 0).toFixed(2)),
    description: food.description || "",
  };

  let result;

  if (food.id) {
    // Update existing item
    result = await supabase
      .from("saved_foods")
      .update(payload)
      .eq("id", food.id)
      .select()
      .single();
  } else {
    // Insert new item
    result = await supabase
      .from("saved_foods")
      .insert(payload)
      .select()
      .single();
  }

  if (result.error) {
    console.error("Save Food Error:", result.error);
    return { success: false, error: result.error.message };
  }
  return { success: true, data: result.data };
}

export async function deleteSavedFood(foodId: string) {
  const { error } = await supabase
    .from("saved_foods")
    .delete()
    .eq("id", foodId);

  if (error) {
    console.error("Delete Error:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function logFoodToDiary(food: {
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  logDate?: string;
}) {
  // Use selected log date or default to current ISO timestamp
  const logTimestamp = food.logDate 
    ? new Date(food.logDate).toISOString() 
    : new Date().toISOString();

  const { error } = await supabase
    .from("food_logs")
    .insert({
      user_id: DUMMY_USER_ID,
      name: food.name,
      calories: Number(food.calories.toFixed(2)),
      protein: Number((food.protein || 0).toFixed(2)),
      carbs: Number((food.carbs || 0).toFixed(2)),
      fats: Number((food.fats || 0).toFixed(2)),
      logged_at: logTimestamp,
    });

  if (error) {
    console.error("Diary Log Error:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}