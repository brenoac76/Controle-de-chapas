import React, { useState } from 'react';
import { toast } from './Toast';
import { auth } from '../lib/firebase';
import { updatePassword } from 'firebase/auth';
import { AppUser } from '../types';

export const ProfileForm = ({ onClose, userProfile }: { onClose: () => void, userProfile: AppUser }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    
    setLoading(true);
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, password);
        toast.success('Senha atualizada com sucesso!');
        onClose();
      }
    } catch(e: any) {
      if (e.code === 'auth/requires-recent-login') {
        toast.error('Por segurança, você precisa sair e entrar novamente antes de alterar a senha.');
      } else {
        toast.error('Erro ao atualizar senha: ' + e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = "w-full p-3 border border-slate-100 bg-slate-50/50 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-200 transition-all text-sm";

  return (
    <div className="max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Meu Perfil</h2>
        
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5 ml-1">Nome</label>
          <input type="text" className={inputStyle} value={userProfile.name} disabled />
        </div>
        
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5 ml-1">E-mail</label>
          <input type="email" className={inputStyle} value={userProfile.email} disabled />
        </div>
        
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5 ml-1">Nova Senha</label>
          <input type="password" placeholder="Nova Senha (Mín. 6 caracteres)" className={inputStyle} value={password} onChange={e => setPassword(e.target.value)} required />
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-100">
          <button type="button" onClick={onClose} className="flex-1 bg-slate-100 text-slate-700 p-3 rounded-xl hover:bg-slate-200 font-medium transition-colors">Cancelar</button>
          <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 font-medium transition-colors disabled:opacity-70">Atualizar Senha</button>
        </div>
      </form>
    </div>
  );
};
