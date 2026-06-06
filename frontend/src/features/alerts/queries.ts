import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsApi } from './api';
import type { AlertResponse } from '@/types/api';

export const alertKeys = {
  all: ['alerts'] as const,
  list: () => ['alerts', 'list'] as const,
};

export function useAlerts() {
  return useQuery({ queryKey: alertKeys.list(), queryFn: alertsApi.list });
}

export function useUnreadAlerts() {
  const { data: alerts = [], ...rest } = useAlerts();
  return { data: alerts.filter((a) => !a.is_read), ...rest };
}

export function useMarkAlertRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => alertsApi.markRead(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: alertKeys.list() });
      const prev = qc.getQueryData<AlertResponse[]>(alertKeys.list());
      qc.setQueryData<AlertResponse[]>(alertKeys.list(), (old = []) =>
        old.map((a) => (a.id === id ? { ...a, is_read: true } : a)),
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(alertKeys.list(), ctx.prev);
    },
  });
}
