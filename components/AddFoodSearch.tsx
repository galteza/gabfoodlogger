"use client";

import { useState } from "react";
import { searchSavedFoods, deleteSavedFood } from "@/app/actions/food"; // Import your DB actions directly here

export default function AddFoodSearch({ setStagedFood, setFoodToEdit }: { setStagedFood: (food: any) => void; setFoodToEdit: (food: any) => void }) {
  // 1. All the state lives directly inside this file
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // 2. The functions to run the DB calls live here too
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const results = await searchSavedFoods(searchQuery);
    setSearchResults(results);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const res = await deleteSavedFood(id);
    if (res.success) {
      setSearchResults(searchResults.filter((item) => item.id !== id));
    }
  };

  const handleEdit = (food: any) => {
    setFoodToEdit(food);
    // You'll handle editing logic here
    console.log("Editing:", food.name);
  }

  const handleLogToDiary = (food: any) => {
    setStagedFood(food);
    // You'll handle logging logic here
    console.log("Logging:", food.name);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* 3. The HTML just points to the local state and functions */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input 
          type="text" 
          placeholder="Search saved database..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 p-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
        />
        <button type="submit" className="px-4 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700">
          Search
        </button>
      </form>

        {/* 4. Display search results */}
      <div className="flex flex-col gap-2 mt-2">
        {searchResults.map((food) => (
          <div key={food.id} className="p-3 border rounded-xl bg-zinc-50 dark:bg-zinc-800/50 dark:border-zinc-700 flex justify-between items-center">
            <div>
              <h4 className="font-bold text-sm text-black dark:text-white">{food.name}</h4>
              <p className="text-[11px] text-zinc-500">
                {food.calories} kcal | {food.protein}g P | {food.carbs}g C | {food.fats}g F
              </p>
            </div>
            
            <div className="flex gap-1">
              <button 
                onClick={() => handleLogToDiary(food)}
                className="px-2 py-1 bg-green-600 text-white font-bold text-[10px] rounded hover:bg-green-700"
              >
                + Log
              </button>
              <button
                onClick={() => handleEdit(food)}
                className="px-2 py-1 bg-red-100 text-red-600 font-bold text-[10px] rounded hover:bg-red-200"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDelete(food.id)}
                className="px-2 py-1 bg-red-100 text-red-600 font-bold text-[10px] rounded hover:bg-red-200"
              >
                Del
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}