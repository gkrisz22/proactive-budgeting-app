import { cn } from '@/lib/utils';
import type { PresetRule } from '../api';

interface Preset {
  id: string;
  label: string;
  description: string;
  rules: PresetRule[];
}

const PRESETS: Preset[] = [
  {
    id: '60-20-20',
    label: '60 / 20 / 20',
    description: 'Needs, wants, and savings — balanced start',
    rules: [
      { label: 'Needs',   percentage: 60, icon: '🏠', isSavings: false },
      { label: 'Wants',   percentage: 20, icon: '✨', isSavings: false },
      { label: 'Savings', percentage: 20, icon: '🎯', isSavings: true  },
    ],
  },
  {
    id: '50-30-20',
    label: '50 / 30 / 20',
    description: 'More flexibility for lifestyle spending',
    rules: [
      { label: 'Needs',   percentage: 50, icon: '🏠', isSavings: false },
      { label: 'Wants',   percentage: 30, icon: '✨', isSavings: false },
      { label: 'Savings', percentage: 20, icon: '🎯', isSavings: true  },
    ],
  },
  {
    id: '70-20-10',
    label: '70 / 20 / 10',
    description: 'Higher essential spending, lighter savings',
    rules: [
      { label: 'Needs',   percentage: 70, icon: '🏠', isSavings: false },
      { label: 'Wants',   percentage: 20, icon: '✨', isSavings: false },
      { label: 'Savings', percentage: 10, icon: '🎯', isSavings: true  },
    ],
  },
];

interface PresetStepProps {
  selectedId: string;
  onSelect: (id: string, rules: PresetRule[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function PresetStep({ selectedId, onSelect, onNext, onBack }: PresetStepProps) {
  return (
    <div className="animate-in slide-in-from-right-4 duration-[280ms]">
      <button onClick={onBack} className="flex items-center gap-1.5 text-brand text-base font-medium mb-6">
        <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
          <path d="M7 1L1 7l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back
      </button>

      <p className="text-sm font-semibold text-c-muted mb-1">Step 3 of 4</p>
      <h2 className="text-2xl font-bold text-c-text tracking-tighter-2 mb-2">Choose your budget split</h2>
      <p className="text-base text-c-muted leading-relaxed mb-6">
        Pick a starting preset — you can adjust percentages later.
      </p>

      <div className="space-y-3 mb-6">
        {PRESETS.map((preset) => {
          const isSelected = selectedId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onSelect(preset.id, preset.rules)}
              className={cn(
                'w-full text-left rounded-lg border-2 p-4 transition-all',
                isSelected
                  ? 'border-brand bg-brand-light'
                  : 'border-c-border bg-surface hover:border-brand/40',
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-base font-bold text-c-text">{preset.label}</span>
                <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                  isSelected ? 'border-brand bg-brand' : 'border-c-border'
                )}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>
              <p className="text-sm text-c-muted mb-3">{preset.description}</p>
              <div className="flex gap-2">
                {preset.rules.map((r) => (
                  <div key={r.label} className="flex items-center gap-1.5 bg-surface-2 rounded-full px-2.5 py-1">
                    <span className="text-sm">{r.icon}</span>
                    <span className="text-xs font-semibold text-c-text">{r.percentage}%</span>
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={onNext}
        disabled={!selectedId}
        className="w-full h-13 rounded-lg bg-brand text-white font-semibold text-base tracking-tighter-1 disabled:opacity-45 active:scale-[0.98] transition-all"
      >
        Continue →
      </button>
    </div>
  );
}
