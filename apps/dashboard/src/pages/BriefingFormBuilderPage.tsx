import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Rocket, Settings2, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  useBriefingFormConfigs,
  useBriefingFormConfig,
  useBriefingFormTemplates,
  useCreateBriefingFormConfig,
  useUpdateBriefingFormConfig,
  usePublishBriefingFormConfig,
  useDeleteBriefingFormConfig,
  useDuplicateBriefingFormConfig,
} from '@/hooks/use-briefing-form-config';
import { FormVersionList } from '@/components/form-builder/FormVersionList';
import { StepManager } from '@/components/form-builder/StepManager';
import { FormSettingsPanel } from '@/components/form-builder/FormSettingsPanel';
import { TemplatesPicker } from '@/components/form-builder/TemplatesPicker';

type Tab = 'fields' | 'settings';

export function BriefingFormBuilderPage() {
  const navigate = useNavigate();

  // Data
  const { data: configs = [], isLoading: loadingConfigs } = useBriefingFormConfigs();
  const { data: templates = [], isLoading: loadingTemplates } = useBriefingFormTemplates();

  // Selected config
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: selectedConfig } = useBriefingFormConfig(selectedId);

  // Mutations
  const createMutation = useCreateBriefingFormConfig();
  const updateMutation = useUpdateBriefingFormConfig();
  const publishMutation = usePublishBriefingFormConfig();
  const deleteMutation = useDeleteBriefingFormConfig();
  const duplicateMutation = useDuplicateBriefingFormConfig();

  // Local editor state
  const [name, setName] = useState('');
  const [steps, setSteps] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [dirty, setDirty] = useState(false);
  const [tab, setTab] = useState<Tab>('fields');
  const [showTemplates, setShowTemplates] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // When selected config loads, populate editor
  useEffect(() => {
    if (selectedConfig) {
      setName(selectedConfig.name ?? '');
      setSteps(selectedConfig.steps ?? []);
      setSettings(selectedConfig.settings ?? {});
      setDirty(false);
    }
  }, [selectedConfig]);

  // Auto-select first config
  useEffect(() => {
    if (!selectedId && configs.length > 0) {
      setSelectedId(configs[0].id);
    }
  }, [configs, selectedId]);

  function showFeedback(msg: string) {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  }

  async function handleNew() {
    try {
      const created = await createMutation.mutateAsync({
        name: 'Novo formulário',
        steps: [{ id: 'step_1', label: { 'pt-BR': 'Etapa 1' }, order: 0, fields: [] }],
      });
      setSelectedId(created.id);
      showFeedback('Formulário criado');
    } catch {
      showFeedback('Erro ao criar');
    }
  }

  async function handleNewFromTemplate(tpl: any) {
    try {
      const created = await createMutation.mutateAsync({
        name: tpl.name,
        steps: tpl.steps,
      });
      setSelectedId(created.id);
      setShowTemplates(false);
      showFeedback(`Criado a partir do template "${tpl.name}"`);
    } catch {
      showFeedback('Erro ao criar a partir do template');
    }
  }

  async function handleSave() {
    if (!selectedId) return;
    try {
      // Published configs: only send settings (name/steps are locked)
      const data = isPublished ? { settings } : { name, steps, settings };
      await updateMutation.mutateAsync({ id: selectedId, data });
      setDirty(false);
      showFeedback('Salvo com sucesso');
    } catch {
      showFeedback('Erro ao salvar');
    }
  }

  async function handlePublish() {
    if (!selectedId) return;
    // Save first
    try {
      await updateMutation.mutateAsync({ id: selectedId, data: { name, steps, settings } });
      await publishMutation.mutateAsync(selectedId);
      setDirty(false);
      showFeedback('Publicado! O formulário está ativo.');
    } catch {
      showFeedback('Erro ao publicar');
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteMutation.mutateAsync(id);
      if (selectedId === id) setSelectedId(null);
      showFeedback('Configuração excluída');
    } catch {
      showFeedback('Erro ao excluir');
    }
  }

  async function handleDuplicate(id: string) {
    try {
      const dup = await duplicateMutation.mutateAsync(id);
      setSelectedId(dup.id);
      showFeedback('Duplicado com sucesso');
    } catch {
      showFeedback('Erro ao duplicar');
    }
  }

  const isPublished = selectedConfig?.status === 'published';
  const isSaving = updateMutation.isPending;
  const isPublishing = publishMutation.isPending;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-card px-6 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/settings')}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-semibold">Formulário de Briefing</h1>
            <p className="text-xs text-muted-foreground">Configure as etapas e campos do formulário</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {feedback && (
            <span className="rounded-md bg-primary/10 px-3 py-1 text-sm text-primary">{feedback}</span>
          )}
          {selectedId && (
            <>
              {/* Save: always visible (settings can be saved even when published) */}
              <button
                onClick={handleSave}
                disabled={isSaving || !dirty}
                className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-secondary disabled:opacity-50"
              >
                <Save size={14} />
                {isSaving ? 'Salvando…' : 'Salvar'}
              </button>
              {!isPublished && (
                <button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  <Rocket size={14} />
                  {isPublishing ? 'Publicando…' : 'Publicar'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1">
        {/* Sidebar — Version list */}
        <aside className="w-64 flex-shrink-0 overflow-y-auto border-r p-4">
          <FormVersionList
            configs={configs}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onNew={handleNew}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onShowTemplates={() => setShowTemplates(true)}
            isLoading={loadingConfigs}
          />
        </aside>

        {/* Editor */}
        <main className="flex-1 overflow-y-auto p-6">
          {!selectedId ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <Layers size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium text-muted-foreground">
                  Selecione ou crie um formulário
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Use os botões à esquerda para começar
                </p>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl">
              {/* Config name */}
              <div className="mb-4">
                <input
                  value={name}
                  onChange={(e) => { setName(e.target.value); setDirty(true); }}
                  disabled={isPublished}
                  placeholder="Nome do formulário"
                  className="w-full rounded-md border bg-background px-4 py-2 text-lg font-semibold disabled:opacity-60"
                />
                {isPublished && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Este formulário está publicado. Duplique-o para editar uma nova versão.
                  </p>
                )}
              </div>

              {/* Tabs */}
              <div className="mb-4 flex gap-1 border-b">
                <button
                  onClick={() => setTab('fields')}
                  className={`flex items-center gap-1.5 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                    tab === 'fields'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Layers size={14} />
                  Etapas & Campos
                </button>
                <button
                  onClick={() => setTab('settings')}
                  className={`flex items-center gap-1.5 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                    tab === 'settings'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Settings2 size={14} />
                  Configurações
                </button>
              </div>

              {/* Content */}
              {tab === 'fields' ? (
                <StepManager
                  steps={steps}
                  onChange={(s) => { setSteps(s); setDirty(true); }}
                />
              ) : (
                <FormSettingsPanel
                  settings={settings}
                  onChange={(s) => { setSettings(s); setDirty(true); }}
                />
              )}
            </div>
          )}
        </main>
      </div>

      {/* Templates modal */}
      {showTemplates && (
        <TemplatesPicker
          templates={templates}
          isLoading={loadingTemplates}
          onSelect={handleNewFromTemplate}
          onClose={() => setShowTemplates(false)}
        />
      )}
    </div>
  );
}
