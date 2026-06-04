import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useRules } from '@/features/rules/queries';
import { useCategories } from '@/features/categories/queries';
import type { SafeToSpendResponse, EnrichedRule } from '@/types/api';

export const dashboardKeys = {
  safeToSpend: () => ['dashboard', 'safe-to-spend'] as const,
};

export function useSafeToSpend() {
  return useQuery({
    queryKey: dashboardKeys.safeToSpend(),
    queryFn: () => apiFetch<SafeToSpendResponse>('/dashboard/safe-to-spend'),
  });
}

export function useMergedBudgetData(): { data: EnrichedRule[]; isLoading: boolean } {
  const { data: rules = [], isLoading: rulesLoading } = useRules();
  const { data: categories = [], isLoading: catsLoading } = useCategories();

  const enriched: EnrichedRule[] = rules.map((rule) => ({
    ...rule,
    category: categories.find((c) => c.name.toLowerCase() === rule.label.toLowerCase()) ?? null,
  }));

  return { data: enriched, isLoading: rulesLoading || catsLoading };
}
