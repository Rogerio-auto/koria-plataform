import { Check } from 'lucide-react';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <nav className="w-full py-4">
      {/* Desktop: horizontal */}
      <ol className="hidden sm:flex items-center justify-between gap-2">
        {steps.map((label, i) => {
          const isCompleted = i < currentStep;
          const isCurrent = i === currentStep;

          return (
            <li key={label} className="flex flex-1 items-center last:flex-none">
              <div className="flex items-center gap-2">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    isCompleted
                      ? 'bg-primary text-primary-foreground'
                      : isCurrent
                        ? 'border-2 border-primary text-primary'
                        : 'border-2 border-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <span
                  className={`hidden md:inline text-sm whitespace-nowrap ${
                    isCurrent ? 'font-semibold text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`mx-2 h-0.5 flex-1 transition-colors ${
                    isCompleted ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Mobile: compact bar + current step label */}
      <div className="sm:hidden space-y-2">
        <div className="flex items-center gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < currentStep
                  ? 'bg-primary'
                  : i === currentStep
                    ? 'bg-primary/60'
                    : 'bg-muted'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{currentStep + 1}/{steps.length}</span>
          {' — '}
          {steps[currentStep]}
        </p>
      </div>
    </nav>
  );
}
