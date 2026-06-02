import { Trash2 } from 'lucide-react';
import { fmtDate, fmtCurrency } from '@/lib/formatters';
import { useDeleteTransaction } from './queries';
import type { TransactionResponse } from '@/types/api';

interface TransactionListProps {
  transactions: TransactionResponse[];
  currency?: string;
}

export function TransactionList({ transactions }: TransactionListProps) {
  const { mutate: deleteTx } = useDeleteTransaction();

  if (transactions.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-2xl mb-2">🧾</p>
        <p className="text-base font-medium text-c-text mb-1">No transactions yet</p>
        <p className="text-sm text-c-muted">Tap + to add your first transaction</p>
      </div>
    );
  }

  // Group by date
  const groups = transactions.reduce<Record<string, TransactionResponse[]>>((acc, tx) => {
    const key = tx.transaction_date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(tx);
    return acc;
  }, {});

  const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-4">
      {sortedDates.map((date) => (
        <div key={date}>
          <p className="text-xs font-semibold text-c-muted uppercase mb-2">{fmtDate(date)}</p>
          <div className="bg-surface rounded-2xl border border-c-border overflow-hidden divide-y divide-c-border">
            {groups[date].map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium text-c-text truncate">
                    {tx.description ?? 'Transaction'}
                  </p>
                </div>
                <span className="text-base font-bold text-danger tracking-tighter-1 tabular-nums shrink-0">
                  −{fmtCurrency(tx.amount, tx.currency)}
                </span>
                <button
                  onClick={() => deleteTx(tx.id)}
                  className="text-c-muted hover:text-danger transition-colors shrink-0 ml-1"
                  aria-label="Delete"
                >
                  <Trash2 size={15} strokeWidth={1.8} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
