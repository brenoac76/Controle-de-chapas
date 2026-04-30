/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useStockState } from './hooks/useStockState';
import { LayoutDashboard, Package, ArrowRightLeft, Users, Building2, Plus, LogOut, Shield, UserCircle, UserCog } from 'lucide-react';
import { StockList } from './components/StockList';
import { SheetForm } from './components/SheetForm';
import { TransactionForm } from './components/TransactionForm';
import { ClientForm } from './components/ClientForm';
import { ClientList } from './components/ClientList';
import { SupplierForm } from './components/SupplierForm';
import { SupplierList } from './components/SupplierList';
import { TransactionList } from './components/TransactionList';
import { ToastContainer, toast } from './components/Toast';
import { Client, Supplier, AppUser } from './types';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { Login } from './components/Login';
import { UserList } from './components/UserList';
import { UserForm } from './components/UserForm';
import { ProfileForm } from './components/ProfileForm';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<AppUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [activeView, setActiveView] = useState('dashboard');
  const [showForm, setShowForm] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>(undefined);
  const [editingUser, setEditingUser] = useState<AppUser | undefined>(undefined);
  const { sheets, transactions, clients, suppliers, users, deleteSheet, deleteTransaction, deleteClient, deleteSupplier, deleteUser } = useStockState();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docSnap = await getDoc(doc(db, 'users', user.uid));
        if (docSnap.exists() && docSnap.data().active !== false) {
          const data = docSnap.data();
          if (user.email === 'breno.ac@gmail.com' && data.role !== 'master') {
            await updateDoc(doc(db, 'users', user.uid), { role: 'master' });
            data.role = 'master';
          }
          setCurrentUser(user);
          setUserProfile({ id: docSnap.id, ...data } as AppUser);
        } else if (!docSnap.exists()) {
          // If no document exists, this is either the first admin created in Firebase Console, 
          // or a deleted user trying to log in. We create the doc so they have a profile.
          const newData = { name: user.displayName || 'Usuário Master', email: user.email || '', active: true, role: 'master' };
          await setDoc(doc(db, 'users', user.uid), newData);
          setCurrentUser(user);
          setUserProfile({ id: user.uid, ...newData } as AppUser);
        } else {
          toast.error('Acesso bloqueado: Seu usuário foi inativado.');
          await signOut(auth);
          setCurrentUser(null);
          setUserProfile(null);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    toast.success('Você saiu do sistema.');
  };

  const MENU_ITEMS = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'stock', name: 'Estoque', icon: Package },
    { id: 'transactions', name: 'Movimentações', icon: ArrowRightLeft },
    { id: 'clients', name: 'Clientes', icon: Users },
    { id: 'suppliers', name: 'Fornecedores', icon: Building2 },
  ];

  if (userProfile?.role === 'master') {
    MENU_ITEMS.push({ id: 'users', name: 'Usuários do Sistema', icon: Shield });
  }

  const handleCloseForm = () => {
    setShowForm(null);
    setEditingClient(undefined);
    setEditingSupplier(undefined);
    setEditingUser(undefined);
  };

  const renderContent = () => {
    if (showForm === 'sheet') return <SheetForm onClose={handleCloseForm} />;
    if (showForm === 'transaction') return <TransactionForm onClose={handleCloseForm} currentUser={userProfile} />;
    if (showForm === 'client') return <ClientForm onClose={handleCloseForm} initialClient={editingClient} onDelete={editingClient ? () => deleteClient(editingClient.id) : undefined} />;
    if (showForm === 'supplier') return <SupplierForm onClose={handleCloseForm} initialSupplier={editingSupplier} onDelete={editingSupplier ? () => deleteSupplier(editingSupplier.id) : undefined} />;
    if (showForm === 'user') return <UserForm onClose={handleCloseForm} initialUser={editingUser} onDelete={editingUser ? () => deleteUser(editingUser.id) : undefined} userProfile={userProfile} />;
    if (showForm === 'profile') return <ProfileForm onClose={handleCloseForm} userProfile={userProfile!} />;
    
    switch (activeView) {
      case 'stock':
        return <StockList sheets={sheets} transactions={transactions} clients={clients} suppliers={suppliers} onDeleteSheet={deleteSheet} onDeleteTransaction={deleteTransaction} />;
      case 'transactions':
        return <TransactionList transactions={transactions} sheets={sheets} clients={clients} suppliers={suppliers} onDelete={deleteTransaction} />;
      case 'clients':
        return <ClientList clients={clients} onEdit={(c) => { setEditingClient(c); setShowForm('client'); }} />;
      case 'suppliers':
        return <SupplierList suppliers={suppliers} onEdit={(s) => { setEditingSupplier(s); setShowForm('supplier'); }} />;
      case 'users':
        return <UserList users={users} onEdit={(u) => { setEditingUser(u); setShowForm('user'); }} />;
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
    if (activeView === 'users') return <button onClick={() => setShowForm('user')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700"><Plus size={14}/>Novo Usuário</button>;
    if (activeView === 'clients') return <button onClick={() => setShowForm('client')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700"><Plus size={14}/>Novo Cliente</button>;
    if (activeView === 'suppliers') return <button onClick={() => setShowForm('supplier')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700"><Plus size={14}/>Novo Fornecedor</button>;
    if (activeView === 'stock') return <button onClick={() => setShowForm('sheet')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700"><Plus size={14}/>Nova Chapa</button>;
    if (activeView === 'transactions') return <button onClick={() => setShowForm('transaction')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700"><Plus size={14}/>Movimentar</button>;
    return null;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>
        <Login />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <nav className="w-full md:w-64 bg-slate-900 text-white flex flex-col shrink-0 md:h-screen sticky top-0 overflow-y-auto">
        <div className="p-4 md:p-6 flex flex-col gap-1">
          <h1 className="text-lg font-bold uppercase tracking-tight flex items-center gap-2">
            <span className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center text-xs">S</span>
            SteelFlow
          </h1>
          <p className="text-xs text-slate-400 font-medium ml-8">Olá, <span className="text-slate-300">{userProfile?.name || 'Administrador'}</span></p>
        </div>
        <div className="flex px-4 md:flex-col overflow-x-auto md:overflow-x-visible space-x-2 md:space-x-0 md:space-y-1 pb-4 md:pb-0 scrollbar-hide flex-1">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveView(item.id); handleCloseForm(); }}
              className={`flex items-center gap-2 md:gap-3 px-3 py-2 md:px-4 md:py-2.5 rounded-xl text-xs md:text-sm font-medium whitespace-nowrap transition-colors ${activeView === item.id ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
              <item.icon size={18} className="md:w-[20px] md:h-[20px] shrink-0" />
              <span>{item.name}</span>
            </button>
          ))}
        </div>
        <div className="p-4 mt-auto border-t border-slate-800 hidden md:block">
          <button onClick={() => setShowForm('profile')} className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-sm font-medium text-slate-400 hover:bg-blue-500/10 hover:text-blue-400 transition-colors mb-2">
            <UserCircle size={18} />
            <span>Meu Perfil</span>
          </button>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors">
            <LogOut size={18} />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">
        <header className="h-auto md:h-20 bg-white border-b border-slate-200 px-4 md:px-8 py-4 md:py-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex justify-between items-center w-full sm:w-auto">
            <h1 className="text-base sm:text-lg font-black text-slate-800 uppercase tracking-wide">
              {MENU_ITEMS.find(m => m.id === activeView)?.name}
            </h1>
            <div className="md:hidden flex items-center gap-3">
              <button onClick={() => setShowForm('profile')} className="text-slate-500 hover:text-blue-500 transition-colors">
                <UserCog size={20} />
              </button>
              <button onClick={handleLogout} className="text-slate-500 hover:text-red-500 transition-colors">
                <LogOut size={20} />
              </button>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {getActionButtons()}
          </div>
        </header>
        <div className="p-4 md:p-8 overflow-y-auto">
          {renderContent()}
        </div>
      </main>
      <ToastContainer />
    </div>
  );
}
