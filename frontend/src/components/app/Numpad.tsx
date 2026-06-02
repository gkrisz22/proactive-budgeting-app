import { Delete } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NumpadProps {
  value: number;
  onChange: (v: number) => void;
}

const KEYS = ['1','2','3','4','5','6','7','8','9','000','0','⌫'] as const;

export function Numpad({ value, onChange }: NumpadProps) {
  function press(key: string) {
    if (key === '⌫') {
      onChange(Math.floor(value / 10));
    } else if (key === '000') {
      onChange(value * 1000);
    } else {
      const digit = parseInt(key, 10);
      if (value === 0) onChange(digit);
      else onChange(value * 10 + digit);
    }
  }

  return (
    <div className="grid grid-cols-3 gap-px bg-c-border rounded-lg overflow-hidden">
      {KEYS.map((key) => (
        <button
          key={key}
          type="button"
          onPointerDown={() => press(key)}
          className={cn(
            'h-14 flex items-center justify-center text-lg font-semibold text-c-text transition-colors active:bg-surface-2',
            key === '⌫' ? 'bg-surface-2' : 'bg-surface',
          )}
        >
          {key === '⌫' ? <Delete size={20} strokeWidth={1.8} className="text-c-muted" /> : key}
        </button>
      ))}
    </div>
  );
}
