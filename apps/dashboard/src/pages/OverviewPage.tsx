/**
 * Overview page — dashboard home with KPIs, charts, recent activity.
 * TODO: Display StatCards (total leads, revenue, active work orders, etc.)
 *       + RevenueChart + FunnelChart + recent leads table
 */
export function OverviewPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Visão Geral</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* TODO: StatCards */}
        <p className="text-muted-foreground">KPI cards placeholder</p>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* TODO: Charts */}
        <p className="text-muted-foreground">Charts placeholder</p>
      </div>
    </div>
  );
}
