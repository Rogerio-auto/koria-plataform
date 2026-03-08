interface QuoteFunnelData {
  draft: number;
  sent: number;
  accepted: number;
  rejected: number;
  expired: number;
  acceptanceRate: number;
  totalValue: number;
}

interface QuoteFunnelChartProps {
  data?: QuoteFunnelData;
  isLoading?: boolean;
}

const STATUSES = [
  { key: 'draft' as const, label: 'Rascunho', color: 'bg-gray-400' },
  { key: 'sent' as const, label: 'Enviado', color: 'bg-blue-400' },
  { key: 'accepted' as const, label: 'Aceito', color: 'bg-green-500' },
  { key: 'rejected' as const, label: 'Rejeitado', color: 'bg-red-400' },
  { key: 'expired' as const, label: 'Expirado', color: 'bg-orange-400' },
];

export function QuoteFunnelChart({ data, isLoading }: QuoteFunnelChartProps) {
  if (isLoading) return <div className="h-64 animate-pulse rounded-lg border bg-card" />;
  if (!data) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-sm font-medium">Funil de Orçamentos</h3>
        <p className="mt-4 text-center text-sm text-muted-foreground">Sem dados.</p>
      </div>
    );
  }

  const maxVal = Math.max(...STATUSES.map((s) => data[s.key]), 1);

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium">Funil de Orçamentos</h3>
        <div className="text-right text-xs">
          <span className="font-semibold text-green-600">{data.acceptanceRate}% aceitos</span>
          <span className="ml-2 text-muted-foreground">
            R$ {data.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
      <div className="space-y-2">
        {STATUSES.map((s) => {
          const val = data[s.key];
          return (
            <div key={s.key} className="flex items-center gap-3">
              <span className="w-20 text-xs text-muted-foreground">{s.label}</span>
              <div className="flex-1">
                <div
                  className={`h-5 rounded ${s.color} transition-all`}
                  style={{ width: `${(val / maxVal) * 100}%`, minWidth: val > 0 ? '8px' : '0px' }}
                />
              </div>
              <span className="w-10 text-right text-xs font-medium">{val}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
