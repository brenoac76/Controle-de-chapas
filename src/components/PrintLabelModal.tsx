import React, { useEffect } from 'react';
import QRCode from 'react-qr-code';

interface LabelData {
  sheetName: string;
  thickness: number;
  material: string;
  orderNumber: string;
  clientId: string;
  clientName: string;
  sheetId: string;
}

interface PrintLabelModalProps {
  onClose: () => void;
  items: LabelData[];
}

export const PrintLabelModal = ({ onClose, items }: PrintLabelModalProps) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100] print:bg-transparent print:backdrop-blur-none print:inset-auto print:absolute print:p-0 print:w-full">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col justify-between max-h-[90vh] print:shadow-none print:max-w-none print:w-full print:max-h-none">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center print:hidden">
          <h2 className="font-bold text-slate-800">Imprimir Etiquetas</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        
        {/* Printable Area */}
        <div className="overflow-y-auto p-6 bg-slate-50 print:p-0 print:bg-white print:overflow-visible">
          <div id="print-area" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4 print:p-0 bg-white p-4 rounded-xl shadow-sm print:shadow-none">
            {items.map((data, index) => {
              const qrValue = JSON.stringify({
                action: 'scan_exit',
                sheetId: data.sheetId,
                clientId: data.clientId,
                orderNumber: data.orderNumber
              });

              return (
                <div key={index} className="flex flex-col items-center gap-3 bg-white p-4 border border-slate-200 rounded-xl page-break-inside-avoid print:border-slate-800 print:break-inside-avoid">
                  <h1 className="text-lg font-bold text-slate-800 uppercase tracking-wider text-center">{data.sheetName}</h1>
                  <div className="flex gap-3 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full print:bg-transparent print:border print:border-slate-300">
                    <span>{data.thickness}mm</span>
                    <span>&bull;</span>
                    <span>{data.material}</span>
                  </div>
                  <div className="bg-white p-2 border border-slate-100 rounded-xl">
                    <QRCode value={qrValue} size={120} level="H" />
                  </div>
                  <div className="text-center w-full mt-2 pt-3 border-t border-slate-100">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Pedido / Cliente</p>
                    <p className="text-sm font-bold text-slate-800">{data.orderNumber} - {data.clientName}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 print:hidden">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
          <button type="button" onClick={handlePrint} className="flex-1 px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>
            Imprimir ({items.length})
          </button>
        </div>
      </div>
    </div>
  );
};
