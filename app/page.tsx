"use client";

import { useState, useRef, useEffect } from "react";
import BarcodeScanner from "@/components/BarcodeScanner";
import { lookupBarcode } from "./actions/food";
import { scanNutritionLabel } from "./actions/vision";
import { logFoodToDb, deleteFoodLog } from "./actions/log";
import MacroChart from "@/components/MacroChart";
import { getDayStats } from "./actions/dashboard";
import { getMacroSuggestions } from "./actions/suggest";

export default function Home() {
  const [scannedFood, setScannedFood] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [portion, setPortion] = useState<number>(1.0);
  const [isSaving, setIsSaving] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  
  // AI Suggestions State
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  
  // Date State (Defaults to today in YYYY-MM-DD format)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadStats = async (dateStr: string) => {
    const stats = await getDayStats(dateStr);
    if (stats.success) {
      setDashboardStats(stats);
    }
  };

  useEffect(() => {
    loadStats(selectedDate);
  }, [selectedDate]);

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleDelete = async (id: string, foodName: string) => {
    if (window.confirm(`Are you sure you want to delete ${foodName}?`)) {
      const result = await deleteFoodLog(id);
      if (result.success) {
        loadStats(selectedDate);
      } else {
        alert("Failed to delete log.");
      }
    }
  };

  const handleGetSuggestions = async () => {
    if (!dashboardStats) return;
    
    setIsSuggesting(true);
    setSuggestions([]);

    const remaining = {
      protein: Math.max(0, dashboardStats.targets.protein - dashboardStats.consumed.protein),
      carbs: Math.max(0, dashboardStats.targets.carbs - dashboardStats.consumed.carbs),
      fats: Math.max(0, dashboardStats.targets.fats - dashboardStats.consumed.fats),
    };

    const result = await getMacroSuggestions(remaining);
    
    if (result.success) {
      setSuggestions(result.suggestions);
    } else {
      alert("Could not generate suggestions right now.");
    }
    
    setIsSuggesting(false);
  };

  const handleScan = async (code: string) => {
    setLoading(true);
    setError(null);
    setScannedFood(null);
    setPortion(1.0);

    const result = await lookupBarcode(code);
    if (result.success) setScannedFood(result);
    else setError(result.error || "Something went wrong");
    
    setLoading(false);
  };

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setScannedFood(null);
    setPortion(1.0);

    const formData = new FormData();
    formData.append("image", file);

    const result = await scanNutritionLabel(formData);
    if (result.success) setScannedFood(result);
    else setError(result.error || "Could not read the label.");
    
    setLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const result = await logFoodToDb(scannedFood, portion, selectedDate);
    setIsSaving(false);

    if (result.success) {
      setScannedFood(null); 
      loadStats(selectedDate);
    } else {
      alert("Failed to log food.");
    }
  };

  return (
    <div className="flex flex-col flex-1 items-center min-h-screen bg-zinc-50 font-sans dark:bg-black p-4 pb-20">
      <main className="flex w-full max-w-md flex-col items-center gap-6 mt-4">
        
        {/* Date Navigator */}
        <div className="flex items-center justify-between w-full p-4 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border dark:border-zinc-800">
          <button onClick={() => changeDate(-1)} className="p-2 text-zinc-500 hover:text-black dark:hover:text-white">
            ◀
          </button>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent font-bold text-lg text-center focus:outline-none dark:text-white"
          />
          <button onClick={() => changeDate(1)} className="p-2 text-zinc-500 hover:text-black dark:hover:text-white">
            ▶
          </button>
        </div>

        {dashboardStats && (
          <>
            <MacroChart targets={dashboardStats.targets} consumed={dashboardStats.consumed} />
            
            {/* AI Suggestion Button & Cards */}
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

            {/* Logged Foods List */}
            <div className="w-full">
              <h3 className="text-lg font-bold mb-3 dark:text-white">Logged Foods</h3>
              {dashboardStats.logs?.length === 0 ? (
                <p className="text-zinc-500 text-sm text-center py-4 bg-white dark:bg-zinc-900 rounded-xl border dark:border-zinc-800">No foods logged on this date.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {dashboardStats.logs.map((log: any) => (
                    <div key={log.id} className="flex justify-between items-center p-3 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border dark:border-zinc-800">
                      <div>
                        <p className="font-bold text-sm dark:text-white">
                          {log.portion_multiplier !== 1 && <span className="text-blue-500 mr-1">{log.portion_multiplier}x</span>}
                          {log.food_name}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {log.calories} kcal • {log.protein}g P • {log.carbs}g C • {log.fats}g F
                        </p>
                      </div>
                      <button 
                        onClick={() => handleDelete(log.id, log.food_name)}
                        className="p-2 text-red-400 hover:text-red-600 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Scanner Component */}
        <div className="w-full mt-2">
          <BarcodeScanner onScan={handleScan} />
        </div>

        <div className="w-full flex justify-center">
          <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handlePhotoCapture} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-xl shadow-sm hover:bg-blue-700 w-full max-w-sm">
            📸 Scan Nutrition Label Instead
          </button>
        </div>

        {loading && <p className="text-blue-500 animate-pulse">Processing...</p>}
        {error && <div className="w-full p-4 bg-red-50 border border-red-200 rounded-xl text-center"><p className="text-red-600 mb-3">{error}</p></div>}

        {scannedFood && (
          <div className="w-full p-6 bg-white border rounded-xl shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
             <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">{scannedFood.foodName}</h2>
             
             <div className="grid grid-cols-4 gap-2 text-center mb-6">
              <div className="p-2 bg-zinc-100 rounded-lg dark:bg-zinc-800"><div className="text-sm text-zinc-500">Cals</div><div className="font-bold">{Math.round(scannedFood.calories * portion)}</div></div>
              <div className="p-2 bg-blue-50 text-blue-700 rounded-lg dark:bg-blue-900/30 dark:text-blue-400"><div className="text-sm opacity-80">Pro</div><div className="font-bold">{(scannedFood.protein * portion).toFixed(1)}g</div></div>
              <div className="p-2 bg-green-50 text-green-700 rounded-lg dark:bg-green-900/30 dark:text-green-400"><div className="text-sm opacity-80">Carbs</div><div className="font-bold">{(scannedFood.carbs * portion).toFixed(1)}g</div></div>
              <div className="p-2 bg-yellow-50 text-yellow-700 rounded-lg dark:bg-yellow-900/30 dark:text-yellow-400"><div className="text-sm opacity-80">Fat</div><div className="font-bold">{(scannedFood.fats * portion).toFixed(1)}g</div></div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 whitespace-nowrap">Portion:</label>
              <input type="number" step="0.25" min="0.25" value={portion} onChange={(e) => setPortion(Number(e.target.value))} className="w-full p-2 border rounded-lg bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
            </div>

            <button onClick={handleSave} disabled={isSaving} className="w-full py-3 text-white font-bold bg-green-600 rounded-xl hover:bg-green-700 disabled:opacity-50">
              {isSaving ? "Saving..." : "Log to Journal"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}