import { useState, useEffect } from 'react';
import { fetchDashboardData, ApiBaseUrlKey } from './dashboardApi';

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

type TimeSlot = 'week' | 'month';

export const useDashboardData = (type: ApiBaseUrlKey = 'D_WALLET_API_BASE_URL') => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({});
  const [chartData, setChartData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('week');

  const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

  const isDashboardApiResponse = (value: unknown): value is DashboardApiResponse => {
    if (!isObject(value)) return false;
    if (typeof value.success !== 'boolean') return false;
    if (!isObject(value.data)) return false;

    const { analytics, chartData } = value.data;
    if (!isObject(analytics)) return false;
    if (!Array.isArray(chartData)) return false;

    return true;
  };

  const normalizeApiResponse = (response: unknown): DashboardApiResponse | null => {
    if (!isObject(response)) return null;

    if (isDashboardApiResponse(response)) {
      return response;
    }

    const r = response as Record<string, unknown>;

    return {
      success: true,
      data: {
        analytics: {
          totalTitle: typeof r.totalTitle === 'string' ? r.totalTitle : 'Total',
          totalUsers: typeof r.totalUsers === 'number' || typeof r.totalUsers === 'string' ? r.totalUsers : 0,
          totalUsersPercentage: typeof r.totalUsersPercentage === 'number' ? r.totalUsersPercentage : undefined,
          totalUsersExtra: typeof r.totalUsersExtra === 'string' ? r.totalUsersExtra : undefined,
          dailyTitle: typeof r.dailyTitle === 'string' ? r.dailyTitle : 'Daily',
          dailyUsers: typeof r.dailyUsers === 'number' || typeof r.dailyUsers === 'string' ? r.dailyUsers : 0,
          dailyUsersPercentage: typeof r.dailyUsersPercentage === 'number' ? r.dailyUsersPercentage : undefined,
          dailyUsersExtra: typeof r.dailyUsersExtra === 'string' ? r.dailyUsersExtra : undefined
        },
        chartData: Array.isArray(r.chartData) && r.chartData.every((item) => typeof item === 'number') ? (r.chartData as number[]) : []
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
  const handleTimeSlotChange = async (newSlot: TimeSlot) => {
    setTimeSlot(newSlot);
    await loadDashboardData(newSlot);
  };

  // Initial data load
  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
