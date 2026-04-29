import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QRScannerModalProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export const QRScannerModal = ({ onScan, onClose }: QRScannerModalProps) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        scanner.clear();
        onScan(decodedText);
      },
      (error) => {
        // Just ignore scan failures
      }
    );

    return () => {
      scanner.clear().catch(err => console.error("Failed to clear html5-qrcode scanner", err));
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-bold text-slate-800">Escanear QR Code</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div className="p-4">
          <div id="qr-reader" className="w-full"></div>
          <p className="text-sm text-slate-500 text-center mt-4">Aponte a câmera para a etiqueta da chapa para registrar saída.</p>
        </div>
      </div>
    </div>
  );
};
