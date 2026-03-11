import { useState, useEffect } from 'react';
import { UploadPage } from '@/pages/UploadPage';
import { SuccessPage } from '@/pages/SuccessPage';
import { InvalidTokenPage } from '@/pages/InvalidTokenPage';
import { LoadingPage } from '@/pages/LoadingPage';
import { uploadApi, type WorkOrderInfo } from '@/services/api';

type AppState = 'loading' | 'valid' | 'invalid' | 'success';

export function App() {
  const [state, setState] = useState<AppState>('loading');
  const [workOrder, setWorkOrder] = useState<WorkOrderInfo | null>(null);
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    // Extract token from URL: /upload/{token}
    const pathParts = window.location.pathname.split('/');
    const urlToken = pathParts[pathParts.length - 1] || pathParts[pathParts.length - 2];

    if (!urlToken || urlToken === 'upload') {
      setState('invalid');
      return;
    }

    setToken(urlToken);
    validateToken(urlToken);
  }, []);

  async function validateToken(t: string) {
    try {
      const result = await uploadApi.validateToken(t);
      if (result.valid) {
        setWorkOrder(result);
        setState('valid');
      } else {
        setState('invalid');
      }
    } catch {
      setState('invalid');
    }
  }

  function handleUploadComplete() {
    setState('success');
  }

  switch (state) {
    case 'loading':
      return <LoadingPage />;
    case 'invalid':
      return <InvalidTokenPage />;
    case 'success':
      return <SuccessPage returnUrl={workOrder?.returnUrl ?? null} />;
    case 'valid':
      return (
        <UploadPage
          token={token}
          workOrder={workOrder!}
          onComplete={handleUploadComplete}
        />
      );
  }
}
