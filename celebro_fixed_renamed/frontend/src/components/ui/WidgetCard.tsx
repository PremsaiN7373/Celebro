interface WidgetCardProps {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function WidgetCard({ title, action, children, className = "" }: WidgetCardProps) {
  return (
    <div className={`card p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-ink-800 dark:text-ink-100">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}
