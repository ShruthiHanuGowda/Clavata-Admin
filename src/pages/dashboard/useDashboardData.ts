
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

// =========================================================
// HOOK
// =========================================================

export const useDashboardData = (
  period: DashboardPeriod
) => {
  const client = useApolloClient();

  const [
    data,
    setData
  ] = useState<DashboardData | null>(null);

  const [
    loading,
    setLoading
  ] = useState<boolean>(true);

  const [
    error,
    setError
  ] = useState<string | null>(null);

  // =======================================================
  // LOAD DASHBOARD
  // =======================================================

  const loadDashboard = useCallback(
    async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const result = await fetchDashboardData(
          client
        );

        const dashboard = buildDashboardData(
          result.customers,
          result.salons,
          result.bookings,
          result.reviews,
          period
        );

        setData(dashboard);
      } catch (err: unknown) {
        console.error(
          'Dashboard loading error:',
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load dashboard data'
        );
      } finally {
        setLoading(false);
      }
    },
    [
      client,
      period
    ]
  );

  // =======================================================
  // LOAD ON MOUNT / PERIOD CHANGE
  // =======================================================

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  // =======================================================
  // RETURN
  // =======================================================

  return {
    data,
    loading,
    error,
    refetch: loadDashboard
  };
};

export default useDashboardData;

