import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Trash2, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface ContactPoint {
  id: string;
  channel: string;
  handle: string;
  isPrimary: boolean;
}

interface LeadStageInfo {
  pipelineId: string;
  stageId: string;
  stageName: string;
  stageCode: string;
  pipelineName: string;
}

interface Lead {
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
  stages: LeadStageInfo[];
}

interface PaginatedLeads {
  data: Lead[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export function LeadsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery<PaginatedLeads>({
    queryKey: ['leads', page, search, statusFilter],
    queryFn: () =>
      dashboardApi.getLeads({
        page,
        limit: 25,
        search: search || undefined,
        status: statusFilter || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }) as Promise<PaginatedLeads>,
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => dashboardApi.deleteLead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  });

  const leads = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Leads</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus size={16} /> Novo Lead
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar por nome..."
            className="w-full rounded-md border bg-background pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">Todos os status</option>
          <option value="active">Ativo</option>
          <option value="archived">Arquivado</option>
          <option value="blocked">Bloqueado</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-14 animate-pulse rounded-lg border bg-card" />)}
        </div>
      ) : leads.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          Nenhum lead encontrado.
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Contato</th>
                <th className="px-4 py-3 font-medium">Etapa</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Criado em</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const primaryContact = lead.contactPoints.find((c) => c.isPrimary) || lead.contactPoints[0];
                const currentStage = lead.stages[0];
                return (
                  <tr key={lead.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm font-medium">{lead.displayName || '(sem nome)'}</td>
                    <td className="px-4 py-3 text-sm capitalize">{lead.type}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {primaryContact ? `${primaryContact.channel}: ${primaryContact.handle}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {currentStage ? (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {currentStage.stageName}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm">{lead.score}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/leads/${lead.id}`)}
                          className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                          title="Ver detalhes"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Tem certeza que deseja excluir este lead?')) {
                              deleteMut.mutate(lead.id);
                            }
                          }}
                          className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          title="Excluir"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {meta.total} leads — Página {meta.page} de {meta.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-secondary disabled:opacity-50"
            >
              <ChevronLeft size={14} /> Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page >= meta.totalPages}
              className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-secondary disabled:opacity-50"
            >
              Próxima <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {showForm && <LeadFormModal onClose={() => setShowForm(false)} />}
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

function LeadFormModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [type, setType] = useState('person');
  const [channel, setChannel] = useState('whatsapp');
  const [handle, setHandle] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const contactPoints = handle.trim()
        ? [{ channel, handle: handle.trim(), isPrimary: true }]
        : undefined;
      await dashboardApi.createLead({
        type,
        displayName: name.trim() || undefined,
        contactPoints,
      });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      onClose();
    } catch {
      alert('Erro ao criar lead');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Novo Lead</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Nome</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="person">Pessoa</option>
              <option value="company">Empresa</option>
            </select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Canal</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="instagram">Instagram</option>
                <option value="messenger">Messenger</option>
                <option value="email">Email</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium">Contato</label>
              <input
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="Número ou @perfil"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 text-sm hover:bg-secondary">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Criar Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
