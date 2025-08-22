const API_BASE_URL: any = {
  D_WALLET_API_BASE_URL: import.meta.env.VITE_APP_D_WALLET_API_URL,
  D_TERMINAL_API_BASE_URL: import.meta.env.VITE_APP_D_TERMINAL_API_URL,
  ENERGY_CONSUMPTION_API_BASE_URL: import.meta.env.VITE_APP_ENERGY_CONSUMPTION_API_URL
};

// // Fetch analytics data
// export const fetchAnalytics = async (type = 'D_WALLET_API_BASE_URL') => {
//   try {
//     const response = await fetch(`${API_BASE_URL[type]}?endpoint=analytics`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json'
//       }
//     });
//
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
//
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error('Error fetching analytics:', error);
//     throw error;
//   }
// };
//
// // Fetch chart data
// export const fetchChartData = async (type = 'D_WALLET_API_BASE_URL', timeSlot = 'week') => {
//   try {
//     const response = await fetch(`${API_BASE_URL[type]}?endpoint=chart&timeSlot=${timeSlot}`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json'
//       }
//     });
//
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
//
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error('Error fetching chart data:', error);
//     throw error;
//   }
// };

// Fetch all dashboard data in one call
export const fetchDashboardData = async (type = 'D_WALLET_API_BASE_URL', timeSlot = 'week') => {
  try {
    const response = await fetch(`${API_BASE_URL[type]}?timeSlot=${timeSlot}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'cors'
    });

    if (!response.ok) {
      if (response.status === 0 || response.status === 503) {
        throw new Error('Server is temporarily unavailable. Please try again later.');
      }
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);

    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('Network Error: Unable to connect to server. Please check your connection.');
    }

    throw error;
  }
};
