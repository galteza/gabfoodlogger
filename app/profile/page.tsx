"use client";

import { useState, useEffect } from "react";
import { updateUserTargets } from "../actions/profile";

export default function ProfilePage() {
  // Pre-filled baseline defaults
  const [age, setAge] = useState<number>(22);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [activity, setActivity] = useState<number>(1.55); // 1.55 = Moderate/Heavy (5 days/week)
  
  // Metrics to be filled by user
  const [weight, setWeight] = useState<string>(""); // in kg
  const [height, setHeight] = useState<string>(""); // in cm
  const [bodyFat, setBodyFat] = useState<string>(""); // optional %
  
  const [deficit, setDeficit] = useState<number>(500);
  const [formula, setFormula] = useState<"mifflin" | "harris" | "katch">("mifflin");
  
  const [isSaving, setIsSaving] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Enforce Max 500 Deficit
  const handleDeficitChange = (val: number) => {
    setDeficit(Math.min(val, 500));
  };

  const calculateTargets = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const bf = parseFloat(bodyFat);
    
    if (!w || !h) return alert("Please enter weight and height.");

    let bmr = 0;

    // 1. Calculate BMR based on selected formula
    if (formula === "katch" && bf) {
      const lbm = w * (1 - bf / 100);
      bmr = 370 + (21.6 * lbm);
    } else if (formula === "harris") {
      if (gender === "male") {
        bmr = (13.397 * w) + (4.799 * h) - (5.677 * age) + 88.362;
      } else {
        bmr = (9.247 * w) + (3.098 * h) - (4.330 * age) + 447.593;
      }
    } else {
      // Default: Mifflin-St Jeor
      const s = gender === "male" ? 5 : -161;
      bmr = (10 * w) + (6.25 * h) - (5 * age) + s;
    }

    // 2. Calculate TDEE
    const tdee = bmr * activity;

    // 3. Apply Deficit
    const targetCalories = tdee - deficit;

    // 4. Calculate 30/25/45 Split & Round to 2 decimal places
    const targetProtein = Number(((targetCalories * 0.30) / 4).toFixed(2));
    const targetFats = Number(((targetCalories * 0.25) / 9).toFixed(2));
    const targetCarbs = Number(((targetCalories * 0.45) / 4).toFixed(2));

    setResults({
      tdee: Number(tdee.toFixed(2)),
      target_calories: Number(targetCalories.toFixed(2)),
      target_protein: targetProtein,
      target_fats: targetFats,
      target_carbs: targetCarbs,
    });
  };

  const handleSave = async () => {
    if (!results) return;
    setIsSaving(true);
    const res = await updateUserTargets(results);
    setIsSaving(false);

    if (res.success) {
      alert("Targets saved to database! Dashboard will now use these numbers.");
    } else {
      alert("Failed to save.");
    }
  };

  // Auto-switch to Katch-McArdle if body fat is entered, or Mifflin if removed
  useEffect(() => {
    if (bodyFat && parseFloat(bodyFat) > 0) {
      setFormula("katch");
    } else if (formula === "katch") {
      setFormula("mifflin");
    }
  }, [bodyFat]);

  return (
    <div className="flex flex-col flex-1 items-center min-h-screen bg-zinc-50 font-sans dark:bg-black p-4 pb-20">
      <main className="flex w-full max-w-md flex-col items-center gap-6 mt-4">
        
        <div className="w-full text-center mb-2">
          <h1 className="text-3xl font-bold tracking-tight text-black dark:text-zinc-50">Personal Tracker</h1>
          <p className="text-zinc-500 text-sm mt-1">Configure your TDEE & 30-25-45 Macros</p>
        </div>

        <div className="w-full p-6 bg-white border rounded-xl shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Age</label>
              <input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} className="w-full p-2 border rounded-lg bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value as any)} className="w-full p-2 border rounded-lg bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white">
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Weight (kg)</label>
              <input type="number" placeholder="75" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full p-2 border rounded-lg bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Height (cm)</label>
              <input type="number" placeholder="175" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full p-2 border rounded-lg bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 block">BF % (Opt)</label>
              <input type="number" placeholder="15" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} className="w-full p-2 border rounded-lg bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Activity Level</label>
            <select value={activity} onChange={(e) => setActivity(Number(e.target.value))} className="w-full p-2 border rounded-lg bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white">
              <option value={1.2}>Sedentary (Little to no exercise)</option>
              <option value={1.375}>Light (1-3 days/week)</option>
              <option value={1.55}>Moderate (3-5 days/week)</option>
              <option value={1.725}>Heavy (6-7 days/week)</option>
              <option value={1.9}>Athlete (2x a day)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
             <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Formula</label>
              <select value={formula} onChange={(e) => setFormula(e.target.value as any)} disabled={!!bodyFat} className="w-full p-2 border rounded-lg bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white disabled:opacity-50">
                <option value="mifflin">Mifflin-St Jeor</option>
                <option value="harris">Harris-Benedict</option>
                <option value="katch">Katch-McArdle</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Deficit (Max 500)</label>
              <input type="number" max="500" value={deficit} onChange={(e) => handleDeficitChange(Number(e.target.value))} className="w-full p-2 border rounded-lg bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
            </div>
          </div>

          <button onClick={calculateTargets} className="w-full py-3 text-white font-bold bg-blue-600 rounded-xl hover:bg-blue-700">
            Calculate Macros
          </button>
        </div>

        {results && (
          <div className="w-full p-6 bg-white border rounded-xl shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
            <h2 className="text-lg font-bold text-center mb-4 dark:text-white">Your Daily Targets</h2>
            
            <div className="flex justify-between items-center mb-6 px-4">
              <div className="text-center">
                <p className="text-sm text-zinc-500">TDEE</p>
                <p className="font-bold text-xl dark:text-white">{results.tdee}</p>
              </div>
              <div className="text-2xl font-black text-zinc-300">-</div>
              <div className="text-center">
                <p className="text-sm text-zinc-500">Deficit</p>
                <p className="font-bold text-xl text-red-500">{deficit}</p>
              </div>
              <div className="text-2xl font-black text-zinc-300">=</div>
              <div className="text-center">
                <p className="text-sm text-zinc-500">Target</p>
                <p className="font-bold text-xl text-green-500">{results.target_calories}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center mb-6">
              <div className="p-3 bg-blue-50 text-blue-700 rounded-lg dark:bg-blue-900/30 dark:text-blue-400">
                <div className="text-xs uppercase tracking-wider font-bold mb-1 opacity-80">Protein</div>
                <div className="font-bold text-lg">{results.target_protein}g</div>
                <div className="text-[10px] mt-1 opacity-70">30%</div>
              </div>
              <div className="p-3 bg-green-50 text-green-700 rounded-lg dark:bg-green-900/30 dark:text-green-400">
                <div className="text-xs uppercase tracking-wider font-bold mb-1 opacity-80">Carbs</div>
                <div className="font-bold text-lg">{results.target_carbs}g</div>
                <div className="text-[10px] mt-1 opacity-70">45%</div>
              </div>
              <div className="p-3 bg-yellow-50 text-yellow-700 rounded-lg dark:bg-yellow-900/30 dark:text-yellow-400">
                <div className="text-xs uppercase tracking-wider font-bold mb-1 opacity-80">Fats</div>
                <div className="font-bold text-lg">{results.target_fats}g</div>
                <div className="text-[10px] mt-1 opacity-70">25%</div>
              </div>
            </div>

            <button onClick={handleSave} disabled={isSaving} className="w-full py-3 text-white font-bold bg-green-600 rounded-xl hover:bg-green-700 disabled:opacity-50">
              {isSaving ? "Saving..." : "Save to Database"}
            </button>
          </div>
        )}

      </main>
    </div>
  );
}