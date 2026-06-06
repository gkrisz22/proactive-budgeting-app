import { cn } from '@/lib/utils';
import { fmtCurrency } from '@/lib/formatters';
import type { Tone } from '@/types/api';

const sizeClasses = {
  sm:   'text-sm font-semibold',
  md:   'text-xl font-bold tracking-tighter-1',
  lg:   'text-2xl font-bold tracking-tighter-2',
  hero: 'text-hero font-bold tracking-hero leading-none tabular-nums',
};

const toneTextClass: Record<Tone, string> = {
  brand:   'text-brand',
  safe:    'text-safe',
  warn:    'text-warn',
  danger:  'text-danger',
  neutral: 'text-c-text',
};

interface AmountDisplayProps {
  amount: number;
  currency?: string;
  size?: keyof typeof sizeClasses;
  tone?: Tone;
  className?: string;
}

export function AmountDisplay({ amount, currency = 'HUF', size = 'md', tone = 'neutral', className }: AmountDisplayProps) {
  return (
    <span className={cn(sizeClasses[size], toneTextClass[tone], 'tabular-nums', className)}>
      {fmtCurrency(amount, currency)}
    </span>
  );
}
