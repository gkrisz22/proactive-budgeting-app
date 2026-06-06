import { motion } from 'framer-motion';
import { AmountDisplay } from './AmountDisplay';
import { Badge } from './Badge';
import { safeToSpendTone } from '@/lib/formatters';
import type { SafeToSpendResponse } from '@/types/api';
import { cn } from '@/lib/utils';

const toneClasses: Record<string, string> = {
  safe:    'bg-gradient-to-br from-safe/15 to-surface border border-safe/20 shadow-lg shadow-safe/5 dark:from-safe/20 dark:to-surface',
  warn:    'bg-gradient-to-br from-warn/15 to-surface border border-warn/20 shadow-lg shadow-warn/5 dark:from-warn/20 dark:to-surface',
  danger:  'bg-gradient-to-br from-danger/15 to-surface border border-danger/20 shadow-lg shadow-danger/5 dark:from-danger/20 dark:to-surface',
  neutral: 'bg-gradient-to-br from-surface-2 to-surface border border-c-border shadow-sm',
};

const toneLabel: Record<string, string> = {
  safe:    'On track',
  warn:    'Spending fast',
  danger:  'Over budget pace',
  neutral: 'No budget set',
};

interface SafeToSpendHeroProps {
  data: SafeToSpendResponse;
}

export function SafeToSpendHero({ data }: SafeToSpendHeroProps) {
  const dailyBudget = data.remaining_days > 0
    ? data.remaining_budget / data.remaining_days
    : 0;
  const tone = safeToSpendTone(data.amount, dailyBudget);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn('relative overflow-hidden rounded-[24px] px-6 pt-6 pb-7', toneClasses[tone])}
    >
      <div className="relative z-10">
        <p className="text-xs font-semibold tracking-widest uppercase text-c-muted mb-2">
          Safe to spend today
        </p>
        <AmountDisplay
          amount={Math.max(0, data.amount)}
          currency={data.currency}
          size="hero"
          tone={tone}
        />
        <div className="flex items-center gap-3 mt-4">
          <Badge tone={tone}>{toneLabel[tone]}</Badge>
          <span className="text-xs font-medium text-c-muted">{data.remaining_days} days left</span>
        </div>
      </div>
      
      {/* Decorative background glow */}
      <div 
        className={cn(
          "absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-40 pointer-events-none",
          tone === 'safe' && "bg-safe",
          tone === 'warn' && "bg-warn",
          tone === 'danger' && "bg-danger",
          tone === 'neutral' && "bg-brand"
        )} 
      />
    </motion.div>
  );
}
