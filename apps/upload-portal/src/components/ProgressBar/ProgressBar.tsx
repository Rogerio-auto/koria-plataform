interface ProgressBarProps {
  progress: number;
  className?: string;
}

export function ProgressBar({ progress, className = '' }: ProgressBarProps) {
  return (
    <div className={`overflow-hidden rounded-full bg-muted ${className}`}>
      <div
        className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  );
}
