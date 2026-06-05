import { apiFetch } from '@/lib/api';
import type { GoalProgressList } from '@/types/api';

export const goalsApi = {
  progress(): Promise<GoalProgressList> {
    return apiFetch('/goals/progress');
  },
};
