import { useState, useEffect } from 'react';
import { fetchAnalytics, fetchChartData, fetchDashboardData } from './dashboardApi';

export const useDashboardData = () => {
    const [analytics, setAnalytics] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeSlot, setTimeSlot] = useState('week');

    const loadAnalytics = async () => {
        try {
            const response = await fetchAnalytics();
            if (response.success) {
                setAnalytics(response.data);
            }
        } catch (err) {
            setError(err.message);
        }
    };


    const loadChartData = async (slot = timeSlot) => {
        try {
            const response = await fetchChartData(slot);
            if (response.success) {
                setChartData(response.data.values);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const loadDashboardData = async (slot = timeSlot) => {
        try {
            setLoading(true);
            const response = await fetchDashboardData(slot);
            if (response.success) {
                // Extract analytics data from combined response
                const dashboardData = response.data;
                setAnalytics({
                    totalUsers: {
                        title: "New User accounts",
                        count: dashboardData.analytics.totalUsers,
                        percentage: dashboardData.analytics.totalUsersPercentage,
                        extra: dashboardData.analytics.totalUsersExtra,
                        isLoss: false
                    },
                    dailyUsers: {
                        title: "New User accounts in 24 hours",
                        count: dashboardData.analytics.dailyUsers,
                        percentage: dashboardData.analytics.dailyUsersPercentage,
                        extra: dashboardData.analytics.dailyUsersExtra,
                        isLoss: false
                    }
                });
                setChartData(dashboardData.chartData);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle time slot change
    const handleTimeSlotChange = async (newSlot) => {
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