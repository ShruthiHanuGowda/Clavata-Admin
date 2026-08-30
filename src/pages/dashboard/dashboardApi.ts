
// ==============================|| DASHBOARD API ||============================== //

/**
 * Dashboard API
 *
 * Currently this file returns dummy dashboard data.
 *
 * Later this can be replaced with:
 *
 * - AWS AppSync GraphQL
 * - Lambda aggregation APIs
 * - DynamoDB analytics
 *
 * without changing the dashboard UI.
 */

// ==============================|| TYPES ||============================== //

export interface DashboardStats {
  totalCustomers: number;
  totalSalons: number;
  totalBookings: number;
  totalRevenue: number;

  pendingApplications: number;
  pendingPayments: number;

  averageRating: number;
  todayBookings: number;
}

export interface RevenueData {
  month: string;
  value: number;
}

export interface BookingSummary {
  confirmed: number;
  completed: number;
  pending: number;
  cancelled: number;
}

export interface DashboardData {
  stats: DashboardStats;
  revenue: RevenueData[];
  bookingSummary: BookingSummary;
}

// ==============================|| DUMMY DASHBOARD DATA ||============================== //

const dashboardData: DashboardData = {
  stats: {
    totalCustomers: 12840,
    totalSalons: 486,
    totalBookings: 3842,
    totalRevenue: 184000,

    pendingApplications: 27,
    pendingPayments: 42650,

    averageRating: 4.7,
    todayBookings: 184
  },

  revenue: [
    {
      month: 'Mar',
      value: 82000
    },
    {
      month: 'Apr',
      value: 105000
    },
    {
      month: 'May',
      value: 97000
    },
    {
      month: 'Jun',
      value: 132000
    },
    {
      month: 'Jul',
      value: 158000
    },
    {
      month: 'Aug',
      value: 184000
    }
  ],

  bookingSummary: {
    confirmed: 68,
    completed: 52,
    pending: 18,
    cancelled: 7
  }
};

// ==============================|| FETCH DASHBOARD ||============================== //

export const fetchDashboardData = async (): Promise<DashboardData> => {
  /**
   * Simulate API delay.
   *
   * Remove this later when GraphQL is connected.
   */
  await new Promise((resolve) => setTimeout(resolve, 500));

  return dashboardData;
};

// ==============================|| FUTURE API ||============================== //

/**
 * Example future GraphQL implementation:
 *
 * export const fetchDashboardData = async () => {
 *
 *   const result = await apolloClient.query({
 *     query: GET_ADMIN_DASHBOARD
 *   });
 *
 *   return result.data.adminDashboard;
 *
 * };
 */
