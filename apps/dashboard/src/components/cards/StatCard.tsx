/**
 * Stat card — displays a single metric with label, value, and trend.
 * TODO: Style with @koria/ui Card component, add trend indicator.
 */

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: number;
  icon?: React.ReactNode;
}

export function StatCard({ label, value, trend, icon }: StatCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        {icon}
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
      {trend !== undefined && (
        <span className={`text-xs ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend >= 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
  );
}
