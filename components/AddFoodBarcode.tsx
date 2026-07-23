"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { lookupBarcode, saveFoodToDatabase } from "@/app/actions/food"; // Import directly!

interface AddFoodBarcodeProps {
  setStagedFood: (food: any) => void;
}

export default function AddFoodBarcode({ setStagedFood }: AddFoodBarcodeProps) {
  // 1. Scanner UI State
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2. Editable Form State
  const [foodName, setFoodName] = useState("");
  const [portionsize, setPortionSize] = useState("");
  const [unit, setUnit] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");

  // 3. Camera Setup & Scanning Logic
  useEffect(() => {
    if (!isScannerOpen) return; // Don't mount scanner if we are looking at the form

    scannerRef.current = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 300, height: 150 },
        aspectRatio: 1.0,
        videoConstraints: {
          facingMode: "environment",
          width: { min: 1280, ideal: 1920 },
          height: { min: 720, ideal: 1080 }
        },
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
        ]
      },
      false
    );

    const handleScanSuccess = async (decodedText: string) => {
      // 1. Stop the camera immediately
      if (scannerRef.current) scannerRef.current.clear();
      setIsScannerOpen(false);
      setLoading(true);
      setError(null);

      // 2. Fetch the food data using the barcode
      const result = await lookupBarcode(decodedText);
      
      if (result.success && result) {
        // 3. Auto-fill the form!
        setFoodName(result.foodName || "Scanned Product");
        setCalories(result.calories?.toString() || "0");
        setProtein(result.protein?.toString() || "0");
        setCarbs(result.carbs?.toString() || "0");
        setFats(result.fats?.toString() || "0");
      } else {
        setError(result.error || "Could not find food in database. Enter manually below.");
      }
      
      setLoading(false);
    };

    scannerRef.current.render(handleScanSuccess, () => {});

    return () => {
      if (scannerRef.current) scannerRef.current.clear().catch(console.error);
    };
  }, [isScannerOpen]);

  // 4. Action Handlers (Same as Quick Add & Nutrition Scan)
  const handleStageForPreview = () => {
    if (!foodName || !calories) return alert("Name and Calories required!");
    setStagedFood({
      name: foodName,
      portionsize: Number(portionsize) || 1,
      unit: unit,
      calories: Number(calories),
      protein: Number(protein),
      carbs: Number(carbs),
      fats: Number(fats)
    });
  };

  const handleSaveToDatabase = async () => {
    if (!foodName || !calories) return alert("Name and Calories required!");
    const res = await saveFoodToDatabase({
      name: foodName,
      portionsize: Number(portionsize) || 1,
      unit: unit,
      calories: Number(calories),
      protein: Number(protein),
      carbs: Number(carbs),
      fats: Number(fats)
    });
    if (res.success) alert("Saved to database!");
    else alert("Failed to save.");
  };

  const resetForm = () => {
    setFoodName(""); setPortionSize(""); setUnit(""); 
    setCalories(""); setProtein(""); setCarbs(""); setFats("");
    setError(null);
    setIsScannerOpen(true); // Turns the camera back on!
  };

  return (
    <div className="flex flex-col gap-3">
      
      {/* 1. Show Camera if waiting for scan */}
      {isScannerOpen && (
        <div className="w-full max-w-sm mx-auto overflow-hidden bg-white border rounded-xl shadow-sm dark:border-zinc-800">
          <div id="reader" className="w-full"></div>
        </div>
      )}

      {loading && <p className="text-blue-500 animate-pulse text-center mt-4">Looking up barcode...</p>}
      
      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-lg text-center">{error}</div>}

      {/* 2. Show Form if scan is complete (or if they want to type manually after a failed scan) */}
      {!isScannerOpen && !loading && (
        <div className="flex flex-col gap-3 mt-2">
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Name *</label>
            <input required type="text" value={foodName} onChange={(e) => setFoodName(e.target.value)} className="w-full p-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Portion Size</label>
              <input type="number" placeholder="e.g. 1" value={portionsize} onChange={(e) => setPortionSize(e.target.value)} className="w-full p-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Unit</label>
              <input type="text" placeholder="e.g. piece, pack" value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full p-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Calories *</label>
              <input required type="number" step="0.01" value={calories} onChange={(e) => setCalories(e.target.value)} className="w-full p-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-blue-500 uppercase block mb-1">Protein (g)</label>
              <input type="number" step="0.01" value={protein} onChange={(e) => setProtein(e.target.value)} className="w-full p-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-green-500 uppercase block mb-1">Carbs (g)</label>
              <input type="number" step="0.01" value={carbs} onChange={(e) => setCarbs(e.target.value)} className="w-full p-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-yellow-500 uppercase block mb-1">Fats (g)</label>
              <input type="number" step="0.01" value={fats} onChange={(e) => setFats(e.target.value)} className="w-full p-2 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <button onClick={handleStageForPreview} className="py-2 bg-green-600 text-white font-bold text-xs rounded-xl hover:bg-green-700">
              Preview & Log
            </button>
            <button onClick={handleSaveToDatabase} className="py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700">
              Save to Database
            </button>
          </div>

          <div className="mt-2">
            <button onClick={resetForm} className="py-2 w-full bg-zinc-100 text-zinc-600 font-bold text-xs rounded-xl hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700">
              Scan Another Barcode
            </button>
          </div>
        </div>
      )}
    </div>
  );
}