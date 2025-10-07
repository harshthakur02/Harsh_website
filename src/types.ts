export interface User {
  id: string;
  email: string;
  fullName: string;
  userType: 'freelancer' | 'client';
  bio?: string;
  avatarUrl?: string;
  skills?: string[];
  hourlyRate?: number;
  createdAt: string;
}

export interface Service {
  id: string;
  freelancerId: string;
  freelancerName: string;
  title: string;
  description: string;
  category: string;
  price: number;
  deliveryDays: number;
  isActive: boolean;
  createdAt: string;
}

export interface Booking {
  id: string;
  serviceId: string;
  serviceTitle: string;
  clientId: string;
  clientName: string;
  freelancerId: string;
  freelancerName: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  message: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}
