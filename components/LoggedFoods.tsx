"use client";

import { useState } from "react";
import { deleteFoodLog } from "@/app/actions/log";
import { getDayStats } from "@/app/actions/dashboard";

interface LoggedFoodsProps {
    date: string;
    dashboardStats: any;
    setDashboardStats: (stats: any) => void;
    setStagedFood: (food: any) => void; // Added the new prop for editing
}

export default function LoggedFoods({ 
    date, 
    dashboardStats, 
    setDashboardStats, 
    setStagedFood 
}: LoggedFoodsProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    // 1. Delete function is now inside the component!
    const handleDelete = async (id: string, foodName: string) => {
        if (window.confirm(`Are you sure you want to delete ${foodName}?`)) {
            setIsDeleting(true);
            const result = await deleteFoodLog(id);
            
            if (result.success) {
                // Refresh the stats immediately so the UI updates
                const updatedStats = await getDayStats(date);
                setDashboardStats(updatedStats);
            } else {
                alert("Failed to delete log.");
            }
            setIsDeleting(false);
        }
    };

    // 2. Edit function formats the log and sends it to the Preview block
    const handleEditEntry = (log: any) => {
        setStagedFood({
            id: log.id, 
            name: log.food_name,
            calories: log.calories,
            protein: log.protein,
            carbs: log.carbs,
            fats: log.fats,
            portionsize: log.portion_multiplier || 1
        });
        
        // Optional: smoothly scrolls the user back to the top where the Preview is!
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (!dashboardStats) return null; // Safety check while loading

    return (
        <div className="w-full">
            <h3 className="text-lg font-bold mb-3 dark:text-white">Logged Foods</h3>
            
            {/* Added the missing curly brace for the ternary operator below */}
            {dashboardStats.logs?.length === 0 ? (
                <p className="text-zinc-500 text-sm text-center py-4 bg-white dark:bg-zinc-900 rounded-xl border dark:border-zinc-800">
                    No foods logged on this date.
                </p>
            ) : (
                <div className="flex flex-col gap-2">
                    {dashboardStats.logs?.map((log: any) => (
                        <div key={log.id} className="flex justify-between items-center p-3 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border dark:border-zinc-800">
                            <div>
                                <p className="font-bold text-sm dark:text-white">
                                    {log.portion_multiplier && log.portion_multiplier !== 1 && (
                                        <span className="text-blue-500 mr-1">{log.portion_multiplier}x</span>
                                    )}
                                    {log.food_name}
                                </p>
                                <p className="text-xs text-zinc-500">
                                    {log.calories} kcal • {log.protein}g P • {log.carbs}g C • {log.fats}g F
                                </p>
                            </div>
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={() => handleEditEntry(log)}
                                    disabled={isDeleting}
                                    className="p-2 text-zinc-400 hover:text-blue-500 transition-colors disabled:opacity-50"
                                    title="Edit Entry"
                                >
                                    ✎
                                </button>
                                <button 
                                    onClick={() => handleDelete(log.id, log.food_name)}
                                    disabled={isDeleting}
                                    className="p-2 text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                                    title="Delete Entry"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}