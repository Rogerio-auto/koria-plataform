import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { FieldConfig, I18nText, FieldValidation } from '@koria/types';

interface FieldEditorProps {
  field: FieldConfig;
  onSave: (field: FieldConfig) => void;
  onClose: () => void;
}

const COLUMN_OPTIONS = [
  '', 'full_name', 'email', 'phone_number', 'instagram_personal', 'instagram_company',
  'linkedin_url', 'website_url', 'company_name', 'company_size', 'industry', 'role_in_company',
  'property_name', 'property_address', 'property_units', 'property_unit_sizes',
  'property_differentials', 'brand_colors', 'communication_tone', 'visual_references',
  'target_audience', 'main_emotion', 'mandatory_elements', 'elements_to_avoid',
  'price_range', 'payment_conditions', 'launch_date', 'realtor_contact',
  'voiceover_text', 'music_preference', 'legal_disclaimers', 'additional_notes',
  'how_found_us', 'budget_range', 'project_type', 'project_goal', 'project_description', 'deadline',
];

const HAS_OPTIONS = ['select', 'multi-select', 'radio'];

export function FieldEditor({ field, onSave, onClose }: FieldEditorProps) {
  const [draft, setDraft] = useState<FieldConfig>(() => JSON.parse(JSON.stringify(field)));

  function setLabel(lang: keyof I18nText, val: string) {
    setDraft((d) => ({ ...d, label: { ...d.label, [lang]: val } }));
  }

  function setPlaceholder(lang: keyof I18nText, val: string) {
    setDraft((d) => ({ ...d, placeholder: { ...(d.placeholder ?? { 'pt-BR': '' }), [lang]: val } }));
  }

  function setHint(lang: keyof I18nText, val: string) {
    setDraft((d) => ({ ...d, hint: { ...(d.hint ?? { 'pt-BR': '' }), [lang]: val } }));
  }

  function setValidation(key: keyof FieldValidation, val: string) {
    const num = val === '' ? undefined : Number(val);
    setDraft((d) => ({ ...d, validation: { ...(d.validation ?? {}), [key]: key === 'pattern' ? (val || undefined) : num } }));
  }

  function addOption() {
    setDraft((d) => ({
      ...d,
      options: [...(d.options ?? []), { value: `opt_${Date.now()}`, label: { 'pt-BR': '' } }],
    }));
  }

  function updateOption(idx: number, field: 'value' | 'label', val: string) {
    setDraft((d) => {
      const opts = [...(d.options ?? [])];
      if (field === 'value') opts[idx] = { ...opts[idx], value: val };
      else opts[idx] = { ...opts[idx], label: { ...opts[idx].label, 'pt-BR': val } };
      return { ...d, options: opts };
    });
  }

  function removeOption(idx: number) {
    setDraft((d) => ({ ...d, options: (d.options ?? []).filter((_, i) => i !== idx) }));
  }

  function handleSave() {
    // Clean up empty placeholder/hint
    const cleaned = { ...draft };
    if (cleaned.placeholder && !cleaned.placeholder['pt-BR']) cleaned.placeholder = undefined;
    if (cleaned.hint && !cleaned.hint['pt-BR']) cleaned.hint = undefined;
    if (!HAS_OPTIONS.includes(cleaned.type)) cleaned.options = undefined;
    onSave(cleaned);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-lg border bg-card p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Editar campo</h3>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-secondary">
            <X size={18} />
          </button>
        </div>

        {/* ID */}
        <div className="mb-3">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">ID do campo</label>
          <input
            value={draft.id}
            onChange={(e) => setDraft((d) => ({ ...d, id: e.target.value.replace(/\s/g, '_') }))}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        {/* Label pt-BR */}
        <div className="mb-3">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Label (pt-BR) *</label>
          <input
            value={draft.label['pt-BR']}
            onChange={(e) => setLabel('pt-BR', e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        {/* Label en */}
        <div className="mb-3">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Label (en)</label>
          <input
            value={draft.label.en ?? ''}
            onChange={(e) => setLabel('en', e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        {/* Placeholder */}
        <div className="mb-3">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Placeholder (pt-BR)</label>
          <input
            value={draft.placeholder?.['pt-BR'] ?? ''}
            onChange={(e) => setPlaceholder('pt-BR', e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        {/* Hint */}
        <div className="mb-3">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Dica (hint)</label>
          <input
            value={draft.hint?.['pt-BR'] ?? ''}
            onChange={(e) => setHint('pt-BR', e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        {/* Required + gridCols */}
        <div className="mb-3 flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.required}
              onChange={(e) => setDraft((d) => ({ ...d, required: e.target.checked }))}
              className="rounded"
            />
            Obrigatório
          </label>
          <label className="flex items-center gap-2 text-sm">
            <select
              value={draft.gridCols ?? 1}
              onChange={(e) => setDraft((d) => ({ ...d, gridCols: Number(e.target.value) as 1 | 2 }))}
              className="rounded-md border bg-background px-2 py-1 text-sm"
            >
              <option value={1}>Largura inteira</option>
              <option value={2}>Meia largura</option>
            </select>
          </label>
        </div>

        {/* Validation */}
        <div className="mb-3">
          <p className="mb-1 text-xs font-medium text-muted-foreground">Validação</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">Min length</label>
              <input
                type="number"
                value={draft.validation?.minLength ?? ''}
                onChange={(e) => setValidation('minLength', e.target.value)}
                className="w-full rounded-md border bg-background px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Max length</label>
              <input
                type="number"
                value={draft.validation?.maxLength ?? ''}
                onChange={(e) => setValidation('maxLength', e.target.value)}
                className="w-full rounded-md border bg-background px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Min (número)</label>
              <input
                type="number"
                value={draft.validation?.min ?? ''}
                onChange={(e) => setValidation('min', e.target.value)}
                className="w-full rounded-md border bg-background px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Max (número)</label>
              <input
                type="number"
                value={draft.validation?.max ?? ''}
                onChange={(e) => setValidation('max', e.target.value)}
                className="w-full rounded-md border bg-background px-2 py-1 text-sm"
              />
            </div>
          </div>
        </div>

        {/* mapToColumn */}
        <div className="mb-3">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Mapear p/ coluna (DB)</label>
          <select
            value={draft.mapToColumn ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, mapToColumn: e.target.value || undefined }))}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">— Nenhuma (custom field) —</option>
            {COLUMN_OPTIONS.filter(Boolean).map((col) => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>

        {/* Options (for select/radio/multi-select) */}
        {HAS_OPTIONS.includes(draft.type) && (
          <div className="mb-3">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Opções</p>
              <button onClick={addOption} className="flex items-center gap-1 text-xs text-primary hover:underline">
                <Plus size={12} /> Adicionar
              </button>
            </div>
            <div className="space-y-2">
              {(draft.options ?? []).map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    placeholder="Valor"
                    value={opt.value}
                    onChange={(e) => updateOption(idx, 'value', e.target.value)}
                    className="w-1/3 rounded-md border bg-background px-2 py-1 text-sm"
                  />
                  <input
                    placeholder="Label (pt-BR)"
                    value={opt.label['pt-BR']}
                    onChange={(e) => updateOption(idx, 'label', e.target.value)}
                    className="flex-1 rounded-md border bg-background px-2 py-1 text-sm"
                  />
                  <button onClick={() => removeOption(idx)} className="text-destructive hover:text-destructive/80">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md px-4 py-2 text-sm text-muted-foreground hover:bg-secondary">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Salvar campo
          </button>
        </div>
      </div>
    </div>
  );
}
