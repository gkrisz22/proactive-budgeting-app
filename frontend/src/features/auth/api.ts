import { apiFetch } from '@/lib/api';
import type { UserResponse } from '@/types/api';

export const authApi = {
  me(): Promise<UserResponse> {
    return apiFetch('/auth/me');
  },

  login(email: string, password: string): Promise<void> {
    return apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register(email: string, password: string, display_name?: string): Promise<UserResponse> {
    return apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, display_name }),
    });
  },

  logout(): Promise<void> {
    return apiFetch('/auth/logout', { method: 'POST' });
  },

  updateMe(display_name: string): Promise<UserResponse> {
    return apiFetch('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify({ display_name }),
    });
  },
};
