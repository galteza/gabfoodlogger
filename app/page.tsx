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

// "use client";

// import { useState } from "react";
// import MacroChart from "../components/MacroChart";
// import { searchSavedFoods, saveFoodToDatabase, deleteSavedFood, logFoodToDiary } from "./actions/food";

// export default function Home() {
//   // Target & Consumed State (Mocked/Loaded from DB)
//   const targets = { calories: 2000, protein: 150, carbs: 225, fats: 55 };
//   const consumed = { calories: 1250.50, protein: 95.20, carbs: 140.00, fats: 35.50 };

//   // Date State (Defaults to Today YYYY-MM-DD)
//   const [logDate, setLogDate] = useState<string>(
//     new Date().toISOString().split("T")[0]
//   );

//   // Active Tab
//   const [activeTab, setActiveTab] = useState<"search" | "quick" | "barcode" | "aiScan">("search");

//   // Search State
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchResults, setSearchResults] = useState<any[]>([]);
//   const [editingFood, setEditingFood] = useState<any | null>(null);

//   // Form State (Shared for Quick Add & Scanners)
//   const [foodName, setFoodName] = useState("");
//   const [calories, setCalories] = useState("");
//   const [protein, setProtein] = useState("");
//   const [carbs, setCarbs] = useState("");
//   const [fats, setFats] = useState("");
//   const [description, setDescription] = useState("");

//   // Search Database
//   const handleSearch = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const results = await searchSavedFoods(searchQuery);
//     setSearchResults(results);
//   };

//   // Delete Saved Food
//   const handleDeleteFood = async (id: string) => {
//     if (!confirm("Are you sure you want to delete this food from your database?")) return;
//     const res = await deleteSavedFood(id);
//     if (res.success) {
//       setSearchResults(searchResults.filter((item) => item.id !== id));
//       alert("Food deleted from database!");
//     }
//   };

//   // Save to Database Action
//   const handleSaveToDatabase = async () => {
//     if (!foodName || !calories) return alert("Name and Calories are required!");

//     const res = await saveFoodToDatabase({
//       id: editingFood?.id,
//       name: foodName,
//       calories: Number(calories),
//       protein: protein ? Number(protein) : 0,
//       carbs: carbs ? Number(carbs) : 0,
//       fats: fats ? Number(fats) : 0,
//       description,
//     });

//     if (res.success) {
//       alert("Successfully saved to database!");
//       resetForm();
//     } else {
//       alert("Failed to save to database.");
//     }
//   };

//   // Log to Diary Action
//   const handleLogToDiary = async (foodData?: any) => {
//     const itemToLog = foodData || {
//       name: foodName,
//       calories: Number(calories),
//       protein: Number(protein || 0),
//       carbs: Number(carbs || 0),
//       fats: Number(fats || 0),
//     };

//     if (!itemToLog.name || !itemToLog.calories) return alert("Name and Calories are required!");

//     const res = await logFoodToDiary({
//       ...itemToLog,
//       logDate,
//     });

//     if (res.success) {
//       alert(`Logged to diary for ${logDate}!`);
//       resetForm();
//     } else {
//       alert("Failed to log to diary.");
//     }
//   };

//   const startEditing = (food: any) => {
//     setEditingFood(food);
//     setFoodName(food.name);
//     setCalories(food.calories.toString());
//     setProtein(food.protein.toString());
//     setCarbs(food.carbs.toString());
//     setFats(food.fats.toString());
//     setDescription(food.description || "");
//     setActiveTab("quick");
//   };

//   const resetForm = () => {
//     setEditingFood(null);
//     setFoodName("");
//     setCalories("");
//     setProtein("");
//     setCarbs("");
//     setFats("");
//     setDescription("");
//   };

//   return (
//     <div className="flex flex-col flex-1 items-center min-h-screen bg-zinc-50 font-sans dark:bg-black p-4 pb-20">
//       <main className="flex w-full max-w-md flex-col items-center gap-6 mt-2">
        
//         {/* Header & Date Selector */}
//         <div className="w-full flex justify-between items-center bg-white dark:bg-zinc-900 p-4 rounded-xl border dark:border-zinc-800 shadow-sm">
//           <div>
//             <h1 className="text-xl font-black text-black dark:text-white">Daily Tracker</h1>
//             <p className="text-xs text-zinc-500">Log entries for any day</p>
//           </div>
//           <input 
//             type="date" 
//             value={logDate} 
//             onChange={(e) => setLogDate(e.target.value)}
//             className="p-2 border rounded-lg text-xs font-bold bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
//           />
//         </div>

//         {/* Top Macro Visualizer Tile */}
//         <MacroChart targets={targets} consumed={consumed} />

//         {/* Entry Method Selector */}
//         <div className="w-full bg-white dark:bg-zinc-900 p-4 rounded-xl border dark:border-zinc-800 shadow-sm">
//           <h2 className="text-sm font-bold mb-3 text-black dark:text-white">Add Food Entry</h2>
          
//           <div className="grid grid-cols-4 gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg mb-4 text-[11px] font-bold">
//             <button 
//               onClick={() => { setActiveTab("search"); resetForm(); }}
//               className={`py-2 rounded-md transition-all ${activeTab === "search" ? "bg-white dark:bg-zinc-700 shadow text-black dark:text-white" : "text-zinc-500"}`}
//             >
//               Search
//             </button>
//             <button 
//               onClick={() => { setActiveTab("quick"); resetForm(); }}
//               className={`py-2 rounded-md transition-all ${activeTab === "quick" ? "bg-white dark:bg-zinc-700 shadow text-black dark:text-white" : "text-zinc-500"}`}
//             >
//               Quick Add
//             </button>
//             <button 
//               onClick={() => { setActiveTab("barcode"); resetForm(); }}
//               className={`py-2 rounded-md transition-all ${activeTab === "barcode" ? "bg-white dark:bg-zinc-700 shadow text-black dark:text-white" : "text-zinc-500"}`}
//             >
//               Barcode
//             </button>
//             <button 
//               onClick={() => { setActiveTab("aiScan"); resetForm(); }}
//               className={`py-2 rounded-md transition-all ${activeTab === "aiScan" ? "bg-white dark:bg-zinc-700 shadow text-black dark:text-white" : "text-zinc-500"}`}
//             >
//               AI Scan
//             </button>
//           </div>

//           {/* TAB 1: Search Database */}
//           {activeTab === "search" && (
//             <div className="flex flex-col gap-3">
//               <form onSubmit={handleSearch} className="flex gap-2">
//                 <input 
//                   type="text" 
//                   placeholder="Search saved database..." 
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   className="flex-1 p-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
//                 />
//                 <button type="submit" className="px-4 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700">
//                   Search
//                 </button>
//               </form>

//               <div className="flex flex-col gap-2 mt-2">
//                 {searchResults.map((food) => (
//                   <div key={food.id} className="p-3 border rounded-xl bg-zinc-50 dark:bg-zinc-800/50 dark:border-zinc-700 flex justify-between items-center">
//                     <div>
//                       <h4 className="font-bold text-sm text-black dark:text-white">{food.name}</h4>
//                       <p className="text-[11px] text-zinc-500">
//                         {food.calories} kcal | {food.protein}g P | {food.carbs}g C | {food.fats}g F
//                       </p>
//                     </div>
                    
//                     <div className="flex gap-1">
//                       <button 
//                         onClick={() => handleLogToDiary(food)}
//                         className="px-2 py-1 bg-green-600 text-white font-bold text-[10px] rounded hover:bg-green-700"
//                       >
//                         + Log
//                       </button>
//                       <button 
//                         onClick={() => startEditing(food)}
//                         className="px-2 py-1 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-white font-bold text-[10px] rounded hover:bg-zinc-300"
//                       >
//                         Edit
//                       </button>
//                       <button 
//                         onClick={() => handleDeleteFood(food.id)}
//                         className="px-2 py-1 bg-red-100 text-red-600 font-bold text-[10px] rounded hover:bg-red-200"
//                       >
//                         Del
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* TAB 2: Quick Add / Edit Form */}
//           {activeTab === "quick" && (
//             <div className="flex flex-col gap-3">
//               {editingFood && (
//                 <div className="text-xs font-bold text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
//                   Editing Database Item: {editingFood.name}
//                 </div>
//               )}
              
//               <div>
//                 <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Name *</label>
//                 <input required type="text" value={foodName} onChange={(e) => setFoodName(e.target.value)} className="w-full p-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
//               </div>

//               <div className="grid grid-cols-2 gap-2">
//                 <div>
//                   <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Calories *</label>
//                   <input required type="number" step="0.01" value={calories} onChange={(e) => setCalories(e.target.value)} className="w-full p-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
//                 </div>
//                 <div>
//                   <label className="text-[10px] font-bold text-blue-500 uppercase block mb-1">Protein (g)</label>
//                   <input type="number" step="0.01" value={protein} onChange={(e) => setProtein(e.target.value)} className="w-full p-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-2">
//                 <div>
//                   <label className="text-[10px] font-bold text-green-500 uppercase block mb-1">Carbs (g)</label>
//                   <input type="number" step="0.01" value={carbs} onChange={(e) => setCarbs(e.target.value)} className="w-full p-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
//                 </div>
//                 <div>
//                   <label className="text-[10px] font-bold text-yellow-500 uppercase block mb-1">Fats (g)</label>
//                   <input type="number" step="0.01" value={fats} onChange={(e) => setFats(e.target.value)} className="w-full p-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
//                 </div>
//               </div>

//               {/* Dual Action Buttons */}
//               <div className="grid grid-cols-2 gap-2 mt-2">
//                 <button onClick={() => handleLogToDiary()} className="py-2 bg-green-600 text-white font-bold text-xs rounded-xl hover:bg-green-700">
//                   Log to Diary ({logDate})
//                 </button>
//                 <button onClick={handleSaveToDatabase} className="py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700">
//                   {editingFood ? "Update Database" : "Save to Database"}
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* TAB 3 & 4: Placeholders for Barcode & AI Scan integration */}
//           {(activeTab === "barcode" || activeTab === "aiScan") && (
//             <div className="p-6 text-center border-2 border-dashed rounded-xl dark:border-zinc-800">
//               <p className="text-xs text-zinc-500 font-medium">
//                 {activeTab === "barcode" ? "Barcode Camera Scanner Ready" : "AI Nutrition Label OCR Scanner Ready"}
//               </p>
//             </div>
//           )}

//         </div>

//       </main>
//     </div>
//   );
// }