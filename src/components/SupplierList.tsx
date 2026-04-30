import { useState } from 'react';
import { Supplier } from '../types';
import { Search } from 'lucide-react';

interface Props {
  suppliers: Supplier[];
  onEdit: (supplier: Supplier) => void;
}

export const SupplierList = ({ suppliers, onEdit }: Props) => {
  const [search, setSearch] = useState('');

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h2 className="text-lg font-bold text-slate-800">Fornecedores</h2>
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-slate-400" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-slate-50/50 focus:bg-white"
            placeholder="Buscar fornecedores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[300px]">
          <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Nome</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredSuppliers.map(s => (
              <tr key={s.id} onClick={() => onEdit(s)} className="hover:bg-slate-50 cursor-pointer transition-colors">
                <td className="px-6 py-3 text-slate-800 font-medium">{s.name}</td>
              </tr>
            ))}
            {filteredSuppliers.length === 0 && (
              <tr>
                <td className="px-6 py-8 text-center text-slate-500">
                  {search ? 'Nenhum fornecedor encontrado para essa busca.' : 'Nenhum fornecedor cadastrado.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

