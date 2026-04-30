import React, { useState } from 'react';
import { Sheet, Transaction, Client, Supplier } from '../types';
import { getClientBalancesByOrder } from '../lib/stockUtils';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { PrintLabelModal } from './PrintLabelModal';

const SheetDetails = ({ sheet, transactions, clients, suppliers, getClientName, getSupplierName, onPrintLabel, onAddToQueue }: { sheet: Sheet, transactions: Transaction[], clients: Client[], suppliers: Supplier[], getClientName: (id?: string) => string, getSupplierName: (id?: string) => string, onPrintLabel: (data: any[]) => void, onAddToQueue: (data: any) => void }) => {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const balancesByOrder = getClientBalancesByOrder(sheet, transactions);
  
  // Create a flattened list of "client - order" balances
  const clientOrderRows: { clientId: string, orderNumber: string, currentStock: number }[] = [];
  
  Object.keys(balancesByOrder).forEach(clientId => {
      Object.keys(balancesByOrder[clientId]).forEach(orderNumber => {
          clientOrderRows.push({
              clientId,
              orderNumber,
              currentStock: balancesByOrder[clientId][orderNumber]
          });
      });
  });

  if (clientOrderRows.length === 0) {
      return <div className="p-4 text-sm text-slate-500 text-center">Nenhum pedido associado a esta chapa.</div>;
  }

  return (
    <div className="bg-white rounded-lg border border-blue-200 overflow-hidden my-3 mx-4 shadow-md bg-blue-50/20">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[600px]">
          <thead className="bg-blue-50 border-b border-blue-100 text-blue-700 font-bold uppercase text-xs">
          <tr>
            <th className="px-4 py-3 w-8"></th>
            <th className="px-4 py-3">Cliente</th>
            <th className="px-4 py-3">Pedido</th>
            <th className="px-4 py-3">Estoque Atual</th>
            <th className="px-4 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-blue-50">
          {clientOrderRows.map((row, index) => {
            const rowId = `${row.clientId}-${row.orderNumber}`;
            const clientTransactions = transactions.filter(t => 
                t.sheetId === sheet.id && 
                (t.sourceClientId === row.clientId || t.destinationClientId === row.clientId) &&
                (t.type === 'entry' ? t.orderNumber === row.orderNumber || (!t.orderNumber && row.orderNumber === 'S/N') : true)
            );
            const isExpanded = expandedRowId === rowId;
            const labelData = {
              sheetId: sheet.id,
              sheetName: sheet.name, 
              thickness: sheet.thickness, 
              material: sheet.material, 
              clientId: row.clientId, 
              clientName: getClientName(row.clientId), 
              orderNumber: row.orderNumber 
            };
            
            return (
              <React.Fragment key={rowId}>
                <tr className={`cursor-pointer transition-colors ${isExpanded ? 'bg-orange-100/80 relative shadow-sm z-10' : 'hover:bg-blue-50/50 bg-white border-b border-transparent'}`} onClick={() => setExpandedRowId(isExpanded ? null : rowId)}>
                  <td className={`px-4 py-2 text-slate-400 ${isExpanded ? 'text-orange-600' : ''}`}>
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </td>
                  <td className={`px-4 py-3 font-medium ${isExpanded ? 'text-orange-950 font-bold' : 'text-slate-700'}`}>{getClientName(row.clientId)}</td>
                  <td className={`px-4 py-3 font-mono text-xs ${isExpanded ? 'text-orange-800 font-semibold' : 'text-slate-500'}`}>{row.orderNumber}</td>
                  <td className={`px-4 py-3 font-mono ${isExpanded ? 'text-orange-900 font-bold' : 'text-slate-700'}`}>{row.currentStock} unidades</td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => onAddToQueue(labelData)}
                        className="text-slate-500 hover:text-slate-700 flex items-center justify-end gap-1 bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors tooltip"
                        title="Adicionar à fila de impressão"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                        <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Fila</span>
                      </button>
                      <button 
                        onClick={() => onPrintLabel([labelData])} 
                        className="text-blue-500 hover:text-blue-700 flex items-center justify-end gap-1 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors tooltip"
                        title="Imprimir agora"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>
                        <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Imprimir</span>
                      </button>
                    </div>
                  </td>
                </tr>
                {isExpanded && (
                  <tr>
                    <td colSpan={5} className="bg-orange-50/80 p-4 border-t border-orange-100">
                      {clientTransactions.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-left min-w-[500px]">
                            <thead>
                              <tr className="text-orange-900 uppercase font-bold">
                              <th className="pb-2 font-semibold">Data</th>
                              <th className="pb-2 font-semibold">Tipo</th>
                              <th className="pb-2 font-semibold">Quant.</th>
                              <th className="pb-2 font-semibold">Fornecedor</th>
                              <th className="pb-2 font-semibold">Origem</th>
                              <th className="pb-2 font-semibold">Destino</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-orange-100/50">
                            {clientTransactions.map(t => (
                              <tr key={t.id} className="text-slate-800 hover:bg-orange-100/50 transition-colors">
                                <td className="py-2 text-orange-950/70 font-medium">{new Date(t.date).toLocaleDateString()}</td>
                                <td className={`py-2 font-bold ${t.type === 'entry' ? 'text-emerald-700' : t.type === 'exit' ? 'text-rose-700' : 'text-amber-700'}`}>{t.type === 'entry' ? 'Entrada' : t.type === 'exit' ? 'Saída' : 'Uso'}</td>
                                <td className="py-2 font-mono font-bold text-orange-900">{t.quantity}</td>
                                <td className="py-2 text-orange-900 font-medium">{getSupplierName(t.supplierId)}</td>
                                <td className="py-2 text-orange-900 font-medium">{getClientName(t.sourceClientId)}</td>
                                <td className="py-2 text-orange-900 font-medium">{getClientName(t.destinationClientId)}</td>
                              </tr>
                            ))}
                          </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center text-orange-600 font-medium text-sm py-4 bg-white/50 rounded-lg border border-orange-100/50">
                          Nenhuma movimentação detalhada encontrada.
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
        </table>
      </div>
    </div>
  );
};

interface Props {
  sheets: Sheet[];
  transactions: Transaction[];
  clients: Client[];
  suppliers: Supplier[];
  onDeleteSheet: (id: string) => void;
  onDeleteTransaction: (id: string) => void;
}

export const StockList = ({ sheets, transactions, clients, suppliers, onDeleteSheet, onDeleteTransaction }: Props) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [printLabels, setPrintLabels] = useState<any[] | null>(null);
  const [printQueue, setPrintQueue] = useState<any[]>([]);

  const handleAddToQueue = (data: any) => {
    setPrintQueue(prev => [...prev, data]);
  };

  const getClientName = (id?: string) => clients.find(c => c.id === id)?.name || (id ? 'Desconhecido' : '-');
  const getSupplierName = (id?: string) => suppliers.find(s => s.id === id)?.name || '-';

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-16">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[500px]">
            <thead className="bg-slate-50/50 border-b border-slate-100 uppercase text-[10px] font-bold text-slate-400 tracking-widest">
              <tr>
                <th className="px-6 py-3">Nome</th>
                <th className="px-6 py-3">Espessura</th>
                <th className="px-6 py-3">Material</th>
                <th className="px-6 py-3">Total</th>
              </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {[...sheets].sort((a, b) => {
              const nameCmp = a.name.localeCompare(b.name);
              if (nameCmp !== 0) return nameCmp;
              return a.thickness - b.thickness;
            }).map(sheet => {
              const isExpanded = expandedRow === sheet.id;
              return (
              <React.Fragment key={sheet.id}>
                <tr className={`cursor-pointer transition-colors ${isExpanded ? 'bg-blue-100/90 hover:bg-blue-100 shadow-sm relative z-10' : 'hover:bg-slate-50'}`} onClick={() => setExpandedRow(isExpanded ? null : sheet.id)}>
                  <td className={`px-6 py-3 font-semibold ${isExpanded ? 'text-blue-900 font-bold' : 'text-slate-800'}`}>{sheet.name}</td>
                  <td className={`px-6 py-3 ${isExpanded ? 'text-blue-800 font-medium' : 'text-slate-600'}`}>{sheet.thickness}mm</td>
                  <td className={`px-6 py-3 ${isExpanded ? 'text-blue-800 font-medium' : 'text-slate-600'}`}>{sheet.material}</td>
                  <td className={`px-6 py-3 font-mono ${isExpanded ? 'text-blue-900 font-bold' : ''}`}>{sheet.quantity} unidades</td>
                </tr>
                {isExpanded && (
                  <tr>
                    <td colSpan={4} className="bg-blue-50/60 p-0 border-b border-blue-200">
                      <SheetDetails 
                        sheet={sheet} 
                        transactions={transactions} 
                        clients={clients} 
                        suppliers={suppliers} 
                        getClientName={getClientName} 
                        getSupplierName={getSupplierName} 
                        onPrintLabel={(data) => setPrintLabels(data)}
                        onAddToQueue={handleAddToQueue}
                      />
                    </td>
                  </tr>
                )}
              </React.Fragment>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>

      {/* Floating Print Queue Actions */}
      {printQueue.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-6 z-50">
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{printQueue.length}</span>
            <span className="font-medium text-sm">na fila</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPrintQueue([])}
              className="text-slate-400 hover:text-white px-3 py-1.5 text-sm font-medium transition-colors"
            >
              Limpar
            </button>
            <button 
              onClick={() => setPrintLabels(printQueue)}
              className="bg-white text-slate-900 px-4 py-1.5 rounded-full text-sm font-bold hover:bg-slate-100 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>
              Imprimir Fila
            </button>
          </div>
        </div>
      )}

      {printLabels && (
        <PrintLabelModal items={printLabels} onClose={() => {
          // If we are printing the queue, empty the queue when we close the modal
          if (printLabels === printQueue) {
              setPrintQueue([]);
          }
          setPrintLabels(null);
        }} />
      )}
    </>
  );
};
