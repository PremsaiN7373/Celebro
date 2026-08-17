interface WidgetCardProps {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function WidgetCard({ title, action, children, className = "" }: WidgetCardProps) {
  return (
    <div className={`bg-white border border-softborder rounded-[16px] p-6 shadow-soft text-txtprimary ${className}`}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display text-lg font-bold text-txtprimary tracking-tight">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}
