import { useNavigate, useParams } from 'react-router';
import { ChevronLeft } from 'lucide-react';
import { AmountDisplay } from '@/components/app/AmountDisplay';
import { Badge } from '@/components/app/Badge';
import { ProgressBar } from '@/components/app/ProgressBar';
import { SectionHeader } from '@/components/app/SectionHeader';
import { TransactionList } from '@/features/transactions/TransactionList';
import { useTransactions, useTransactionsThisMonth } from '@/features/transactions/queries';
import { useMergedBudgetData } from '@/features/dashboard/queries';
import { paceInfo, daysElapsed, daysInMonth } from '@/lib/formatters';

export function CategoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: enrichedRules = [] } = useMergedBudgetData();
  const { data: monthlySpent = {} } = useTransactionsThisMonth();
  const { data: txPage } = useTransactions(id);

  const rule = enrichedRules.find((r) => r.category?.id === id);
  const cat = rule?.category ?? null;

  const income = rule?.monthly_income ?? 0;
  const limit  = income * (rule?.percentage ?? 0) / 100;
  const spent  = monthlySpent[id ?? ''] ?? 0;
  const today  = new Date();
  const elapsed = daysElapsed();
  const total   = daysInMonth(today.getFullYear(), today.getMonth());
  const pace    = paceInfo(spent, limit, elapsed, total);
  const pctSpent = limit > 0 ? (spent / limit) * 100 : 0;
  const currency = rule?.currency ?? 'HUF';

  const transactions = txPage?.items ?? [];

  if (!rule) {
    return (
      <div className="py-8 text-center">
        <p className="text-c-muted">Category not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-brand text-base font-medium"
      >
        <ChevronLeft size={18} strokeWidth={2} />
        Back
      </button>

      {/* Header card */}
      <div className="bg-surface rounded-2xl border border-c-border shadow-sm p-4">
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-12 h-12 rounded-[14px] flex items-center justify-center text-2xl shrink-0"
            style={{ background: `var(--c-${pace.tone}-light)` }}
          >
            {cat?.icon ?? '📂'}
          </div>
          <div>
            <h1 className="text-lg font-bold text-c-text tracking-tighter-1">{rule.label}</h1>
            <p className="text-sm text-c-muted">{rule.percentage}% of income</p>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-c-muted mb-0.5">Spent</p>
            <AmountDisplay amount={spent} currency={currency} size="lg" tone={pace.tone} />
          </div>
          <div>
            <p className="text-xs text-c-muted mb-0.5">Projected month-end</p>
            <AmountDisplay amount={pace.projected} currency={currency} size="lg" />
          </div>
        </div>

        <ProgressBar value={pctSpent} tone={pace.tone} height={8} className="mb-3" />

        <div className="flex items-center justify-between">
          <Badge tone={pace.tone}>{pace.label}</Badge>
          <span className="text-xs text-c-muted">
            Remaining: <AmountDisplay amount={Math.max(0, limit - spent)} currency={currency} size="sm" />
          </span>
        </div>
      </div>

      {/* Transaction list */}
      <div>
        <SectionHeader title={`Transactions (${transactions.length})`} />
        <TransactionList transactions={transactions} />
      </div>
    </div>
  );
}
