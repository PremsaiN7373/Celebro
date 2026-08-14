interface EmptyStateProps {
  message: string;
  hint?: string;
}

export default function EmptyState({ message, hint }: EmptyStateProps) {
  return (
    <div className="text-center py-6">
      <p className="text-sm text-ink-400 dark:text-ink-500">{message}</p>
      {hint && <p className="text-xs text-ink-300 dark:text-ink-600 mt-1">{hint}</p>}
    </div>
  );
}
