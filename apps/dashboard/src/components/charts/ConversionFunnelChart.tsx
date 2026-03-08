import { ArrowDown } from 'lucide-react';

interface ConversionStep {
  total: number;
  converted: number;
  rate: number;
}

interface ConversionFunnelData {
  leadToQualified: ConversionStep;
  qualifiedToDeal: ConversionStep;
  dealToPaid: ConversionStep;
  overallConversion: number;
}

interface ConversionFunnelChartProps {
  data?: ConversionFunnelData;
  isLoading?: boolean;
}

const STEPS = [
  { key: 'leadToQualified' as const, label: 'Lead → Qualificado' },
  { key: 'qualifiedToDeal' as const, label: 'Qualificado → Negócio' },
  { key: 'dealToPaid' as const, label: 'Negócio → Pago' },
];

export function ConversionFunnelChart({ data, isLoading }: ConversionFunnelChartProps) {
  if (isLoading) return <div className="h-64 animate-pulse rounded-lg border bg-card" />;
  if (!data) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-sm font-medium">Funil de Conversão</h3>
        <p className="mt-4 text-center text-sm text-muted-foreground">Sem dados.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium">Funil de Conversão</h3>
        <span className="text-xs font-semibold text-primary">{data.overallConversion}% geral</span>
      </div>
      <div className="space-y-1">
        {STEPS.map((step, idx) => {
          const s = data[step.key];
          const widthPct = Math.max(s.rate, 5);
          return (
            <div key={step.key}>
              <div className="flex items-center gap-3">
                <span className="w-40 text-xs text-muted-foreground">{step.label}</span>
                <div className="flex-1">
                  <div
                    className="h-7 rounded bg-primary/70 transition-all"
                    style={{ width: `${widthPct}%`, minWidth: '24px' }}
                  />
                </div>
                <span className="w-20 text-right text-xs font-medium">
                  {s.converted}/{s.total} ({s.rate}%)
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className="flex justify-center py-0.5 text-muted-foreground">
                  <ArrowDown size={12} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
