import type { ReactNode } from 'react';

interface FieldWrapperProps {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export function FieldWrapper({ label, error, required, children }: FieldWrapperProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
