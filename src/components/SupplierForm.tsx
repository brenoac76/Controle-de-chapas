import React, { useState } from 'react';
import { useStockState } from '../hooks/useStockState';

export const SupplierForm = ({ onClose }: { onClose: () => void }) => {
  const { addSupplier } = useStockState();
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addSupplier({ id: Date.now().toString(), name });
    onClose();
  };

  const inputStyle = "w-full p-3 border border-slate-100 bg-slate-50/50 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-200 transition-all text-sm";

  return (
    <div className="max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Cadastrar Fornecedor</h2>
        <input type="text" placeholder="Nome do Fornecedor" className={inputStyle} value={name} onChange={e => setName(e.target.value)} required />
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 bg-slate-100 text-slate-700 p-3 rounded-xl hover:bg-slate-200 font-medium transition-colors">Cancelar</button>
          <button type="submit" className="flex-1 bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 font-medium transition-colors">Salvar</button>
        </div>
      </form>
    </div>
  );
};
