import {
  Type,
  FileText,
  Mail,
  Phone,
  Hash,
  Calendar,
  Link,
  List,
  CheckSquare,
  Circle,
  Tag,
  Palette,
  LinkIcon,
  Upload,
  Heading,
  Minus,
} from 'lucide-react';
import type { FieldType } from '@koria/types';

export interface FieldTypeOption {
  type: FieldType;
  label: string;
  icon: React.ElementType;
  category: string;
}

const FIELD_TYPES: FieldTypeOption[] = [
  { type: 'text', label: 'Texto curto', icon: Type, category: 'Texto' },
  { type: 'textarea', label: 'Texto longo', icon: FileText, category: 'Texto' },
  { type: 'email', label: 'E-mail', icon: Mail, category: 'Texto' },
  { type: 'tel', label: 'Telefone', icon: Phone, category: 'Texto' },
  { type: 'number', label: 'Número', icon: Hash, category: 'Texto' },
  { type: 'url', label: 'URL', icon: Link, category: 'Texto' },
  { type: 'date', label: 'Data', icon: Calendar, category: 'Seleção' },
  { type: 'select', label: 'Dropdown', icon: List, category: 'Seleção' },
  { type: 'multi-select', label: 'Múltipla escolha', icon: CheckSquare, category: 'Seleção' },
  { type: 'radio', label: 'Escolha única', icon: Circle, category: 'Seleção' },
  { type: 'checkbox', label: 'Sim/Não', icon: CheckSquare, category: 'Seleção' },
  { type: 'chips', label: 'Tags (chips)', icon: Tag, category: 'Avançado' },
  { type: 'color-picker', label: 'Cor', icon: Palette, category: 'Avançado' },
  { type: 'url-list', label: 'Lista de URLs', icon: LinkIcon, category: 'Avançado' },
  { type: 'file-upload', label: 'Upload', icon: Upload, category: 'Avançado' },
  { type: 'heading', label: 'Subtítulo', icon: Heading, category: 'Layout' },
  { type: 'divider', label: 'Divisor', icon: Minus, category: 'Layout' },
];

interface FieldTypePickerProps {
  onSelect: (type: FieldType) => void;
  onClose: () => void;
}

export function FieldTypePicker({ onSelect, onClose }: FieldTypePickerProps) {
  const categories = [...new Set(FIELD_TYPES.map((ft) => ft.category))];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-lg border bg-card p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-4 text-lg font-semibold">Adicionar campo</h3>

        {categories.map((cat) => (
          <div key={cat} className="mb-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">{cat}</p>
            <div className="grid grid-cols-3 gap-2">
              {FIELD_TYPES.filter((ft) => ft.category === cat).map((ft) => (
                <button
                  key={ft.type}
                  onClick={() => onSelect(ft.type)}
                  className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-secondary transition-colors"
                >
                  <ft.icon size={16} className="text-muted-foreground" />
                  {ft.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm text-muted-foreground hover:bg-secondary"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export function getFieldTypeInfo(type: string): FieldTypeOption | undefined {
  return FIELD_TYPES.find((ft) => ft.type === type);
}
