import React, { useState } from 'react';
import { useStockState } from '../hooks/useStockState';
import { getClientBalances, getClientBalancesByOrder } from '../lib/stockUtils';
import { PrintLabelModal } from './PrintLabelModal';
import { QRScannerModal } from './QRScannerModal';

export const TransactionForm = ({ onClose }: { onClose: () => void }) => {
  const { addTransaction, sheets, clients, suppliers, transactions } = useStockState();
  const [formData, setFormData] = useState({ 
    sheetId: '', 
    type: 'entry' as const, 
    quantity: 0, 
    date: new Date().toISOString(),
    sourceClientId: '',
    destinationClientId: '',
    supplierId: '',
    orderNumber: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [printData, setPrintData] = useState<any | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);

  const selectedSheet = sheets.find(s => s.id === formData.sheetId);
  const balances = selectedSheet ? getClientBalances(selectedSheet, transactions) : {};
  const balancesByOrder = selectedSheet ? getClientBalancesByOrder(selectedSheet, transactions) : {};

  const handleQRScan = (decodedText: string) => {
    try {
      const data = JSON.parse(decodedText);
      if (data.action === 'scan_exit' && data.sheetId && data.clientId) {
        setFormData(prev => ({
          ...prev,
          type: 'exit',
          sheetId: data.sheetId,
          sourceClientId: data.clientId,
          orderNumber: data.orderNumber || ''
        }));
        setShowQRScanner(false);
      } else {
        setError('QR Code inválido para saída.');
        setShowQRScanner(false);
      }
    } catch(e) {
      setError('Formato de QR Code desconhecido.');
      setShowQRScanner(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if ((formData.type === 'exit' || formData.type === 'partial_usage') && formData.sourceClientId) {
      const orderStock = formData.orderNumber ? (balancesByOrder[formData.sourceClientId]?.[formData.orderNumber] || 0) : (balances[formData.sourceClientId] || 0);
      if (formData.quantity > orderStock) {
        setError(`Atenção: O estoque disponível para esta seleção é ${orderStock}. Por favor, altere a quantidade.`);
        return;
      }
    }

    await addTransaction({ 
      ...formData, 
      id: Date.now().toString(),
    });
    
    if (formData.type === 'entry' && selectedSheet) {
      const client = clients.find(c => c.id === formData.destinationClientId);
      setPrintData({
        sheetId: selectedSheet.id,
        sheetName: selectedSheet.name,
        thickness: selectedSheet.thickness,
        material: selectedSheet.material,
        clientId: formData.destinationClientId,
        clientName: client?.name || 'Desconhecido',
        orderNumber: formData.orderNumber || 'S/N'
      });
    } else {
      onClose();
    }
  };

  const handlePrintClose = () => {
    setPrintData(null);
    onClose();
  };

  const inputStyle = "w-full p-3 border border-slate-100 bg-slate-50/50 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-200 transition-all text-sm";

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">Nova Movimentação</h2>
          <button type="button" onClick={() => setShowQRScanner(true)} className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>
            Ler Etiqueta
          </button>
        </div>

      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      <select className={inputStyle} onChange={e => { setFormData({...formData, sheetId: e.target.value, sourceClientId: ''}); setError(null); }} required>
        <option value="">Selecione a Chapa</option>
        {sheets.map(s => <option key={s.id} value={s.id}>{s.name} ({s.material} - {s.thickness}mm)</option>)}
      </select>
      <select className={inputStyle} onChange={e => { setFormData({...formData, type: e.target.value as any}); setError(null); }} required>
        <option value="entry">Entrada</option>
        <option value="exit">Saída</option>
        <option value="partial_usage">Uso Parcial</option>
      </select>
      <input type="number" placeholder="Quantidade" className={inputStyle} min="1" onChange={e => { setFormData({...formData, quantity: Number(e.target.value)}); setError(null); }} required />
      
      {formData.type === 'entry' && (
        <input type="text" placeholder="Número do Pedido (Entrada)" value={formData.orderNumber || ''} className={inputStyle} onChange={e => {
            let val = e.target.value.replace('MJF', '').trim();
            setFormData({...formData, orderNumber: `MJF${val}`});
        }} required />
      )}

      {formData.type === 'entry' && (
        <select className={inputStyle} onChange={e => setFormData({...formData, supplierId: e.target.value})} required>
          <option value="">Selecione Fornecedor (Obrigatório)</option>
          {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      )}

      {formData.type === 'exit' || formData.type === 'partial_usage' ? (
        <select className={inputStyle} value={`${formData.sourceClientId}|${formData.orderNumber || ''}`} onChange={e => { 
          const [clientId, order] = e.target.value.split('|');
          setFormData({...formData, sourceClientId: clientId, orderNumber: order || ''}); 
          setError(null); 
        }} required>
          <option value="|">Selecione Cliente Origem e Pedido (De quem estou retirando)</option>
          {clients.flatMap(c => {
            const clientOrders = balancesByOrder[c.id] || {};
            return Object.entries(clientOrders)
              .filter(([_, qty]) => qty > 0)
              .map(([order, qty]) => (
                <option key={`${c.id}|${order}`} value={`${c.id}|${order}`}>
                  {c.name} - Pedido {order} ({qty} disponível)
                </option>
              ));
          })}
        </select>
      ) : null}

      <select className={inputStyle} onChange={e => setFormData({...formData, destinationClientId: e.target.value})} required>
        <option value="">Selecione Cliente Destino (Para quem estou usando)</option>
        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 font-medium transition-colors">Registrar</button>
      </form>
      {printData && (
        <PrintLabelModal items={[printData]} onClose={handlePrintClose} />
      )}
      {showQRScanner && (
        <QRScannerModal onScan={handleQRScan} onClose={() => setShowQRScanner(false)} />
      )}
    </>
  );
};
