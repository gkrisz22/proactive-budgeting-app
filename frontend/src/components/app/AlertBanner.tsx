import { X, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AlertResponse, Tone } from '@/types/api';

const typeToTone: Record<AlertResponse['alert_type'], Tone> = {
  BREACH_PREDICTED: 'danger',
  PACE_ELEVATED:    'warn',
  EVENT_REMINDER:   'brand',
};

const toneBg: Record<Tone, string> = {
  danger:  'bg-danger-light border-danger/20',
  warn:    'bg-warn-light border-warn/20',
  brand:   'bg-brand-light border-brand/20',
  safe:    'bg-safe-light border-safe/20',
  neutral: 'bg-surface-2 border-c-border',
};

const toneIcon: Record<Tone, string> = {
  danger:  'bg-danger',
  warn:    'bg-warn',
  brand:   'bg-brand',
  safe:    'bg-safe',
  neutral: 'bg-c-muted',
};

const toneTitle: Record<AlertResponse['alert_type'], string> = {
  BREACH_PREDICTED: 'Budget breach predicted',
  PACE_ELEVATED:    'Spending pace elevated',
  EVENT_REMINDER:   'Upcoming event',
};

interface AlertBannerProps {
  alert: AlertResponse;
  onDismiss: () => void;
}

export function AlertBanner({ alert, onDismiss }: AlertBannerProps) {
  const tone = typeToTone[alert.alert_type];

  return (
    <div className={cn('flex items-start gap-3 rounded-md border px-3.5 py-3', toneBg[tone])}>
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', toneIcon[tone])}>
        <TriangleAlert size={16} className="text-white" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-semibold mb-0.5', `text-${tone}`)}>{toneTitle[alert.alert_type]}</p>
        <p className="text-xs text-c-text/75 leading-snug">{alert.message}</p>
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 text-c-muted hover:text-c-text transition-colors mt-0.5"
        aria-label="Dismiss"
      >
        <X size={14} strokeWidth={2} />
      </button>
    </div>
  );
}
