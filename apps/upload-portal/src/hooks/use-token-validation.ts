import { useState, useEffect } from 'react';
import { uploadApi, type WorkOrderInfo } from '@/services/api';

interface TokenValidation {
  isValid: boolean;
  isLoading: boolean;
  workOrder: WorkOrderInfo | null;
  error: string | null;
}

export function useTokenValidation(token: string | undefined): TokenValidation {
  const [state, setState] = useState<TokenValidation>({
    isValid: false,
    isLoading: true,
    workOrder: null,
    error: null,
  });

  useEffect(() => {
    if (!token) {
      setState({ isValid: false, isLoading: false, workOrder: null, error: 'Token não fornecido' });
      return;
    }

    uploadApi
      .validateToken(token)
      .then((result) => {
        setState({
          isValid: result.valid,
          isLoading: false,
          workOrder: result,
          error: result.valid ? null : 'Token inválido',
        });
      })
      .catch(() => {
        setState({
          isValid: false,
          isLoading: false,
          workOrder: null,
          error: 'Erro ao validar token',
        });
      });
  }, [token]);

  return state;
}
