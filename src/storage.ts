import { User, Service, Booking } from './types';

const STORAGE_KEYS = {
  USERS: 'freelance_users',
  SERVICES: 'freelance_services',
  BOOKINGS: 'freelance_bookings',
  CURRENT_USER: 'freelance_current_user',
};

export const storage = {
  getUsers(): User[] {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },

  setUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  addUser(user: User): void {
    const users = this.getUsers();
    users.push(user);
    this.setUsers(users);
  },

  updateUser(userId: string, updates: Partial<User>): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      this.setUsers(users);
    }
  },

  getUserByEmail(email: string): User | undefined {
    return this.getUsers().find(u => u.email === email);
  },

  getUserById(id: string): User | undefined {
    return this.getUsers().find(u => u.id === id);
  },

  getCurrentUser(): User | null {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  getServices(): Service[] {
    const data = localStorage.getItem(STORAGE_KEYS.SERVICES);
    return data ? JSON.parse(data) : [];
  },

  setServices(services: Service[]): void {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
  },

  addService(service: Service): void {
    const services = this.getServices();
    services.push(service);
    this.setServices(services);
  },

  updateService(serviceId: string, updates: Partial<Service>): void {
    const services = this.getServices();
    const index = services.findIndex(s => s.id === serviceId);
    if (index !== -1) {
      services[index] = { ...services[index], ...updates };
      this.setServices(services);
    }
  },

  deleteService(serviceId: string): void {
    const services = this.getServices().filter(s => s.id !== serviceId);
    this.setServices(services);
  },

  getServicesByFreelancer(freelancerId: string): Service[] {
    return this.getServices().filter(s => s.freelancerId === freelancerId);
  },

  getActiveServices(): Service[] {
    return this.getServices().filter(s => s.isActive);
  },

  getBookings(): Booking[] {
    const data = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    return data ? JSON.parse(data) : [];
  },

  setBookings(bookings: Booking[]): void {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  },

  addBooking(booking: Booking): void {
    const bookings = this.getBookings();
    bookings.push(booking);
    this.setBookings(bookings);
  },

  updateBooking(bookingId: string, updates: Partial<Booking>): void {
    const bookings = this.getBookings();
    const index = bookings.findIndex(b => b.id === bookingId);
    if (index !== -1) {
      bookings[index] = { ...bookings[index], ...updates, updatedAt: new Date().toISOString() };
      this.setBookings(bookings);
    }
  },

  getBookingsByClient(clientId: string): Booking[] {
    return this.getBookings().filter(b => b.clientId === clientId);
  },

  getBookingsByFreelancer(freelancerId: string): Booking[] {
    return this.getBookings().filter(b => b.freelancerId === freelancerId);
  },
};
