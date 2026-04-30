import React, { useState } from 'react';
import { useStockState } from '../hooks/useStockState';
import { toast } from './Toast';
import { AppUser } from '../types';
import { auth } from '../lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

export const UserForm = ({ onClose, initialUser, onDelete, userProfile }: { onClose: () => void, initialUser?: AppUser, onDelete?: () => void, userProfile: AppUser | null }) => {
  const { addUser, updateUser } = useStockState();
  const [name, setName] = useState(initialUser?.name || '');
  const [email, setEmail] = useState(initialUser?.email || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(initialUser?.role || 'operacional');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initialUser) {
        await updateUser(initialUser.id, { name, email, role });
        toast.success('Usuário atualizado com sucesso!');
      } else {
        if (!password || password.length < 6) {
          toast.error('A senha deve ter no mínimo 6 caracteres.');
          setLoading(false);
          return;
        }
        await addUser({ name, email, password, role });
        toast.success('Usuário cadastrado com sucesso!');
      }
      onClose();
    } catch(e: any) {
      toast.error('Erro ao salvar usuário: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!initialUser?.email) return;
    try {
      await sendPasswordResetEmail(auth, initialUser.email);
      toast.success(`E-mail de redefinição enviado para ${initialUser.email}`);
    } catch (e: any) {
      toast.error('Erro ao enviar e-mail: ' + e.message);
    }
  };

  const inputStyle = "w-full p-3 border border-slate-100 bg-slate-50/50 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-200 transition-all text-sm";

  return (
    <div className="max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-blue-200 rounded-full animate-spin"></div>
          </div>
        )}
        <h2 className="text-lg font-bold text-slate-800">{initialUser ? 'Editar Usuário' : 'Novo Usuário (Acesso)'}</h2>
        
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5 ml-1">Nome</label>
          <input type="text" placeholder="Nome Completo" className={inputStyle} value={name} onChange={e => setName(e.target.value)} required />
        </div>
        
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5 ml-1">E-mail</label>
          <input type="email" placeholder="E-mail de Acesso" className={inputStyle} value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5 ml-1">Nível de Acesso</label>
          <select className={inputStyle} value={role} onChange={e => setRole(e.target.value as any)} required disabled={initialUser?.id === userProfile?.id}>
            <option value="operacional">Operacional</option>
            <option value="master">Master</option>
          </select>
        </div>

        {!initialUser ? (
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5 ml-1">Senha Inicial</label>
            <input type="password" placeholder="Senha (Mín. 6 caracteres)" className={inputStyle} value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
        ) : (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-sm text-slate-600 mb-3">Para alterar a senha deste usuário, clique abaixo para enviar um e-mail de redefinição de senha.</p>
            <button type="button" onClick={handleResetPassword} className="px-4 py-2 bg-white border border-slate-200 shadow-sm text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">
              Enviar Link de Redefinição
            </button>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-slate-100">
          {initialUser && onDelete && initialUser.id !== userProfile?.id && (
            <button type="button" onClick={async () => {
              try {
                await onDelete();
                toast.success('Usuário removido!');
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
