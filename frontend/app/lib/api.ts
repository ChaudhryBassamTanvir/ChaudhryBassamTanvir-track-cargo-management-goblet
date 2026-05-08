const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';

const getToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem('goblet_token') : null;

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...init
  });
  if (res.status === 401) { window.location.href = '/login'; throw new Error('Unauthorized'); }
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const api = {
  login: (email: string, password: string) =>
    req<{ token: string; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (name: string, email: string, password: string, role?: string) =>
    req<{ token: string; user: User }>('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password, role }) }),
  getCargo: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return req<{ data: Cargo[]; total: number; pages: number }>(`/cargo${q}`);
  },
  createCargo: (body: Partial<Cargo>) =>
    req<Cargo>('/cargo', { method: 'POST', body: JSON.stringify(body) }),
  updateStatus: (id: string, status: string, notes?: string) =>
    req<Cargo>(`/cargo/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, notes }) }),
  deleteCargo: (id: string) => req(`/cargo/${id}`, { method: 'DELETE' }),
  getTrucks: () => req<Truck[]>('/trucks'),
  createTruck: (body: Partial<Truck>) =>
    req<Truck>('/trucks', { method: 'POST', body: JSON.stringify(body) }),
  updateTruck: (id: string, body: Partial<Truck>) =>
    req<Truck>(`/trucks/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  getDrivers: () => req<Driver[]>('/drivers'),
  createDriver: (body: Partial<Driver>) =>
    req<Driver>('/drivers', { method: 'POST', body: JSON.stringify(body) }),
  updateDriver: (id: string, body: Partial<Driver>) =>
    req<Driver>(`/drivers/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteDriver: (id: string) => req(`/drivers/${id}`, { method: 'DELETE' }),
  getSummary: () => req<Summary>('/analytics/summary'),
  getTimeline: () => req<TimelinePoint[]>('/analytics/timeline'),
};

export interface User { _id: string; name: string; email: string; role: string; }
export interface Cargo {
  _id: string; trackingId: string; origin: string; destination: string;
  weight: number; status: string; truck?: Truck; events: any[]; createdAt: string;
}
export interface Truck {
  _id: string; plateNumber: string; driverName: string; status: string;
  capacity: number; location: { lat: number; lng: number }; driver?: Driver;
}
export interface Driver {
  _id: string; name: string; phone: string; licenseNumber: string;
  status: string; assignedTruck?: Truck; totalTrips: number;
}
export interface Summary {
  cargoByStatus: { _id: string; count: number }[];
  truckByStatus: { _id: string; count: number }[];
  totalCargo: number; totalTrucks: number; totalDrivers: number;
  recentCargo: Cargo[];
}
export interface TimelinePoint { _id: string; count: number; delivered: number; }