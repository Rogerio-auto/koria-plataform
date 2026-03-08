import { useAnalytics } from '@/hooks/use-analytics';
import { StatCard } from '@/components/cards/StatCard';
import { FunnelChart } from '@/components/charts/FunnelChart';
import { RevenueChart } from '@/components/charts/RevenueChart';
import { ConversionFunnelChart } from '@/components/charts/ConversionFunnelChart';
import { SourcesChart } from '@/components/charts/SourcesChart';
import { ChannelsChart } from '@/components/charts/ChannelsChart';
import { QuoteFunnelChart } from '@/components/charts/QuoteFunnelChart';
import { WorkOrderStatusChart } from '@/components/charts/WorkOrderStatusChart';
import { ActivityFeed } from '@/components/charts/ActivityFeed';
import {
  Users, DollarSign, TrendingUp, Briefcase,
  Bot, Send, AlertOctagon, ShieldAlert,
  Receipt, ClipboardCheck,
} from 'lucide-react';

export function OverviewPage() {
  const {
    overview, funnel, leadsByPeriod, revenue,
    aiCosts, followupRate, errors, objectionsOverview,
    conversionRates, averageTicket, leadSources,
    channelsDistribution, quoteFunnel, workOrderStatus, briefingCompletion,
    recentActivity,
  } = useAnalytics();

  const data = overview.data as {
    totalLeads?: { value: number; variation: number };
    qualifiedLeads?: { value: number; variation: number };
    closedDeals?: { value: number; variation: number };
    revenue?: { value: number; variation: number };
  } | undefined;

  const aiData = aiCosts.data as Array<{ date: string; agent: string; totalCost: string | number; totalRuns: number; totalTokens: string | number }> | undefined;
  const followupData = followupRate.data as { totalSent: number; conversions: number; rate: number } | undefined;
  const errorsData = errors.data as Array<{ context: string; count: number }> | undefined;
  const objectionsData = objectionsOverview.data as {
    totalObjections: number;
    overcomeRate: number;
    topCategories: Array<{ slug: string; name: string; total: number; overcome: number; overcomeRate: number }>;
  } | undefined;
  const ticketData = averageTicket.data as { averageTicket: number; totalRevenue: number; totalDeals: number; variation: number } | undefined;
  const briefingData = briefingCompletion.data as { pending: number; sent: number; completed: number; completionRate: number } | undefined;

  const totalAiCost = aiData?.reduce((acc, r) => acc + Number(r.totalCost || 0), 0) ?? 0;
  const totalAiRuns = aiData?.reduce((acc, r) => acc + r.totalRuns, 0) ?? 0;
  const totalErrors = errorsData?.reduce((acc, r) => acc + r.count, 0) ?? 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Visão Geral</h2>

      {/* KPI Cards — Row 1: Comercial */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total de Leads"
          value={overview.isLoading ? '...' : (data?.totalLeads?.value ?? 0)}
          trend={data?.totalLeads?.variation}
          icon={<Users size={18} className="text-muted-foreground" />}
        />
        <StatCard
          label="Receita"
          value={
            overview.isLoading
              ? '...'
              : `R$ ${(data?.revenue?.value ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
          }
          trend={data?.revenue?.variation}
          icon={<DollarSign size={18} className="text-muted-foreground" />}
        />
        <StatCard
          label="Leads Qualificados"
          value={overview.isLoading ? '...' : (data?.qualifiedLeads?.value ?? 0)}
          trend={data?.qualifiedLeads?.variation}
          icon={<TrendingUp size={18} className="text-muted-foreground" />}
        />
        <StatCard
          label="Negócios Fechados"
          value={overview.isLoading ? '...' : (data?.closedDeals?.value ?? 0)}
          trend={data?.closedDeals?.variation}
          icon={<Briefcase size={18} className="text-muted-foreground" />}
        />
      </div>

      {/* KPI Cards — Row 2: Operacional */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Ticket Médio"
          value={
            averageTicket.isLoading
              ? '...'
              : `R$ ${(ticketData?.averageTicket ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
          }
          trend={ticketData?.variation}
          icon={<Receipt size={18} className="text-muted-foreground" />}
        />
        <StatCard
          label="Custo IA Total"
          value={aiCosts.isLoading ? '...' : `$ ${totalAiCost.toFixed(2)}`}
          icon={<Bot size={18} className="text-muted-foreground" />}
        />
        <StatCard
          label="Follow-ups Enviados"
          value={followupRate.isLoading ? '...' : (followupData?.totalSent ?? 0)}
          icon={<Send size={18} className="text-muted-foreground" />}
        />
        <StatCard
          label="Briefings Completos"
          value={
            briefingCompletion.isLoading
              ? '...'
              : `${briefingData?.completionRate ?? 0}%`
          }
          icon={<ClipboardCheck size={18} className="text-muted-foreground" />}
        />
      </div>

      {/* KPI Cards — Row 3: Alertas */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Objeções Detectadas"
          value={objectionsOverview.isLoading ? '...' : (objectionsData?.totalObjections ?? 0)}
          icon={<ShieldAlert size={18} className="text-muted-foreground" />}
        />
        <StatCard
          label="Erros (7 dias)"
          value={errors.isLoading ? '...' : totalErrors}
          icon={<AlertOctagon size={18} className="text-muted-foreground" />}
        />
      </div>

      {/* Charts Row: Funil + Receita */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FunnelChart data={funnel.data as Array<{ stage: string; count: number }> | undefined} isLoading={funnel.isLoading} />
        <RevenueChart data={revenue.data as Array<{ date: string; amount: number }> | undefined} isLoading={revenue.isLoading} />
      </div>

      {/* Conversion Funnel */}
      <ConversionFunnelChart data={conversionRates.data as any} isLoading={conversionRates.isLoading} />

      {/* Leads by Period */}
      <LeadsByPeriodChart
        data={leadsByPeriod.data as Array<{ date: string; count: number }> | undefined}
        isLoading={leadsByPeriod.isLoading}
      />

      {/* Acquisition: Sources + Channels */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SourcesChart data={leadSources.data as any} isLoading={leadSources.isLoading} />
        <ChannelsChart data={channelsDistribution.data as any} isLoading={channelsDistribution.isLoading} />
      </div>

      {/* Production: Quotes + Work Orders */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <QuoteFunnelChart data={quoteFunnel.data as any} isLoading={quoteFunnel.isLoading} />
        <WorkOrderStatusChart data={workOrderStatus.data as any} isLoading={workOrderStatus.isLoading} />
      </div>

      {/* Operational Details Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AiCostsWidget data={aiData} isLoading={aiCosts.isLoading} totalCost={totalAiCost} totalRuns={totalAiRuns} />
        <ObjectionsWidget data={objectionsData} isLoading={objectionsOverview.isLoading} />
      </div>

      {/* Errors widget */}
      <ErrorsWidget data={errorsData} isLoading={errors.isLoading} total={totalErrors} />

      {/* Activity Feed */}
      <ActivityFeed data={recentActivity.data as any} isLoading={recentActivity.isLoading} />
    </div>
  );
}

// --- Leads by Period ---

function LeadsByPeriodChart({
  data,
  isLoading,
}: {
  data?: Array<{ date: string; count: number }>;
  isLoading: boolean;
}) {
  if (isLoading) return <div className="h-64 animate-pulse rounded-lg border bg-card" />;
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

// --- AI Costs Widget ---

function AiCostsWidget({
  data,
  isLoading,
  totalCost,
  totalRuns,
}: {
  data?: Array<{ date: string; agent: string; totalCost: string | number; totalRuns: number; totalTokens: string | number }>;
  isLoading: boolean;
  totalCost: number;
  totalRuns: number;
}) {
  if (isLoading) return <div className="h-64 animate-pulse rounded-lg border bg-card" />;

  const byAgent = new Map<string, { cost: number; runs: number; tokens: number }>();
  for (const row of data || []) {
    const prev = byAgent.get(row.agent) || { cost: 0, runs: 0, tokens: 0 };
    byAgent.set(row.agent, {
      cost: prev.cost + Number(row.totalCost || 0),
      runs: prev.runs + row.totalRuns,
      tokens: prev.tokens + Number(row.totalTokens || 0),
    });
  }
  const agents = Array.from(byAgent.entries()).sort((a, b) => b[1].cost - a[1].cost);

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium">Custos de IA</h3>
        <div className="text-right text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">$ {totalCost.toFixed(2)}</span> · {totalRuns} execuções
        </div>
      </div>
      {agents.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">Sem dados de IA no período.</p>
      ) : (
        <div className="space-y-2">
          {agents.map(([agent, stats]) => {
            const pct = totalCost > 0 ? (stats.cost / totalCost) * 100 : 0;
            return (
              <div key={agent} className="flex items-center gap-3">
                <span className="w-28 truncate text-xs font-medium">{agent}</span>
                <div className="flex-1">
                  <div
                    className="h-5 rounded bg-violet-500/70"
                    style={{ width: `${pct}%`, minWidth: stats.cost > 0 ? '8px' : '0px' }}
                  />
                </div>
                <span className="w-20 text-right text-xs text-muted-foreground">
                  $ {stats.cost.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- Objections Widget ---

function ObjectionsWidget({
  data,
  isLoading,
}: {
  data?: {
    totalObjections: number;
    overcomeRate: number;
    topCategories: Array<{ slug: string; name: string; total: number; overcome: number; overcomeRate: number }>;
  };
  isLoading: boolean;
}) {
  if (isLoading) return <div className="h-64 animate-pulse rounded-lg border bg-card" />;
  if (!data || data.totalObjections === 0) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-sm font-medium">Objeções</h3>
        <p className="mt-4 text-center text-sm text-muted-foreground">Nenhuma objeção detectada.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium">Objeções</h3>
        <div className="flex items-center gap-3 text-xs">
          <span>{data.totalObjections} total</span>
          <span className={data.overcomeRate >= 50 ? 'text-green-600' : 'text-orange-500'}>
            {data.overcomeRate}% superadas
          </span>
        </div>
      </div>
      <div className="space-y-2">
        {data.topCategories.slice(0, 5).map((cat) => (
          <div key={cat.slug} className="flex items-center gap-3">
            <span className="w-32 truncate text-xs font-medium">{cat.name}</span>
            <div className="flex-1">
              <div className="relative h-5 w-full rounded bg-muted">
                <div
                  className="absolute left-0 top-0 h-full rounded bg-orange-400/70"
                  style={{ width: `${(cat.total / data.totalObjections) * 100}%`, minWidth: '8px' }}
                />
                <div
                  className="absolute left-0 top-0 h-full rounded bg-green-500/70"
                  style={{ width: `${(cat.overcome / data.totalObjections) * 100}%`, minWidth: cat.overcome > 0 ? '4px' : '0px' }}
                />
              </div>
            </div>
            <span className="w-16 text-right text-xs text-muted-foreground">
              {cat.total} ({cat.overcomeRate}%)
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded bg-orange-400/70" /> Total</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded bg-green-500/70" /> Superadas</span>
      </div>
    </div>
  );
}

// --- Errors Widget ---

function ErrorsWidget({
  data,
  isLoading,
  total,
}: {
  data?: Array<{ context: string; count: number }>;
  isLoading: boolean;
  total: number;
}) {
  if (isLoading) return <div className="h-32 animate-pulse rounded-lg border bg-card" />;
  if (!data || total === 0) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-sm font-medium">Erros do Sistema (últimos 7 dias)</h3>
        <p className="mt-2 text-center text-sm text-green-600">Nenhum erro registrado. ✓</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium">Erros do Sistema (últimos 7 dias)</h3>
        <span className="text-xs font-semibold text-red-500">{total} erros</span>
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {data.slice(0, 8).map((err) => (
          <div key={err.context} className="rounded border px-3 py-2 text-center">
            <div className="text-lg font-bold text-red-500">{err.count}</div>
            <div className="truncate text-[10px] text-muted-foreground">{err.context}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
