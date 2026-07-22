"use server";

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