interface WelcomeStepProps {
  name: string;
  onChange: (name: string) => void;
  onNext: () => void;
}

export function WelcomeStep({ name, onChange, onNext }: WelcomeStepProps) {
  return (
    <div className="animate-in fade-in duration-200">
      <div className="flex justify-center mb-8">
        <div className="w-18 h-18 rounded-[20px] bg-brand flex items-center justify-center shadow-lg">
          <svg width="36" height="36" viewBox="0 0 32 32" fill="none" className="text-white">
            <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="2.5" fill="none"/>
            <path d="M16 10v6l4 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-c-text tracking-tighter-2 text-center leading-snug mb-2">
        Welcome to<br />Proactive Budgeting
      </h1>
      <p className="text-base text-c-muted text-center leading-relaxed mb-8">
        Let's set up your budget in a few quick steps.
      </p>

      <div className="space-y-1.5 mb-6">
        <label className="text-sm font-medium text-c-text">What should we call you?</label>
        <input
          type="text"
          value={name}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Your name"
          autoFocus
          className="w-full h-13 px-4 rounded-md bg-surface-2 border border-c-border text-base text-c-text placeholder:text-muted-2 outline-none focus:border-brand transition-colors"
        />
      </div>

      <button
        onClick={onNext}
        disabled={!name.trim()}
        className="w-full h-13 rounded-lg bg-brand text-white font-semibold text-base tracking-tighter-1 disabled:opacity-45 active:scale-[0.98] transition-all"
      >
        Get started →
      </button>
    </div>
  );
}
