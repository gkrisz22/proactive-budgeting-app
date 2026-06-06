import { rulesApi } from '@/features/rules/api';
import { categoriesApi } from '@/features/categories/api';
import { authApi } from '@/features/auth/api';
import type { BudgetRuleCreate } from '@/types/api';

export interface PresetRule {
  label: string;
  percentage: number;
  icon: string;
  isSavings: boolean;
}

export interface OnboardingPayload {
  displayName: string;
  monthlyIncome: number;
  currency: string;
  rules: PresetRule[];
  savingsGoal?: { name: string; target: number } | null;
}

export async function completeOnboarding(payload: OnboardingPayload): Promise<void> {
  // 1. Update display name
  await authApi.updateMe(payload.displayName);

  // 2. Batch-create all budget rules
  const rulesToCreate: BudgetRuleCreate[] = payload.rules.map((r) => ({
    label: r.label,
    percentage: r.percentage,
    monthly_income: payload.monthlyIncome,
    currency: payload.currency,
  }));
  await rulesApi.batch(rulesToCreate);

  // 3. Create a matching category for each rule (links by name convention)
  await Promise.all(
    payload.rules.map((r) =>
      categoriesApi.create({
        name: r.label,
        icon: r.icon,
        is_savings_goal: r.isSavings,
        monthly_target: null,
      }),
    ),
  );

  // 4. Optionally create a dedicated savings goal category
  if (payload.savingsGoal) {
    // Check if a savings category already exists from the preset; if not, create one
    const savingsCatAlreadyCreated = payload.rules.some((r) => r.isSavings);
    if (!savingsCatAlreadyCreated) {
      await categoriesApi.create({
        name: payload.savingsGoal.name,
        icon: '🎯',
        is_savings_goal: true,
        monthly_target: payload.savingsGoal.target,
      });
    }
  }
}
