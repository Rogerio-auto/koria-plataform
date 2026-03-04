/**
 * Step indicator — shows progress through the multi-step form.
 * TODO: Implement with steps, current step highlight, completed checkmarks.
 */

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <nav className="flex items-center justify-between">
      {steps.map((step, index) => (
        <div
          key={step}
          className={`flex items-center ${
            index <= currentStep ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <span className="text-sm font-medium">{step}</span>
        </div>
      ))}
    </nav>
  );
}
