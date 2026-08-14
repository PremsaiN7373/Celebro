interface WidgetCardProps {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function WidgetCard({ title, action, children, className = "" }: WidgetCardProps) {
  return (
    <div className={`bg-white border border-[#E9DDD5] rounded-[16px] p-6 shadow-[0_4px_20px_rgba(33,31,32,0.06)] text-[#211F20] ${className}`}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display text-lg font-bold text-[#211F20] tracking-tight">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}



