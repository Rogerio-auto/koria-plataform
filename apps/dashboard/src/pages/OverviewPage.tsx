import { useAnalytics } from '@/hooks/use-analytics';
import { StatCard } from '@/components/cards/StatCard';
import { FunnelChart } from '@/components/charts/FunnelChart';
import { RevenueChart } from '@/components/charts/RevenueChart';
import { Users, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';

export function OverviewPage() {
  const { overview, funnel, leadsByPeriod, revenue } = useAnalytics();

  const data = overview.data as {
    totalLeads?: number;
    totalLeadsVariation?: number;
    totalRevenue?: number;
    totalRevenueVariation?: number;
    conversionRate?: number;
    conversionRateVariation?: number;
    totalErrors?: number;
    totalErrorsVariation?: number;
  } | undefined;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Visão Geral</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total de Leads"
          value={overview.isLoading ? '...' : (data?.totalLeads ?? 0)}
          trend={data?.totalLeadsVariation}
          icon={<Users size={18} className="text-muted-foreground" />}
        />
        <StatCard
          label="Receita"
          value={
            overview.isLoading
              ? '...'
              : `R$ ${(data?.totalRevenue ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
          }
          trend={data?.totalRevenueVariation}
          icon={<DollarSign size={18} className="text-muted-foreground" />}
        />
        <StatCard
          label="Taxa de Conversão"
          value={overview.isLoading ? '...' : `${(data?.conversionRate ?? 0).toFixed(1)}%`}
          trend={data?.conversionRateVariation}
          icon={<TrendingUp size={18} className="text-muted-foreground" />}
        />
        <StatCard
          label="Erros"
          value={overview.isLoading ? '...' : (data?.totalErrors ?? 0)}
          trend={data?.totalErrorsVariation}
          icon={<AlertTriangle size={18} className="text-muted-foreground" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FunnelChart data={funnel.data as Array<{ stage: string; count: number }> | undefined} isLoading={funnel.isLoading} />
        <RevenueChart data={revenue.data as Array<{ date: string; amount: number }> | undefined} isLoading={revenue.isLoading} />
      </div>

      {/* Leads by Period Chart */}
      <LeadsByPeriodChart
        data={leadsByPeriod.data as Array<{ date: string; count: number }> | undefined}
        isLoading={leadsByPeriod.isLoading}
      />
    </div>
  );
}

function LeadsByPeriodChart({
  data,
  isLoading,
}: {
  data?: Array<{ date: string; count: number }>;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-lg border bg-card" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 rounded-lg border bg-card p-4">
        <h3 className="text-sm font-medium">Leads por Período</h3>
        <p className="mt-8 text-center text-sm text-muted-foreground">Sem dados para o período.</p>
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="mb-4 text-sm font-medium">Leads por Período</h3>
      <div className="flex h-48 items-end gap-1">
        {data.map((d) => (
          <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-xs text-muted-foreground">{d.count}</span>
            <div
              className="w-full rounded-t bg-primary/80"
              style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: d.count > 0 ? '4px' : '0px' }}
            />
            <span className="text-[10px] text-muted-foreground">{new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
