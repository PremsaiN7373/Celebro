interface EmptyStateProps {
  message: string;
  hint?: string;
}

export default function EmptyState({ message, hint }: EmptyStateProps) {
  return (
    <div className="text-center py-8 px-4 rounded-2xl bg-slate-50 border border-slate-200/60">
      <p className="text-sm font-semibold text-slate-700">{message}</p>
      {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}


