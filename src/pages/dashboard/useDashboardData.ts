
import {
  useCallback,
  useEffect,
  useState
} from 'react';

import { useApolloClient } from '@apollo/client';

import {
  DashboardData,
  DashboardPeriod,
  buildDashboardData,
  fetchDashboardData
} from './dashboardApi';

const useDashboardData = (
  period: DashboardPeriod
) => {
  const client = useApolloClient();

  const [data, setData] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadDashboard = useCallback(
    async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const result =
          await fetchDashboardData(client);

        const dashboard =
          buildDashboardData(
            result.customers,
            result.salons,
            result.bookings,
            result.reviews,
            period,
            {
              customerCount: result.customerCount,
              salonCount: result.salonCount
            }
          );

        setData(dashboard);
      } catch (err: unknown) {
        console.error(
          '[Dashboard] Loading failed:',
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load dashboard data. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    },
    [client, period]
  );

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  return {
    data,
    loading,
    error,
    refetch: loadDashboard
  };
};

export default useDashboardData;
