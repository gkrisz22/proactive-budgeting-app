/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { SectionHeader } from '@/components/app/SectionHeader';
import { MobileHeader } from '@/components/app/MobileHeader';
import { RuleEditor } from './RuleEditor';
import { useRules, useBatchRules } from '@/features/rules/queries';
import { useQueryClient } from '@tanstack/react-query';
import { dashboardKeys } from '@/features/dashboard/queries';
import { fmtCurrency, fmtNumber, daysInMonth } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface RuleRow {
  id: string;
  label: string;
  percentage: number;
  currency: string;
}

export function BudgetPage() {
  const { data: rules = [], isLoading } = useRules();
  const { mutate: batchRules, isPending } = useBatchRules();
  const qc = useQueryClient();

  const [income, setIncome] = useState('');
  const [rows, setRows] = useState<RuleRow[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (rules.length > 0 && !initialized) {
      setRows(rules.map((r) => ({ id: r.id, label: r.label, percentage: r.percentage, currency: r.currency })));
      setIncome(rules[0]?.monthly_income?.toString() ?? '');
      setInitialized(true);
    }
  }, [rules, initialized]);

  const sum = rows.reduce((s, r) => s + r.percentage, 0);
  const sumOk = sum === 100;
  const incomeNum = parseFloat(income) || 0;

  const now = new Date();
  const totalDays = daysInMonth(now.getFullYear(), now.getMonth());
  const dailyPreview = incomeNum > 0 ? Math.round(incomeNum / totalDays) : 0;

  function updatePct(index: number, pct: number) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, percentage: pct } : r)));
  }

  // Format income input for display
  const displayIncome = income && !isNaN(Number(income))
    ? fmtNumber(Number(income))
    : income;

  function handleIncomeChange(raw: string) {
    // Strip spaces so user can type freely
    const cleaned = raw.replace(/\s/g, '');
    if (cleaned === '' || /^\d+$/.test(cleaned)) {
      setIncome(cleaned);
    }
  }

  function handleSave() {
    if (!sumOk || isPending) return;
    batchRules(
      rows.map((r) => ({
        label: r.label,
        percentage: r.percentage,
        monthly_income: incomeNum || null,
        currency: r.currency,
      })),
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: dashboardKeys.safeToSpend() });
        },
      },
    );
  }

  return (
    <div className="space-y-5">
      <MobileHeader />

      {/* Income card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface rounded-2xl border border-c-border shadow-sm p-5"
      >
        <p className="text-xs font-semibold text-c-muted uppercase tracking-wide mb-3">Monthly income</p>
        <div className="flex items-center gap-3">
          <input
            type="text"
            inputMode="numeric"
            value={displayIncome}
            onChange={(e) => handleIncomeChange(e.target.value)}
            placeholder="0"
            className="flex-1 h-12 px-4 rounded-xl bg-surface-2 border border-c-border text-xl font-bold text-c-text tabular-nums outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
          />
          <span className="text-sm text-c-muted font-medium shrink-0">HUF / mo</span>
        </div>
        {dailyPreview > 0 && (
          <p className="text-xs text-c-muted mt-2.5">
            ≈ {fmtCurrency(dailyPreview, 'HUF')} per day
          </p>
        )}
      </motion.div>

      {/* Rules */}
      <div>
        <SectionHeader title="Budget allocation" />
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-surface-2 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {rows.map((row, i) => (
              <RuleEditor
                key={row.id}
                index={i}
                label={row.label}
                percentage={row.percentage}
                onChange={(pct) => updatePct(i, pct)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sum indicator */}
      {rows.length > 0 && (
        <motion.div
          layout
          className={cn(
            'flex items-center gap-2 px-4 py-3 rounded-xl border',
            sumOk
              ? 'bg-safe/10 border-safe/30 text-safe'
              : 'bg-danger/10 border-danger/30 text-danger',
          )}
        >
          {sumOk
            ? <Check size={16} strokeWidth={2.5} />
            : <AlertCircle size={16} strokeWidth={2.5} />}
          <span className="text-sm font-semibold">
            {sum}% allocated{!sumOk && ` — must equal 100%`}
          </span>
          {!sumOk && (
            <span className="ml-auto text-sm font-medium tabular-nums">
              {sum > 100 ? `−${sum - 100}%` : `+${100 - sum}%`}
            </span>
          )}
        </motion.div>
      )}

      {/* Save button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleSave}
        disabled={!sumOk || isPending}
        className="w-full h-13 rounded-xl bg-brand text-white font-semibold text-base tracking-tighter-1 disabled:opacity-40 hover:bg-brand-mid transition-all shadow-md shadow-brand/20"
      >
        {isPending ? 'Saving…' : 'Save budget'}
      </motion.button>
    </div>
  );
}
