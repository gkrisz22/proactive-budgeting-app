import { apiFetch } from '@/lib/api';
import type { AlertResponse } from '@/types/api';

export const alertsApi = {
  list(): Promise<AlertResponse[]> {
    return apiFetch('/alerts');
  },

  markRead(id: string): Promise<AlertResponse> {
    return apiFetch(`/alerts/${id}/read`, { method: 'PUT' });
  },
};
