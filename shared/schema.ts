import { Timestamp } from "firebase/firestore";

// Tipos base para os dados que vêm do Firebase
export interface Client {
  id: string;
  name: string;
  cpf: string;
  email?: string;
  phone: string;
  notes?: string;
  points: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: string;
  points: number;
  imageUrl?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  clientId: string;
  serviceId: string;
  date: Date;
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";
  paymentMethod?: "cash" | "pix" | "card" | "credit";
  paymentStatus?: "pending" | "paid";
  notes?: string;
  price: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GalleryImage {
    id: string;
    url: string;
    title?: string;
    description?: string;
    category?: string;
    createdAt: Date;
}

// Tipos para dados que serão inseridos (sem id, com Timestamps do Firebase)
export type InsertClient = Omit<Client, 'id' | 'createdAt' | 'updatedAt'> & {
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
};

export type InsertService = Omit<Service, 'id' | 'createdAt' | 'updatedAt'> & {
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
};

export type InsertAppointment = Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'> & {
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
    date: Date; // Garantir que a data seja um objeto Date
};

export type InsertGalleryImage = Omit<GalleryImage, 'id' | 'createdAt'> & {
    createdAt?: Timestamp;
};


// Tipos estendidos para incluir dados relacionados
export type AppointmentWithDetails = Appointment & {
  client: Client;
  service: Service;
};
