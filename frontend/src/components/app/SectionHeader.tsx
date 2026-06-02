interface SectionHeaderProps {
  title: string;
  action?: { label: string; onClick: () => void };
}

export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-semibold text-c-muted uppercase tracking-wide">{title}</span>
      {action && (
        <button
          onClick={action.onClick}
          className="text-sm font-semibold text-brand hover:underline"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
