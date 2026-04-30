export interface Sheet {
  id: string;
  name: string;
  material: string;
  thickness: number;
  length: number;
  width: number;
  quantity: number;
  unit: 'm2' | 'kg' | 'units';
  supplierId: string;
  clientId: string;
  orderNumber: string;
}

export interface Client {
  id: string;
  name: string;
  city?: string;
}

export interface Supplier {
  id: string;
  name: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  active?: boolean;
  role?: 'master' | 'operacional';
}

export interface Transaction {
  id: string;
  sheetId: string;
  type: 'entry' | 'exit' | 'partial_usage';
  quantity: number;
  date: string;
  sourceClientId?: string;
  destinationClientId?: string;
  supplierId?: string;
  orderNumber?: string;
  notes?: string;
  userId?: string;
  userName?: string;
}
