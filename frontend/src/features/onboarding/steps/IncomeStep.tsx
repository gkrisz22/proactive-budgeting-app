import { fmtCurrency } from '@/lib/formatters';

interface IncomeStepProps {
  income: string;
  currency: string;
  onChange: (income: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function IncomeStep({ income, currency, onChange, onNext, onBack }: IncomeStepProps) {
  const parsed = parseFloat(income.replace(/\s/g, '')) || 0;
  const daily = parsed > 0 ? Math.round(parsed / 30) : 0;

  return (
    <div className="animate-in slide-in-from-right-4 duration-[280ms]">
      <button onClick={onBack} className="flex items-center gap-1.5 text-brand text-base font-medium mb-6">
        <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
          <path d="M7 1L1 7l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back
      </button>

      <p className="text-sm font-semibold text-c-muted mb-1">Step 2 of 4</p>
      <h2 className="text-2xl font-bold text-c-text tracking-tighter-2 mb-2">What's your monthly income?</h2>
      <p className="text-base text-c-muted leading-relaxed mb-6">
        This is used to calculate your budget allocations.
      </p>

      <div className="space-y-1.5 mb-4">
        <label className="text-sm font-medium text-c-text">Monthly income</label>
        <div className="relative">
          <input
            type="number"
            value={income}
            onChange={(e) => onChange(e.target.value)}
            placeholder="0"
            className="w-full h-13 px-4 pr-16 rounded-md bg-surface-2 border border-c-border text-base text-c-text placeholder:text-muted-2 outline-none focus:border-brand transition-colors"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-base font-medium text-c-muted">
            {currency}
          </span>
        </div>
      </div>

      {/* Live preview */}
      {daily > 0 && (
        <div className="bg-brand-light rounded-md px-4 py-3 mb-6">
          <p className="text-sm text-c-muted">Daily budget (income ÷ 30)</p>
          <p className="text-lg font-bold text-brand tracking-tighter-1">{fmtCurrency(daily, currency)}</p>
        </div>
      )}

      <button
        onClick={onNext}
        disabled={parsed <= 0}
        className="w-full h-13 rounded-lg bg-brand text-white font-semibold text-base tracking-tighter-1 disabled:opacity-45 active:scale-[0.98] transition-all"
      >
        Continue →
      </button>
    </div>
  );
}
