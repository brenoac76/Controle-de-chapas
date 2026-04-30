import { Supplier } from '../types';

interface Props {
  suppliers: Supplier[];
  onDelete: (id: string) => void;
}

export const SupplierList = ({ suppliers, onDelete }: Props) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <h2 className="text-lg font-bold text-slate-800 p-6">Fornecedores</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[300px]">
          <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Nome</th>
              <th className="px-6 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {suppliers.map(s => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="px-6 py-3 text-slate-800">{s.name}</td>
                <td className="px-6 py-3 text-right">
                  <button onClick={() => onDelete(s.id)} className="text-red-500 hover:text-red-600 text-xs font-bold transition-colors">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
