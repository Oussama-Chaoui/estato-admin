import { useState } from 'react';
import useSWR from 'swr';
import useApi, { ApiResponse } from '@common/hooks/useApi';
import ApiRoutes from '@modules/dashboard/defs/api-routes';
import { DashboardData } from '@modules/dashboard/defs/types';

export interface UseDashboardReturn {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const useDashboard = (): UseDashboardReturn => {
  const fetchApi = useApi();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data, mutate } = useSWR<DashboardData>(
    ApiRoutes.GetStatistics,
    async (url: string): Promise<DashboardData> => {
      try {
        setIsLoading(true);
        setError(null);

        const response: ApiResponse<DashboardData> = await fetchApi<DashboardData>(url, {
          method: 'GET',
        });

        if (!response.success) {
          throw new Error(response.errors?.[0] || 'Failed to fetch dashboard data');
        }

        if (!response.data) {
          throw new Error('No data received from server');
        }

        return response.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 300000,
    }
  );

  const refetch = () => {
    mutate();
  };

  return {
    data: data || null,
    isLoading,
    error,
    refetch,
  };
};

export default useDashboard;
