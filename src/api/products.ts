import type { AxiosResponse } from 'axios';
import { api } from './axios';
import type {
  Product,
  CreateProductDto,
  UpdateProductDto,
  ProductFilters,
  PaginatedProducts,
} from '@/features/products/types';

const BASE = '/products';

// Forma real del backend: { items: Product[], meta: { total, page, limit... } }
interface BackendProductsResponse {
  items: Product[];
  meta: {
    total?: number;
    totalItems?: number;
    itemCount?: number;
    itemsPerPage?: number;
    totalPages?: number;
    currentPage?: number;
    page?: number;
    limit?: number;
  };
}

function normalize(raw: BackendProductsResponse): PaginatedProducts {
  const meta = raw.meta ?? {};
  return {
    data:  raw.items ?? [],
    total: meta.total ?? meta.totalItems ?? meta.itemCount ?? 0,
    page:  meta.currentPage ?? meta.page ?? 1,
    limit: meta.itemsPerPage ?? meta.limit ?? 20,
  };
}

export const productsApi = {
  getAll: (filters?: ProductFilters): Promise<PaginatedProducts> => {
    const params: Record<string, string | number | boolean> = {};
    if (filters?.search)     params.search     = filters.search;
    if (filters?.categoryId !== undefined && filters.categoryId !== null)
                              params.categoryId = filters.categoryId;
    if (filters?.isActive !== undefined) params.isActive = filters.isActive;
    if (filters?.page)       params.page       = filters.page;
    if (filters?.limit)      params.limit      = filters.limit;
    return api.get<BackendProductsResponse>(BASE, { params })
      .then((r: AxiosResponse<BackendProductsResponse>) => normalize(r.data));
  },

  getOne: (id: string): Promise<Product> =>
    api.get<Product>(`${BASE}/${id}`).then((r: AxiosResponse<Product>) => r.data),

  create: (dto: CreateProductDto): Promise<Product> =>
    api.post<Product>(BASE, dto).then((r: AxiosResponse<Product>) => r.data),

  update: (id: string, dto: UpdateProductDto): Promise<Product> =>
    api.patch<Product>(`${BASE}/${id}`, dto).then((r: AxiosResponse<Product>) => r.data),

  delete: (id: string): Promise<void> =>
    api.delete<void>(`${BASE}/${id}`).then((r: AxiosResponse<void>) => r.data),

  toggleActive: (id: string, isActive: boolean): Promise<Product> =>
    api.patch<Product>(`${BASE}/${id}`, { isActive }).then((r: AxiosResponse<Product>) => r.data),
};
