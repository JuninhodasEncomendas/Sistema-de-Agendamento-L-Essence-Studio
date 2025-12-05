import { Service, Professional } from './types';

export const INITIAL_SERVICES: Service[] = [
  {
    id: '1',
    name: "Corte L'essence Signature",
    description: 'Corte personalizado com visagismo, lavagem relaxante e finalização premium.',
    price: 180,
    durationMinutes: 60,
    category: 'hair',
  },
  {
    id: '2',
    name: 'Coloração Global',
    description: 'Coloração completa da raiz às pontas com produtos de alta performance e proteção.',
    price: 350,
    durationMinutes: 120,
    category: 'hair',
  },
  {
    id: '3',
    name: 'Manicure Spa',
    description: 'Tratamento completo para mãos, inclui esfoliação, hidratação e esmaltação.',
    price: 65,
    durationMinutes: 45,
    category: 'nails',
  },
  {
    id: '4',
    name: 'Pedicure Relaxante',
    description: 'Cuidado especial para os pés com massagem relaxante e pedras quentes.',
    price: 75,
    durationMinutes: 60,
    category: 'nails',
  },
  {
    id: '5',
    name: 'Limpeza de Pele Profunda',
    description: 'Higienização profunda, extração de comedões e máscara calmante de ouro.',
    price: 220,
    durationMinutes: 90,
    category: 'skin',
  },
  {
    id: '6',
    name: 'Massagem Relaxante',
    description: 'Técnica sueca para alívio de tensões e relaxamento total do corpo.',
    price: 180,
    durationMinutes: 60,
    category: 'spa',
  }
];

export const INITIAL_PROFESSIONALS: Professional[] = [
  { id: '1', name: 'Ana Souza', role: 'Hairstylist Senior' },
  { id: '2', name: 'Beatriz Lima', role: 'Nail Designer' },
  { id: '3', name: 'Carla Dias', role: 'Esteticista' },
  { id: '4', name: 'Daniela Rocha', role: 'Massoterapeuta' }
];

export const BUSINESS_HOURS = {
  start: 9, // 09:00
  end: 19, // Ends logic loop, allowing slots up to 18:30
  days: [2, 3, 4, 5, 6], // Tue(2) to Sat(6) (Sunday is 0, Monday is 1)
};