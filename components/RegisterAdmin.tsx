
import React, { useState, useEffect } from 'react';
import { UserPlus, User, Lock, Trash2, Shield, Mail, Phone, FileText, Briefcase } from 'lucide-react';
import { User as UserType, Professional } from '../types';

interface RegisterAdminProps {
  professionals: Professional[];
  currentUser: UserType;
}

const RegisterAdmin: React.FC<RegisterAdminProps> = ({ professionals, currentUser }) => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    cpf: '',
    phone: '',
    password: '',
    confirmPassword: '',
    professionalId: ''
  });
  const [users, setUsers] = useState<UserType[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isSuperAdmin = currentUser.username === 'Admin@Manu';

  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem('lessence_users') || '[]');
    setUsers(savedUsers);
  }, []);

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

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    if (field === 'cpf') formattedValue = formatCPF(value);
    if (field === 'phone') formattedValue = formatPhone(value);
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.username || !formData.password || !formData.email || !formData.cpf || !formData.phone || !formData.professionalId) {
      setError('Preencha todos os campos e vincule um profissional.');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (users.find(u => u.username === formData.username)) {
      setError('Este usuário já existe.');
      return;
    }

    const newUser: UserType = {
      name: formData.name,
      username: formData.username,
      email: formData.email,
      cpf: formData.cpf,
      phone: formData.phone,
      password: formData.password,
      professionalId: formData.professionalId
    };

    const updatedUsers = [...users, newUser];
    localStorage.setItem('lessence_users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    
    setSuccess('Administrador cadastrado com sucesso!');
    setFormData({ name: '', username: '', email: '', cpf: '', phone: '', password: '', confirmPassword: '', professionalId: '' });
  };

  const handleDelete = (usernameToDelete: string) => {
    if (window.confirm(`Tem certeza que deseja remover o acesso de ${usernameToDelete}?`)) {
      const updatedUsers = users.filter(u => u.username !== usernameToDelete);
      localStorage.setItem('lessence_users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Formulário de Cadastro */}
      <div className="bg-white p-6 rounded-lg border border-primary-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary-50 rounded-full text-primary-600">
             <UserPlus size={24} />
          </div>
          <div>
            <h3 className="text-lg font-serif font-bold text-gray-800">Novo Usuário</h3>
            <p className="text-sm text-gray-500">Cadastre um profissional para acesso ao sistema.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm border border-red-100">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4 text-sm border border-green-100">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nome Completo</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                type="text"
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                className="pl-9 block w-full rounded-md border-gray-300 border p-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                placeholder="Nome do colaborador"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Vincular Profissional</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <select
                value={formData.professionalId}
                onChange={e => handleInputChange('professionalId', e.target.value)}
                className="pl-9 block w-full rounded-md border-gray-300 border p-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white"
              >
                <option value="">Selecione o profissional...</option>
                {professionals.map(p => (
                  <option key={p.id} value={p.id}>{p.name} - {p.role}</option>
                ))}
              </select>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Este usuário verá apenas os dados deste profissional.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Usuário de Acesso</label>
              <div className="relative">
                <Shield className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="text"
                  value={formData.username}
                  onChange={e => handleInputChange('username', e.target.value)}
                  className="pl-9 block w-full rounded-md border-gray-300 border p-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  placeholder="usuario.login"
                />
              </div>
            </div>
             <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  className="pl-9 block w-full rounded-md border-gray-300 border p-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>
          </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">CPF</label>
              <div className="relative">
                <FileText className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="text"
                  value={formData.cpf}
                  maxLength={14}
                  onChange={e => handleInputChange('cpf', e.target.value)}
                  className="pl-9 block w-full rounded-md border-gray-300 border p-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  placeholder="000.000.000-00"
                />
              </div>
            </div>
             <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Telefone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="text"
                  value={formData.phone}
                  maxLength={15}
                  onChange={e => handleInputChange('phone', e.target.value)}
                  className="pl-9 block w-full rounded-md border-gray-300 border p-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="password"
                  value={formData.password}
                  onChange={e => handleInputChange('password', e.target.value)}
                  className="pl-9 block w-full rounded-md border-gray-300 border p-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  placeholder="••••••"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Confirmar</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={e => handleInputChange('confirmPassword', e.target.value)}
                  className="pl-9 block w-full rounded-md border-gray-300 border p-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                  placeholder="••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary-600 text-white py-2.5 rounded-md font-bold shadow-sm hover:bg-primary-700 transition-colors uppercase tracking-widest text-xs mt-4"
          >
            Cadastrar Usuário
          </button>
        </form>
      </div>

      {/* Lista de Usuários - VISÍVEL APENAS PARA SUPER ADMIN */}
      {isSuperAdmin && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
           <h3 className="text-lg font-serif font-bold text-gray-800 mb-4">Administradores Ativos</h3>
           <div className="space-y-3">
              {users.length === 0 ? (
                <p className="text-gray-500 text-sm italic">Nenhum administrador cadastrado. (Usando acesso padrão admin/admin)</p>
              ) : (
                users.map((u, index) => {
                  const linkedPro = professionals.find(p => p.id === u.professionalId);
                  return (
                    <div key={index} className="bg-white p-4 rounded-md shadow-sm border border-gray-100 flex justify-between items-center">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-sm">{u.name}</p>
                            <p className="text-xs text-gray-500">@{u.username} • {linkedPro ? linkedPro.name : 'Sem vínculo'}</p>
                          </div>
                       </div>
                       <button 
                         onClick={() => handleDelete(u.username)}
                         className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                         title="Remover acesso"
                       >
                         <Trash2 size={18} />
                       </button>
                    </div>
                  );
                })
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default RegisterAdmin;
