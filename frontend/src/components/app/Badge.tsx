import { cn } from '@/lib/utils';
import type { Tone } from '@/types/api';

const toneClasses: Record<Tone, string> = {
  brand:   'bg-brand-light text-brand',
  safe:    'bg-safe-light text-safe',
  warn:    'bg-warn-light text-warn',
  danger:  'bg-danger-light text-danger',
  neutral: 'bg-surface-2 text-c-muted',
};

interface BadgeProps {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ tone = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold tracking-wide',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
