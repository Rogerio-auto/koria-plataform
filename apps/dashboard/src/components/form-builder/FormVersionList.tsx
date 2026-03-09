import { CheckCircle, FileText, Copy, Trash2, Plus, BookTemplate } from 'lucide-react';

interface ConfigItem {
  id: string;
  name: string;
  version: number;
  status: string;
  isActive: boolean;
  updatedAt: string;
}

interface FormVersionListProps {
  configs: ConfigItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onShowTemplates: () => void;
  isLoading: boolean;
}

export function FormVersionList({
  configs,
  selectedId,
  onSelect,
  onNew,
  onDuplicate,
  onDelete,
  onShowTemplates,
  isLoading,
}: FormVersionListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-md border bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {configs.map((cfg) => (
        <div
          key={cfg.id}
          onClick={() => onSelect(cfg.id)}
          className={`cursor-pointer rounded-md border p-3 transition-colors ${
            cfg.id === selectedId
              ? 'border-primary bg-primary/5'
              : 'hover:bg-muted/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="truncate text-sm font-medium">{cfg.name}</span>
            {cfg.isActive && <CheckCircle size={14} className="text-primary" />}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span>v{cfg.version}</span>
            <span>•</span>
            <span className={cfg.status === 'published' ? 'text-primary' : ''}>
              {cfg.status === 'published' ? 'Publicado' : 'Rascunho'}
            </span>
          </div>
          <div className="mt-2 flex gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onDuplicate(cfg.id); }}
              className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
              title="Duplicar"
            >
              <Copy size={12} />
            </button>
            {!cfg.isActive && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(cfg.id); }}
                className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-destructive"
                title="Excluir"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>
      ))}

      {configs.length === 0 && (
        <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
          <FileText size={24} className="mx-auto mb-2" />
          Nenhuma configuração ainda
        </div>
      )}

      <button
        onClick={onNew}
        className="flex items-center justify-center gap-2 rounded-md border border-dashed py-2 text-sm text-muted-foreground hover:bg-secondary transition-colors"
      >
        <Plus size={14} /> Novo formulário
      </button>
      <button
        onClick={onShowTemplates}
        className="flex items-center justify-center gap-2 rounded-md border py-2 text-sm text-muted-foreground hover:bg-secondary transition-colors"
      >
        <BookTemplate size={14} /> Templates
      </button>
    </div>
  );
}
