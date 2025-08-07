import { cn } from 'app/lib/utils';

interface ProgressBarProps {
  value: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  size = 'md',
  showLabel = false,
  className,
}: ProgressBarProps) {
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const getColorClass = (value: number) => {
    if (value === 100) return 'bg-okron-btEdit';
    if (value > 50) return 'bg-okron-btCreate';
    return 'bg-okron-500';
  };

  return (
    <div className={cn('flex items-center gap-2  w-full', className)}>
      <div
        className={cn(
          'w-full  rounded-full overflow-hidden',
          sizeClasses[size]
        )}
      >
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out rounded-full',
            getColorClass(value)
          )}
          style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xl font-semibold text-muted-foreground min-w-[3rem] text-right">
          {Math.round(value)}%
        </span>
      )}
    </div>
  );
}
