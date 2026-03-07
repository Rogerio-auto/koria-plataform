interface RevenueChartProps {
  data?: Array<{ date: string; amount: number }>;
  isLoading?: boolean;
}

export function RevenueChart({ data, isLoading }: RevenueChartProps) {
  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-lg border bg-card" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 rounded-lg border bg-card p-4">
        <h3 className="text-sm font-medium">Receita</h3>
        <p className="mt-8 text-center text-sm text-muted-foreground">Sem dados.</p>
      </div>
    );
  }

  const maxAmount = Math.max(...data.map((d) => d.amount), 1);
  const total = data.reduce((acc, d) => acc + d.amount, 0);

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium">Receita</h3>
        <span className="text-sm font-semibold text-primary">
          R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
      </div>
      <div className="flex h-40 items-end gap-1">
        {data.map((d) => (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-t bg-green-500/70"
              style={{ height: `${(d.amount / maxAmount) * 100}%`, minHeight: d.amount > 0 ? '4px' : '0px' }}
            />
            <span className="text-[10px] text-muted-foreground">
              {new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
