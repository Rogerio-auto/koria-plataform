interface FunnelChartProps {
  data?: Array<{ stage: string; count: number }>;
  isLoading?: boolean;
}

export function FunnelChart({ data, isLoading }: FunnelChartProps) {
  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-lg border bg-card" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 rounded-lg border bg-card p-4">
        <h3 className="text-sm font-medium">Funil de Leads</h3>
        <p className="mt-8 text-center text-sm text-muted-foreground">Sem dados.</p>
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="mb-4 text-sm font-medium">Funil de Leads</h3>
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.stage} className="flex items-center gap-3">
            <span className="w-28 truncate text-xs text-muted-foreground">{item.stage}</span>
            <div className="flex-1">
              <div
                className="h-6 rounded bg-primary/70 transition-all"
                style={{ width: `${(item.count / maxCount) * 100}%`, minWidth: item.count > 0 ? '8px' : '0px' }}
              />
            </div>
            <span className="w-10 text-right text-xs font-medium">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
