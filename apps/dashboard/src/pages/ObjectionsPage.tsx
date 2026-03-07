import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/api';
import { useState } from 'react';
import { ShieldAlert, ChevronRight, ArrowLeft } from 'lucide-react';

interface CategorySummary {
  category: string;
  categoryName: string;
  total: number;
  overcomeRate: number;
}

interface ObjectionsOverview {
  totalObjections: number;
  overcomeRate: number;
  topCategories: CategorySummary[];
}

interface ByPeriodItem {
  date: string;
  category: string;
  count: number;
}

interface DrilldownItem {
  id: string;
  leadName: string;
  originalText: string;
  wasOvercome: boolean;
  detectedAt: string;
  suggestedResponse: string;
}

export function ObjectionsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const overview = useQuery<ObjectionsOverview>({
    queryKey: ['objections', 'overview'],
    queryFn: () => dashboardApi.getObjectionsOverview() as Promise<ObjectionsOverview>,
  });

  const byPeriod = useQuery<ByPeriodItem[]>({
    queryKey: ['objections', 'by-period'],
    queryFn: () => dashboardApi.getObjectionsByPeriod() as Promise<ByPeriodItem[]>,
  });

  const drilldown = useQuery<{ category: string; categoryName: string; suggestedResponse: string; objections: DrilldownItem[] }>({
    queryKey: ['objections', 'drilldown', selectedCategory],
    queryFn: () => dashboardApi.getObjectionDrilldown(selectedCategory!) as Promise<{ category: string; categoryName: string; suggestedResponse: string; objections: DrilldownItem[] }>,
    enabled: !!selectedCategory,
  });

  if (selectedCategory && drilldown.data) {
    return (
      <DrilldownView
        data={drilldown.data}
        isLoading={drilldown.isLoading}
        onBack={() => setSelectedCategory(null)}
      />
    );
  }

  const data = overview.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShieldAlert size={24} className="text-primary" />
        <h2 className="text-2xl font-bold">Objeções</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-4">
          <span className="text-sm text-muted-foreground">Total de Objeções</span>
          <div className="mt-1 text-3xl font-bold">
            {overview.isLoading ? '...' : (data?.totalObjections ?? 0)}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <span className="text-sm text-muted-foreground">Taxa de Superação</span>
          <div className="mt-1 text-3xl font-bold text-green-600">
            {overview.isLoading ? '...' : `${(data?.overcomeRate ?? 0).toFixed(1)}%`}
          </div>
        </div>
      </div>

      {/* Category Ranking */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-4 text-sm font-medium">Ranking por Categoria</h3>
        {overview.isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : !data?.topCategories?.length ? (
          <p className="py-4 text-center text-sm text-muted-foreground">Nenhuma objeção encontrada.</p>
        ) : (
          <div className="space-y-2">
            {data.topCategories.map((cat) => {
              const maxTotal = Math.max(...data.topCategories.map((c: CategorySummary) => c.total), 1);
              return (
                <button
                  key={cat.category}
                  onClick={() => setSelectedCategory(cat.category)}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-secondary transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{cat.categoryName}</span>
                      <span className="text-xs text-muted-foreground">{cat.total} ocorrências</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-2 flex-1 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary/70"
                          style={{ width: `${(cat.total / maxTotal) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-green-600">{cat.overcomeRate.toFixed(0)}% superadas</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* By Period Chart */}
      {byPeriod.data && byPeriod.data.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-4 text-sm font-medium">Objeções por Período</h3>
          <ByPeriodMiniChart data={byPeriod.data} />
        </div>
      )}
    </div>
  );
}

function ByPeriodMiniChart({ data }: { data: ByPeriodItem[] }) {
  // Aggregate by date
  const byDate = new Map<string, number>();
  for (const item of data) {
    byDate.set(item.date, (byDate.get(item.date) || 0) + item.count);
  }
  const dates = Array.from(byDate.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  const maxCount = Math.max(...dates.map(([, c]) => c), 1);

  return (
    <div className="flex h-32 items-end gap-1">
      {dates.map(([date, count]) => (
        <div key={date} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-[10px] text-muted-foreground">{count}</span>
          <div
            className="w-full rounded-t bg-red-400/70"
            style={{ height: `${(count / maxCount) * 100}%`, minHeight: count > 0 ? '4px' : '0px' }}
          />
          <span className="text-[9px] text-muted-foreground">
            {new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
          </span>
        </div>
      ))}
    </div>
  );
}

function DrilldownView({
  data,
  isLoading,
  onBack,
}: {
  data: { category: string; categoryName: string; suggestedResponse: string; objections: DrilldownItem[] };
  isLoading: boolean;
  onBack: () => void;
}) {
  if (isLoading) return <div className="h-64 animate-pulse rounded-lg bg-muted" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="rounded-md p-1 hover:bg-secondary">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold">{data.categoryName}</h2>
          <p className="text-sm text-muted-foreground">{data.objections.length} ocorrências</p>
        </div>
      </div>

      {data.suggestedResponse && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
          <h4 className="mb-1 text-sm font-medium text-green-800 dark:text-green-300">Resposta Sugerida</h4>
          <p className="text-sm text-green-700 dark:text-green-400">{data.suggestedResponse}</p>
        </div>
      )}

      <div className="rounded-lg border bg-card">
        <div className="grid grid-cols-[1fr_2fr_100px_140px] gap-4 border-b px-4 py-2 text-xs font-medium text-muted-foreground">
          <span>Lead</span>
          <span>Texto Original</span>
          <span>Superada?</span>
          <span>Data</span>
        </div>
        {data.objections.map((obj) => (
          <div key={obj.id} className="grid grid-cols-[1fr_2fr_100px_140px] gap-4 border-b px-4 py-3 text-sm last:border-b-0">
            <span className="truncate font-medium">{obj.leadName}</span>
            <span className="truncate text-muted-foreground">{obj.originalText}</span>
            <span>
              {obj.wasOvercome ? (
                <span className="inline-block rounded bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900 dark:text-green-300">Sim</span>
              ) : (
                <span className="inline-block rounded bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-900 dark:text-red-300">Não</span>
              )}
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(obj.detectedAt).toLocaleDateString('pt-BR')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
