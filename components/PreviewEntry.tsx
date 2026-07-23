"use client";

type StagedFood = any;

interface PreviewEntryProps {
    stagedFood: StagedFood | null;
    portion: number;
    setPortion: (v: number) => void;
    isSaving: boolean;
    onSave: () => void;
    onCancel: () => void; // 1. Add this new prop!
}

export default function PreviewEntry({ 
    stagedFood,
    portion,
    setPortion,
    isSaving,
    onSave,
    onCancel, // 2. Pull it in here
 }: PreviewEntryProps) {
    
    // If no food is staged yet, render nothing so the UI stays clean
    if (!stagedFood) return null;

    return (
        <div className="w-full p-6 bg-white border rounded-xl shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
            
            {/* Header / Name & Close Button */}
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white pr-4">
                    {stagedFood.name || stagedFood.foodName}
                </h2>
                
                {/* 3. Clean, subtle X button in the top right */}
                <button 
                    onClick={onCancel}
                    className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
                    title="Remove from preview"
                >
                    ✕
                </button>
            </div>
            
            {/* Macro Calculation Row */}
            <div className="grid grid-cols-4 gap-2 text-center mb-6">
              <div className="p-2 bg-zinc-100 rounded-lg dark:bg-zinc-800">
                <div className="text-sm text-zinc-500">Cals</div>
                <div className="font-bold">{Math.round(stagedFood.calories * portion)}</div>
              </div>
              <div className="p-2 bg-blue-50 text-blue-700 rounded-lg dark:bg-blue-900/30 dark:text-blue-400">
                <div className="text-sm opacity-80">Pro</div>
                <div className="font-bold">{(stagedFood.protein * portion).toFixed(1)}g</div>
              </div>
              <div className="p-2 bg-green-50 text-green-700 rounded-lg dark:bg-green-900/30 dark:text-green-400">
                <div className="text-sm opacity-80">Carbs</div>
                <div className="font-bold">{(stagedFood.carbs * portion).toFixed(1)}g</div>
              </div>
              <div className="p-2 bg-yellow-50 text-yellow-700 rounded-lg dark:bg-yellow-900/30 dark:text-yellow-400">
                <div className="text-sm opacity-80">Fat</div>
                <div className="font-bold">{(stagedFood.fats * portion).toFixed(1)}g</div>
              </div>
            </div>

            {/* Portion Modifier */}
            <div className="flex items-center gap-4 mb-6">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                Portion:
              </label>
              <input 
                type="number" 
                step="0.25" 
                min="0.25" 
                value={portion} 
                onChange={(e) => setPortion(Number(e.target.value))} 
                className="w-full p-2 border rounded-lg bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" 
              />
            </div>

            {/* Save Button triggers the parent's function */}
            <button 
                onClick={onSave} 
                disabled={isSaving} 
                className="w-full py-3 text-white font-bold bg-green-600 rounded-xl hover:bg-green-700 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Log to Journal"}
            </button>
        </div>
    );
}