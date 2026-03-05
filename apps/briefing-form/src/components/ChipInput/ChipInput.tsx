import { useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface ChipInputProps {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
}

export function ChipInput({ values, onChange, placeholder, hint, error }: ChipInputProps) {
  const [input, setInput] = useState('');

  function add() {
    const trimmed = input.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setInput('');
  }

  function remove(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add();
    }
    if (e.key === 'Backspace' && input === '' && values.length > 0) {
      remove(values.length - 1);
    }
  }

  return (
    <div>
      <div
        className={`flex min-h-[2.5rem] flex-wrap items-center gap-1.5 rounded-md border px-3 py-2 text-base transition-colors focus-within:ring-2 focus-within:ring-ring ${
          error ? 'border-destructive' : 'border-border'
        }`}
      >
        {values.map((val, i) => (
          <span
            key={`${val}-${i}`}
            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-sm text-primary"
          >
            {val}
            <button
              type="button"
              onClick={() => remove(i)}
              className="rounded-full p-0.5 hover:bg-primary/20 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={add}
          placeholder={values.length === 0 ? placeholder : ''}
        />
      </div>
      {hint && !error && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
