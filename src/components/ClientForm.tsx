import React, { useState } from 'react';
import { useStockState } from '../hooks/useStockState';
import { toast } from './Toast';

export const ClientForm = ({ onClose, initialClient, onDelete }: { onClose: () => void, initialClient?: {id: string, name: string, city?: string}, onDelete?: () => void }) => {
  const { addClient, updateClient } = useStockState();
  const [name, setName] = useState(initialClient?.name || '');
  const [city, setCity] = useState(initialClient?.city || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (initialClient) {
        await updateClient(initialClient.id, { name, city });
        toast.success('Cliente editado com sucesso!');
      } else {
        await addClient({ id: Date.now().toString(), name, city });
        toast.success('Cliente cadastrado com sucesso!');
      }
      onClose();
    } catch(e: any) {
      toast.error('Erro ao salvar cliente: ' + e.message);
    }
  };

  const inputStyle = "w-full p-3 border border-slate-100 bg-slate-50/50 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-200 transition-all text-sm";

  return (
    <div className="max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-800">{initialClient ? 'Editar Cliente' : 'Cadastrar Cliente'}</h2>
        <input type="text" placeholder="Nome do Cliente" className={inputStyle} value={name} onChange={e => setName(e.target.value)} required />
        <input type="text" placeholder="Cidade (Opcional)" className={inputStyle} value={city} onChange={e => setCity(e.target.value)} />
        <div className="flex gap-3 pt-2">
          {initialClient && onDelete && (
            <button type="button" onClick={async () => { 
              try {
                await onDelete(); 
                toast.success('Cliente excluído com sucesso!');
                onClose();
              } catch (e: any) {
                toast.error(e.message);
              }
            }} className="bg-red-50 text-red-600 p-3 rounded-xl hover:bg-red-100 font-medium transition-colors">Excluir</button>
          )}
          <button type="button" onClick={onClose} className="flex-1 bg-slate-100 text-slate-700 p-3 rounded-xl hover:bg-slate-200 font-medium transition-colors">Cancelar</button>
          <button type="submit" className="flex-1 bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 font-medium transition-colors">Salvar</button>
        </div>
      </form>
    </div>
  );
};
