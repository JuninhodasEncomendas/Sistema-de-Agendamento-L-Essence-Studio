
export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  category: 'hair' | 'nails' | 'skin' | 'spa';
}

export interface Professional {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface Appointment {
  id: string;
  serviceId: string;
  professionalId: string; // New field
  customerName: string;
  customerPhone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid';
  createdAt: number;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface User {
  username: string;
  password: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  professionalId?: string; // Link to the Professional ID
}
