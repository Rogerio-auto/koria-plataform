import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2, Asterisk } from 'lucide-react';
import { getFieldTypeInfo } from './FieldTypePicker';
import type { FieldConfig } from '@koria/types';

interface FieldCardProps {
  field: FieldConfig;
  onEdit: () => void;
  onRemove: () => void;
}

export function FieldCard({ field, onEdit, onRemove }: FieldCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const typeInfo = getFieldTypeInfo(field.type);
  const Icon = typeInfo?.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 hover:bg-muted/50 transition-colors"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-muted-foreground hover:text-foreground"
      >
        <GripVertical size={16} />
      </button>

      {Icon && <Icon size={16} className="text-muted-foreground" />}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium">{field.label['pt-BR'] || field.id}</span>
          {field.required && <Asterisk size={12} className="text-destructive" />}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded bg-secondary px-1.5 py-0.5">{typeInfo?.label ?? field.type}</span>
          {field.mapToColumn && (
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-primary">{field.mapToColumn}</span>
          )}
        </div>
      </div>

      <button onClick={onEdit} className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground">
        <Pencil size={14} />
      </button>
      <button onClick={onRemove} className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-destructive">
        <Trash2 size={14} />
      </button>
    </div>
  );
}
