"use client";

import { useEffect, useRef } from "react";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
}

export default function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        // 1. Widen the box to better fit standard 1D food barcodes
        qrbox: { width: 300, height: 150 },
        aspectRatio: 1.0,
        // 2. Force the phone to provide an HD stream (720p/1080p)
        videoConstraints: {
          facingMode: "environment",
          width: { min: 1280, ideal: 1920 },
          height: { min: 720, ideal: 1080 }
        },
        // 3. Limit to common product barcode formats to make decoding much faster
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
        ]
      },
      false
    );

    const handleScanSuccess = (decodedText: string) => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
      onScan(decodedText);
    };

    const handleScanError = (errorMessage: string) => {
      // Safely ignore background scanning errors
    };

    scannerRef.current.render(handleScanSuccess, handleScanError);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [onScan]);

  return (
    <div className="w-full max-w-sm mx-auto overflow-hidden bg-white border rounded-xl shadow-sm">
      <div id="reader" className="w-full"></div>
    </div>
  );
}