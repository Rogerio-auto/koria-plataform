import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BriefingPage } from '@/pages/BriefingPage';
import { SuccessPage } from '@/pages/SuccessPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/briefing/:leadId" element={<BriefingPage />} />
        <Route path="/briefing/success" element={<SuccessPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
