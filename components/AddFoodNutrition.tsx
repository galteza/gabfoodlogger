"use client";

import { useState, useRef } from "react";
import { scanNutritionLabel } from "@/app/actions/vision"; // Adjust path if needed
import { saveFoodToDatabase } from "@/app/actions/food"; 

interface AddFoodNutritionProps {
  setStagedFood: (food: any) => void;
}

export default function AddFoodNutrition({ setStagedFood }: AddFoodNutritionProps) {
  // 1. Scanner State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2. Editable Form State (starts empty, gets filled by AI)
  const [foodName, setFoodName] = useState("");
  const [portionsize, setPortionSize] = useState("");
  const [unit, setUnit] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");

  // 3. The Camera Action (Lives entirely inside this component now)
  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", file);

    const result = await scanNutritionLabel(formData);
    
    if (result.success && result) {
      // Auto-fill the form with the AI's best guess!
      setFoodName(result.foodName || "Scanned Food");
      setPortionSize(result.portionsize?.toString() || "1");
      setUnit(result.unit || "serving");
      setCalories(result.calories?.toString() || "0");
      setProtein(result.protein?.toString() || "0");
      setCarbs(result.carbs?.toString() || "0");
      setFats(result.fats?.toString() || "0");
    } else {
      setError(result.error || "Could not read the label.");
    }
    
    setLoading(false);
  };

  // 4. Action Handlers
  const handleStageForPreview = () => {
    if (!foodName || !calories) return alert("Name and Calories required!");
    // Send it up to page.tsx -> PreviewEntry.tsx
    setStagedFood({
      name: foodName,
      portionsize: Number(portionsize) || 1,
      unit: unit,
      calories: Number(calories),
      protein: Number(protein),
      carbs: Number(carbs),
      fats: Number(fats)
    });
  };

  const handleSaveToDatabase = async () => {
    if (!foodName || !calories) return alert("Name and Calories required!");
    const res = await saveFoodToDatabase({
      name: foodName,
      portionsize: Number(portionsize) || 1,
      unit: unit,
      calories: Number(calories),
      protein: Number(protein),
      carbs: Number(carbs),
      fats: Number(fats)
    });

    if (res.success) alert("Saved to database!");
    else alert("Failed to save.");
  };

  const resetForm = () => {
    setFoodName(""); setPortionSize(""); setUnit(""); 
    setCalories(""); setProtein(""); setCarbs(""); setFats("");
    setError(null);
  };

  return (
    <div className="flex flex-col gap-3">
      
      {/* SCANNER BUTTON */}
      <div className="w-full flex justify-center mb-2">
        <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handlePhotoCapture} className="hidden" />
        <button 
          onClick={() => fileInputRef.current?.click()} 
          className="px-6 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl shadow-sm hover:bg-blue-700 w-full flex items-center justify-center gap-2"
        >
          {loading ? "Scanning Label..." : "📷 Scan Nutrition Label"}
        </button>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-lg text-center">{error}</div>}

      {/* EDITABLE FORM (Auto-filled by scan) */}
      <div>
        <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Name *</label>
        <input required type="text" value={foodName} onChange={(e) => setFoodName(e.target.value)} className="w-full p-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Portion Size (optional)</label>
          <input type="number" placeholder="e.g. 1" value={portionsize} onChange={(e) => setPortionSize(e.target.value)} className="w-full p-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Unit (optional)</label>
          <input type="text" placeholder="e.g. slice, cup" value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full p-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Calories *</label>
          <input required type="number" step="0.01" value={calories} onChange={(e) => setCalories(e.target.value)} className="w-full p-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-blue-500 uppercase block mb-1">Protein (g)</label>
          <input type="number" step="0.01" value={protein} onChange={(e) => setProtein(e.target.value)} className="w-full p-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-bold text-green-500 uppercase block mb-1">Carbs (g)</label>
          <input type="number" step="0.01" value={carbs} onChange={(e) => setCarbs(e.target.value)} className="w-full p-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-yellow-500 uppercase block mb-1">Fats (g)</label>
          <input type="number" step="0.01" value={fats} onChange={(e) => setFats(e.target.value)} className="w-full p-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        <button onClick={handleStageForPreview} className="py-2 bg-green-600 text-white font-bold text-xs rounded-xl hover:bg-green-700">
          Preview & Log
        </button>
        <button onClick={handleSaveToDatabase} className="py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700">
          Save to Database
        </button>
      </div>

      <div className="mt-2">
        <button onClick={resetForm} className="py-2 w-full bg-zinc-100 text-zinc-600 font-bold text-xs rounded-xl hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700">
          Reset Form
        </button>
      </div>

    </div>
  );
}