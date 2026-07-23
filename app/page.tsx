/*

This is the main page of the app, which includes the following features:

(1) Welcome message!
(2) Macro Chart showing the user's daily targets vs consumed macros
    * 
(3) AI Suggestions button that generates food suggestions based on remaining macros
(4) Logged Foods List for the selected date, with the ability to DELETE and EDIT entries
(5) Food preview
    * Shows the food's name, portion size, corresponding calories, protein, carbs, fats, (if portion not provided in grams, it will default to 1 portion) 
    * Asks for how many/fraction of portions to add to log
    * Log to Journal button
    * Remove from preview button on top right (✕)
(6) Add food tab
      (a) Search Database: Search for previously saved foods and log them to the diary
        - Search bar
        - Add to preview button (+)
        - Edit food button (✎) --> open pop up to edit food's name, portion size, calories, protein, carbs, fats, and description --> Save changes
        - Delete food button (✕) --> are you sure?
      (b) Quick Add: Manually add a food item with macros and log it to the diary
        - Form fields for name, portion size (optional), calories, protein, carbs, fats, and description
        - Add to preview button (+)
        - Save to Database button
      (c) Barcode Scanner: Scan a food item's barcode to retrieve its nutritional info and log it
        - Form fields for name, portion size (optional), calories, protein, carbs, fats, and description (editable)
        - Add to preview button (+)
        - Save to Database button
      (d) AI Nutrition Label Scanner: Upload a photo of a nutrition label and log the food item
        - Form fields for name, portion size (optional), calories, protein, carbs, fats, and description (editable)
        - Add to preview button (+)
        - Save to Database button
      (e) AI Consultation for helping user calculate macros of recipes and meals

(8) Update macro goals and user profile (future feature)


*/

"use client";

import { useState, useRef, useEffect } from "react";
import MacroChart from "@/components/MacroChart";
import AISuggestions from "@/components/AISuggestions";
import LoggedFoods from "@/components/LoggedFoods";
import PreviewEntry from "@/components/PreviewEntry";
import AddFood from "@/components/AddFood";
import Profile from "@/components/Profile";

import { logFoodToDb } from "./actions/log"; 
import { getDayStats } from "./actions/dashboard";

// Helper function to ALWAYS get the correct YYYY-MM-DD in the user's local timezone
const getLocalDateString = (dateObj = new Date()) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function Home() {

  // ======== SET UP VARIABLES ========

  const [name, setName] = useState("Gabriel");
  const [isSaving, setIsSaving] = useState(false);

  // Initialize with the correct local date
  const [selectedDate, setSelectedDate] = useState(getLocalDateString()); 
  const [dashboardStats, setDashboardStats] = useState<any>(null);

  const [stagedFood, setStagedFood] = useState<any>(null); 
  const [portion, setPortion] = useState<number>(1.0);
  
  // ======== FUNCTIONS ========

  const loadStats = async (dateStr: string) => {
    const stats = await getDayStats(dateStr);
    if (stats.success) {
      setDashboardStats(stats);
    }
  };

  useEffect(() => {
    loadStats(selectedDate);
  }, [selectedDate]);

  // Midnight Rollover Listener: Refreshes to "Today" if you leave the tab open overnight
  useEffect(() => {
    const handleFocus = () => {
      const actualToday = getLocalDateString();
      // If the day changed while the app was in the background, gently push them to the new today
      if (selectedDate !== actualToday && selectedDate === getLocalDateString(new Date(Date.now() - 86400000))) {
         setSelectedDate(actualToday);
      }
    };
    
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") handleFocus();
    });
    window.addEventListener("focus", handleFocus);
    
    return () => {
      window.removeEventListener("visibilitychange", handleFocus);
      window.removeEventListener("focus", handleFocus);
    };
  }, [selectedDate]);

  const changeDate = (days: number) => {
    // Adding "T00:00:00" ensures JavaScript parses the string in local time, not UTC!
    const d = new Date(selectedDate + "T00:00:00");
    d.setDate(d.getDate() + days);
    setSelectedDate(getLocalDateString(d));
  };

  const handleSaveToDb = async () => {
    if (!stagedFood) return alert("No food item to log.");
    
    setIsSaving(true);
    const result = await logFoodToDb(stagedFood, portion, selectedDate);
    
    if (result.success) {
      setStagedFood(null); 
      setPortion(1.0); 
      loadStats(selectedDate); 
    } else {
      alert("Failed to save to diary.");
    }
    
    setIsSaving(false);
  }

  return (
    <div className="flex flex-col flex-1 items-center min-h-screen bg-zinc-50 font-sans dark:bg-black p-4 pb-20">
      <main className="flex w-full max-w-md flex-col items-center gap-6 mt-4">

        <h1 className="text-xl font-bold text-center text-black dark:text-white mb-2">
          Hi there, {name}! Welcome to your daily food tracker. Happy logging! 🎉
        </h1>
        
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

        {/* Dashboard Stats */}
        {dashboardStats && (
          <>
            <MacroChart targets={dashboardStats.targets} consumed={dashboardStats.consumed} />
            <AISuggestions date={selectedDate} dashboardStats={dashboardStats} /> 
            <LoggedFoods date={selectedDate} dashboardStats={dashboardStats} setDashboardStats={setDashboardStats} setStagedFood={setStagedFood} />
          </>
        )}

        {/* Food Preview Section */}
        <PreviewEntry 
          stagedFood={stagedFood} 
          portion={portion} 
          setPortion={setPortion} 
          isSaving={isSaving} 
          onSave={handleSaveToDb}
          onCancel={() => setStagedFood(null)}
         />

        {/* Add Food Section */}
        <AddFood 
          setStagedFood={setStagedFood} 
         />

        {/* Profile Update Section */}
        <Profile onTargetsUpdated={() => loadStats(selectedDate)} />

      </main>
    </div>
  )
}