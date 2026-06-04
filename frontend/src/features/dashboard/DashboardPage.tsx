import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { MobileHeader } from '@/components/app/MobileHeader';
import { SafeToSpendHero } from '@/components/app/SafeToSpendHero';
import { AlertBanner } from '@/components/app/AlertBanner';
import { CategoryCard } from '@/components/app/CategoryCard';
import { SavingsGoalCard } from '@/components/app/SavingsGoalCard';
import { SectionHeader } from '@/components/app/SectionHeader';
import { ProgressBar } from '@/components/app/ProgressBar';
import { AmountDisplay } from '@/components/app/AmountDisplay';
import { useSafeToSpend, useMergedBudgetData } from './queries';
import { useUnreadAlerts, useMarkAlertRead } from '@/features/alerts/queries';
import { useGoalProgress } from '@/features/goals/queries';
import { useTransactionsThisMonth } from '@/features/transactions/queries';
import { dashboardKeys } from './queries';
import { categoryKeys } from '@/features/categories/queries';
import { daysElapsed, daysInMonth } from '@/lib/formatters';

const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const } },
};

export function DashboardPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: safeToSpend, isLoading: heroLoading } = useSafeToSpend();
  const { data: enrichedRules, isLoading: rulesLoading } = useMergedBudgetData();
  const { data: unreadAlerts = [] } = useUnreadAlerts();
  const { data: goalData } = useGoalProgress();
  const { data: monthlySpentByCategory = {} } = useTransactionsThisMonth();
  const { mutate: markRead } = useMarkAlertRead();

  const income = enrichedRules[0]?.monthly_income ?? 0;
  const currency = enrichedRules[0]?.currency ?? 'HUF';
  const totalSpent = Object.values(monthlySpentByCategory).reduce((s, v) => s + v, 0);
  const spentPct = income > 0 ? (totalSpent / income) * 100 : 0;
  const spentTone = spentPct > 85 ? 'danger' : spentPct > 65 ? 'warn' : 'brand';

  const today = new Date();
  const elapsed = daysElapsed();
  const total = daysInMonth(today.getFullYear(), today.getMonth());

  // Non-savings rules for the category list
  const spendingRules = enrichedRules.filter((r) => !r.category?.is_savings_goal);
  const goals = goalData?.goals ?? [];

  function handleRefresh() {
    qc.invalidateQueries({ queryKey: dashboardKeys.safeToSpend() });
    qc.invalidateQueries({ queryKey: categoryKeys.all });
  }

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-5"
    >
      <MobileHeader />

      {/* Hero */}
      <motion.div variants={fadeUp}>
        {heroLoading ? (
          <div className="h-36 rounded-[24px] bg-surface-2 animate-pulse" />
        ) : safeToSpend ? (
          <SafeToSpendHero data={safeToSpend} />
        ) : null}
      </motion.div>

      {/* Alerts */}
      {unreadAlerts.length > 0 && (
        <motion.div variants={fadeUp} className="space-y-2">
          {unreadAlerts.slice(0, 3).map((alert) => (
            <AlertBanner key={alert.id} alert={alert} onDismiss={() => markRead(alert.id)} />
          ))}
        </motion.div>
      )}

      {/* Category cards */}
      <motion.div variants={fadeUp}>
        <SectionHeader
          title="Categories"
          action={{ label: 'Budget', onClick: () => navigate('/budget') }}
        />
        {rulesLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-surface-2 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {spendingRules.map((rule) => (
              <CategoryCard
                key={rule.id}
                rule={rule}
                spent={monthlySpentByCategory[rule.category?.id ?? ''] ?? 0}
                onClick={() => rule.category && navigate(`/categories/${rule.category.id}`)}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Savings goals */}
      {goals.length > 0 && (
        <motion.div variants={fadeUp}>
          <SectionHeader title="Savings goals" />
          <div className="space-y-2">
            {goals.map((g) => (
              <SavingsGoalCard key={g.category_id} goal={g} currency={currency} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Income summary */}
      {income > 0 && (
        <motion.div
          variants={fadeUp}
          className="bg-surface rounded-2xl border border-c-border shadow-sm p-5"
        >
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: 'Monthly income', value: income },
              { label: 'Spent', value: totalSpent },
              { label: 'Remaining', value: Math.max(0, income - totalSpent) },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-xs text-c-muted mb-1.5">{label}</p>
                <AmountDisplay amount={value} currency={currency} size="sm" />
              </div>
            ))}
          </div>
          <ProgressBar value={spentPct} tone={spentTone} height={6} className="mb-2.5" />
          <p className="text-xs text-c-muted text-right tabular-nums">
            {Math.round(spentPct)}% spent · Day {elapsed}/{total}
          </p>
        </motion.div>
      )}

      {/* Pull to refresh on mobile — just a tap area */}
      <div className="h-px" onClick={handleRefresh} />
    </motion.div>
  );
}
