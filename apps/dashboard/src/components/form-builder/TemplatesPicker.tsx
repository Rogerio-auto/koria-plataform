import { FileText, X } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  steps: any[];
}

interface TemplatesPickerProps {
  templates: Template[];
  isLoading: boolean;
  onSelect: (template: Template) => void;
  onClose: () => void;
}

export function TemplatesPicker({ templates, isLoading, onSelect, onClose }: TemplatesPickerProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-lg border bg-card p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Templates</h3>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-secondary">
            <X size={18} />
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-md border bg-muted" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => onSelect(tpl)}
                className="w-full rounded-md border p-4 text-left transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-primary" />
                  <div>
                    <p className="font-medium">{tpl.name}</p>
                    <p className="text-sm text-muted-foreground">{tpl.description}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {tpl.steps.length} etapas · {tpl.steps.reduce((acc: number, s: any) => acc + (s.fields?.length ?? 0), 0)} campos
                    </p>
                  </div>
                </div>
              </button>
            ))}
            {templates.length === 0 && (
              <p className="text-center text-sm text-muted-foreground">Nenhum template disponível</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
