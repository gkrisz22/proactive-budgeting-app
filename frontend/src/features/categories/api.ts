import { apiFetch } from '@/lib/api';
import type { CategoryCreate, CategoryResponse } from '@/types/api';

export const categoriesApi = {
  list(): Promise<CategoryResponse[]> {
    return apiFetch('/categories');
  },

  create(data: CategoryCreate): Promise<CategoryResponse> {
    return apiFetch('/categories', { method: 'POST', body: JSON.stringify(data) });
  },

  update(id: string, data: Partial<CategoryCreate>): Promise<CategoryResponse> {
    return apiFetch(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  delete(id: string): Promise<void> {
    return apiFetch(`/categories/${id}`, { method: 'DELETE' });
  },
};
