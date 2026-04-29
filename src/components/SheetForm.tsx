import React, { useState } from 'react';
import { useStockState } from '../hooks/useStockState';

export const SheetForm = ({ onClose }: { onClose: () => void }) => {
  const { addSheet, clients, suppliers } = useStockState();
  const [formData, setFormData] = useState({ name: '', material: '', thickness: 0, length: 0, width: 0, quantity: 0, unit: 'units' as const, orderNumber: '', clientId: '', supplierId: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addSheet({ ...formData, id: Date.now().toString() });
    onClose();
  };

  const inputStyle = "w-full p-3 border border-slate-100 bg-slate-50/50 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-200 transition-all text-sm";

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <h2 className="text-lg font-bold text-slate-800">Cadastrar Nova Chapa</h2>
      
      <input type="text" placeholder="Nome/ID da Chapa" className={inputStyle} onChange={e => setFormData({...formData, name: e.target.value})} required />
      <input type="text" placeholder="Material" className={inputStyle} onChange={e => setFormData({...formData, material: e.target.value})} required />
      <input type="number" placeholder="Espessura (mm)" className={inputStyle} onChange={e => setFormData({...formData, thickness: Number(e.target.value)})} required />
      <select className={inputStyle} value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value as any})} required>
          <option value="units">Unidades</option>
          <option value="m2">m²</option>
          <option value="kg">kg</option>
      </select>
      <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 font-medium transition-colors">Salvar</button>
    </form>
  );
};
