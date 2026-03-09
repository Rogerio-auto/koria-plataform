import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '@/services/api';

const QUERY_KEY = 'briefing-form-configs';

export function useBriefingFormConfigs() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => dashboardApi.getBriefingFormConfigs(),
  });
}

export function useBriefingFormConfig(id: string | null) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => dashboardApi.getBriefingFormConfig(id!),
    enabled: !!id,
  });
}

export function useBriefingFormTemplates() {
  return useQuery({
    queryKey: [QUERY_KEY, 'templates'],
    queryFn: () => dashboardApi.getBriefingFormTemplates(),
  });
}

export function useCreateBriefingFormConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; steps: any[]; settings?: any }) =>
      dashboardApi.createBriefingFormConfig(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateBriefingFormConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; steps?: any[]; settings?: any } }) =>
      dashboardApi.updateBriefingFormConfig(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function usePublishBriefingFormConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dashboardApi.publishBriefingFormConfig(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDeleteBriefingFormConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dashboardApi.deleteBriefingFormConfig(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDuplicateBriefingFormConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dashboardApi.duplicateBriefingFormConfig(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}
