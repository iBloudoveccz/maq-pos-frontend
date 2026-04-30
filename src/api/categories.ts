import type { AxiosResponse } from 'axios';
import { api } from './axios';   // named import — ajusta si tu export tiene otro nombre
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '@/features/products/types';

const BASE = '/categories';

export const categoriesApi = {
  getAll: (): Promise<Category[]> =>
    api.get<Category[]>(BASE).then((r: AxiosResponse<Category[]>) => r.data),

  getOne: (id: number): Promise<Category> =>
    api.get<Category>(`${BASE}/${id}`).then((r: AxiosResponse<Category>) => r.data),

  create: (dto: CreateCategoryDto): Promise<Category> =>
    api.post<Category>(BASE, dto).then((r: AxiosResponse<Category>) => r.data),

  update: (id: number, dto: UpdateCategoryDto): Promise<Category> =>
    api.patch<Category>(`${BASE}/${id}`, dto).then((r: AxiosResponse<Category>) => r.data),

  delete: (id: number): Promise<void> =>
    api.delete<void>(`${BASE}/${id}`).then((r: AxiosResponse<void>) => r.data),
};
