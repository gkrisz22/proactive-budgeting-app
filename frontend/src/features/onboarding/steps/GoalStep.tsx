interface GoalStepProps {
  goalName: string;
  goalTarget: string;
  onChangeName: (v: string) => void;
  onChangeTarget: (v: string) => void;
  onSkip: () => void;
  onFinish: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export function GoalStep({
  goalName, goalTarget, onChangeName, onChangeTarget,
  onSkip, onFinish, onBack, isSubmitting,
}: GoalStepProps) {
  return (
    <div className="animate-in slide-in-from-right-4 duration-[280ms]">
      <button onClick={onBack} className="flex items-center gap-1.5 text-brand text-base font-medium mb-6">
        <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
          <path d="M7 1L1 7l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back
      </button>

      <p className="text-sm font-semibold text-c-muted mb-1">Step 4 of 4</p>
      <h2 className="text-2xl font-bold text-c-text tracking-tighter-2 mb-2">Add a savings goal</h2>
      <p className="text-base text-c-muted leading-relaxed mb-6">
        Optional — track progress toward something you're saving for.
      </p>

      <div className="space-y-3 mb-6">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-c-text">Goal name</label>
          <input
            type="text"
            value={goalName}
            onChange={(e) => onChangeName(e.target.value)}
            placeholder="e.g. Holiday fund"
            className="w-full h-13 px-4 rounded-md bg-surface-2 border border-c-border text-base text-c-text placeholder:text-muted-2 outline-none focus:border-brand transition-colors"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-c-text">Monthly target</label>
          <input
            type="number"
            value={goalTarget}
            onChange={(e) => onChangeTarget(e.target.value)}
            placeholder="0"
            className="w-full h-13 px-4 rounded-md bg-surface-2 border border-c-border text-base text-c-text placeholder:text-muted-2 outline-none focus:border-brand transition-colors"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onSkip}
          disabled={isSubmitting}
          className="flex-1 h-13 rounded-lg border-2 border-c-border bg-surface text-c-text font-semibold text-base disabled:opacity-45 active:scale-[0.98] transition-all"
        >
          Skip
        </button>
        <button
          onClick={onFinish}
          disabled={isSubmitting}
          className="flex-[2] h-13 rounded-lg bg-brand text-white font-semibold text-base tracking-tighter-1 disabled:opacity-45 active:scale-[0.98] transition-all"
        >
          {isSubmitting ? 'Setting up…' : "Let's go →"}
        </button>
      </div>
    </div>
  );
}
