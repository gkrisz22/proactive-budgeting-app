import { cn } from '@/lib/utils';
import type { Tone } from '@/types/api';

const toneFill: Record<Tone, string> = {
  brand:   'bg-gradient-to-r from-brand to-brand-mid',
  safe:    'bg-gradient-to-r from-safe to-[#34d399]',
  warn:    'bg-gradient-to-r from-warn to-[#fbbf24]',
  danger:  'bg-gradient-to-r from-danger to-[#fb7185]',
  neutral: 'bg-c-muted',
};

interface ProgressBarProps {
  value: number;
  max?: number;
  tone?: Tone;
  height?: number;
  className?: string;
}

export function ProgressBar({ value, max = 100, tone = 'brand', height = 6, className }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      className={cn('w-full rounded-full bg-surface-2 overflow-hidden', className)}
      style={{ height }}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-500', toneFill[tone])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
