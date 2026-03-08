interface ActivityEvent {
  id: string;
  entityType: string;
  entityId: string;
  eventType: string;
  source: string;
  createdAt: string;
}

interface ActivityFeedProps {
  data?: ActivityEvent[];
  isLoading?: boolean;
}

const ENTITY_ICONS: Record<string, string> = {
  lead: '👤',
  conversation: '💬',
  quote: '📋',
  payment_intent: '💳',
  work_order: '🎬',
};

const EVENT_LABELS: Record<string, string> = {
  created: 'criado',
  updated: 'atualizado',
  deleted: 'removido',
  stage_changed: 'mudou de etapa',
  status_changed: 'status alterado',
  approved: 'aprovado',
  paid: 'pagamento confirmado',
  delivered: 'entregue',
  sent: 'enviado',
};

export function ActivityFeed({ data, isLoading }: ActivityFeedProps) {
  if (isLoading) return <div className="h-64 animate-pulse rounded-lg border bg-card" />;
  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-sm font-medium">Atividade Recente</h3>
        <p className="mt-4 text-center text-sm text-muted-foreground">Nenhuma atividade registrada.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="mb-4 text-sm font-medium">Atividade Recente</h3>
      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
        {data.map((event) => (
          <div key={event.id} className="flex items-start gap-2 rounded border px-3 py-2">
            <span className="mt-0.5 text-sm">{ENTITY_ICONS[event.entityType] || '📌'}</span>
            <div className="flex-1 text-xs">
              <span className="font-medium capitalize">{event.entityType.replace('_', ' ')}</span>
              {' '}
              <span className="text-muted-foreground">
                {EVENT_LABELS[event.eventType] || event.eventType}
              </span>
              {event.source && (
                <span className="ml-1 text-muted-foreground">via {event.source}</span>
              )}
            </div>
            <span className="whitespace-nowrap text-[10px] text-muted-foreground">
              {new Date(event.createdAt).toLocaleString('pt-BR', {
                day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
