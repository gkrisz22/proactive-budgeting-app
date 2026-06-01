import { Card } from './Card';
import { Badge } from './Badge';
import { ProgressBar } from './ProgressBar';
import { AmountDisplay } from './AmountDisplay';
import { paceInfo, daysElapsed, daysInMonth } from '@/lib/formatters';
import type { EnrichedRule } from '@/types/api';
import { cn } from '@/lib/utils';

const toneIconBg: Record<string, string> = {
  safe:    'bg-safe/12 dark:bg-safe/20',
  warn:    'bg-warn/12 dark:bg-warn/20',
  danger:  'bg-danger/12 dark:bg-danger/20',
  brand:   'bg-brand/12 dark:bg-brand/20',
  neutral: 'bg-surface-2',
};

interface CategoryCardProps {
  rule: EnrichedRule;
  spent: number;
  onClick: () => void;
}

export function CategoryCard({ rule, spent, onClick }: CategoryCardProps) {
  const today = new Date();
  const elapsed = daysElapsed();
  const total = daysInMonth(today.getFullYear(), today.getMonth());
  const income = rule.monthly_income ?? 0;
  const limit = income * rule.percentage / 100;
  const pace = paceInfo(spent, limit, elapsed, total);
  const pctSpent = limit > 0 ? (spent / limit) * 100 : 0;
  const remaining = Math.max(0, limit - spent);

  return (
    <Card onClick={onClick} padding="p-4">
      {/* Header row */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0',
            toneIconBg[pace.tone] ?? toneIconBg.neutral,
          )}
        >
          {rule.category?.icon ?? '📂'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-c-text tracking-tighter-1 truncate">{rule.label}</p>
          <p className="text-xs text-c-muted">{rule.percentage}% · <AmountDisplay amount={limit} currency={rule.currency} size="sm" /></p>
        </div>
        <div className="text-right shrink-0">
          <AmountDisplay amount={spent} currency={rule.currency} size="sm" tone={pace.tone} />
          <div className="mt-1">
            <Badge tone={pace.tone}>{pace.label}</Badge>
          </div>
        </div>
      </div>

      {/* Progress */}
      <ProgressBar value={pctSpent} tone={pace.tone} height={6} className="mb-2" />

      {/* Footer */}
      <div className="flex justify-between">
        <span className="text-xs text-c-muted tabular-nums">Spent: {Math.round(pctSpent)}%</span>
        <span className="text-xs text-c-muted">Remaining: <AmountDisplay amount={remaining} currency={rule.currency} size="sm" /></span>
      </div>
    </Card>
  );
}
