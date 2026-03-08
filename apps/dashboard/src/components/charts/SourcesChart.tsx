interface SourceItem {
  source: string;
  count: number;
  percentage: number;
}

interface SourcesChartProps {
  data?: SourceItem[];
  isLoading?: boolean;
}

export function SourcesChart({ data, isLoading }: SourcesChartProps) {
  if (isLoading) return <div className="h-64 animate-pulse rounded-lg border bg-card" />;
  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-sm font-medium">Fontes de Aquisição</h3>
        <p className="mt-4 text-center text-sm text-muted-foreground">Sem dados.</p>
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="mb-4 text-sm font-medium">Fontes de Aquisição</h3>
      <div className="space-y-2">
        {data.slice(0, 8).map((item) => (
          <div key={item.source} className="flex items-center gap-3">
            <span className="w-28 truncate text-xs font-medium">{item.source}</span>
            <div className="flex-1">
              <div
                className="h-5 rounded bg-blue-500/70"
                style={{ width: `${(item.count / maxCount) * 100}%`, minWidth: '8px' }}
              />
            </div>
            <span className="w-16 text-right text-xs text-muted-foreground">
              {item.count} ({item.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
