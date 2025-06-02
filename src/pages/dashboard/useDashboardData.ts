import { useState, useEffect } from 'react';
import { fetchDashboardData } from './dashboardApi';

// Define interfaces for analytics data structure
interface AnalyticItem {
  title: string;
  count: string;
  percentage?: number;
  extra?: string;
  isLoss: boolean;
}

interface AnalyticsData {
  total: AnalyticItem;
  daily: AnalyticItem;
}

export const useDashboardData = (type = 'D_WALLET_API_BASE_URL') => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({} as AnalyticsData);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeSlot, setTimeSlot] = useState('week');

  const loadDashboardData = async (slot = timeSlot) => {
    try {
      setLoading(true);
      const response = await fetchDashboardData(type, slot);
      if (response.success) {
        // Extract analytics data from combined response
        const dashboardData = response.data;
        setAnalytics({
          total: {
            title: dashboardData.analytics.totalTitle ?? 'New User accounts',
            count: String(dashboardData.analytics.totalUsers),
            percentage: dashboardData.analytics.totalUsersPercentage,
            extra: dashboardData.analytics.totalUsersExtra,
            isLoss: false
          },
          daily: {
            title: dashboardData.analytics.dailyTitle ?? 'New User accounts',
            count: String(dashboardData.analytics.dailyUsers),
            percentage: dashboardData.analytics.dailyUsersPercentage,
            extra: dashboardData.analytics.dailyUsersExtra,
            isLoss: false
          }
        });
        setChartData(dashboardData.chartData);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle time slot change
  const handleTimeSlotChange = async (newSlot: string) => {
    setTimeSlot(newSlot);
    await loadDashboardData(newSlot);
  };

  // Initial data load
  useEffect(() => {
    loadDashboardData();
  }, []);

  return {
    analytics,
    chartData,
    loading,
    error,
    timeSlot,
    handleTimeSlotChange,
    refetch: () => loadDashboardData(timeSlot)
  };
};
