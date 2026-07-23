"use server";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const DUMMY_USER_ID = "00000000-0000-0000-0000-000000000000";

export async function lookupBarcode(barcode: string) {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const data = await response.json();

    if (data.status === 1) {
      const product = data.product;
      const nutriments = product.nutriments;
      
      return {
        success: true,
        foodName: product.product_name || "Unknown Product",
        portionsize: nutriments['serving_size'] ? parseFloat(nutriments['serving_size']) : 1,
        unit: nutriments['serving_size'] ? nutriments['serving_size'].replace(/[0-9.]/g, '').trim() : "serving",
        calories: nutriments['energy-kcal_100g'] || 0,
        protein: nutriments.proteins_100g || 0,
        carbs: nutriments.carbohydrates_100g || 0,
        fats: nutriments.fat_100g || 0,
        image: product.image_front_url || null,
      };
    } else {
      return { success: false, error: "Food not found in database" };
    }
  } catch {
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

export async function logFoodToJournal(foodId: string, targetDate?: string) {
  const { data: food, error: fetchError } = await supabase
    .from("saved_foods")
    .select("*")
    .eq("id", foodId)
    .single();

  if (fetchError || !food) {
    console.error("Food lookup error:", fetchError);
    return { success: false };
  }

  const logDate = targetDate || new Date().toISOString().split("T")[0];

  const { error } = await supabase
    .from("food_logs")
    .insert({
      user_id: DUMMY_USER_ID,
      date: logDate,
      food_name: food.name,
      calories: food.calories,
      protein: food.protein || 0,
      carbs: food.carbs || 0,
      fats: food.fats || 0,
      portion_multiplier: 1,
      entry_type: "saved",
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
  portionsize?: number;
  unit?: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  description?: string;
}) {
  const payload = {
    user_id: DUMMY_USER_ID,
    name: food.name,
    portionsize: Number(food.portionsize || "").toFixed(2),
    unit: food.unit || "",
    calories: Number(food.calories.toFixed(2)),
    protein: Number((food.protein || 0).toFixed(2)),
    carbs: Number((food.carbs || 0).toFixed(2)),
    fats: Number((food.fats || 0).toFixed(2)),
    description: food.description || "",
  };

  let result;

  if (food.id) {
    result = await supabase
      .from("saved_foods")
      .update(payload)
      .eq("id", food.id)
      .select()
      .single();
  } else {
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
  const logDate = food.logDate || new Date().toISOString().split("T")[0];

  const { error } = await supabase
    .from("food_logs")
    .insert({
      user_id: DUMMY_USER_ID,
      date: logDate,
      food_name: food.name,
      calories: Number(food.calories.toFixed(2)),
      protein: Number((food.protein || 0).toFixed(2)),
      carbs: Number((food.carbs || 0).toFixed(2)),
      fats: Number((food.fats || 0).toFixed(2)),
      portion_multiplier: 1,
      entry_type: "manual",
    });

  if (error) {
    console.error("Diary Log Error:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}
