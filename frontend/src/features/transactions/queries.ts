import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsApi } from './api';
import { dashboardKeys } from '@/features/dashboard/queries';
import type { TransactionCreate } from '@/types/api';

export const txKeys = {
  all: ['transactions'] as const,
  list: (params: Record<string, string | undefined>) => ['transactions', 'list', params] as const,
  thisMonth: (categoryId?: string) => ['transactions', 'this-month', categoryId] as const,
};

function isoMonthRange(): { date_from: string; date_to: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
  return {
    date_from: `${year}-${month}-01`,
    date_to:   `${year}-${month}-${String(lastDay).padStart(2, '0')}`,
  };
}

export function useTransactions(categoryId?: string, page = 1) {
  const { date_from, date_to } = isoMonthRange();
  return useQuery({
    queryKey: txKeys.list({ category_id: categoryId, date_from, date_to, page: String(page) }),
    queryFn: () =>
      transactionsApi.list({
        page,
        page_size: 50,
        category_id: categoryId,
        date_from,
        date_to,
      }),
  });
}

/** Returns { [categoryId]: totalSpent } for all categories this month */
export function useTransactionsThisMonth() {
  const { date_from, date_to } = isoMonthRange();
  return useQuery({
    queryKey: txKeys.thisMonth(),
    queryFn: async () => {
      const result = await transactionsApi.list({ page_size: 100, date_from, date_to });
      const map: Record<string, number> = {};
      for (const tx of result.items) {
        if (tx.category_id) {
          map[tx.category_id] = (map[tx.category_id] ?? 0) + tx.amount;
        }
      }
      return map;
    },
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TransactionCreate) => transactionsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: txKeys.all });
      qc.invalidateQueries({ queryKey: dashboardKeys.safeToSpend() });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => transactionsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: txKeys.all });
      qc.invalidateQueries({ queryKey: dashboardKeys.safeToSpend() });
    },
  });
}
