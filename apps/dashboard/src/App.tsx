/**
 * Dashboard App — Main component with routing.
 * TODO: Implement route definitions, auth protection, layout.
 */
import { Routes, Route } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        {/* TODO: Add child routes for each section */}
        {/* <Route index element={<OverviewPage />} /> */}
        {/* <Route path="leads" element={<LeadsPage />} /> */}
        {/* <Route path="leads/:id" element={<LeadDetailPage />} /> */}
        {/* <Route path="work-orders" element={<WorkOrdersPage />} /> */}
        {/* <Route path="payments" element={<PaymentsPage />} /> */}
        {/* <Route path="analytics" element={<AnalyticsPage />} /> */}
        {/* <Route path="products" element={<ProductsPage />} /> */}
      </Route>
      {/* <Route path="/login" element={<LoginPage />} /> */}
    </Routes>
  );
}
