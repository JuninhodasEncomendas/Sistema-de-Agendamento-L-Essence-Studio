
import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Calendar, Settings, MessageSquare, X, Send, Crown, MapPin, Clock, LogOut } from 'lucide-react';
import { Service, Appointment, ChatMessage, Professional, User } from './types';
import { INITIAL_SERVICES, INITIAL_PROFESSIONALS } from './constants';
import { generateServiceSuggestion } from './services/geminiService';
import BookingFlow from './components/BookingFlow';
import AdminDashboard from './components/AdminDashboard';
import Auth from './components/Auth';
import BrandLogo from './components/BrandLogo';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'booking' | 'admin'>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem('lessence_services');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [professionals, setProfessionals] = useState<Professional[]>(() => {
    const saved = localStorage.getItem('lessence_professionals');
    return saved ? JSON.parse(saved) : INITIAL_PROFESSIONALS;
  });
  
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('lessence_appointments');
    return saved ? JSON.parse(saved) : [];
  });

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Olá! Bem-vindo ao L\'essence Studio. Como posso ajudar a realçar sua beleza hoje?', timestamp: Date.now() }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('lessence_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('lessence_professionals', JSON.stringify(professionals));
  }, [professionals]);

  useEffect(() => {
    localStorage.setItem('lessence_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    if (chatOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, chatOpen]);

  // Auth Persistence Check
  useEffect(() => {
    const auth = sessionStorage.getItem('lessence_auth');
    const userStr = sessionStorage.getItem('lessence_current_user');
    if (auth === 'true' && userStr) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogin = (user: User) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    sessionStorage.setItem('lessence_auth', 'true');
    sessionStorage.setItem('lessence_current_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    sessionStorage.removeItem('lessence_auth');
    sessionStorage.removeItem('lessence_current_user');
    setView('home'); // Redirect to home on logout
  };

  // Handlers
  const handleBookingComplete = (newAppointment: Omit<Appointment, 'id' | 'createdAt'>) => {
    const appointment: Appointment = {
      ...newAppointment,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now()
    };
    setAppointments([...appointments, appointment]);
    setView('home');
    alert('Agendamento realizado com sucesso! Enviamos a confirmação para seu WhatsApp.');
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputMessage,
      timestamp: Date.now()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    const responseText = await generateServiceSuggestion(userMsg.text, services);

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };

    setIsTyping(false);
    setChatMessages(prev => [...prev, botMsg]);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-primary-50">
      {/* Navbar */}
      <nav className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-primary-200 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-24 items-center">
            <div 
              className="flex items-center gap-4 cursor-pointer group hover:opacity-80 transition-opacity"
              onClick={() => setView('home')}
            >
              {/* Navbar Logo Component */}
              <BrandLogo variant="navbar" className="h-16 w-16 shadow-sm rounded-sm" />
              <span className="font-serif text-2xl text-gray-800 tracking-widest hidden sm:block uppercase">L'essence STUDIO</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => setView('home')}
                className={`${view === 'home' ? 'text-primary-600 font-bold border-b-2 border-primary-600' : 'text-gray-500'} hover:text-primary-500 transition-all uppercase text-sm tracking-widest py-1`}
              >
                Início
              </button>
              <button 
                onClick={() => setView('booking')}
                className={`${view === 'booking' ? 'text-primary-600 font-bold border-b-2 border-primary-600' : 'text-gray-500'} hover:text-primary-500 transition-all uppercase text-sm tracking-widest py-1`}
              >
                Agendar
              </button>
              <button 
                onClick={() => setView('admin')}
                className={`${view === 'admin' ? 'text-primary-600 font-bold border-b-2 border-primary-600' : 'text-gray-500'} hover:text-primary-500 transition-all uppercase text-sm tracking-widest py-1`}
              >
                Admin
              </button>
              
              {/* Logout Button (Only visible if authenticated and on admin view) */}
              {isAuthenticated && (
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-500 hover:text-red-700 text-sm font-medium transition-colors ml-4 border-l pl-4 border-gray-200"
                  title="Sair do sistema"
                >
                  <LogOut size={16} /> Sair
                </button>
              )}
            </div>
            <button 
               onClick={() => setView('booking')}
               className="md:hidden bg-primary-600 text-white px-6 py-2 rounded-sm text-sm font-medium uppercase tracking-widest shadow-md"
            >
              Agendar
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {view === 'home' && (
          <div>
            {/* Hero Section */}
            <div className="relative h-[650px] flex items-center justify-center text-center overflow-hidden">
               {/* Salon Background Image */}
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center"></div>
               {/* Stronger white overlay to make the Bronze logo pop */}
               <div className="absolute inset-0 bg-white/85 backdrop-blur-[1px]"></div>
               
               <div className="relative max-w-4xl mx-auto px-4 py-12 flex flex-col items-center animate-fade-in">
                 {/* Main Hero Logo Component */}
                 <div className="mb-8 w-full max-w-[500px] h-auto transform hover:scale-105 transition-transform duration-700">
                    <BrandLogo variant="hero" className="w-full h-auto drop-shadow-xl" />
                 </div>
                 
                 <p className="text-xl md:text-2xl text-gray-800 max-w-2xl mb-4 font-serif italic tracking-wide">
                   "Sua essência, nossa arte. 🤍✨"
                 </p>
                 <p className="text-sm text-primary-700 mb-10 font-sans tracking-[0.3em] uppercase border-t border-b border-primary-300 py-2 px-8">
                   Tudo em um só lugar
                 </p>
                 
                 <button 
                   onClick={() => setView('booking')}
                   className="bg-primary-600 text-white px-12 py-4 rounded-sm text-lg font-medium shadow-xl hover:bg-primary-700 hover:shadow-2xl transition-all transform hover:-translate-y-1 tracking-[0.2em] border border-primary-500 uppercase"
                 >
                   Agendar Horário
                 </button>
               </div>
            </div>

            {/* Services Preview */}
            <div className="max-w-7xl mx-auto px-4 py-24 bg-primary-50">
              <div className="text-center mb-16">
                <span className="text-primary-600 uppercase tracking-[0.3em] text-xs font-bold block mb-2">Experiências Exclusivas</span>
                <h2 className="text-4xl font-serif font-medium text-gray-900 mb-6">Nossos Procedimentos</h2>
                <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-primary-400 to-transparent mx-auto"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {services.slice(0, 3).map(service => (
                  <div key={service.id} className="bg-white p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-primary-100 group relative overflow-hidden rounded-sm">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary-200 group-hover:bg-primary-600 transition-colors"></div>
                    <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center mb-6 text-primary-500 group-hover:bg-primary-600 group-hover:text-white transition-colors shadow-inner">
                      <Crown size={22} />
                    </div>
                    <h3 className="text-2xl font-serif font-medium text-gray-900 mb-3">{service.name}</h3>
                    <p className="text-gray-500 mb-8 leading-relaxed font-light text-sm">{service.description}</p>
                    <div className="flex justify-between items-center text-sm font-medium border-t border-gray-100 pt-6">
                      <span className="text-gray-400 flex items-center gap-2"><Clock size={16}/> {service.durationMinutes} min</span>
                      <span className="text-primary-700 text-xl font-serif">R$ {service.price}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-16">
                 <button onClick={() => setView('booking')} className="px-10 py-4 border border-primary-600 text-primary-700 font-medium hover:bg-primary-600 hover:text-white transition-colors uppercase tracking-[0.2em] text-xs shadow-sm">
                   Ver Menu Completo
                 </button>
              </div>
            </div>
          </div>
        )}

        {view === 'booking' && (
          <div className="py-12 px-4 max-w-7xl mx-auto bg-primary-50 min-h-screen animate-fade-in">
             <div className="text-center mb-12">
                <h2 className="text-3xl font-serif font-bold text-gray-800">Agende seu Momento</h2>
                <p className="text-gray-500 mt-2 font-light">Selecione o serviço e o profissional ideal para você.</p>
             </div>
             <BookingFlow 
               services={services}
               professionals={professionals}
               existingAppointments={appointments}
               onComplete={handleBookingComplete}
               onCancel={() => setView('home')}
             />
          </div>
        )}

        {view === 'admin' && (
          <div className="py-12 px-4 max-w-7xl mx-auto bg-primary-50 min-h-screen">
            {!isAuthenticated || !currentUser ? (
              <Auth onLogin={handleLogin} />
            ) : (
              <AdminDashboard 
                services={services}
                professionals={professionals}
                appointments={appointments}
                currentUser={currentUser}
                onAddService={(s) => setServices([...services, { ...s, id: Date.now().toString() }])}
                onUpdateService={(s) => setServices(services.map(srv => srv.id === s.id ? s : srv))}
                onDeleteService={(id) => setServices(services.filter(s => s.id !== id))}
                onUpdateAppointmentStatus={(id, status) => setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a))}
              />
            )}
          </div>
        )}
      </main>

      {/* AI Assistant Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {chatOpen && (
          <div className="bg-white w-80 md:w-96 rounded-lg shadow-2xl mb-4 overflow-hidden border border-primary-200 animate-slide-up flex flex-col h-[500px]">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm tracking-wide">L'essence AI</h3>
                  <p className="text-[10px] text-primary-100 uppercase tracking-wider opacity-80">Concierge Virtual</p>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="hover:bg-white/20 rounded-full p-1 transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`
                    max-w-[85%] p-3 text-sm shadow-sm
                    ${msg.role === 'user' 
                      ? 'bg-primary-600 text-white rounded-2xl rounded-tr-none' 
                      : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-none'}
                  `}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                   <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1.5">
                     <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce"></span>
                     <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce delay-100"></span>
                     <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce delay-200"></span>
                   </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100">
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={inputMessage}
                  onChange={e => setInputMessage(e.target.value)}
                  placeholder="Como podemos ajudar?"
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all"
                />
                <button 
                  type="submit" 
                  disabled={!inputMessage.trim()}
                  className="bg-primary-600 text-white p-2.5 rounded-full hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </div>
        )}
        
        <button 
          onClick={() => setChatOpen(!chatOpen)}
          className="bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 flex items-center justify-center border-4 border-white ring-1 ring-primary-100"
        >
          {chatOpen ? <X size={24}/> : <MessageSquare size={24} />}
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 border-t border-primary-800/30">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="flex flex-col mb-6">
               <span className="text-3xl font-serif font-bold tracking-widest text-primary-50">L'essence</span>
               <span className="text-xs font-light tracking-[0.6em] text-primary-500 uppercase mt-1">STUDIO</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed font-light italic border-l-2 border-primary-600 pl-4">
              "Sua essência, nossa arte."
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-xs uppercase tracking-[0.2em] text-primary-400">Horário de Atendimento</h4>
            <ul className="text-gray-400 text-sm space-y-4 font-light">
              <li className="flex justify-between border-b border-gray-800 pb-2">
                <span className="flex items-center gap-2"><Clock size={14} className="text-primary-600"/> Terça - Sábado</span> 
                <span className="text-gray-300">09:00 - 18:30</span>
              </li>
              <li className="flex justify-between border-b border-gray-800 pb-2 opacity-50">
                <span className="flex items-center gap-2"><Clock size={14}/> Dom - Seg</span> 
                <span>Fechado</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-xs uppercase tracking-[0.2em] text-primary-400">Localização</h4>
            <ul className="text-gray-400 text-sm space-y-4 font-light">
              <li className="flex gap-3 group">
                 <MapPin size={18} className="text-primary-500 flex-shrink-0 mt-1 group-hover:text-primary-400 transition-colors" />
                 <span className="leading-relaxed">Avenida Jovita Feitosa, 647.<br/>Parquelândia. Fortaleza - CE.</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-16 pt-8 border-t border-gray-800 text-center text-xs text-gray-600 tracking-wider">
          © {new Date().getFullYear()} L'essence STUDIO. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

export default App;
