import { apiFetch } from '@/lib/api';
import type { BudgetRuleCreate, BudgetRuleResponse, BudgetRuleUpdate } from '@/types/api';

export const rulesApi = {
  list(): Promise<BudgetRuleResponse[]> {
    return apiFetch('/rules');
  },

  create(data: BudgetRuleCreate): Promise<BudgetRuleResponse> {
    return apiFetch('/rules', { method: 'POST', body: JSON.stringify(data) });
  },

  update(id: string, data: BudgetRuleUpdate): Promise<BudgetRuleResponse> {
    return apiFetch(`/rules/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  delete(id: string): Promise<void> {
    return apiFetch(`/rules/${id}`, { method: 'DELETE' });
  },

  batch(rules: BudgetRuleCreate[]): Promise<BudgetRuleResponse[]> {
    return apiFetch('/rules/batch', { method: 'POST', body: JSON.stringify({ rules }) });
  },
};
