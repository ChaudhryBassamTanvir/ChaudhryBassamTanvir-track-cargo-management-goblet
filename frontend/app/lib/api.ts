const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const api = {
  getCargo: (status?: string) =>
    req<{ data: Cargo[] }>(`/cargo${status ? `?status=${status}` : ''}`),
  createCargo: (body: Partial<Cargo>) =>
    req<Cargo>('/cargo', { method: 'POST', body: JSON.stringify(body) }),
  updateStatus: (id: string, status: string, notes?: string) =>
    req<Cargo>(`/cargo/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, notes }) }),
  deleteCargo: (id: string) =>
    req(`/cargo/${id}`, { method: 'DELETE' }),
  getTrucks: () => req<Truck[]>('/trucks'),
  createTruck: (body: Partial<Truck>) =>
    req<Truck>('/trucks', { method: 'POST', body: JSON.stringify(body) })
};

export interface Cargo {
  _id: string; trackingId: string; origin: string; destination: string;
  weight: number; status: string; truck?: Truck; events: any[]; createdAt: string;
}
export interface Truck {
  _id: string; plateNumber: string; driverName: string; status: string; capacity: number;
}