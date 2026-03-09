import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { FieldCard } from './FieldCard';
import { FieldEditor } from './FieldEditor';
import { FieldTypePicker } from './FieldTypePicker';
import type { FieldConfig, StepConfig, FieldType } from '@koria/types';

interface StepManagerProps {
  steps: StepConfig[];
  onChange: (steps: StepConfig[]) => void;
}

export function StepManager({ steps, onChange }: StepManagerProps) {
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [editingField, setEditingField] = useState<FieldConfig | null>(null);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [editingStepLabel, setEditingStepLabel] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const currentStep = steps[activeStepIdx];

  function updateStep(idx: number, patch: Partial<StepConfig>) {
    const updated = steps.map((s, i) => (i === idx ? { ...s, ...patch } : s));
    onChange(updated);
  }

  function addStep() {
    const order = steps.length;
    const newStep: StepConfig = {
      id: `step_${Date.now()}`,
      label: { 'pt-BR': `Etapa ${order + 1}` },
      order,
      fields: [],
    };
    onChange([...steps, newStep]);
    setActiveStepIdx(steps.length);
  }

  function removeStep(idx: number) {
    if (steps.length <= 1) return;
    const updated = steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, order: i }));
    onChange(updated);
    setActiveStepIdx(Math.min(activeStepIdx, updated.length - 1));
  }

  function addField(type: FieldType) {
    if (!currentStep) return;
    const order = currentStep.fields.length;
    const newField: FieldConfig = {
      id: `field_${Date.now()}`,
      type,
      label: { 'pt-BR': '' },
      required: false,
      order,
    };
    setShowTypePicker(false);
    setEditingField(newField);
  }

  function saveField(field: FieldConfig) {
    if (!currentStep) return;
    const existing = currentStep.fields.findIndex((f) => f.id === field.id);
    let updatedFields: FieldConfig[];
    if (existing >= 0) {
      updatedFields = currentStep.fields.map((f, i) => (i === existing ? field : f));
    } else {
      updatedFields = [...currentStep.fields, field];
    }
    updateStep(activeStepIdx, { fields: updatedFields });
    setEditingField(null);
  }

  function removeField(fieldId: string) {
    if (!currentStep) return;
    const updatedFields = currentStep.fields
      .filter((f) => f.id !== fieldId)
      .map((f, i) => ({ ...f, order: i }));
    updateStep(activeStepIdx, { fields: updatedFields });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !currentStep) return;

    const oldIdx = currentStep.fields.findIndex((f) => f.id === active.id);
    const newIdx = currentStep.fields.findIndex((f) => f.id === over.id);

    const reordered = arrayMove(currentStep.fields, oldIdx, newIdx).map((f, i) => ({ ...f, order: i }));
    updateStep(activeStepIdx, { fields: reordered });
  }

  return (
    <div>
      {/* Step tabs */}
      <div className="mb-4 flex items-center gap-1 overflow-x-auto border-b pb-2">
        {steps.map((step, idx) => (
          <div key={step.id} className="flex items-center">
            {editingStepLabel === idx ? (
              <input
                autoFocus
                value={step.label['pt-BR']}
                onChange={(e) => updateStep(idx, { label: { ...step.label, 'pt-BR': e.target.value } })}
                onBlur={() => setEditingStepLabel(null)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingStepLabel(null)}
                className="rounded border bg-background px-2 py-1 text-sm"
              />
            ) : (
              <button
                onClick={() => setActiveStepIdx(idx)}
                onDoubleClick={() => setEditingStepLabel(idx)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  idx === activeStepIdx
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                {step.label['pt-BR'] || `Etapa ${idx + 1}`}
              </button>
            )}
            {steps.length > 1 && (
              <button
                onClick={() => removeStep(idx)}
                className="ml-0.5 rounded p-0.5 text-xs text-muted-foreground hover:text-destructive"
                title="Remover etapa"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addStep}
          className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-secondary"
        >
          <Plus size={14} /> Etapa
        </button>
      </div>

      {/* Step icon + label editing */}
      {currentStep && (
        <div className="mb-3 flex items-center gap-3">
          <input
            placeholder="Ícone (lucide-react)"
            value={currentStep.icon ?? ''}
            onChange={(e) => updateStep(activeStepIdx, { icon: e.target.value || undefined })}
            className="w-40 rounded-md border bg-background px-2 py-1 text-sm"
          />
          <span className="text-xs text-muted-foreground">
            {currentStep.fields.length} campo(s)
          </span>
        </div>
      )}

      {/* Fields list with drag-and-drop */}
      {currentStep && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={currentStep.fields.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {currentStep.fields.map((field) => (
                <FieldCard
                  key={field.id}
                  field={field}
                  onEdit={() => setEditingField(field)}
                  onRemove={() => removeField(field.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add field button */}
      <button
        onClick={() => setShowTypePicker(true)}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-dashed py-2.5 text-sm text-muted-foreground hover:bg-secondary transition-colors"
      >
        <Plus size={16} /> Adicionar campo
      </button>

      {/* Modals */}
      {showTypePicker && (
        <FieldTypePicker onSelect={addField} onClose={() => setShowTypePicker(false)} />
      )}
      {editingField && (
        <FieldEditor field={editingField} onSave={saveField} onClose={() => setEditingField(null)} />
      )}
    </div>
  );
}
