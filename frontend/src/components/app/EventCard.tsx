import { Trash2 } from 'lucide-react';
import { Badge } from './Badge';
import { daysUntil, fmtCurrency } from '@/lib/formatters';
import type { EventResponse } from '@/types/api';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: EventResponse;
  onDelete: () => void;
  currency?: string;
}

export function EventCard({ event, onDelete, currency = 'HUF' }: EventCardProps) {
  const days = daysUntil(event.event_date);
  const isUrgent = days <= 14;
  const tone = isUrgent ? 'warn' : 'brand';

  const eventDate = new Date(event.event_date);
  const month = eventDate.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase();
  const day   = eventDate.getDate();

  return (
    <div className="bg-surface rounded-2xl border border-c-border shadow-sm p-3.5 flex items-center gap-3">
      {/* Date tile */}
      <div className={cn(
        'w-11 h-11 rounded-xl flex flex-col items-center justify-center shrink-0',
        isUrgent ? 'bg-warn-light' : 'bg-brand-light',
      )}>
        <span className={cn('text-xs font-bold uppercase', isUrgent ? 'text-warn' : 'text-brand')}>{month}</span>
        <span className={cn('text-base font-bold leading-none', isUrgent ? 'text-warn' : 'text-brand')}>{day}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-base font-semibold text-c-text tracking-tighter-1 truncate">{event.name}</p>
        <p className="text-xs text-c-muted mt-0.5">
          {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days} days`} · {fmtCurrency(event.estimated_cost, currency)}
        </p>
      </div>

      {/* Badge + delete */}
      <div className="flex items-center gap-2 shrink-0">
        <Badge tone={tone}>{days === 0 ? 'Today' : `${days}d`}</Badge>
        <button
          onClick={onDelete}
          className="text-c-muted hover:text-danger transition-colors"
          aria-label="Delete event"
        >
          <Trash2 size={15} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}
