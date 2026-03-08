import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/api';
import { BarChart3, Clock, AlertTriangle, DollarSign, TrendingUp } from 'lucide-react';

interface PipelinePerformanceData {
  pipeline: { id: string; name: string };
  totalLeads: number;
  conversionRate: number;
  averageTicket: number;
  revenueTotal: number;
  stageDistribution: Array<{ stage: string; count: number; avgDaysInStage: number }>;
  staleLeads: number;
  topSources: Array<{ source: string; count: number }>;
}

export function PipelineAnalyticsPanel({ pipelineId }: { pipelineId: string }) {
  const { data, isLoading } = useQuery<PipelinePerformanceData>({
    queryKey: ['analytics', 'pipeline-performance', pipelineId],
    queryFn: () => dashboardApi.getPipelinePerformance(pipelineId) as Promise<PipelinePerformanceData>,
  });

  if (isLoading) return <div className="mt-3 h-32 animate-pulse rounded border bg-muted" />;
  if (!data) return null;

  const maxStageCount = Math.max(...data.stageDistribution.map((s) => s.count), 1);

  return (
    <div className="mt-3 space-y-3 rounded border bg-muted/20 p-3">
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <MiniKpi icon={<BarChart3 size={12} />} label="Leads" value={String(data.totalLeads)} />
        <MiniKpi icon={<TrendingUp size={12} />} label="Conversão" value={`${data.conversionRate}%`} />
        <MiniKpi icon={<DollarSign size={12} />} label="Ticket Médio" value={`R$ ${data.averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
        <MiniKpi icon={<DollarSign size={12} />} label="Receita Total" value={`R$ ${data.revenueTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
      </div>

      {/* Stage distribution */}
      {data.stageDistribution.length > 0 && (
        <div>
          <h4 className="mb-1.5 text-xs font-medium text-muted-foreground">Distribuição por Etapa</h4>
          <div className="space-y-1">
            {data.stageDistribution.map((s) => (
              <div key={s.stage} className="flex items-center gap-2">
                <span className="w-24 truncate text-[11px] font-medium">{s.stage}</span>
                <div className="flex-1">
                  <div
                    className="h-4 rounded bg-primary/60"
                    style={{ width: `${(s.count / maxStageCount) * 100}%`, minWidth: s.count > 0 ? '6px' : '0' }}
                  />
                </div>
                <span className="w-8 text-right text-[11px] font-medium">{s.count}</span>
                <span className="flex w-16 items-center gap-0.5 text-right text-[10px] text-muted-foreground">
                  <Clock size={9} /> {s.avgDaysInStage}d
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom info */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        {data.staleLeads > 0 && (
          <span className="flex items-center gap-1 text-orange-500">
            <AlertTriangle size={12} /> {data.staleLeads} leads parados (+7 dias)
          </span>
        )}
        {data.topSources.length > 0 && (
          <span>
            Fontes: {data.topSources.map((s) => `${s.source} (${s.count})`).join(', ')}
          </span>
        )}
      </div>
    </div>
  );
}

function MiniKpi({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded border bg-card px-2 py-1.5 text-center">
      <div className="flex items-center justify-center gap-1 text-muted-foreground">{icon}<span className="text-[10px]">{label}</span></div>
      <div className="text-sm font-bold">{value}</div>
    </div>
  );
}
