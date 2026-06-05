import { apiFetch } from '@/lib/api';
import type { EventCreate, EventResponse } from '@/types/api';

export const eventsApi = {
  list(): Promise<EventResponse[]> {
    return apiFetch('/events');
  },

  create(data: EventCreate): Promise<EventResponse> {
    return apiFetch('/events', { method: 'POST', body: JSON.stringify(data) });
  },

  delete(id: string): Promise<void> {
    return apiFetch(`/events/${id}`, { method: 'DELETE' });
  },
};
