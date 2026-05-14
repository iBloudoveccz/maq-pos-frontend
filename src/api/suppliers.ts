import { api } from './axios';

export interface Supplier {
  id: string;
  code: string;
  name: string;
  ruc?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  isActive: boolean;
}

export interface CreateSupplierDto {
  code: string;
  name: string;
  ruc?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export const suppliersApi = {
  list: (search?: string): Promise<Supplier[]> =>
    api.get('/purchases/suppliers', { params: search ? { search } : {} })
       .then(r => r.data?.items ?? r.data ?? []),

  create: (dto: CreateSupplierDto): Promise<Supplier> =>
    api.post('/purchases/suppliers', dto).then(r => r.data),
};
