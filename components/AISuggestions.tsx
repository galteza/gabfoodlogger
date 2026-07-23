"use client";

import { useState } from "react";
import { getMacroSuggestions } from "@/app/actions/suggest";

interface AISuggestionsProps {
    date: string;
    dashboardStats: any;
}

export default function AISuggestions({ date, dashboardStats }: AISuggestionsProps) {
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isSuggesting, setIsSuggesting] = useState(false);

    const handleGetSuggestions = async () => {
        if (!dashboardStats) return;
        
        setIsSuggesting(true);
        setSuggestions([]);
    
        const remaining = {
          protein: Math.max(0, dashboardStats.targets.protein - dashboardStats.consumed.protein),
          carbs: Math.max(0, dashboardStats.targets.carbs - dashboardStats.consumed.carbs),
          fats: Math.max(0, dashboardStats.targets.fats - dashboardStats.consumed.fats),
        };
    
        // 2. FIXED: Matched the function call to your import at the top of the file
        const result = await getMacroSuggestions(remaining);
        
        if (result.success) {
          setSuggestions(result.suggestions);
        } else {
          alert("Could not generate suggestions right now.");
        }
        
        setIsSuggesting(false);
    };

    return (
        <div className="w-full">
            <button 
              onClick={handleGetSuggestions}
              disabled={isSuggesting}
              className="w-full py-3 text-sm font-bold text-zinc-900 bg-yellow-400 rounded-xl shadow-sm hover:bg-yellow-500 disabled:opacity-50 transition-colors"
            >
              {isSuggesting ? "✨ Thinking..." : "✨ Ask AI What To Eat"}
            </button>

            {suggestions.length > 0 && (
            <div className="mt-3 flex flex-col gap-3">
                {suggestions.map((item, i) => (
                <div key={i} className="p-4 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl shadow-sm">
                    <h4 className="font-bold text-md dark:text-white">{item.name}</h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">{item.description}</p>
                    <div className="flex gap-3 text-xs font-medium">
                      <span className="text-zinc-500">{item.calories} kcal</span>
                      <span className="text-blue-500">{item.protein}g P</span>
                      <span className="text-green-500">{item.carbs}g C</span>
                      <span className="text-yellow-500">{item.fats}g F</span>
                    </div>
                </div>
                ))}
            </div>
            )}
        </div>
    );
}