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
    <div className="bg-white rounded-lg border border-blue-200 overflow-hidden my-2 sm:my-3 sm:mx-4 mx-2 shadow-md bg-blue-50/20">
      <div className="hidden sm:grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-4 bg-blue-50 border-b border-blue-100 text-blue-700 font-bold uppercase text-xs px-4 py-3">
        <div className="w-8"></div>
        <div>Cliente</div>
        <div>Pedido</div>
        <div>Estoque Atual</div>
        <div className="text-right">Ações</div>
      </div>
      <div className="divide-y divide-blue-50">
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
              <div 
                className={`cursor-pointer transition-colors p-4 sm:p-0 ${isExpanded ? 'bg-orange-100/80 relative shadow-sm z-10' : 'hover:bg-blue-50/50 bg-white sm:border-b-0 border-b border-transparent'} flex flex-col sm:grid sm:grid-cols-[auto_1fr_1fr_1fr_auto] sm:gap-4 sm:items-center sm:px-4 sm:py-2 gap-2`}
                onClick={() => setExpandedRowId(isExpanded ? null : rowId)}
              >
                <div className="hidden sm:flex w-8 text-slate-400">
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>

                {/* Mobile logic */}
                <div className="flex sm:hidden justify-between items-center w-full mb-1">
                  <div className={`font-medium ${isExpanded ? 'text-orange-950 font-bold' : 'text-slate-700'}`}>
                    {getClientName(row.clientId)} <span className="text-slate-400 font-normal">| {row.orderNumber}</span>
                  </div>
                  <div className={`text-slate-400 ${isExpanded ? 'text-orange-600' : ''}`}>
                    {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </div>
                </div>

                <div className={`hidden sm:block font-medium ${isExpanded ? 'text-orange-950 font-bold' : 'text-slate-700'}`}>
                  {getClientName(row.clientId)}
                </div>
                <div className={`hidden sm:block font-mono text-xs ${isExpanded ? 'text-orange-800 font-semibold' : 'text-slate-500'}`}>
                  {row.orderNumber}
                </div>
                <div className={`font-mono text-sm flex justify-between sm:block ${isExpanded ? 'text-orange-900 font-bold' : 'text-slate-700'}`}>
                  <span className="sm:hidden text-xs text-slate-500 uppercase font-bold tracking-wider">Estoque Atual</span>
                  {row.currentStock} unidades
                </div>
                <div className="mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex justify-end">
                  <div className="flex items-center justify-end gap-2 w-full sm:w-auto" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onAddToQueue(labelData); }}
                      className="flex-1 sm:flex-none justify-center text-slate-500 hover:text-slate-700 flex items-center gap-1 bg-white px-3 py-2 sm:py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors tooltip"
                      title="Adicionar à fila de impressão"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                      <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Fila</span>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onPrintLabel([labelData]); }} 
                      className="flex-1 sm:flex-none justify-center text-blue-500 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-2 sm:py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors tooltip"
                      title="Imprimir agora"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>
                      <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Imprimir</span>
                    </button>
                  </div>
                </div>
              </div>
              {isExpanded && (
                <div className="bg-orange-50/80 p-3 sm:p-4 border-t border-orange-100">
                  {clientTransactions.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      <div className="hidden sm:grid grid-cols-[100px_80px_80px_1fr_1fr_1fr] gap-4 text-orange-900 uppercase font-bold text-xs pb-2 border-b border-orange-200">
                        <div>Data</div>
                        <div>Tipo</div>
                        <div>Quant.</div>
                        <div>Fornecedor</div>
                        <div>Origem</div>
                        <div>Destino</div>
                      </div>
                      <div className="flex flex-col gap-3 sm:gap-0 sm:divide-y sm:divide-orange-100/50">
                        {clientTransactions.map(t => (
                          <div key={t.id} className="bg-white sm:bg-transparent rounded-lg border border-orange-200 sm:border-none p-3 sm:p-0 sm:py-2 text-slate-800 hover:bg-orange-100/50 transition-colors flex flex-col sm:grid sm:grid-cols-[100px_80px_80px_1fr_1fr_1fr] sm:gap-4 gap-1.5 shadow-sm sm:shadow-none">
                            <div className="flex justify-between sm:block text-orange-950/70 font-medium text-sm">
                              <span className="sm:hidden text-[11px] font-bold uppercase text-orange-800/60 pb-1 w-24">Data</span>
                              <span>{new Date(t.date).toLocaleDateString()}</span>
                            </div>
                            <div className={`flex justify-between sm:block text-sm font-bold ${t.type === 'entry' ? 'text-emerald-700' : t.type === 'exit' ? 'text-rose-700' : 'text-amber-700'}`}>
                              <span className="sm:hidden text-[11px] font-bold uppercase text-orange-800/60 pb-1 w-24 text-left">Tipo</span>
                              <span>{t.type === 'entry' ? 'Entrada' : t.type === 'exit' ? 'Saída' : 'Uso'}</span>
                            </div>
                            <div className="flex justify-between sm:block text-sm font-mono font-bold text-orange-900">
                              <span className="sm:hidden text-[11px] font-bold uppercase text-orange-800/60 pb-1 w-24">Quant.</span>
                              <span>{t.quantity}</span>
                            </div>
                            <div className="flex justify-between sm:block text-sm text-orange-900 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                              <span className="sm:hidden text-[11px] font-bold uppercase text-orange-800/60 pb-1 w-24">Fornecedor</span>
                              <span className="truncate">{t.type === 'entry' ? getSupplierName(t.supplierId) : '-'}</span>
                            </div>
                            <div className="flex justify-between sm:block text-sm text-orange-900 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                              <span className="sm:hidden text-[11px] font-bold uppercase text-orange-800/60 pb-1 w-24">Origem</span>
                              <span className="truncate">{getClientName(t.sourceClientId)}</span>
                            </div>
                            <div className="flex justify-between sm:block text-sm text-orange-900 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                              <span className="sm:hidden text-[11px] font-bold uppercase text-orange-800/60 pb-1 w-24">Destino</span>
                              <span className="truncate">{getClientName(t.destinationClientId)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-orange-600 font-medium text-sm py-4 bg-white sm:bg-white/50 shadow-sm sm:shadow-none rounded-lg border border-orange-200 sm:border-orange-100/50">
                      Nenhuma movimentação detalhada encontrada.
                    </div>
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
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
          <table className="w-full text-left text-sm md:min-w-[500px]">
            <thead className="bg-slate-50/50 border-b border-slate-100 uppercase text-[10px] font-bold text-slate-400 tracking-widest">
              <tr>
                <th className="px-6 py-3">Nome</th>
                <th className="px-6 py-3">Espessura</th>
                <th className="px-6 py-3 hidden md:table-cell">Material</th>
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
                  <td className={`px-6 py-3 hidden md:table-cell ${isExpanded ? 'text-blue-800 font-medium' : 'text-slate-600'}`}>{sheet.material}</td>
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
