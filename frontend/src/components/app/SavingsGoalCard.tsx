import { Card } from './Card';
import { ProgressBar } from './ProgressBar';
import { AmountDisplay } from './AmountDisplay';
import type { GoalProgress } from '@/types/api';

interface SavingsGoalCardProps {
  goal: GoalProgress;
  currency?: string;
}

export function SavingsGoalCard({ goal, currency = 'HUF' }: SavingsGoalCardProps) {
  const tone = goal.progress_percentage >= 100 ? 'safe' : 'brand';

  return (
    <Card padding="p-3.5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-[10px] bg-brand-light flex items-center justify-center text-lg shrink-0">
          🎯
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-c-text tracking-tighter-1 truncate">{goal.category_name}</p>
          <p className="text-xs text-c-muted">Savings goal</p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-base font-bold text-brand tracking-tighter-1">
            {Math.round(goal.progress_percentage)}%
          </span>
          <p className="text-xs text-c-muted mt-0.5">
            <AmountDisplay amount={goal.contributed} currency={currency} size="sm" /> / <AmountDisplay amount={goal.monthly_target} currency={currency} size="sm" />
          </p>
        </div>
      </div>
      <ProgressBar value={goal.progress_percentage} tone={tone} height={8} />
    </Card>
  );
}
