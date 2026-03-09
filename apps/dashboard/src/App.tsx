import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { InvitePage } from '@/pages/InvitePage';
import { OverviewPage } from '@/pages/OverviewPage';
import { ObjectionsPage } from '@/pages/ObjectionsPage';
import { UsersPage } from '@/pages/UsersPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { LeadsPage } from '@/pages/LeadsPage';
import { LeadDetailPage } from '@/pages/LeadDetailPage';
import { WorkOrdersPage } from '@/pages/WorkOrdersPage';
import { PaymentsPage } from '@/pages/PaymentsPage';
import { ProductsPage } from '@/pages/ProductsPage';
import { PipelinesPage } from '@/pages/PipelinesPage';
import { BriefingFormBuilderPage } from '@/pages/BriefingFormBuilderPage';

export function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/invite/:token" element={<InvitePage />} />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="objections" element={<ObjectionsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="leads/:id" element={<LeadDetailPage />} />
          <Route path="work-orders" element={<WorkOrdersPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="pipelines" element={<PipelinesPage />} />
          <Route path="settings" element={<SettingsPage />} />

          {/* Admin/Manager only */}
          <Route element={<ProtectedRoute roles={['admin', 'manager']} />}>
            <Route path="settings/users" element={<UsersPage />} />
            <Route path="settings/briefing-form" element={<BriefingFormBuilderPage />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
