"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface MacroChartProps {
  targets: { protein: number; carbs: number; fats: number; calories: number };
  consumed: { protein: number; carbs: number; fats: number; calories: number };
}

export default function MacroChart({ targets, consumed }: MacroChartProps) {
  // Calculate remaining values (preventing negative numbers if you go over)
  const remainingProtein = Math.max(0, targets.protein - consumed.protein);
  const remainingCarbs = Math.max(0, targets.carbs - consumed.carbs);
  const remainingFats = Math.max(0, targets.fats - consumed.fats);

  const data = [
    { name: "Protein Left", value: remainingProtein, color: "#3b82f6" }, 
    { name: "Carbs Left", value: remainingCarbs, color: "#22c55e" },   
    { name: "Fats Left", value: remainingFats, color: "#eab308" },     
  ];

  const allGoalsMet = remainingProtein === 0 && remainingCarbs === 0 && remainingFats === 0;
  if (allGoalsMet) {
    data.length = 0;
    data.push({ name: "Goals Met!", value: 1, color: "#10b981" });
  }

  // Helper for progress bar width calculations
  const calcPercent = (consumedAmt: number, targetAmt: number) => {
    if (targetAmt === 0) return 0;
    return Math.min(100, (consumedAmt / targetAmt) * 100);
  };

  return (
    <div className="w-full flex flex-col bg-white dark:bg-zinc-900 p-6 rounded-xl border shadow-sm dark:border-zinc-800">
      
      {/* Top Section: The Pie Chart */}
      <div className="relative w-full h-48 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#18181b', fontWeight: 'bold' }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-zinc-900 dark:text-white">
            {Math.max(0, targets.calories - consumed.calories).toFixed(0)}
          </span>
          <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Cals Left</span>
        </div>
      </div>

      {/* Bottom Section: Progress Bars */}
      <div className="flex flex-col gap-4">
        {/* Protein */}
        <div>
          <div className="flex justify-between text-xs font-bold mb-1">
            <span className="text-blue-600 dark:text-blue-400">Protein</span>
            <span className="text-zinc-600 dark:text-zinc-400">
              {Number(consumed.protein).toFixed(2)} / {Number(targets.protein).toFixed(2)}g
            </span>
          </div>
          <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-500" 
              style={{ width: `${calcPercent(consumed.protein, targets.protein)}%` }}
            />
          </div>
        </div>

        {/* Carbs */}
        <div>
          <div className="flex justify-between text-xs font-bold mb-1">
            <span className="text-green-600 dark:text-green-400">Carbs</span>
            <span className="text-zinc-600 dark:text-zinc-400">
              {Number(consumed.carbs).toFixed(2)} / {Number(targets.carbs).toFixed(2)}g
            </span>
          </div>
          <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 rounded-full transition-all duration-500" 
              style={{ width: `${calcPercent(consumed.carbs, targets.carbs)}%` }}
            />
          </div>
        </div>

        {/* Fats */}
        <div>
          <div className="flex justify-between text-xs font-bold mb-1">
            <span className="text-yellow-600 dark:text-yellow-400">Fats</span>
            <span className="text-zinc-600 dark:text-zinc-400">
              {Number(consumed.fats).toFixed(2)} / {Number(targets.fats).toFixed(2)}g
            </span>
          </div>
          <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-yellow-500 rounded-full transition-all duration-500" 
              style={{ width: `${calcPercent(consumed.fats, targets.fats)}%` }}
            />
          </div>
        </div>
      </div>

    </div>
  );
}