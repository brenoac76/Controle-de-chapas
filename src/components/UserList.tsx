import { useState } from 'react';
import { AppUser } from '../types';
import { Search, ShieldAlert } from 'lucide-react';
import { useStockState } from '../hooks/useStockState';

interface Props {
  users: AppUser[];
  onEdit: (user: AppUser) => void;
}

export const UserList = ({ users, onEdit }: Props) => {
  const [search, setSearch] = useState('');
  const { toggleUserActive } = useStockState();

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="bg-blue-50/50 p-4 border-b border-blue-100 flex gap-3 text-blue-800 text-sm">
        <ShieldAlert size={20} className="shrink-0 mt-0.5 text-blue-500" />
        <p>
          Para que o login com senha funcione, é obrigatório ativar o provedor <strong>E-mail/Senha</strong> na aba <em>Authentication</em> no Console do Firebase.
        </p>
      </div>
      <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h2 className="text-lg font-bold text-slate-800">Usuários do Sistema</h2>
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-slate-400" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-slate-50/50 focus:bg-white"
            placeholder="Buscar usuários..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[500px]">
          <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-3">Nome</th>
              <th className="px-6 py-3">E-mail</th>
              <th className="px-6 py-3 text-center">Status</th>
              <th className="px-6 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredUsers.map(u => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-slate-800 font-semibold cursor-pointer" onClick={() => onEdit(u)}>{u.name}</td>
                <td className="px-6 py-4 text-slate-600 font-medium cursor-pointer" onClick={() => onEdit(u)}>{u.email}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${u.active !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                    {u.active !== false ? 'Ativo' : 'Inativo'}
                  </span>
                  <span className="block mt-1 text-[10px] uppercase font-bold text-slate-400">{u.role === 'master' ? 'Master' : 'Operacional'}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleUserActive(u.id, u.active !== false); }}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${u.active !== false ? 'text-amber-700 bg-amber-50 hover:bg-amber-100' : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'}`}
                  >
                    {u.active !== false ? 'Bloquear' : 'Desbloquear'}
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500 font-medium">
                  {search ? 'Nenhum usuário encontrado para essa busca.' : 'Nenhum usuário cadastrado.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
