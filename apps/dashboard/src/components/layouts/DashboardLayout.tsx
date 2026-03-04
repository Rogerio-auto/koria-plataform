/**
 * Dashboard layout — sidebar + top bar + main content area.
 * TODO: Implement with sidebar navigation, user menu, breadcrumbs.
 */
import { Outlet } from 'react-router-dom';

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card p-4">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-primary">KorIA</h1>
        </div>
        <nav className="space-y-2">
          {/* TODO: Sidebar navigation links */}
          <p className="text-sm text-muted-foreground">Navigation placeholder</p>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1">
        <header className="border-b bg-card px-6 py-3">
          {/* TODO: Breadcrumbs, search, user menu */}
          <p className="text-sm text-muted-foreground">Header placeholder</p>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
