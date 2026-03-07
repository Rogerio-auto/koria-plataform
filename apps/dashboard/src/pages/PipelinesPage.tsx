import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '@/services/api';
import { Plus, Pencil, Trash2, X, GripVertical } from 'lucide-react';

interface Stage {
  id: string;
  pipelineId: string;
  name: string;
  code: string;
  position: number;
  isTerminal: boolean;
}

interface Pipeline {
  id: string;
  name: string;
  createdAt: string;
  stages: Stage[];
}

export function PipelinesPage() {
  const queryClient = useQueryClient();
  const [showPipelineForm, setShowPipelineForm] = useState(false);
  const [editingPipeline, setEditingPipeline] = useState<Pipeline | null>(null);
  const [stageForm, setStageForm] = useState<{ pipelineId: string; stage?: Stage } | null>(null);

  const { data: pipelines = [], isLoading } = useQuery<Pipeline[]>({
    queryKey: ['pipelines'],
    queryFn: () => dashboardApi.getPipelines() as Promise<Pipeline[]>,
  });

  const deletePipelineMut = useMutation({
    mutationFn: (id: string) => dashboardApi.deletePipeline(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pipelines'] }),
  });

  const deleteStageMut = useMutation({
    mutationFn: (stageId: string) => dashboardApi.deleteStage(stageId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pipelines'] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Pipelines & Etapas</h2>
        <button
          onClick={() => { setEditingPipeline(null); setShowPipelineForm(true); }}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus size={16} /> Novo Pipeline
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <div key={i} className="h-40 animate-pulse rounded-lg border bg-card" />)}
        </div>
      ) : pipelines.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          Nenhum pipeline criado. Crie um pipeline para gerenciar as etapas dos leads.
        </div>
      ) : (
        <div className="space-y-4">
          {pipelines.map((pipeline) => (
            <div key={pipeline.id} className="rounded-lg border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold">{pipeline.name}</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStageForm({ pipelineId: pipeline.id })}
                    className="flex items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-secondary"
                  >
                    <Plus size={12} /> Etapa
                  </button>
                  <button
                    onClick={() => { setEditingPipeline(pipeline); setShowPipelineForm(true); }}
                    className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Excluir pipeline "${pipeline.name}" e todas as suas etapas?`)) {
                        deletePipelineMut.mutate(pipeline.id);
                      }
                    }}
                    className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {pipeline.stages.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma etapa criada.</p>
              ) : (
                <div className="space-y-1">
                  {pipeline.stages
                    .sort((a, b) => a.position - b.position)
                    .map((stage, idx) => (
                      <div
                        key={stage.id}
                        className="flex items-center gap-2 rounded border px-3 py-2 text-sm"
                      >
                        <GripVertical size={14} className="text-muted-foreground" />
                        <span className="w-6 text-center text-xs text-muted-foreground">{idx + 1}</span>
                        <span className="flex-1 font-medium">{stage.name}</span>
                        <span className="text-xs text-muted-foreground">{stage.code}</span>
                        {stage.isTerminal && (
                          <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-medium text-orange-700">Final</span>
                        )}
                        <button
                          onClick={() => setStageForm({ pipelineId: pipeline.id, stage })}
                          className="rounded p-1 text-muted-foreground hover:text-foreground"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Excluir etapa "${stage.name}"?`)) {
                              deleteStageMut.mutate(stage.id);
                            }
                          }}
                          className="rounded p-1 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showPipelineForm && (
        <PipelineFormModal
          pipeline={editingPipeline}
          onClose={() => { setShowPipelineForm(false); setEditingPipeline(null); }}
        />
      )}

      {stageForm && (
        <StageFormModal
          pipelineId={stageForm.pipelineId}
          stage={stageForm.stage}
          onClose={() => setStageForm(null)}
        />
      )}
    </div>
  );
}

function PipelineFormModal({ pipeline, onClose }: { pipeline: Pipeline | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(pipeline?.name || '');
  const [saving, setSaving] = useState(false);
  const isEdit = !!pipeline;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (isEdit) {
        await dashboardApi.updatePipeline(pipeline!.id, { name: name.trim() });
      } else {
        await dashboardApi.createPipeline({ name: name.trim() });
      }
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
      onClose();
    } catch {
      alert('Erro ao salvar pipeline');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-sm rounded-lg bg-card p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{isEdit ? 'Editar Pipeline' : 'Novo Pipeline'}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Nome</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 text-sm hover:bg-secondary">Cancelar</button>
            <button type="submit" disabled={saving || !name.trim()} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StageFormModal({ pipelineId, stage, onClose }: { pipelineId: string; stage?: Stage; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(stage?.name || '');
  const [code, setCode] = useState(stage?.code || '');
  const [position, setPosition] = useState(stage?.position ?? 0);
  const [isTerminal, setIsTerminal] = useState(stage?.isTerminal ?? false);
  const [saving, setSaving] = useState(false);
  const isEdit = !!stage;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    setSaving(true);
    try {
      if (isEdit) {
        await dashboardApi.updateStage(stage!.id, { name: name.trim(), code: code.trim(), position, isTerminal });
      } else {
        await dashboardApi.createStage(pipelineId, { name: name.trim(), code: code.trim(), position, isTerminal });
      }
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
      onClose();
    } catch {
      alert('Erro ao salvar etapa');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-sm rounded-lg bg-card p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{isEdit ? 'Editar Etapa' : 'Nova Etapa'}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Nome *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Código *</label>
            <input value={code} onChange={(e) => setCode(e.target.value)} required placeholder="ex: new_lead" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Posição</label>
              <input type="number" value={position} onChange={(e) => setPosition(Number(e.target.value))} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={isTerminal} onChange={(e) => setIsTerminal(e.target.checked)} /> Etapa final
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 text-sm hover:bg-secondary">Cancelar</button>
            <button type="submit" disabled={saving || !name.trim() || !code.trim()} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
