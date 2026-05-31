import { useQuery } from '@tanstack/react-query';
import { rulesApi } from '@/features/rules/api';
import { ruleKeys } from '@/features/rules/queries';

export function useOnboardingStatus() {
  const { data: rules, isLoading } = useQuery({
    queryKey: ruleKeys.list(),
    queryFn: rulesApi.list,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  return {
    isOnboarded: !isLoading && Array.isArray(rules) && rules.length > 0,
    isLoading,
  };
}
