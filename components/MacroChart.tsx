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
    { name: "Protein Left", value: remainingProtein, color: "#3b82f6" }, // Blue
    { name: "Carbs Left", value: remainingCarbs, color: "#22c55e" },   // Green
    { name: "Fats Left", value: remainingFats, color: "#eab308" },     // Yellow
  ];

  // If everything is hit, show a success ring
  const allGoalsMet = remainingProtein === 0 && remainingCarbs === 0 && remainingFats === 0;
  if (allGoalsMet) {
    data.length = 0;
    data.push({ name: "Goals Met!", value: 1, color: "#10b981" });
  }

  return (
    <div className="w-full flex flex-col items-center bg-white dark:bg-zinc-900 p-6 rounded-xl border shadow-sm dark:border-zinc-800">
      <div className="relative w-full h-48">
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
        
        {/* Center Text for Calories */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-zinc-900 dark:text-white">
            {Math.max(0, targets.calories - consumed.calories)}
          </span>
          <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Cals Left</span>
        </div>
      </div>

      {/* Legend underneath */}
      <div className="flex gap-4 mt-4 text-sm font-medium">
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-500"></div>{remainingProtein}g Pro</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500"></div>{remainingCarbs}g Carb</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-500"></div>{remainingFats}g Fat</div>
      </div>
    </div>
  );
}