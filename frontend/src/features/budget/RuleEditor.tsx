import { cn } from '@/lib/utils';

const COLORS = [
  { bg: 'bg-brand/10 dark:bg-brand/20', text: 'text-brand' },
  { bg: 'bg-safe/10 dark:bg-safe/20', text: 'text-safe' },
  { bg: 'bg-warn/10 dark:bg-warn/20', text: 'text-warn' },
  { bg: 'bg-danger/10 dark:bg-danger/20', text: 'text-danger' },
] as const;

interface RuleEditorProps {
  index: number;
  label: string;
  percentage: number;
  onChange: (pct: number) => void;
}

export function RuleEditor({ index, label, percentage, onChange }: RuleEditorProps) {
  const color = COLORS[index % COLORS.length];

  function handleChange(raw: string) {
    const n = parseInt(raw, 10);
    onChange(isNaN(n) ? 0 : Math.max(0, Math.min(100, n)));
  }

  return (
    <div className="bg-surface rounded-2xl border border-c-border shadow-sm p-4 flex items-center gap-3">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', color.bg)}>
        <span className={cn('text-sm font-bold', color.text)}>
          {label.charAt(0).toUpperCase()}
        </span>
      </div>

      <p className="flex-1 text-base font-semibold text-c-text tracking-tighter-1 truncate">
        {label}
      </p>

      <div className="flex items-center gap-1.5 shrink-0">
        <input
          type="number"
          min={0}
          max={100}
          value={percentage}
          onChange={(e) => handleChange(e.target.value)}
          className="w-16 h-10 px-2 text-right rounded-xl bg-surface-2 border border-c-border text-base font-semibold text-c-text tabular-nums outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
        />
        <span className="text-base text-c-muted">%</span>
      </div>
    </div>
  );
}
