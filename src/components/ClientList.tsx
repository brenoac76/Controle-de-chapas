import { Client } from '../types';

interface Props {
  clients: Client[];
  onEdit: (client: Client) => void;
}

export const ClientList = ({ clients, onEdit }: Props) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <h2 className="text-lg font-bold text-slate-800 p-6">Clientes</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[300px]">
          <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Nome</th>
              <th className="px-6 py-3">Cidade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {clients.map(c => (
              <tr key={c.id} onClick={() => onEdit(c)} className="hover:bg-slate-50 cursor-pointer transition-colors">
                <td className="px-6 py-3 text-slate-800 font-medium">{c.name}</td>
                <td className="px-6 py-3 text-slate-600">{c.city || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
