import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, CreditCard, ChevronRight, Check, Loader2, Sparkles } from 'lucide-react';
import { Service, Appointment, TimeSlot, Professional } from '../types';
import { BUSINESS_HOURS } from '../constants';

interface BookingFlowProps {
  services: Service[];
  professionals: Professional[];
  existingAppointments: Appointment[];
  onComplete: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const steps = [
  { id: 1, title: 'Serviço', icon: <ChevronRight size={18} /> },
  { id: 2, title: 'Profissional', icon: <User size={18} /> },
  { id: 3, title: 'Horário', icon: <Calendar size={18} /> },
  { id: 4, title: 'Seus Dados', icon: <User size={18} /> },
  { id: 5, title: 'Pagamento', icon: <CreditCard size={18} /> },
];

const BookingFlow: React.FC<BookingFlowProps> = ({ 
  services, 
  professionals,
  existingAppointments, 
  onComplete,
  onCancel 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [generatedSlots, setGeneratedSlots] = useState<TimeSlot[]>([]);

  // Helpers to get dates for the next 7 days excluding Sundays if needed
  const availableDates = React.useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayOfWeek = d.getDay(); // 0 = Sun
      if (BUSINESS_HOURS.days.includes(dayOfWeek)) {
        dates.push(d.toISOString().split('T')[0]);
      }
    }
    return dates;
  }, []);

  // Effect to generate time slots when date is picked
  useEffect(() => {
    if (!selectedDate || !selectedProfessional) return;

    const slots: TimeSlot[] = [];
    for (let hour = BUSINESS_HOURS.start; hour < BUSINESS_HOURS.end; hour++) {
      const hourStr = hour.toString().padStart(2, '0');
      
      const time1 = `${hourStr}:00`;
      // Check availablity ONLY for the selected professional
      const isTaken1 = existingAppointments.some(
        a => a.date === selectedDate && 
             a.time === time1 && 
             a.status !== 'cancelled' &&
             a.professionalId === selectedProfessional.id
      );
      slots.push({ time: time1, available: !isTaken1 });

      const time2 = `${hourStr}:30`;
      const isTaken2 = existingAppointments.some(
         a => a.date === selectedDate && 
              a.time === time2 && 
              a.status !== 'cancelled' &&
              a.professionalId === selectedProfessional.id
      );
      slots.push({ time: time2, available: !isTaken2 });
    }
    setGeneratedSlots(slots);
  }, [selectedDate, existingAppointments, selectedProfessional]);

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);
    // Simulate API call
    setTimeout(() => {
      setIsProcessingPayment(false);
      if (selectedService && selectedProfessional) {
        onComplete({
          serviceId: selectedService.id,
          professionalId: selectedProfessional.id,
          customerName: customerInfo.name,
          customerPhone: customerInfo.phone,
          date: selectedDate,
          time: selectedTime,
          status: 'confirmed', // Immediate confirmation after "payment"
          paymentStatus: 'paid'
        });
      }
    }, 2000);
  };

  const depositAmount = selectedService ? selectedService.price * 0.5 : 0;
  const remainingAmount = selectedService ? selectedService.price - depositAmount : 0;

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden min-h-[500px] flex flex-col">
      {/* Progress Header */}
      <div className="bg-primary-50 p-6 border-b border-primary-100">
        <div className="flex justify-between items-center relative">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-0"></div>
          
          {steps.map((step) => (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div 
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors duration-300
                  ${currentStep >= step.id ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}
                `}
              >
                {step.id < currentStep ? <Check size={16} /> : <span className="text-sm">{step.id}</span>}
              </div>
              <span className={`text-[10px] sm:text-xs mt-2 font-medium hidden sm:block ${currentStep >= step.id ? 'text-primary-800' : 'text-gray-400'}`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-8 flex-1">
        {/* Step 1: Services */}
        {currentStep === 1 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-serif font-bold text-gray-800 mb-6">Selecione o Procedimento</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map(service => (
                <div 
                  key={service.id}
                  onClick={() => { setSelectedService(service); setCurrentStep(2); }}
                  className="p-4 border rounded-xl hover:border-primary-400 hover:shadow-md cursor-pointer transition-all group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-800 group-hover:text-primary-700">{service.name}</h3>
                    <span className="font-semibold text-primary-600">R$ {service.price}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{service.description}</p>
                  <div className="flex items-center text-xs text-gray-400">
                    <Clock size={12} className="mr-1" /> {service.durationMinutes} min
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Professional */}
        {currentStep === 2 && (
          <div className="animate-fade-in">
            <button onClick={() => setCurrentStep(1)} className="text-sm text-gray-500 hover:text-primary-600 mb-4 flex items-center">
              &larr; Voltar
            </button>
            <h2 className="text-2xl font-serif font-bold text-gray-800 mb-6">Escolha o Profissional</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {professionals.map(pro => (
                <div 
                  key={pro.id}
                  onClick={() => { setSelectedProfessional(pro); setCurrentStep(3); }}
                  className="flex items-center gap-4 p-4 border rounded-xl hover:border-primary-400 hover:shadow-md cursor-pointer transition-all group bg-white"
                >
                  <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                     <User size={32} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg group-hover:text-primary-700">{pro.name}</h3>
                    <p className="text-sm text-gray-500 uppercase tracking-wide text-xs">{pro.role}</p>
                    <div className="flex gap-1 mt-1 text-primary-400">
                       <Sparkles size={12} fill="currentColor"/>
                       <Sparkles size={12} fill="currentColor"/>
                       <Sparkles size={12} fill="currentColor"/>
                       <Sparkles size={12} fill="currentColor"/>
                       <Sparkles size={12} fill="currentColor"/>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Date & Time */}
        {currentStep === 3 && (
          <div className="animate-fade-in">
             <button onClick={() => setCurrentStep(2)} className="text-sm text-gray-500 hover:text-primary-600 mb-4 flex items-center">
              &larr; Voltar
            </button>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                <User size={20}/>
              </div>
              <div>
                 <p className="text-xs text-gray-500 uppercase">Profissional</p>
                 <p className="font-bold text-gray-800">{selectedProfessional?.name}</p>
              </div>
            </div>

            <h2 className="text-2xl font-serif font-bold text-gray-800 mb-6">Escolha o Horário</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {availableDates.map(date => {
                   const d = new Date(date);
                   const isSelected = selectedDate === date;
                   return (
                     <button
                        key={date}
                        onClick={() => { setSelectedDate(date); setSelectedTime(''); }}
                        className={`flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 rounded-lg border transition-all
                          ${isSelected ? 'bg-primary-600 text-white border-primary-600 shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300'}
                        `}
                     >
                       <span className="text-xs uppercase font-medium">{d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</span>
                       <span className="text-xl font-bold">{d.getDate()}</span>
                     </button>
                   );
                })}
              </div>
            </div>

            {selectedDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Horários Disponíveis</label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {generatedSlots.map((slot) => (
                    <button
                      key={slot.time}
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.time)}
                      className={`py-2 rounded text-sm font-medium transition-all
                        ${!slot.available 
                           ? 'bg-gray-100 text-gray-300 cursor-not-allowed decoration-slice' 
                           : selectedTime === slot.time 
                             ? 'bg-primary-600 text-white shadow-md' 
                             : 'bg-white border hover:border-primary-400 text-gray-700'}
                      `}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-8 flex justify-end">
              <button 
                disabled={!selectedDate || !selectedTime}
                onClick={() => setCurrentStep(4)}
                className="bg-primary-600 text-white px-8 py-3 rounded-full font-medium shadow-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                Continuar <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Customer Info */}
        {currentStep === 4 && (
          <div className="animate-fade-in max-w-md mx-auto">
             <button onClick={() => setCurrentStep(3)} className="text-sm text-gray-500 hover:text-primary-600 mb-4 flex items-center">
              &larr; Voltar
            </button>
            <h2 className="text-2xl font-serif font-bold text-gray-800 mb-2">Seus Dados</h2>
            <p className="text-gray-500 mb-6">Precisamos apenas do seu nome e contato para confirmar.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                <input 
                  type="text" 
                  value={customerInfo.name}
                  onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})}
                  className="mt-1 block w-full rounded-lg border-gray-300 border p-3 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow"
                  placeholder="Ex: Ana Silva"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Telefone / WhatsApp</label>
                <input 
                  type="tel" 
                  value={customerInfo.phone}
                  onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})}
                  className="mt-1 block w-full rounded-lg border-gray-300 border p-3 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow"
                  placeholder="(85) 99999-9999"
                />
              </div>
            </div>

            <div className="mt-8">
              <button 
                disabled={!customerInfo.name || !customerInfo.phone}
                onClick={() => setCurrentStep(5)}
                className="w-full bg-primary-600 text-white px-8 py-3 rounded-full font-medium shadow-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Ir para Pagamento
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Payment */}
        {currentStep === 5 && (
           <div className="animate-fade-in max-w-md mx-auto">
             <button onClick={() => setCurrentStep(4)} className="text-sm text-gray-500 hover:text-primary-600 mb-4 flex items-center">
              &larr; Voltar
            </button>
            <h2 className="text-2xl font-serif font-bold text-gray-800 mb-6 text-center">Pagamento do Sinal</h2>
            
            <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-200">
              <h3 className="font-bold text-gray-700 mb-2">Resumo do Pedido</h3>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Serviço:</span>
                <span className="font-medium text-gray-900">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Profissional:</span>
                <span className="font-medium text-gray-900">{selectedProfessional?.name}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Data:</span>
                <span className="font-medium text-gray-900">{new Date(selectedDate).toLocaleDateString('pt-BR')} às {selectedTime}</span>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Valor Total:</span>
                  <span>R$ {selectedService?.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-primary-700">
                  <span>Sinal para Confirmação (50%):</span>
                  <span>R$ {depositAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500 italic">
                  <span>Restante (Pagar no local):</span>
                  <span>R$ {remainingAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Número do Cartão</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 text-gray-400" size={20}/>
                  <input 
                    type="text" 
                    placeholder="0000 0000 0000 0000"
                    required
                    className="pl-10 block w-full rounded-lg border-gray-300 border p-3 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Validade</label>
                  <input 
                    type="text" 
                    placeholder="MM/AA"
                    required
                    className="block w-full rounded-lg border-gray-300 border p-3 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <input 
                    type="text" 
                    placeholder="123"
                    required
                    className="block w-full rounded-lg border-gray-300 border p-3 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isProcessingPayment}
                className="w-full bg-green-600 text-white px-8 py-3 rounded-full font-medium shadow-lg hover:bg-green-700 disabled:opacity-70 transition-all flex justify-center items-center gap-2"
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="animate-spin" size={20} /> Processando...
                  </>
                ) : (
                  <>
                    Pagar Sinal R$ {depositAmount.toFixed(2)} e Agendar
                  </>
                )}
              </button>
            </form>
            <p className="text-xs text-center text-gray-400 mt-4 flex items-center justify-center gap-1">
              <Check size={12}/> Ambiente seguro e criptografado
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingFlow;