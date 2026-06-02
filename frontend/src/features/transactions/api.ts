import { apiFetch } from '@/lib/api';
import type { PaginatedTransactions, TransactionCreate, TransactionResponse } from '@/types/api';

interface ListParams {
  page?: number;
  page_size?: number;
  category_id?: string;
  date_from?: string;
  date_to?: string;
}

export const transactionsApi = {
  list(params: ListParams = {}): Promise<PaginatedTransactions> {
    const sp = new URLSearchParams();
    if (params.page)        sp.set('page', String(params.page));
    if (params.page_size)   sp.set('page_size', String(params.page_size));
    if (params.category_id) sp.set('category_id', params.category_id);
    if (params.date_from)   sp.set('date_from', params.date_from);
    if (params.date_to)     sp.set('date_to', params.date_to);
    const qs = sp.toString();
    return apiFetch(`/transactions${qs ? `?${qs}` : ''}`);
  },

  create(data: TransactionCreate): Promise<TransactionResponse> {
    return apiFetch('/transactions', { method: 'POST', body: JSON.stringify(data) });
  },

  delete(id: string): Promise<void> {
    return apiFetch(`/transactions/${id}`, { method: 'DELETE' });
  },
};
