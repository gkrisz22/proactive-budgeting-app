import { useState } from 'react';
import { AdaptiveSheet } from '@/components/app/AdaptiveSheet';
import { useCreateEvent } from './queries';

interface AddEventSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddEventSheet({ open, onOpenChange }: AddEventSheetProps) {
  const [name, setName]   = useState('');
  const [cost, setCost]   = useState('');
  const [date, setDate]   = useState('');
  const { mutate, isPending } = useCreateEvent();

  function handleSubmit() {
    if (!name.trim() || !cost || !date) return;
    mutate(
      { name: name.trim(), estimated_cost: parseFloat(cost), event_date: date },
      {
        onSuccess: () => {
          setName(''); setCost(''); setDate('');
          onOpenChange(false);
        },
      },
    );
  }

  const inputClass = "w-full h-13 px-4 rounded-xl bg-surface-2 border border-c-border text-base text-c-text placeholder:text-muted-2 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all";

  return (
    <AdaptiveSheet open={open} onOpenChange={onOpenChange} title="Add upcoming event">
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-c-text">Event name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Holiday trip" className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-c-text">Estimated cost (HUF)</label>
          <input type="number" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0" className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-c-text">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
        </div>
        <button
          onClick={handleSubmit}
          disabled={!name.trim() || !cost || !date || isPending}
          className="w-full h-13 rounded-xl bg-brand text-white font-semibold text-base tracking-tighter-1 disabled:opacity-40 hover:bg-brand-mid active:scale-[0.98] transition-all shadow-md shadow-brand/20 mt-2"
        >
          {isPending ? 'Saving…' : 'Add event'}
        </button>
      </div>
    </AdaptiveSheet>
  );
}
