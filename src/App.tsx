/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useStockState } from './hooks/useStockState';
import { LayoutDashboard, Package, ArrowRightLeft, Users, Building2, Plus } from 'lucide-react';
import { StockList } from './components/StockList';
import { SheetForm } from './components/SheetForm';
import { TransactionForm } from './components/TransactionForm';
import { ClientForm } from './components/ClientForm';
import { ClientList } from './components/ClientList';
import { SupplierForm } from './components/SupplierForm';
import { SupplierList } from './components/SupplierList';
import { TransactionList } from './components/TransactionList';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [showForm, setShowForm] = useState<string | null>(null);
  const { sheets, transactions, clients, suppliers, deleteSheet, deleteTransaction, deleteClient, deleteSupplier } = useStockState();

  const MENU_ITEMS = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'stock', name: 'Estoque', icon: Package },
    { id: 'transactions', name: 'Movimentações', icon: ArrowRightLeft },
    { id: 'clients', name: 'Clientes', icon: Users },
    { id: 'suppliers', name: 'Fornecedores', icon: Building2 },
  ];

  const renderContent = () => {
    if (showForm === 'sheet') return <SheetForm onClose={() => setShowForm(null)} />;
    if (showForm === 'transaction') return <TransactionForm onClose={() => setShowForm(null)} />;
    if (showForm === 'client') return <ClientForm onClose={() => setShowForm(null)} />;
    if (showForm === 'supplier') return <SupplierForm onClose={() => setShowForm(null)} />;
    
    switch (activeView) {
      case 'stock':
        return <StockList sheets={sheets} transactions={transactions} clients={clients} suppliers={suppliers} onDeleteSheet={deleteSheet} onDeleteTransaction={deleteTransaction} />;
      case 'transactions':
        return <TransactionList transactions={transactions} sheets={sheets} clients={clients} suppliers={suppliers} onDelete={deleteTransaction} />;
      case 'clients':
        return <ClientList clients={clients} onDelete={deleteClient} />;
      case 'suppliers':
        return <SupplierList suppliers={suppliers} onDelete={deleteSupplier} />;
      default: {
        const thicknessCounts = sheets.reduce((acc, sheet) => {
          acc[sheet.thickness] = (acc[sheet.thickness] || 0) + sheet.quantity;
          return acc;
        }, {} as Record<number, number>);
        
        const totalSheets = sheets.reduce((acc, sheet) => acc + sheet.quantity, 0);

        const todayTransactions = transactions.filter(t => {
          const tDate = new Date(t.date);
          const today = new Date();
          return tDate.getDate() === today.getDate() && 
                 tDate.getMonth() === today.getMonth() && 
                 tDate.getFullYear() === today.getFullYear();
        });
        
        const todayEntries = todayTransactions.filter(t => t.type === 'entry').length;
        const todayExits = todayTransactions.filter(t => t.type === 'exit' || t.type === 'partial_usage').length;
        const totalToday = todayTransactions.length;

        return (
          <section className="grid grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm col-span-4 md:col-span-2">
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Total de Chapas por Espessura</h3>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 min-w-[90px]">
                  <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wide">Total</p>
                  <p className="text-2xl font-black text-blue-900">{totalSheets}</p>
                </div>
                {Object.keys(thicknessCounts).length > 0 ? (
                  Object.entries(thicknessCounts).map(([thickness, count]) => (
                    <div key={thickness} className="bg-slate-50 border border-slate-100 rounded-lg p-3 min-w-[90px]">
                      <p className="text-xs text-slate-500 font-medium">{thickness}mm</p>
                      <p className="text-xl font-bold text-slate-800">{count}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 font-medium ml-2">Nenhuma chapa cadastrada.</p>
                )}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm col-span-4 md:col-span-2">
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Movimentações de Hoje</h3>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 min-w-[90px]">
                  <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wide">Total</p>
                  <p className="text-2xl font-black text-indigo-900">{totalToday}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 min-w-[90px]">
                  <p className="text-xs text-emerald-600 font-bold uppercase tracking-wide">Entradas</p>
                  <p className="text-xl font-bold text-emerald-900">{todayEntries}</p>
                </div>
                <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 min-w-[90px]">
                  <p className="text-xs text-orange-600 font-bold uppercase tracking-wide">Saídas</p>
                  <p className="text-xl font-bold text-orange-900">{todayExits}</p>
                </div>
              </div>
            </div>
          </section>
        );
      }
    }
  };

  const getActionButtons = () => {
    if (activeView === 'clients') return <button onClick={() => setShowForm('client')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700"><Plus size={14}/>Novo Cliente</button>;
    if (activeView === 'suppliers') return <button onClick={() => setShowForm('supplier')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700"><Plus size={14}/>Novo Fornecedor</button>;
    if (activeView === 'stock') return <button onClick={() => setShowForm('sheet')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700"><Plus size={14}/>Nova Chapa</button>;
    if (activeView === 'transactions') return <button onClick={() => setShowForm('transaction')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700"><Plus size={14}/>Movimentar</button>;
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <nav className="w-full md:w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-4 md:p-6 flex justify-between items-center">
          <h1 className="text-lg font-bold uppercase tracking-tight">SteelFlow</h1>
        </div>
        <div className="flex px-4 md:flex-col overflow-x-auto md:overflow-x-visible space-x-2 md:space-x-0 md:space-y-1 pb-4 md:pb-0 scrollbar-hide">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveView(item.id); setShowForm(null); }}
              className={`flex items-center gap-2 md:gap-3 px-3 py-2 md:px-4 md:py-2 rounded-md text-xs md:text-sm font-medium whitespace-nowrap ${activeView === item.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <item.icon size={16} className="md:w-[18px] md:h-[18px]" />
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-auto md:h-16 bg-white border-b border-slate-200 px-4 md:px-8 py-4 md:py-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-sm font-bold text-slate-700">
            {MENU_ITEMS.find(m => m.id === activeView)?.name}
          </h1>
          <div className='flex gap-2 flex-wrap'>
            {getActionButtons()}
          </div>
        </header>
        <div className="p-4 md:p-8 overflow-y-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
