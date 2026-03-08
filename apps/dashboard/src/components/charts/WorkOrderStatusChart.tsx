import { AlertTriangle } from 'lucide-react';

interface WoStatusData {
  statuses: Array<{ status: string; count: number }>;
  overdueCount: number;
  deliveryRate: number;
}

interface WorkOrderStatusChartProps {
  data?: WoStatusData;
  isLoading?: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  created: { label: 'Criada', color: 'bg-gray-400' },
  in_progress: { label: 'Em andamento', color: 'bg-blue-500' },
  preview_sent: { label: 'Preview enviado', color: 'bg-purple-500' },
  changes_requested: { label: 'Alterações', color: 'bg-yellow-500' },
  approved: { label: 'Aprovada', color: 'bg-green-400' },
  delivered: { label: 'Entregue', color: 'bg-green-600' },
  canceled: { label: 'Cancelada', color: 'bg-red-400' },
};

export function WorkOrderStatusChart({ data, isLoading }: WorkOrderStatusChartProps) {
  if (isLoading) return <div className="h-64 animate-pulse rounded-lg border bg-card" />;
  if (!data || data.statuses.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-sm font-medium">Status de Work Orders</h3>
        <p className="mt-4 text-center text-sm text-muted-foreground">Sem dados.</p>
      </div>
    );
  }

  const total = data.statuses.reduce((acc, s) => acc + s.count, 0);

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium">Status de Work Orders</h3>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-muted-foreground">{total} total</span>
          <span className="font-semibold text-green-600">{data.deliveryRate}% entregues</span>
          {data.overdueCount > 0 && (
            <span className="flex items-center gap-1 font-semibold text-red-500">
              <AlertTriangle size={12} /> {data.overdueCount} atrasadas
            </span>
          )}
        </div>
      </div>
      {/* Stacked bar */}
      <div className="mb-3 flex h-8 overflow-hidden rounded">
        {data.statuses.map((s) => {
          const config = STATUS_CONFIG[s.status] || { label: s.status, color: 'bg-gray-300' };
          const pct = total > 0 ? (s.count / total) * 100 : 0;
          return (
            <div
              key={s.status}
              className={`${config.color} transition-all`}
              style={{ width: `${pct}%`, minWidth: s.count > 0 ? '4px' : '0' }}
              title={`${config.label}: ${s.count}`}
            />
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {data.statuses.map((s) => {
          const config = STATUS_CONFIG[s.status] || { label: s.status, color: 'bg-gray-300' };
          return (
            <div key={s.status} className="flex items-center gap-1.5 text-xs">
              <span className={`inline-block h-2.5 w-2.5 rounded ${config.color}`} />
              <span className="font-medium">{config.label}</span>
              <span className="text-muted-foreground">{s.count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
