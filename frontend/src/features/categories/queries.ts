import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from './api';
import type { CategoryCreate } from '@/types/api';

export const categoryKeys = {
  all: ['categories'] as const,
  list: () => ['categories', 'list'] as const,
};

export function useCategories() {
  return useQuery({ queryKey: categoryKeys.list(), queryFn: categoriesApi.list });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CategoryCreate) => categoriesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}
