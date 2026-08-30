
import { useCallback, useEffect, useState } from 'react';

import {
  DashboardData,
  fetchDashboardData
} from './dashboardApi';

// ==============================|| DASHBOARD HOOK ||============================== //

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchDashboardData();

      setData(response);
    } catch (err) {
      console.error('Dashboard loading error:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load dashboard data'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return {
    data,
    loading,
    error,
    refetch: loadDashboard
  };
};

export default useDashboardData;
