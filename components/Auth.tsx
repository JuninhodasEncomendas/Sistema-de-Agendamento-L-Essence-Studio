
import React, { useState } from 'react';
import { Lock, User, LogIn, ArrowLeft, ShieldCheck, FileText, Phone } from 'lucide-react';
import { User as UserType } from '../types';
import BrandLogo from './BrandLogo';

interface AuthProps {
  onLogin: (user: UserType) => void;
}

type AuthView = 'login' | 'forgot_password' | 'reset_password';

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [view, setView] = useState<AuthView>('login');
  
  // Login State
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  
  // Recovery State
  const [recoveryData, setRecoveryData] = useState({ username: '', cpf: '', phone: '' });
  
  // Reset Password State
  const [resetData, setResetData] = useState({ password: '', confirmPassword: '' });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Helpers de formatação
  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const users: UserType[] = JSON.parse(localStorage.getItem('lessence_users') || '[]');

    // Backdoor para Admin Principal (Super Admin)
    if (loginData.username === 'Admin@Manu' && loginData.password === 'Admin@Manu') {
      const superAdmin: UserType = {
        name: 'Super Admin',
        username: 'Admin@Manu',
        password: 'Admin@Manu',
        email: 'admin@lessencestudio.com',
        cpf: '000.000.000-00',
        phone: '(00) 00000-0000'
      };
      onLogin(superAdmin);
      return;
    }

    const user = users.find(u => u.username === loginData.username && u.password === loginData.password);
    if (user) {
      onLogin(user);
    } else {
      setError('Usuário ou senha incorretos.');
    }
  };

  const handleVerifyIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const users: UserType[] = JSON.parse(localStorage.getItem('lessence_users') || '[]');
    const user = users.find(u => 
      u.username === recoveryData.username && 
      u.cpf === recoveryData.cpf && 
      u.phone === recoveryData.phone
    );

    if (user) {
      setView('reset_password');
      setSuccess('Identidade confirmada. Defina sua nova senha.');
    } else {
      setError('Dados não conferem com nenhum administrador cadastrado.');
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (resetData.password !== resetData.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    const users: UserType[] = JSON.parse(localStorage.getItem('lessence_users') || '[]');
    const updatedUsers = users.map(u => {
      if (u.username === recoveryData.username) {
        return { ...u, password: resetData.password };
      }
      return u;
    });

    localStorage.setItem('lessence_users', JSON.stringify(updatedUsers));
    setSuccess('Senha redefinida com sucesso! Faça login.');
    setTimeout(() => {
      setSuccess('');
      setView('login');
      setLoginData({ username: '', password: '' });
      setRecoveryData({ username: '', cpf: '', phone: '' });
      setResetData({ password: '', confirmPassword: '' });
    }, 2000);
  };

  return (
    <div className="min-h-[500px] flex items-center justify-center bg-primary-50/50 py-12 px-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-primary-100 animate-fade-in relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-400 to-primary-600"></div>
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-24 h-24 mx-auto mb-4">
            <BrandLogo variant="icon" className="w-full h-full" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-gray-800 tracking-tight">
            {view === 'login' ? 'Acesso Restrito' : 'Recuperação'}
          </h2>
          <p className="text-gray-500 mt-2 text-sm font-light">
            {view === 'login' ? 'Área exclusiva para gestão do studio.' : 'Confirme seus dados para redefinir a senha.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm text-center border border-red-100 flex items-center justify-center gap-2 animate-pulse">
            <span>⚠️</span> {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6 text-sm text-center border border-green-100 animate-fade-in">
             {success}
          </div>
        )}

        {/* VIEW: LOGIN */}
        {view === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Usuário</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  value={loginData.username}
                  onChange={e => setLoginData({...loginData, username: e.target.value})}
                  className="pl-10 block w-full rounded-lg border-gray-300 border p-2.5 focus:ring-primary-500 focus:border-primary-500 transition-shadow outline-none focus:shadow-md"
                  placeholder="usuario.admin"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="password"
                  value={loginData.password}
                  onChange={e => setLoginData({...loginData, password: e.target.value})}
                  className="pl-10 block w-full rounded-lg border-gray-300 border p-2.5 focus:ring-primary-500 focus:border-primary-500 transition-shadow outline-none focus:shadow-md"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary-600 text-white py-3.5 rounded-lg font-bold shadow-lg hover:bg-primary-700 hover:shadow-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs mt-8 transform hover:-translate-y-0.5"
            >
              Acessar Painel <LogIn size={16} />
            </button>
            
            <div className="mt-4 text-center">
              <button 
                type="button"
                onClick={() => { setView('forgot_password'); setError(''); setSuccess(''); }}
                className="text-xs text-primary-600 hover:underline hover:text-primary-800 transition-colors"
              >
                Esqueceu a senha?
              </button>
            </div>
          </form>
        )}

        {/* VIEW: FORGOT PASSWORD (VERIFY) */}
        {view === 'forgot_password' && (
          <form onSubmit={handleVerifyIdentity} className="space-y-4">
             <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Seu Usuário</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  value={recoveryData.username}
                  onChange={e => setRecoveryData({...recoveryData, username: e.target.value})}
                  className="pl-10 block w-full rounded-lg border-gray-300 border p-2.5 focus:ring-primary-500 focus:border-primary-500 transition-shadow outline-none"
                  placeholder="usuario.admin"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Confirmar CPF</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  maxLength={14}
                  value={recoveryData.cpf}
                  onChange={e => setRecoveryData({...recoveryData, cpf: formatCPF(e.target.value)})}
                  className="pl-10 block w-full rounded-lg border-gray-300 border p-2.5 focus:ring-primary-500 focus:border-primary-500 transition-shadow outline-none"
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Confirmar Telefone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  maxLength={15}
                  value={recoveryData.phone}
                  onChange={e => setRecoveryData({...recoveryData, phone: formatPhone(e.target.value)})}
                  className="pl-10 block w-full rounded-lg border-gray-300 border p-2.5 focus:ring-primary-500 focus:border-primary-500 transition-shadow outline-none"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gray-800 text-white py-3 rounded-lg font-bold shadow-md hover:bg-gray-900 transition-all uppercase tracking-widest text-xs mt-4"
            >
              Verificar Dados
            </button>
            
            <button
              type="button"
              onClick={() => { setView('login'); setError(''); }}
              className="w-full flex items-center justify-center gap-2 text-gray-500 py-2 text-xs hover:text-primary-600 transition-colors"
            >
              <ArrowLeft size={14}/> Voltar para Login
            </button>
          </form>
        )}

        {/* VIEW: RESET PASSWORD */}
        {view === 'reset_password' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
             <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nova Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="password"
                  required
                  value={resetData.password}
                  onChange={e => setResetData({...resetData, password: e.target.value})}
                  className="pl-10 block w-full rounded-lg border-gray-300 border p-2.5 focus:ring-primary-500 focus:border-primary-500 transition-shadow outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>
             <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Confirmar Nova Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="password"
                  required
                  value={resetData.confirmPassword}
                  onChange={e => setResetData({...resetData, confirmPassword: e.target.value})}
                  className="pl-10 block w-full rounded-lg border-gray-300 border p-2.5 focus:ring-primary-500 focus:border-primary-500 transition-shadow outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-bold shadow-md hover:bg-primary-700 transition-all uppercase tracking-widest text-xs mt-4"
            >
              Salvar Nova Senha
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;
