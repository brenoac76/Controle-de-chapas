import { Client } from '../types';

interface Props {
  clients: Client[];
  onDelete: (id: string) => void;
}

export const ClientList = ({ clients, onDelete }: Props) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <h2 className="text-lg font-bold text-slate-800 p-6">Clientes</h2>
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-xs">
          <tr>
            <th className="px-6 py-3">Nome</th>
            <th className="px-6 py-3">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {clients.map(c => (
            <tr key={c.id} className="hover:bg-slate-50">
              <td className="px-6 py-3 text-slate-800">{c.name}</td>
              <td className="px-6 py-3">
                <button onClick={() => onDelete(c.id)} className="text-red-500 text-xs font-bold">Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
