import React, { useState } from 'react';
import { Transaction, Sheet, Client, Supplier } from '../types';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  sheets: Sheet[];
  clients: Client[];
  suppliers: Supplier[];
  onDelete: (id: string) => void;
}

export const TransactionList = ({ transactions, sheets, clients, suppliers, onDelete }: Props) => {
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

  const getSheetNameWithThickness = (id?: string) => {
    const sheet = sheets.find(s => s.id === id);
    if (!sheet) return '-';
    return `${sheet.name} (${sheet.thickness}mm)`;
  };
  const getClientName = (id?: string) => clients.find(c => c.id === id)?.name || '-';
  const getSupplierName = (id?: string) => suppliers.find(s => s.id === id)?.name || '-';

  // Group transactions by date
  const groupedTransactions: Record<string, Transaction[]> = transactions.reduce((acc, t) => {
    const date = new Date(t.date).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(t);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const toggleDate = (date: string) => {
    setExpandedDates(prev => ({ ...prev, [date]: !prev[date] }));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden auto-rows-max">
      <h2 className="text-lg font-bold text-slate-800 p-6">Histórico de Movimentações</h2>
      <div className="w-full text-left text-sm">
        {Object.entries(groupedTransactions).map(([date, dailyTrans]) => (
          <div key={date} className="border-t border-slate-100">
            <div 
              className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => toggleDate(date)}
            >
               <div className="flex items-center gap-3">
                 {expandedDates[date] ? <ChevronDown size={18} className="text-slate-500" /> : <ChevronRight size={18} className="text-slate-500" />}
                 <span className="font-semibold text-slate-800 text-base">{date}</span>
               </div>
               <div className="text-slate-500 font-medium">
                  {dailyTrans.length} {dailyTrans.length === 1 ? 'movimentação' : 'movimentações'}
               </div>
            </div>

            {expandedDates[date] && (
              <div className="bg-slate-50/50 p-4 border-t border-slate-100">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm min-w-[800px]">
                    <thead className="text-slate-400 font-bold uppercase text-xs">
                    <tr>
                      <th className="px-4 py-2">Chapa</th>
                      <th className="px-4 py-2">Pedido</th>
                      <th className="px-4 py-2">Tipo</th>
                      <th className="px-4 py-2">Quantidade</th>
                      <th className="px-4 py-2">Fornecedor</th>
                      <th className="px-4 py-2">Origem</th>
                      <th className="px-4 py-2">Destino</th>
                      <th className="px-4 py-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dailyTrans.map(t => (
                      <tr key={t.id} className={`transition-colors rounded ${t.type === 'entry' ? 'bg-emerald-50/60 hover:bg-emerald-100/60' : t.type === 'exit' ? 'bg-orange-50/60 hover:bg-orange-100/60' : 'hover:bg-white bg-transparent'}`}>
                        <td className="px-4 py-3 text-slate-800 font-medium">{getSheetNameWithThickness(t.sheetId)}</td>
                        <td className="px-4 py-3 text-slate-600 font-mono text-xs">
                          {t.orderNumber || '-'}
                        </td>
                        <td className={`px-4 py-3 font-medium ${t.type === 'entry' ? 'text-emerald-700' : t.type === 'exit' ? 'text-orange-700' : 'text-amber-700'}`}>
                          {t.type === 'entry' ? 'Entrada' : t.type === 'exit' ? 'Saída' : 'Uso Parcial'}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-700">{t.quantity}</td>
                        <td className="px-4 py-3 text-slate-600">{getSupplierName(t.supplierId)}</td>
                        <td className="px-4 py-3 text-slate-600">{getClientName(t.sourceClientId)}</td>
                        <td className="px-4 py-3 text-slate-600">{getClientName(t.destinationClientId)}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => onDelete(t.id)} className="text-red-500 text-xs font-bold hover:text-red-600 transition-colors">Excluir</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {Object.keys(groupedTransactions).length === 0 && (
          <div className="p-6 text-center text-slate-500 border-t border-slate-100">
            Nenhuma movimentação registrada.
          </div>
        )}
      </div>
    </div>
  );
};
