"use client";

import { useState, useEffect } from "react";
import { saveFoodToDatabase } from "@/app/actions/food"; // Import your DB actions directly here

interface AddFoodQuickProps {
    setStagedFood: (food: any) => void;
    foodToEdit?: any | null;
    setFoodToEdit: (food: any | null) => void;
}

export default function AddFoodQuick({ setStagedFood, foodToEdit, setFoodToEdit }: AddFoodQuickProps) {
  
  // 1. All form state lives isolated inside this component
  const [foodName, setFoodName] = useState("");
  const [portionsize, setPortionSize] = useState("");
  const [unit, setUnit] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");

  // 2. If a user clicks "Edit" and passes a food item, populate the form automatically
  useEffect(() => {
    if (foodToEdit) {
      setFoodName(foodToEdit.name || "");
      setPortionSize(foodToEdit.portionsize || "");
    setUnit(foodToEdit.unit || "");
      setCalories(foodToEdit.calories?.toString() || "");
      setProtein(foodToEdit.protein?.toString() || "");
      setCarbs(foodToEdit.carbs?.toString() || "");
      setFats(foodToEdit.fats?.toString() || "");
    }
  }, [foodToEdit]);

  const resetForm = () => {
    foodToEdit && setStagedFood(null); // Clear the staged food if we were editing
    setFoodToEdit(null); // Clear the foodToEdit state
    setFoodName(""); 
    setPortionSize("");
    setUnit("");
    setCalories(""); 
    setProtein(""); 
    setCarbs(""); 
    setFats("");
  };

  return (
    <div className="flex flex-col gap-3">
      {foodToEdit && (
        <div className="text-xs font-bold text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
          Editing Database Item: {foodToEdit.name}
        </div>
      )}
      
      <div>
        <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Name *</label>
        <input required type="text" value={foodName} onChange={(e) => setFoodName(e.target.value)} className="w-full p-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
      </div>

      <div>
        <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Portion Size (optional)</label>
        <input required type="text" placeholder="Portion Size (optional)" value={portionsize} onChange={(e) => setPortionSize(e.target.value)} className="w-full p-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
      </div>

      <div>
        <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Unit * (optional)</label>
        <input required type="text" placeholder="Unit (optional)" value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full p-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
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

      <div className="grid grid-cols-2 gap-2 mt-2">
        <button onClick={setStagedFood} className="py-2 bg-green-600 text-white font-bold text-xs rounded-xl hover:bg-green-700">
          Preview & Log
        </button>
        <button onClick={() => saveFoodToDatabase({ name: foodName, portionsize: Number(portionsize), unit: unit, calories: Number(calories), protein: Number(protein), carbs: Number(carbs), fats: Number(fats) })} className="py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700">
          Save to Database
        </button>
      </div>

      <div className="mt-2">
        <button onClick={resetForm} className="py-2 bg-zinc-100 text-zinc-600 font-bold text-xs rounded-xl hover:bg-zinc-200">
          Reset Form
        </button>
      </div>
    </div>
  );
}