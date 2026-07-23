"use client";

import { useState } from "react";

import AddFoodSearch from "./AddFoodSearch";
import AddFoodQuick from "./AddFoodQuick";
import AddFoodBarcode from "./AddFoodBarcode";
import AddFoodNutrition from "./AddFoodNutrition";
import AddFoodConsultation from "./AddFoodConsultation";

interface AddFoodProps {
  setStagedFood: (food: any) => void;
}

export default function AddFood({ setStagedFood }: AddFoodProps) {
    const [activeTab, setActiveTab] = useState<"search" | "quick" | "barcode" | "nutrition" | "consultation">("search");
    const [foodToEdit, setFoodToEdit] = useState<any | null>(null); // State to hold the food item to edit  

  // When we switch tabs, clear out the preview so the user doesn't get confused
  const handleTabSwitch = (tab: any) => {
    setActiveTab(tab);
    setStagedFood(null); 
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-900 p-4 rounded-xl border dark:border-zinc-800 shadow-sm">
      <h2 className="text-sm font-bold mb-3 text-black dark:text-white">Add Food Entry</h2>
      
      {/* Tabs */}
      <div className="grid grid-cols-5 gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg mb-4 text-[10px] sm:text-[11px] font-bold text-center">
        <button 
          onClick={() => handleTabSwitch("search")}
          className={`py-2 rounded-md transition-all ${activeTab === "search" ? "bg-white dark:bg-zinc-700 shadow text-black dark:text-white" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
        >
          Search
        </button>
        <button 
          onClick={() => handleTabSwitch("quick")}
          className={`py-2 rounded-md transition-all ${activeTab === "quick" ? "bg-white dark:bg-zinc-700 shadow text-black dark:text-white" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
        >
          Quick Add
        </button>
        <button 
          onClick={() => handleTabSwitch("barcode")}
          className={`py-2 rounded-md transition-all ${activeTab === "barcode" ? "bg-white dark:bg-zinc-700 shadow text-black dark:text-white" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
        >
          Barcode
        </button>
        <button 
          onClick={() => handleTabSwitch("nutrition")}
          className={`py-2 rounded-md transition-all ${activeTab === "nutrition" ? "bg-white dark:bg-zinc-700 shadow text-black dark:text-white" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
        >
          Label Scan
        </button>
        <button 
          onClick={() => handleTabSwitch("consultation")}
          className={`py-2 rounded-md transition-all ${activeTab === "consultation" ? "bg-white dark:bg-zinc-700 shadow text-black dark:text-white" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
        >
          AI Chat
        </button>
      </div>

      {/* Render modular components and just pass them the tools they need */}

      {activeTab === "search" && (
        <AddFoodSearch 
          setStagedFood={setStagedFood} 
          setFoodToEdit={setFoodToEdit}
        />
      )}

      {activeTab === "quick" && (
        <AddFoodQuick 
          setStagedFood={setStagedFood} 
          foodToEdit={foodToEdit}
        />
      )}

      {activeTab === "barcode" && (
        <AddFoodBarcode 
          setStagedFood={setStagedFood} 
        />
      )}

      {activeTab === "nutrition" && (
        <AddFoodNutrition 
          setStagedFood={setStagedFood} 
        />
      )}

      {activeTab === "consultation" && (
        <AddFoodConsultation 
          setStagedFood={setStagedFood} 
        />
      )}
      
    </div>
  );
}