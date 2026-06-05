import { useState } from 'react';
import { Plus } from 'lucide-react';
import { EventCard } from '@/components/app/EventCard';
import { AmountDisplay } from '@/components/app/AmountDisplay';
import { SectionHeader } from '@/components/app/SectionHeader';
import { MobileHeader } from '@/components/app/MobileHeader';
import { AddEventSheet } from './AddEventSheet';
import { useEvents, useDeleteEvent } from './queries';
import { useIsDesktop } from '@/hooks/useMediaQuery';

export function EventsPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { data: events = [], isLoading } = useEvents();
  const { mutate: deleteEvent } = useDeleteEvent();
  const isDesktop = useIsDesktop();

  const totalCost = events.reduce((s, e) => s + e.estimated_cost, 0);

  return (
    <div className="space-y-5">
      <MobileHeader />

      {/* Summary */}
      <div className="bg-surface rounded-2xl border border-c-border shadow-sm p-4">
        <p className="text-sm text-c-muted mb-1">Total planned expenses</p>
        <AmountDisplay amount={totalCost} size="lg" />
        <p className="text-xs text-c-muted mt-1">{events.length} upcoming event{events.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Events list */}
      <div>
        <SectionHeader
          title="Upcoming events"
          action={{ label: '+ Add', onClick: () => setSheetOpen(true) }}
        />

        {isLoading ? (
          <div className="space-y-2">
            {[1,2,3].map((i) => <div key={i} className="h-16 rounded-lg bg-surface-2 animate-pulse" />)}
          </div>
        ) : events.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-2xl mb-2">📅</p>
            <p className="text-base font-medium text-c-text mb-1">No upcoming events</p>
            <p className="text-sm text-c-muted">Add events to factor them into your budget</p>
          </div>
        ) : (
          <div className={isDesktop ? 'grid grid-cols-2 gap-2' : 'space-y-2'}>
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onDelete={() => deleteEvent(event.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Mobile FAB */}
      {!isDesktop && (
        <button
          onClick={() => setSheetOpen(true)}
          className="fixed bottom-28 right-4 w-12 h-12 bg-gradient-to-tr from-brand to-brand-mid rounded-full flex items-center justify-center shadow-lg shadow-brand/25 active:scale-95 transition-transform z-30"
          aria-label="Add event"
        >
          <Plus size={22} className="text-white" strokeWidth={2.5} />
        </button>
      )}

      <AddEventSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
