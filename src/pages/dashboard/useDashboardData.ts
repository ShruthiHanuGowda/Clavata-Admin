import { useState, useEffect } from 'react';
import { fetchDashboardData } from './dashboardApi';

// Define interfaces for analytics data structure
interface AnalyticItem {
  title: string;
  count: string | number;
  percentage?: number;
  extra?: string;
  isLoss: boolean;
}

interface AnalyticsData {
  total?: AnalyticItem;
  daily?: AnalyticItem;
}

interface DashboardApiResponse {
  success: boolean;
  data: {
    analytics: {
      totalTitle?: string;
      totalUsers: number | string;
      totalUsersPercentage?: number;
      totalUsersExtra?: string;
      dailyTitle?: string;
      dailyUsers: number | string;
      dailyUsersPercentage?: number;
      dailyUsersExtra?: string;
    };
    chartData: number[];
  };
}

export const useDashboardData = (type = 'D_WALLET_API_BASE_URL') => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({});
  const [chartData, setChartData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeSlot, setTimeSlot] = useState('week');

  const normalizeApiResponse = (response: any): DashboardApiResponse | null => {
    if (!response) return null;

    // Handle different API response formats
    if (response.success) {
      return response as DashboardApiResponse;
    }

    // Fallback for different response structures
    return {
      success: true,
      data: {
        analytics: {
          totalTitle: response.totalTitle || 'Total',
          totalUsers: response.totalUsers || 0,
          totalUsersPercentage: response.totalUsersPercentage,
          totalUsersExtra: response.totalUsersExtra,
          dailyTitle: response.dailyTitle || 'Daily',
          dailyUsers: response.dailyUsers || 0,
          dailyUsersPercentage: response.dailyUsersPercentage,
          dailyUsersExtra: response.dailyUsersExtra
        },
        chartData: Array.isArray(response.chartData) ? response.chartData : []
      }
    };
  };

  const loadDashboardData = async (slot = timeSlot) => {
    try {
      setLoading(true);
      setError('');
      const response = await fetchDashboardData(type, slot);
      const normalizedResponse = normalizeApiResponse(response);

      if (normalizedResponse?.success) {
        const { analytics: apiAnalytics, chartData: apiChartData } = normalizedResponse.data;

        const newAnalytics: AnalyticsData = {};

        // Only add total analytics if data exists
        if (apiAnalytics.totalUsers !== undefined && apiAnalytics.totalUsers !== null) {
          newAnalytics.total = {
            title: apiAnalytics.totalTitle || 'Total Users',
            count: typeof apiAnalytics.totalUsers === 'number' ? apiAnalytics.totalUsers.toLocaleString() : String(apiAnalytics.totalUsers),
            percentage: apiAnalytics.totalUsersPercentage,
            extra: apiAnalytics.totalUsersExtra,
            isLoss: false
          };
        }

        // Only add daily analytics if data exists
        if (apiAnalytics.dailyUsers !== undefined && apiAnalytics.dailyUsers !== null) {
          newAnalytics.daily = {
            title: apiAnalytics.dailyTitle || 'Daily Users',
            count: typeof apiAnalytics.dailyUsers === 'number' ? apiAnalytics.dailyUsers.toLocaleString() : String(apiAnalytics.dailyUsers),
            percentage: apiAnalytics.dailyUsersPercentage,
            extra: apiAnalytics.dailyUsersExtra,
            isLoss: false
          };
        }

        setAnalytics(newAnalytics);
        setChartData(Array.isArray(apiChartData) ? apiChartData : []);
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (err: unknown) {
      console.error('Dashboard data loading error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setAnalytics({});
      setChartData([]);
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
