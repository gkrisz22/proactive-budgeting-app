import { useState } from 'react';
import { AdaptiveSheet } from '@/components/app/AdaptiveSheet';
import { Numpad } from '@/components/app/Numpad';
import { useCategories } from '@/features/categories/queries';
import { useCreateTransaction } from './queries';
import { fmtCurrency, fmtNumber } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface AddTransactionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTransactionSheet({ open, onOpenChange }: AddTransactionSheetProps) {
  const [amount, setAmount]         = useState(0);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [description, setDescription] = useState('');

  const { data: categories = [] } = useCategories();
  const { mutate: createTx, isPending } = useCreateTransaction();

  const spendingCategories = categories
    .filter((c) => !c.is_savings_goal)
    .filter(
      (category, index, all) =>
        index === all.findIndex((other) => other.name.trim().toLowerCase() === category.name.trim().toLowerCase()),
    );

  function handleSubmit() {
    if (amount === 0) return;
    createTx(
      { amount, category_id: categoryId, description: description.trim() || null },
      {
        onSuccess: () => {
          setAmount(0);
          setCategoryId(null);
          setDescription('');
          onOpenChange(false);
        },
      },
    );
  }

  return (
    <AdaptiveSheet open={open} onOpenChange={onOpenChange} title="Add transaction">
      <div className="space-y-4">
        {/* Amount display */}
        <div className="border-b border-c-border pb-4">
          <div className="flex items-end gap-2 justify-center">
            <span className="text-hero font-bold text-c-text tracking-hero tabular-nums leading-none">
              {fmtNumber(amount)}
            </span>
            <span className="text-xl font-medium text-c-muted mb-1">Ft</span>
          </div>
        </div>

        {/* Numpad */}
        <Numpad value={amount} onChange={setAmount} />

        {/* Category picker */}
        {spendingCategories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {spendingCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id === categoryId ? null : cat.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 text-sm font-medium transition-colors',
                  cat.id === categoryId
                    ? 'border-brand bg-brand-light text-brand'
                    : 'border-c-border bg-surface-2 text-c-muted',
                )}
              >
                {cat.icon && <span>{cat.icon}</span>}
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Description */}
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-c-border text-base text-c-text placeholder:text-muted-2 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
        />

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={amount === 0 || isPending}
          className="w-full h-13 rounded-xl bg-brand text-white font-semibold text-base tracking-tighter-1 disabled:opacity-40 hover:bg-brand-mid active:scale-[0.98] transition-all shadow-md shadow-brand/20"
        >
          {isPending ? 'Saving…' : `Save — ${fmtCurrency(amount)}`}
        </button>
      </div>
    </AdaptiveSheet>
  );
}
