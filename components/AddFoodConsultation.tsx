"use client";

import { useState } from "react";
import { saveFoodToDatabase } from "@/app/actions/food"; 
import { estimateMacrosFromText } from "@/app/actions/vision";

interface AddFoodConsultationProps {
  setStagedFood: (food: any) => void;
}

export default function AddFoodConsultation({ setStagedFood }: AddFoodConsultationProps) {
  // 1. Chat/Prompt State
  const [prompt, setPrompt] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2. Editable Form State
  const [foodName, setFoodName] = useState("");
  const [portionsize, setPortionSize] = useState("");
  const [unit, setUnit] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");

  // 3. AI Request Logic
  const handleAskAI = async () => {
    if (!prompt.trim()) return alert("Please describe your meal!");
    
    setLoading(true);
    setError(null);

    try {

      const result = await estimateMacrosFromText(prompt); // Replace with your actual AI action

      if (result.success) {
        setFoodName(result.foodName || "");
        setPortionSize(result.portionsize.toString());
        setUnit(result.unit || "");
        setCalories(result.calories.toString());
        setProtein(result.protein.toString());
        setCarbs(result.carbs.toString());
        setFats(result.fats.toString());
        setIsChatOpen(false); // Hide the chat, show the form!
      } else {
        setError(result.error || "Could not estimate macros. Please try a different description.");
      }
    } catch (err) {
      setError("An error occurred while talking to the AI.");
    }

    setLoading(false);
  };

  // 4. Action Handlers (Exactly the same as other tabs)
  const handleStageForPreview = () => {
    if (!foodName || !calories) return alert("Name and Calories required!");
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
    setPrompt("");
    setFoodName(""); setPortionSize(""); setUnit(""); 
    setCalories(""); setProtein(""); setCarbs(""); setFats("");
    setError(null);
    setIsChatOpen(true); // Show the chat box again
  };

  return (
    <div className="flex flex-col gap-3">
      
      {/* 1. Chat Input View */}
      {isChatOpen && (
        <div className="flex flex-col gap-3 mt-2">
          <label className="text-xs font-bold text-zinc-500 uppercase block">Describe Your Meal</label>
          <textarea 
            rows={4}
            placeholder="e.g. 2 scrambled eggs with a slice of sourdough toast and half an avocado..." 
            value={prompt} 
            onChange={(e) => setPrompt(e.target.value)} 
            className="w-full p-3 border rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 outline-none" 
          />
          <button 
            onClick={handleAskAI} 
            disabled={loading || !prompt.trim()}
            className="py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {loading ? "✨ AI is estimating..." : "✨ Ask AI for Macros"}
          </button>
        </div>
      )}

      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-lg text-center">{error}</div>}

      {/* 2. Editable Form View (Shows after AI responds) */}
      {!isChatOpen && !loading && (
        <div className="flex flex-col gap-3 mt-2">
          
          <div className="p-3 mb-2 bg-blue-50 border border-blue-200 rounded-xl dark:bg-blue-900/20 dark:border-blue-800/50">
             <p className="text-xs text-blue-800 dark:text-blue-300 font-medium">
               <strong>Your query:</strong> "{prompt}"
             </p>
          </div>

          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Name *</label>
            <input required type="text" value={foodName} onChange={(e) => setFoodName(e.target.value)} className="w-full p-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Portion Size</label>
              <input type="number" placeholder="e.g. 1" value={portionsize} onChange={(e) => setPortionSize(e.target.value)} className="w-full p-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Unit</label>
              <input type="text" placeholder="e.g. meal, plate" value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full p-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
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

          {/* Action Buttons */}
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
              Ask About Another Meal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}