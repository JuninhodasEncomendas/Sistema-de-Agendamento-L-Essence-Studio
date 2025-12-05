
import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Plus, Trash2, Edit2, CheckCircle, XCircle, DollarSign, Calendar as CalendarIcon, Clock, TrendingUp, Users, Settings, Lock } from 'lucide-react';
import { Service, Appointment, Professional, User } from '../types';
import RegisterAdmin from './RegisterAdmin';

interface AdminDashboardProps {
  services: Service[];
  professionals: Professional[];
  appointments: Appointment[];
  currentUser: User;
  onAddService: (s: Omit<Service, 'id'>) => void;
  onUpdateService: (s: Service) => void;
  onDeleteService: (id: string) => void;
  onUpdateAppointmentStatus: (id: string, status: Appointment['status']) => void;
}

const COLORS = ['#b08d26', '#d6b063', '#96731d', '#e3ca91', '#78591a'];

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  services,
  professionals,
  appointments,
  currentUser,
  onAddService,
  onDeleteService,
  onUpdateAppointmentStatus
}) => {
  const [activeTab, setActiveTab] = useState<'appointments' | 'services' | 'analytics' | 'financial' | 'settings'>('analytics');
  const [professionalFilter, setProfessionalFilter] = useState<string>('all');
  const [financialPeriod, setFinancialPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');

  // Logic to determine if Super Admin or Regular User
  const isSuperAdmin = currentUser.username === 'Admin@Manu';

  // Determine Effective Filter: If not Super Admin, FORCE filter to own ID
  const effectiveFilter = isSuperAdmin ? professionalFilter : (currentUser.professionalId || 'all');

  // Filtered appointments for list view & calculations
  const filteredAppointments = useMemo(() => {
    let list = appointments;
    if (effectiveFilter !== 'all') {
      list = list.filter(a => a.professionalId === effectiveFilter);
    }
    return list;
  }, [appointments, effectiveFilter]);

  // Analytics Data (Based on Filtered Appointments)
  const revenueData = useMemo(() => {
    const dailyRevenue: Record<string, number> = {};
    filteredAppointments.forEach(app => {
      if (app.status !== 'cancelled') {
        const service = services.find(s => s.id === app.serviceId);
        if (service) {
          dailyRevenue[app.date] = (dailyRevenue[app.date] || 0) + service.price;
        }
      }
    });
    return Object.entries(dailyRevenue)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7); 
  }, [filteredAppointments, services]);

  const servicePopularity = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredAppointments.forEach(app => {
      const serviceName = services.find(s => s.id === app.serviceId)?.name || 'Unknown';
      counts[serviceName] = (counts[serviceName] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [filteredAppointments, services]);

  const totalRevenue = useMemo(() => {
    return filteredAppointments
      .filter(a => a.status !== 'cancelled')
      .reduce((acc, curr) => {
        const s = services.find(s => s.id === curr.serviceId);
        return acc + (s?.price || 0);
      }, 0);
  }, [filteredAppointments, services]);

  // Financial Logic by Professional (Filtered by Permission)
  const professionalPerformance = useMemo(() => {
    const now = new Date();
    const isInPeriod = (dateStr: string) => {
      const d = new Date(dateStr);
      if (financialPeriod === 'day') return d.toDateString() === now.toDateString();
      if (financialPeriod === 'week') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return d >= oneWeekAgo && d <= now;
      }
      if (financialPeriod === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (financialPeriod === 'year') return d.getFullYear() === now.getFullYear();
      return true;
    };

    // Filter professionals list: If super admin, all. If regular, only self.
    const relevantProfessionals = isSuperAdmin 
      ? professionals 
      : professionals.filter(p => p.id === currentUser.professionalId);

    return relevantProfessionals.map(pro => {
      const proApps = appointments.filter(a => 
        a.professionalId === pro.id && 
        a.status === 'confirmed' && 
        isInPeriod(a.date)
      );

      const totalValue = proApps.reduce((acc, curr) => {
        const s = services.find(srv => srv.id === curr.serviceId);
        return acc + (s?.price || 0);
      }, 0);

      return {
        id: pro.id,
        name: pro.name,
        role: pro.role,
        count: proApps.length,
        total: totalValue
      };
    }).sort((a, b) => b.total - a.total);

  }, [appointments, professionals, services, financialPeriod, isSuperAdmin, currentUser.professionalId]);


  // Form State for new Service
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price: '',
    durationMinutes: '',
    category: 'hair'
  });

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    onAddService({
      name: newService.name,
      description: newService.description,
      price: Number(newService.price),
      durationMinutes: Number(newService.durationMinutes),
      category: newService.category as any
    });
    setNewService({ name: '', description: '', price: '', durationMinutes: '', category: 'hair' });
  };

  return (
    <div className="bg-white rounded-sm shadow-sm border border-primary-100 p-6 min-h-[600px]">
      <div className="flex flex-col xl:flex-row justify-between items-center mb-8 border-b pb-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-gray-800">Painel Administrativo</h2>
          <div className="flex items-center gap-2 text-primary-600 font-light tracking-wide mt-1">
             <span className="font-bold">{currentUser.name}</span>
             {isSuperAdmin ? <span className="text-xs bg-primary-100 px-2 py-0.5 rounded-full">Super Admin</span> : <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">Profissional</span>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 xl:mt-0 justify-center">
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-sm transition-colors text-sm font-medium tracking-wide ${activeTab === 'analytics' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            DASHBOARD
          </button>
          <button 
            onClick={() => setActiveTab('financial')}
            className={`px-4 py-2 rounded-sm transition-colors text-sm font-medium tracking-wide flex items-center gap-2 ${activeTab === 'financial' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <TrendingUp size={16}/> DESEMPENHO
          </button>
          <button 
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-2 rounded-sm transition-colors text-sm font-medium tracking-wide ${activeTab === 'appointments' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            AGENDAMENTOS
          </button>
          <button 
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2 rounded-sm transition-colors text-sm font-medium tracking-wide ${activeTab === 'services' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            SERVIÇOS
          </button>
          {isSuperAdmin && (
            <button 
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-sm transition-colors text-sm font-medium tracking-wide flex items-center gap-2 ${activeTab === 'settings' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <Settings size={16}/> ACESSO
            </button>
          )}
        </div>
      </div>

      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-primary-50 to-white p-6 rounded-sm border border-primary-100 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary-100 rounded-full text-primary-600">
                  <DollarSign size={24} />
                </div>
                <h3 className="font-semibold text-gray-700">
                  {isSuperAdmin ? 'Receita Total' : 'Minha Receita'}
                </h3>
              </div>
              <p className="text-3xl font-bold text-gray-900 font-serif">R$ {totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-sm border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gray-200 rounded-full text-gray-600">
                  <CalendarIcon size={24} />
                </div>
                <h3 className="font-semibold text-gray-700">
                   {isSuperAdmin ? 'Total Agendamentos' : 'Meus Agendamentos'}
                </h3>
              </div>
              <p className="text-3xl font-bold text-gray-900 font-serif">{filteredAppointments.length}</p>
            </div>
            <div className="bg-gradient-to-br from-primary-50 to-white p-6 rounded-sm border border-primary-100 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary-100 rounded-full text-primary-600">
                  <CheckCircle size={24} />
                </div>
                <h3 className="font-semibold text-gray-700">Taxa de Conclusão</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900 font-serif">
                {filteredAppointments.length ? Math.round((filteredAppointments.filter(a => a.status === 'confirmed' || a.status === 'completed').length / filteredAppointments.length) * 100) : 0}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-sm border border-primary-100 shadow-sm">
              <h3 className="text-lg font-bold mb-6 text-gray-800 font-serif">Receita Recente</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="date" />
                    <YAxis prefix="R$ " />
                    <Tooltip formatter={(value) => `R$ ${value}`} contentStyle={{ borderColor: '#b08d26' }} />
                    <Bar dataKey="amount" fill="#b08d26" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-sm border border-primary-100 shadow-sm">
              <h3 className="text-lg font-bold mb-6 text-gray-800 font-serif">Serviços Mais Procurados</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={servicePopularity}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {servicePopularity.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderColor: '#b08d26' }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'financial' && (
        <div className="animate-fade-in space-y-6">
           <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-primary-50 p-4 rounded-lg border border-primary-100">
             <div className="flex items-center gap-2">
                <div className="p-2 bg-white rounded-full text-primary-600 shadow-sm">
                  <TrendingUp size={20}/> 
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">
                    {isSuperAdmin ? 'Desempenho Profissional' : 'Meu Desempenho'}
                  </h3>
                  <p className="text-xs text-gray-500">Valores baseados em agendamentos confirmados</p>
                </div>
             </div>
             
             <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
               {(['day', 'week', 'month', 'year'] as const).map((period) => (
                 <button
                    key={period}
                    onClick={() => setFinancialPeriod(period)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${financialPeriod === period ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-500 hover:text-primary-600'}`}
                 >
                    {period === 'day' && 'Hoje'}
                    {period === 'week' && 'Semana'}
                    {period === 'month' && 'Mês'}
                    {period === 'year' && 'Ano'}
                 </button>
               ))}
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             {professionalPerformance.map((pro) => (
               <div key={pro.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                       <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 border-2 border-white shadow-sm">
                          <Users size={20}/>
                       </div>
                       <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                         {pro.count} atendimentos
                       </span>
                    </div>
                    
                    <h3 className="font-bold text-gray-800 text-lg leading-tight">{pro.name}</h3>
                    <p className="text-gray-500 text-xs uppercase tracking-wide mb-4">{pro.role}</p>
                    
                    <div className="pt-4 border-t border-gray-50">
                      <p className="text-xs text-gray-400 mb-1">Faturamento {financialPeriod === 'day' ? 'do dia' : financialPeriod === 'week' ? 'semanal' : financialPeriod === 'month' ? 'mensal' : 'anual'}</p>
                      <p className="text-2xl font-serif font-bold text-primary-600">R$ {pro.total.toFixed(2)}</p>
                    </div>
                  </div>
               </div>
             ))}
           </div>
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="space-y-4">
          {/* Only show filter if Super Admin */}
          {isSuperAdmin && (
            <div className="flex justify-end">
              <select 
                value={professionalFilter}
                onChange={(e) => setProfessionalFilter(e.target.value)}
                className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-sm focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
              >
                <option value="all">Todos os Profissionais</option>
                {professionals.map(pro => (
                  <option key={pro.id} value={pro.id}>{pro.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary-50 border-b border-primary-200">
                  <th className="p-4 font-semibold text-gray-600 font-serif">Cliente</th>
                  <th className="p-4 font-semibold text-gray-600 font-serif">Serviço/Profissional</th>
                  <th className="p-4 font-semibold text-gray-600 font-serif">Data/Hora</th>
                  <th className="p-4 font-semibold text-gray-600 font-serif">Status</th>
                  <th className="p-4 font-semibold text-gray-600 font-serif">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.sort((a,b) => b.createdAt - a.createdAt).map(app => (
                  <tr key={app.id} className="border-b hover:bg-gray-50 border-gray-100">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{app.customerName}</div>
                      <div className="text-sm text-gray-500">{app.customerPhone}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-gray-900 font-medium">{services.find(s => s.id === app.serviceId)?.name || 'Removido'}</div>
                      <div className="text-xs text-primary-600 flex items-center gap-1 mt-1">
                        <Users size={10}/>
                        {professionals.find(p => p.id === app.professionalId)?.name || 'N/A'}
                      </div>
                    </td>
                    <td className="p-4 text-gray-700">
                      {new Date(app.date).toLocaleDateString('pt-BR')} às {app.time}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${app.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                          app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {app.status === 'confirmed' ? 'Confirmado' : app.status === 'pending' ? 'Pendente' : 'Cancelado'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => onUpdateAppointmentStatus(app.id, 'confirmed')}
                          className="p-1 text-green-600 hover:bg-green-50 rounded" 
                          title="Confirmar"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button 
                           onClick={() => onUpdateAppointmentStatus(app.id, 'cancelled')}
                          className="p-1 text-red-600 hover:bg-red-50 rounded" 
                          title="Cancelar"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAppointments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500 italic">Nenhum agendamento encontrado para este filtro.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'services' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
             {services.map(service => (
               <div key={service.id} className="flex justify-between items-center p-4 bg-white rounded-sm border border-primary-100 hover:shadow-md transition-shadow">
                 <div>
                   <h4 className="font-bold text-gray-800 font-serif">{service.name}</h4>
                   <p className="text-sm text-gray-600 font-light">{service.description}</p>
                   <div className="flex gap-4 mt-2 text-sm text-primary-600">
                     <span className="flex items-center gap-1"><Clock size={14}/> {service.durationMinutes} min</span>
                     <span className="flex items-center gap-1"><DollarSign size={14}/> R$ {service.price}</span>
                   </div>
                 </div>
                 {isSuperAdmin && (
                   <button 
                      onClick={() => onDeleteService(service.id)}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-full"
                    >
                     <Trash2 size={20} />
                   </button>
                 )}
               </div>
             ))}
          </div>
          
          <div className="bg-primary-50 p-6 rounded-sm border border-primary-200 h-fit">
            <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2 font-serif">
              {isSuperAdmin ? <Plus size={20}/> : <Lock size={20} />} 
              {isSuperAdmin ? 'Novo Serviço' : 'Gestão de Serviços'}
            </h3>
            
            {isSuperAdmin ? (
              <form onSubmit={handleAddService} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome do Serviço</label>
                  <input 
                    required
                    type="text" 
                    value={newService.name}
                    onChange={e => setNewService({...newService, name: e.target.value})}
                    className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Categoria</label>
                  <select
                    value={newService.category}
                    onChange={e => setNewService({...newService, category: e.target.value})}
                    className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 border"
                  >
                    <option value="hair">Cabelo</option>
                    <option value="nails">Unhas</option>
                    <option value="skin">Pele</option>
                    <option value="spa">Spa</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Preço (R$)</label>
                    <input 
                      required
                      type="number" 
                      value={newService.price}
                      onChange={e => setNewService({...newService, price: e.target.value})}
                      className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Duração (min)</label>
                    <input 
                      required
                      type="number" 
                      value={newService.durationMinutes}
                      onChange={e => setNewService({...newService, durationMinutes: e.target.value})}
                      className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 border"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descrição</label>
                  <textarea 
                    required
                    rows={3}
                    value={newService.description}
                    onChange={e => setNewService({...newService, description: e.target.value})}
                    className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 border"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-primary-600 text-white py-2 rounded-sm hover:bg-primary-700 transition-colors font-medium shadow-sm uppercase tracking-wider text-sm"
                >
                  Adicionar Serviço
                </button>
              </form>
            ) : (
              <div className="text-center text-gray-500 py-8 bg-white/50 rounded-lg">
                <Lock className="mx-auto mb-2 opacity-50" size={32}/>
                <p>Apenas o administrador principal pode adicionar ou remover serviços.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'settings' && isSuperAdmin && (
        <div className="animate-fade-in">
          <RegisterAdmin professionals={professionals} currentUser={currentUser} />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
