import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '@/services/api';
import { ArrowLeft, Save, Plus, Trash2, X } from 'lucide-react';

interface ContactPoint {
  id: string;
  channel: string;
  handle: string;
  isPrimary: boolean;
}

interface StageInfo {
  pipelineId: string;
  stageId: string;
  stageName: string;
  stageCode: string;
  stagePosition: number;
  pipelineName: string;
  enteredAt: string;
}

interface LeadDetail {
  id: string;
  type: string;
  displayName: string | null;
  preferredLanguage: string | null;
  countryCode: string | null;
  vipLevel: number;
  score: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  contactPoints: ContactPoint[];
  stages: StageInfo[];
  qualification: Record<string, unknown> | null;
}

interface Pipeline {
  id: string;
  name: string;
  stages: Array<{ id: string; name: string; code: string; position: number; isTerminal: boolean }>;
}

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: lead, isLoading } = useQuery<LeadDetail>({
    queryKey: ['lead', id],
    queryFn: () => dashboardApi.getLead(id!) as Promise<LeadDetail>,
    enabled: !!id,
  });

  const { data: pipelinesData } = useQuery<Pipeline[]>({
    queryKey: ['pipelines'],
    queryFn: () => dashboardApi.getPipelines() as Promise<Pipeline[]>,
  });

  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ displayName: '', type: '', status: '', score: 0, vipLevel: 0 });
  const [showContactForm, setShowContactForm] = useState(false);

  const updateMut = useMutation({
    mutationFn: (data: Record<string, unknown>) => dashboardApi.updateLead(id!, data as never),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      setEditing(false);
    },
  });

  const moveStageMut = useMutation({
    mutationFn: (data: { pipelineId: string; stageId: string }) => dashboardApi.moveLeadStage(id!, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lead', id] }),
  });

  const deleteContactMut = useMutation({
    mutationFn: (contactId: string) => dashboardApi.removeLeadContact(id!, contactId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lead', id] }),
  });

  if (isLoading) {
    return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-lg border bg-card" />)}</div>;
  }

  if (!lead) {
    return <div className="p-8 text-center text-muted-foreground">Lead não encontrado.</div>;
  }

  function startEdit() {
    setEditData({
      displayName: lead!.displayName || '',
      type: lead!.type,
      status: lead!.status,
      score: lead!.score,
      vipLevel: lead!.vipLevel,
    });
    setEditing(true);
  }

  function saveEdit() {
    updateMut.mutate({
      displayName: editData.displayName || undefined,
      type: editData.type,
      status: editData.status,
      score: editData.score,
      vipLevel: editData.vipLevel,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/leads')} className="rounded p-1.5 hover:bg-secondary">
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-2xl font-bold">{lead.displayName || '(sem nome)'}</h2>
        <StatusBadge status={lead.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Lead Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Informações</h3>
              {editing ? (
                <div className="flex gap-2">
                  <button onClick={() => setEditing(false)} className="rounded border px-2 py-1 text-xs hover:bg-secondary">Cancelar</button>
                  <button onClick={saveEdit} disabled={updateMut.isPending} className="flex items-center gap-1 rounded bg-primary px-2 py-1 text-xs text-primary-foreground hover:bg-primary/90">
                    <Save size={12} /> Salvar
                  </button>
                </div>
              ) : (
                <button onClick={startEdit} className="rounded border px-2 py-1 text-xs hover:bg-secondary">Editar</button>
              )}
            </div>

            {editing ? (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Nome</label>
                  <input value={editData.displayName} onChange={(e) => setEditData({ ...editData, displayName: e.target.value })} className="w-full rounded border bg-background px-2 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Tipo</label>
                  <select value={editData.type} onChange={(e) => setEditData({ ...editData, type: e.target.value })} className="w-full rounded border bg-background px-2 py-1.5 text-sm">
                    <option value="person">Pessoa</option>
                    <option value="company">Empresa</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Status</label>
                  <select value={editData.status} onChange={(e) => setEditData({ ...editData, status: e.target.value })} className="w-full rounded border bg-background px-2 py-1.5 text-sm">
                    <option value="active">Ativo</option>
                    <option value="archived">Arquivado</option>
                    <option value="blocked">Bloqueado</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Score</label>
                  <input type="number" value={editData.score} onChange={(e) => setEditData({ ...editData, score: Number(e.target.value) })} className="w-full rounded border bg-background px-2 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">VIP Level</label>
                  <input type="number" value={editData.vipLevel} onChange={(e) => setEditData({ ...editData, vipLevel: Number(e.target.value) })} className="w-full rounded border bg-background px-2 py-1.5 text-sm" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <InfoRow label="Tipo" value={lead.type === 'person' ? 'Pessoa' : 'Empresa'} />
                <InfoRow label="Idioma" value={lead.preferredLanguage || '—'} />
                <InfoRow label="País" value={lead.countryCode || '—'} />
                <InfoRow label="Score" value={String(lead.score)} />
                <InfoRow label="VIP Level" value={String(lead.vipLevel)} />
                <InfoRow label="Criado em" value={new Date(lead.createdAt).toLocaleString('pt-BR')} />
              </div>
            )}
          </div>

          {/* Contact Points */}
          <div className="rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Contatos</h3>
              <button onClick={() => setShowContactForm(true)} className="flex items-center gap-1 rounded border px-2 py-1 text-xs hover:bg-secondary">
                <Plus size={12} /> Adicionar
              </button>
            </div>
            {lead.contactPoints.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum contato cadastrado.</p>
            ) : (
              <div className="space-y-2">
                {lead.contactPoints.map((cp) => (
                  <div key={cp.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
                    <div>
                      <span className="font-medium capitalize">{cp.channel}</span>: {cp.handle}
                      {cp.isPrimary && <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">Principal</span>}
                    </div>
                    <button
                      onClick={() => deleteContactMut.mutate(cp.id)}
                      className="rounded p-1 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Qualification */}
          {lead.qualification && (
            <div className="rounded-lg border bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold">Qualificação</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(lead.qualification)
                  .filter(([k, v]) => v && !['id', 'tenantId', 'leadId', 'createdAt', 'updatedAt'].includes(k))
                  .map(([key, value]) => (
                    <InfoRow key={key} label={key} value={String(value)} />
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar: Pipeline Stages */}
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold">Etapas do Pipeline</h3>
            {pipelinesData && pipelinesData.length > 0 ? (
              <div className="space-y-4">
                {pipelinesData.map((pipeline) => {
                  const currentStage = lead.stages.find((s) => s.pipelineId === pipeline.id);
                  return (
                    <div key={pipeline.id}>
                      <p className="mb-2 text-xs font-medium text-muted-foreground">{pipeline.name}</p>
                      <div className="space-y-1">
                        {pipeline.stages
                          .sort((a, b) => a.position - b.position)
                          .map((stage) => {
                            const isCurrent = currentStage?.stageId === stage.id;
                            return (
                              <button
                                key={stage.id}
                                onClick={() => {
                                  if (!isCurrent) {
                                    moveStageMut.mutate({ pipelineId: pipeline.id, stageId: stage.id });
                                  }
                                }}
                                className={`w-full rounded px-3 py-1.5 text-left text-sm transition-colors ${
                                  isCurrent
                                    ? 'bg-primary text-primary-foreground font-medium'
                                    : 'hover:bg-secondary text-muted-foreground'
                                }`}
                              >
                                {stage.name}
                                {stage.isTerminal && <span className="ml-1 text-[10px]">(final)</span>}
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum pipeline configurado.</p>
            )}
          </div>
        </div>
      </div>

      {showContactForm && <AddContactModal leadId={lead.id} onClose={() => setShowContactForm(false)} />}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-muted-foreground">{label}</span>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === 'active'
      ? 'bg-green-100 text-green-700'
      : status === 'archived'
        ? 'bg-gray-100 text-gray-600'
        : 'bg-red-100 text-red-700';
  const labels: Record<string, string> = { active: 'Ativo', archived: 'Arquivado', blocked: 'Bloqueado' };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles}`}>
      {labels[status] || status}
    </span>
  );
}

function AddContactModal({ leadId, onClose }: { leadId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [channel, setChannel] = useState('whatsapp');
  const [handle, setHandle] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!handle.trim()) return;
    setSaving(true);
    try {
      await dashboardApi.addLeadContact(leadId, { channel, handle: handle.trim(), isPrimary });
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
      onClose();
    } catch {
      alert('Erro ao adicionar contato');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-sm rounded-lg bg-card p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Adicionar Contato</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Canal</label>
            <select value={channel} onChange={(e) => setChannel(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm">
              <option value="whatsapp">WhatsApp</option>
              <option value="instagram">Instagram</option>
              <option value="messenger">Messenger</option>
              <option value="email">Email</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Handle</label>
            <input value={handle} onChange={(e) => setHandle(e.target.value)} required className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isPrimary} onChange={(e) => setIsPrimary(e.target.checked)} /> Contato principal
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 text-sm hover:bg-secondary">Cancelar</button>
            <button type="submit" disabled={saving || !handle.trim()} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {saving ? 'Salvando...' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
