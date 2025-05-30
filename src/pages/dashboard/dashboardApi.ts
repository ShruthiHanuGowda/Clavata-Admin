const API_BASE_URL = 'https://b4iuscsibh.execute-api.me-central-1.amazonaws.com/default/adminDashboardAnalytics';

// Fetch analytics data
export const fetchAnalytics = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}?endpoint=analytics`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching analytics:', error);
        throw error;
    }
};

// Fetch chart data
export const fetchChartData = async (timeSlot = 'week') => {
    try {
        const response = await fetch(`${API_BASE_URL}?endpoint=chart&timeSlot=${timeSlot}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching chart data:', error);
        throw error;
    }
};

// Fetch all dashboard data in one call
export const fetchDashboardData = async (timeSlot = 'week') => {
    try {
        const response = await fetch(`${API_BASE_URL}?timeSlot=${timeSlot}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        throw error;
    }
};
