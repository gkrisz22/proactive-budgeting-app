import { useQuery } from '@tanstack/react-query';
import { goalsApi } from './api';

export const goalKeys = {
  all: ['goals'] as const,
  progress: () => ['goals', 'progress'] as const,
};

export function useGoalProgress() {
  return useQuery({ queryKey: goalKeys.progress(), queryFn: goalsApi.progress });
}
