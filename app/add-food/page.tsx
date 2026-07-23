"use client";

import { useState } from "react";
import { searchSavedFoods, quickAddFood, logFoodToJournal } from "../actions/food";

export default function AddFoodPage() {
  const [activeTab, setActiveTab] = useState<"search" | "quickAdd">("search");
  
  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Quick Add State
  const [qaName, setQaName] = useState("");
  const [qaCals, setQaCals] = useState("");
  const [qaProtein, setQaProtein] = useState("");
  const [qaCarbs, setQaCarbs] = useState("");
  const [qaFats, setQaFats] = useState("");
  const [qaDesc, setQaDesc] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    const results = await searchSavedFoods(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qaName || !qaCals) return alert("Name and Calories are required!");

    const res = await quickAddFood({
      name: qaName,
      calories: Number(qaCals),
      protein: qaProtein ? Number(qaProtein) : 0,
      carbs: qaCarbs ? Number(qaCarbs) : 0,
      fats: qaFats ? Number(qaFats) : 0,
      description: qaDesc,
    });

    if (res.success && res.data) {
      await logFoodToJournal(res.data.id);
      alert("Food saved and logged successfully!");
      // Reset form
      setQaName(""); setQaCals(""); setQaProtein(""); setQaCarbs(""); setQaFats(""); setQaDesc("");
    } else {
      alert("Failed to add food.");
    }
  };

  const handleLogExisting = async (foodId: string) => {
    const res = await logFoodToJournal(foodId);
    if (res.success) alert("Logged to journal!");
  };

  return (
    <div className="flex flex-col flex-1 items-center min-h-screen bg-zinc-50 font-sans dark:bg-black p-4 pb-20">
      <main className="flex w-full max-w-md flex-col items-center gap-6 mt-4">
        
        <div className="w-full text-center mb-2">
          <h1 className="text-3xl font-bold tracking-tight text-black dark:text-zinc-50">Add Food</h1>
        </div>

        {/* Tabs */}
        <div className="flex w-full bg-zinc-200 dark:bg-zinc-800 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab("search")}
            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${activeTab === "search" ? "bg-white dark:bg-zinc-700 shadow-sm text-black dark:text-white" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
          >
            Search Database
          </button>
          <button 
            onClick={() => setActiveTab("quickAdd")}
            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${activeTab === "quickAdd" ? "bg-white dark:bg-zinc-700 shadow-sm text-black dark:text-white" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
          >
            Quick Add
          </button>
        </div>

        {/* Search Tab */}
        {activeTab === "search" && (
          <div className="w-full">
            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
              <input 
                type="text" 
                placeholder="Search saved foods..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 p-3 border rounded-xl bg-white dark:bg-zinc-900 dark:border-zinc-800 dark:text-white"
              />
              <button type="submit" className="px-5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">
                {isSearching ? "..." : "Search"}
              </button>
            </form>

            <div className="flex flex-col gap-3">
              {searchResults.length === 0 && !isSearching && searchQuery && (
                <p className="text-center text-zinc-500 text-sm">No foods found. Try Quick Add!</p>
              )}
              {searchResults.map((food) => (
                <div key={food.id} className="flex justify-between items-center p-4 bg-white border rounded-xl shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
                  <div>
                    <h3 className="font-bold text-black dark:text-white">{food.name}</h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      {food.calories} kcal • {food.protein}g P • {food.carbs}g C • {food.fats}g F
                    </p>
                  </div>
                  <button onClick={() => handleLogExisting(food.id)} className="px-4 py-2 bg-green-100 text-green-700 text-sm font-bold rounded-lg hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400">
                    + Log
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Add Tab */}
        {activeTab === "quickAdd" && (
          <form onSubmit={handleQuickAdd} className="w-full p-6 bg-white border rounded-xl shadow-sm dark:bg-zinc-900 dark:border-zinc-800 flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Name *</label>
              <input required type="text" value={qaName} onChange={(e) => setQaName(e.target.value)} className="w-full p-2 border rounded-lg bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
            </div>
            
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Calories *</label>
              <input required type="number" value={qaCals} onChange={(e) => setQaCals(e.target.value)} className="w-full p-2 border rounded-lg bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-blue-500 uppercase mb-1 block">Protein</label>
                <input type="number" value={qaProtein} onChange={(e) => setQaProtein(e.target.value)} className="w-full p-2 border rounded-lg bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
              </div>
              <div>
                <label className="text-xs font-bold text-green-500 uppercase mb-1 block">Carbs</label>
                <input type="number" value={qaCarbs} onChange={(e) => setQaCarbs(e.target.value)} className="w-full p-2 border rounded-lg bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
              </div>
              <div>
                <label className="text-xs font-bold text-yellow-500 uppercase mb-1 block">Fats</label>
                <input type="number" value={qaFats} onChange={(e) => setQaFats(e.target.value)} className="w-full p-2 border rounded-lg bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block">Description (Optional)</label>
              <textarea value={qaDesc} onChange={(e) => setQaDesc(e.target.value)} rows={2} className="w-full p-2 border rounded-lg bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
            </div>

            <button type="submit" className="w-full py-3 mt-2 text-white font-bold bg-blue-600 rounded-xl hover:bg-blue-700">
              Save & Log Food
            </button>
          </form>
        )}
      </main>
    </div>
  );
}