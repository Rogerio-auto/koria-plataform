/**
 * Briefing Form App — Main component.
 *
 * Renders a multi-step briefing form for leads.
 * Route format: /briefing/:leadId
 *
 * TODO: Implement routing and form logic
 */

export function App() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card p-4">
        <h1 className="text-xl font-bold text-primary">KorIA Briefing</h1>
      </header>
      <main className="container mx-auto max-w-2xl p-6">
        <p className="text-muted-foreground">
          Briefing form — placeholder. Multi-step form will be implemented here.
        </p>
      </main>
    </div>
  );
}
