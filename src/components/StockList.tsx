import React, { useState } from 'react';
import { Sheet, Transaction, Client, Supplier } from '../types';
import { getClientBalancesByOrder } from '../lib/stockUtils';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { PrintLabelModal } from './PrintLabelModal';

const SheetDetails = ({ sheet, transactions, clients, suppliers, getClientName, getSupplierName, onPrintLabel, selectedLabels, onToggleLabel }: { sheet: Sheet, transactions: Transaction[], clients: Client[], suppliers: Supplier[], getClientName: (id?: string) => string, getSupplierName: (id?: string) => string, onPrintLabel: (data: any) => void, selectedLabels: any[], onToggleLabel: (data: any) => void }) => {
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
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden my-2 mx-4 shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase text-xs">
          <tr>
            <th className="px-4 py-2 w-8"></th>
            <th className="px-4 py-2 w-8"></th>
            <th className="px-4 py-2">Cliente</th>
            <th className="px-4 py-2">Pedido</th>
            <th className="px-4 py-2">Estoque Atual</th>
            <th className="px-4 py-2 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
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
            const isSelected = selectedLabels.some(l => l.sheetId === labelData.sheetId && l.clientId === labelData.clientId && l.orderNumber === labelData.orderNumber);

            return (
              <React.Fragment key={rowId}>
                <tr className="hover:bg-slate-50 cursor-pointer" onClick={() => setExpandedRowId(isExpanded ? null : rowId)}>
                  <td className="px-4 py-2 text-slate-400">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                      onClick={(e) => e.stopPropagation()} 
                      onChange={() => onToggleLabel(labelData)}
                      checked={isSelected}
                    />
                  </td>
                  <td className="px-4 py-2 text-slate-400">
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </td>
                  <td className="px-4 py-2 text-slate-700 font-medium">{getClientName(row.clientId)}</td>
                  <td className="px-4 py-2 text-slate-500 font-mono text-xs">{row.orderNumber}</td>
                  <td className="px-4 py-2 font-mono text-slate-700">{row.currentStock} unidades</td>
                  <td className="px-4 py-2 text-right">
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        onPrintLabel({ 
                          sheetId: sheet.id,
                          sheetName: sheet.name, 
                          thickness: sheet.thickness, 
                          material: sheet.material, 
                          clientId: row.clientId, 
                          clientName: getClientName(row.clientId), 
                          orderNumber: row.orderNumber 
                        }); 
                      }} 
                      className="text-blue-500 hover:text-blue-700 flex items-center justify-end gap-1 ml-auto"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>
                      <span className="text-xs font-bold uppercase tracking-wider">Etiqueta</span>
                    </button>
                  </td>
                </tr>
                {isExpanded && (
                  <tr>
                    <td colSpan={6} className="bg-slate-50/50 p-4 border-t border-slate-100">
                      {clientTransactions.length > 0 ? (
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="text-slate-400 uppercase">
                              <th className="pb-2 font-semibold">Data</th>
                              <th className="pb-2 font-semibold">Tipo</th>
                              <th className="pb-2 font-semibold">Quant.</th>
                              <th className="pb-2 font-semibold">Fornecedor</th>
                              <th className="pb-2 font-semibold">Origem</th>
                              <th className="pb-2 font-semibold">Destino</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {clientTransactions.map(t => (
                              <tr key={t.id} className="text-slate-600">
                                <td className="py-2">{new Date(t.date).toLocaleDateString()}</td>
                                <td className="py-2">{t.type === 'entry' ? 'Entrada' : t.type === 'exit' ? 'Saída' : 'Uso Parcial'}</td>
                                <td className="py-2 font-mono">{t.quantity}</td>
                                <td className="py-2">{getSupplierName(t.supplierId)}</td>
                                <td className="py-2">{getClientName(t.sourceClientId)}</td>
                                <td className="py-2">{getClientName(t.destinationClientId)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="text-center text-slate-500 text-xs py-2">
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
  const [selectedLabels, setSelectedLabels] = useState<any[]>([]);

  const handleToggleLabel = (data: any) => {
    setSelectedLabels(prev => {
        const isSelected = prev.some(l => l.sheetId === data.sheetId && l.clientId === data.clientId && l.orderNumber === data.orderNumber);
        if (isSelected) {
            return prev.filter(l => !(l.sheetId === data.sheetId && l.clientId === data.clientId && l.orderNumber === data.orderNumber));
        } else {
            return [...prev, data];
        }
    });
  };

  const getClientName = (id?: string) => clients.find(c => c.id === id)?.name || (id ? 'Desconhecido' : '-');
  const getSupplierName = (id?: string) => suppliers.find(s => s.id === id)?.name || '-';

  return (
    <>
      {selectedLabels.length > 0 && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
          <span className="text-blue-800 font-medium">
            {selectedLabels.length} {selectedLabels.length === 1 ? 'etiqueta selecionada' : 'etiquetas selecionadas'}
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => setSelectedLabels([])}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={() => setPrintLabels(selectedLabels)}
              className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>
              Imprimir Selecionadas
            </button>
          </div>
        </div>
      )}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
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
            }).map(sheet => (
              <React.Fragment key={sheet.id}>
                <tr key={sheet.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setExpandedRow(expandedRow === sheet.id ? null : sheet.id)}>
                  <td className="px-6 py-3 text-slate-800 font-semibold">{sheet.name}</td>
                  <td className="px-6 py-3 text-slate-600">{sheet.thickness}mm</td>
                  <td className="px-6 py-3 text-slate-600">{sheet.material}</td>
                  <td className="px-6 py-3 font-mono">{sheet.quantity} unidades</td>
                </tr>
                {expandedRow === sheet.id && (
                  <tr>
                    <td colSpan={4} className="bg-slate-50/30 p-0 border-b border-slate-100">
                      <SheetDetails 
                        sheet={sheet} 
                        transactions={transactions} 
                        clients={clients} 
                        suppliers={suppliers} 
                        getClientName={getClientName} 
                        getSupplierName={getSupplierName} 
                        onPrintLabel={(data) => setPrintLabels([data])}
                        selectedLabels={selectedLabels}
                        onToggleLabel={handleToggleLabel}
                      />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {printLabels && (
        <PrintLabelModal items={printLabels} onClose={() => {
          setPrintLabels(null);
          setSelectedLabels([]);
        }} />
      )}
    </>
  );
};
