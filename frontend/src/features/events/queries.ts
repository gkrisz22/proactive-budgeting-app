import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from './api';
import { dashboardKeys } from '@/features/dashboard/queries';
import type { EventCreate } from '@/types/api';

export const eventKeys = {
  all: ['events'] as const,
  list: () => ['events', 'list'] as const,
};

export function useEvents() {
  return useQuery({ queryKey: eventKeys.list(), queryFn: eventsApi.list });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: EventCreate) => eventsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: eventKeys.all });
      qc.invalidateQueries({ queryKey: dashboardKeys.safeToSpend() });
    },
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: eventKeys.all });
      qc.invalidateQueries({ queryKey: dashboardKeys.safeToSpend() });
    },
  });
}
