import React, { useState } from 'react';
import { useStockState } from '../hooks/useStockState';

export const ClientForm = ({ onClose }: { onClose: () => void }) => {
  const { addClient } = useStockState();
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addClient({ id: Date.now().toString(), name });
    onClose();
  };

  const inputStyle = "w-full p-3 border border-slate-100 bg-slate-50/50 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-200 transition-all text-sm";

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <h2 className="text-lg font-bold text-slate-800">Cadastrar Cliente</h2>
      <input type="text" placeholder="Nome do Cliente" className={inputStyle} onChange={e => setName(e.target.value)} required />
      <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 font-medium transition-colors">Salvar</button>
    </form>
  );
};
