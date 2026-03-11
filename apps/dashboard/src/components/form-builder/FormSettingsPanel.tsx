import type { FormSettings } from '@koria/types';

interface FormSettingsPanelProps {
  settings: FormSettings;
  onChange: (settings: FormSettings) => void;
}

export function FormSettingsPanel({ settings, onChange }: FormSettingsPanelProps) {
  function set(path: string, value: unknown) {
    const parts = path.split('.');
    const copy = JSON.parse(JSON.stringify(settings)) as any;
    let target = copy;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!target[parts[i]]) target[parts[i]] = {};
      target = target[parts[i]];
    }
    target[parts[parts.length - 1]] = value;
    onChange(copy);
  }

  return (
    <div className="space-y-6">
      {/* Theme */}
      <section>
        <h4 className="mb-2 text-sm font-semibold">Tema</h4>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Cor primária</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.theme?.primaryColor ?? '#45B649'}
                onChange={(e) => set('theme.primaryColor', e.target.value)}
                className="h-8 w-8 cursor-pointer rounded border"
              />
              <input
                value={settings.theme?.primaryColor ?? '#45B649'}
                onChange={(e) => set('theme.primaryColor', e.target.value)}
                className="w-28 rounded-md border bg-background px-2 py-1 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Logo URL (opcional)</label>
            <input
              value={settings.theme?.logo ?? ''}
              onChange={(e) => set('theme.logo', e.target.value || undefined)}
              placeholder="https://..."
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
      </section>

      {/* Behavior */}
      <section>
        <h4 className="mb-2 text-sm font-semibold">Comportamento</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.behavior?.showProgressBar ?? true}
              onChange={(e) => set('behavior.showProgressBar', e.target.checked)}
              className="rounded"
            />
            Exibir barra de progresso
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.behavior?.allowDraftSave ?? true}
              onChange={(e) => set('behavior.allowDraftSave', e.target.checked)}
              className="rounded"
            />
            Permitir salvar rascunho (localStorage)
          </label>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Mensagem de sucesso (pt-BR)</label>
            <input
              value={settings.behavior?.successMessage?.['pt-BR'] ?? ''}
              onChange={(e) =>
                set('behavior.successMessage', {
                  ...(settings.behavior?.successMessage ?? { 'pt-BR': '' }),
                  'pt-BR': e.target.value,
                })
              }
              placeholder="Briefing enviado com sucesso!"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section>
        <h4 className="mb-2 text-sm font-semibold">Integrações</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.integrations?.syncToClickUp ?? true}
              onChange={(e) => set('integrations.syncToClickUp', e.target.checked)}
              className="rounded"
            />
            Sincronizar com ClickUp
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.integrations?.fireWebhook ?? true}
              onChange={(e) => set('integrations.fireWebhook', e.target.checked)}
              className="rounded"
            />
            Disparar webhook (N8N)
          </label>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Webhook URL (override)</label>
            <input
              value={settings.integrations?.webhookUrl ?? ''}
              onChange={(e) => set('integrations.webhookUrl', e.target.value || undefined)}
              placeholder="https://n8n..."
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
      </section>

      {/* Return Channels */}
      <section>
        <h4 className="mb-2 text-sm font-semibold">Link de Retorno</h4>
        <p className="mb-3 text-xs text-muted-foreground">
          Configure os canais para redirecionar o lead após enviar o formulário ou uploads.
        </p>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">WhatsApp (número com DDI)</label>
            <input
              value={settings.integrations?.returnChannels?.whatsapp ?? ''}
              onChange={(e) => set('integrations.returnChannels.whatsapp', e.target.value || undefined)}
              placeholder="5511999999999"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Instagram (@usuário)</label>
            <input
              value={settings.integrations?.returnChannels?.instagram ?? ''}
              onChange={(e) => set('integrations.returnChannels.instagram', e.target.value || undefined)}
              placeholder="@koriastudio"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Messenger (page ID ou username)</label>
            <input
              value={settings.integrations?.returnChannels?.messenger ?? ''}
              onChange={(e) => set('integrations.returnChannels.messenger', e.target.value || undefined)}
              placeholder="koriastudio"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Telegram (@usuário)</label>
            <input
              value={settings.integrations?.returnChannels?.telegram ?? ''}
              onChange={(e) => set('integrations.returnChannels.telegram', e.target.value || undefined)}
              placeholder="@koriastudio"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
