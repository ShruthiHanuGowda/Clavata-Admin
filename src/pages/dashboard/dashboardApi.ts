const API_BASE_URL: any = {
  D_WALLET_API_BASE_URL: 'https://rtb4zcgmxf.execute-api.me-central-1.amazonaws.com/default/adminDashboardAnalytics',
  D_TERMINAL_API_BASE_URL: 'https://7ygfwsucgd.execute-api.me-central-1.amazonaws.com/default/adminDashboardDTerminalAnalytics',
  ENERGY_CONSUMPTION_API_BASE_URL: 'https://ovecu7uou9.execute-api.me-central-1.amazonaws.com/default/adminDashboardEnergyConsumptionAPI'
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
      }
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
