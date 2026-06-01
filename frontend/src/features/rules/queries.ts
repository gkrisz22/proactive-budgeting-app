import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rulesApi } from './api';
import type { BudgetRuleUpdate } from '@/types/api';

export const ruleKeys = {
  all: ['rules'] as const,
  list: () => ['rules', 'list'] as const,
};

export function useRules() {
  return useQuery({ queryKey: ruleKeys.list(), queryFn: rulesApi.list });
}

export function useUpdateRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BudgetRuleUpdate }) =>
      rulesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ruleKeys.all }),
  });
}

export function useDeleteRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rulesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ruleKeys.all }),
  });
}

export function useBatchRules() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: rulesApi.batch,
    onSuccess: () => qc.invalidateQueries({ queryKey: ruleKeys.all }),
  });
}
