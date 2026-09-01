
// =========================================================
// TYPES
// =========================================================

import { ADMIN_BOOKINGS, ADMIN_CUSTOMERS, ADMIN_REVIEWS, ADMIN_SALONS } from 'graphql/queries';

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export type PaymentStatus =
  | 'PENDING'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED';

export type ReviewStatus =
  | 'PUBLISHED'
  | 'FLAGGED'
  | 'HIDDEN';

export type ProviderApprovalStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED';

// =========================================================
// CUSTOMER
// =========================================================

export interface Customer {
  userId: string;
  fullName: string;
  phoneNumber: string;
  email?: string | null;

  activeRole: string;
  providerStatus: string;
  salonId?: string | null;
  status: string;

  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalSpent: number;

  lastBooking?: string | null;

  createdAt: string;
  updatedAt: string;
}

// =========================================================
// SALON
// =========================================================

export interface Salon {
  salonId: string;
  ownerUserId: string;

  salonName: string;
  ownerName: string;
  businessType: string;

  ownerPhoneNumber: string;
  alternatePhone?: string | null;
  email: string;

  address: {
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
  };

  latitude?: number | null;
  longitude?: number | null;

  gstNumber?: string | null;
  panNumber?: string | null;
  aadhaarNumber?: string | null;

  bankAccount?: string | null;
  ifsc?: string | null;
  accountHolderName: string;

  logoUrl?: string | null;
  coverImageUrl?: string | null;
  galleryImages: string[];

  kycStatus: string;
  adminApprovalStatus: ProviderApprovalStatus;
  salonStatus: string;

  isActive: boolean;
  isVisible: boolean;
  isDeleted: boolean;

  averageRating: number;
  totalReviews: number;
  totalAppointments: number;
  totalCompletedAppointments: number;
  totalCancelledAppointments: number;
  totalRevenue: number;

  approvedBy?: string | null;
  approvedAt?: string | null;

  rejectedBy?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;

  lastUpdatedBy: string;

  createdAt: string;
  updatedAt: string;
}

// =========================================================
// BOOKING SERVICE
// =========================================================

export interface BookingService {
  serviceId: string;
  name: string;
  category: string;
  duration: number;
  price: number;
}

// =========================================================
// BOOKING
// =========================================================

export interface Booking {
  bookingId: string;
  salonId: string;
  customerUserId: string;

  salonName: string;
  customerName: string;
  customerPhone: string;

  bookingDate: string;
  startTime: string;
  endTime: string;

  staffId?: string | null;
  staffName?: string | null;

  services: BookingService[];

  totalDuration: number;
  subtotal: number;
  discount: number;
  totalAmount: number;

  paymentMethod: string;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;

  notes?: string | null;
  salonNote?: string | null;

  bookingFee: number;
  bookingFeeStatus: PaymentStatus;
  bookingFeePaidAt?: string | null;

  remainingAmount: number;

  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  paymentGateway?: string | null;

  reviewSubmitted?: boolean | null;
  rating?: number | null;
  review?: string | null;
  reviewedAt?: string | null;

  createdAt: string;
  updatedAt: string;
}

// =========================================================
// REVIEW
// =========================================================

export interface Review {
  reviewId: string;
  bookingId?: string | null;
  salonId: string;

  salonName: string;

  customerUserId: string;
  customerName?: string | null;

  rating: number;
  review: string;

  createdAt: string;
  status: ReviewStatus;
}

// =========================================================
// DASHBOARD TYPES
// =========================================================

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
  noShow: number;
}

export interface DashboardData {
  stats: DashboardStats;

  revenue: RevenueData[];

  bookingSummary: BookingSummary;

  recentBookings: Booking[];

  pendingApplications: Salon[];

  recentReviews: Review[];

  customers: Customer[];

  salons: Salon[];

  bookings: Booking[];

  reviews: Review[];
}

// =========================================================
// RAW API RESPONSE TYPES
// =========================================================

interface AdminCustomersResponse {
  adminCustomers: {
    success: boolean;
    message: string;
    totalCount: number;
    customers: Customer[];
  };
}

interface AdminSalonsResponse {
  adminSalons: {
    success: boolean;
    message: string;
    totalCount: number;
    salons: Salon[];
  };
}

interface AdminBookingsResponse {
  adminBookings: {
    success: boolean;
    message: string;
    totalCount: number;
    bookings: Booking[];
  };
}

interface AdminReviewsResponse {
  adminReviews: {
    success: boolean;
    message: string;
    totalCount: number;
    reviews: Review[];
  };
}

// =========================================================
// DATE HELPERS
// =========================================================

const parseDate = (
  value?: string | null
): Date | null => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (!Number.isNaN(date.getTime())) {
    return date;
  }

  return null;
};

const getBookingDate = (
  booking: Booking
): Date | null => {
  const bookingDate =
    booking.bookingDate || '';

  const startTime =
    booking.startTime || '';

  if (bookingDate && startTime) {
    const combined =
      `${bookingDate} ${startTime}`;

    const date =
      new Date(combined);

    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  return parseDate(
    booking.bookingDate
  );
};

// =========================================================
// PERIOD
// =========================================================

export type DashboardPeriod =
  | 'day'
  | 'week'
  | 'month'
  | 'year';

// =========================================================
// PERIOD FILTER
// =========================================================

const isWithinPeriod = (
  date: Date | null,
  period: DashboardPeriod
): boolean => {
  if (!date) {
    return false;
  }

  const now = new Date();

  // -------------------------------------------------------
  // DAY
  // -------------------------------------------------------

  if (period === 'day') {
    return (
      date.getFullYear() ===
        now.getFullYear() &&
      date.getMonth() ===
        now.getMonth() &&
      date.getDate() ===
        now.getDate()
    );
  }

  // -------------------------------------------------------
  // WEEK
  // -------------------------------------------------------

  if (period === 'week') {
    const start =
      new Date(now);

    const day =
      start.getDay() === 0
        ? 7
        : start.getDay();

    start.setDate(
      start.getDate() -
        day +
        1
    );

    start.setHours(
      0,
      0,
      0,
      0
    );

    return (
      date >= start &&
      date <= now
    );
  }

  // -------------------------------------------------------
  // MONTH
  // -------------------------------------------------------

  if (period === 'month') {
    return (
      date.getFullYear() ===
        now.getFullYear() &&
      date.getMonth() ===
        now.getMonth()
    );
  }

  // -------------------------------------------------------
  // YEAR
  // -------------------------------------------------------

  if (period === 'year') {
    return (
      date.getFullYear() ===
      now.getFullYear()
    );
  }

  return true;
};

// =========================================================
// MONTH NAME
// =========================================================

const getMonthName = (
  monthIndex: number
): string => {
  return new Date(
    2000,
    monthIndex,
    1
  ).toLocaleString(
    'en-IN',
    {
      month: 'short'
    }
  );
};

// =========================================================
// REVENUE
// =========================================================

const buildRevenueData = (
  bookings: Booking[]
): RevenueData[] => {
  const now =
    new Date();

  const months:
    RevenueData[] = [];

  for (
    let i = 5;
    i >= 0;
    i--
  ) {
    const date =
      new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );

    const year =
      date.getFullYear();

    const month =
      date.getMonth();

    const value =
      bookings
        .filter(
          (
            booking
          ) => {
            const bookingDate =
              getBookingDate(
                booking
              );

            if (!bookingDate) {
              return false;
            }

            return (
              bookingDate.getFullYear() ===
                year &&
              bookingDate.getMonth() ===
                month &&
              booking.bookingStatus !==
                'CANCELLED'
            );
          }
        )
        .reduce(
          (
            sum,
            booking
          ) =>
            sum +
            Number(
              booking.totalAmount ||
                0
            ),
          0
        );

    months.push({
      month:
        getMonthName(
          month
        ),
      value
    });
  }

  return months;
};

// =========================================================
// BUILD DASHBOARD
// =========================================================

export const buildDashboardData = (
  customers: Customer[],
  salons: Salon[],
  bookings: Booking[],
  reviews: Review[],
  period: DashboardPeriod
): DashboardData => {
  // -------------------------------------------------------
  // PERIOD BOOKINGS
  // -------------------------------------------------------

  const periodBookings =
    bookings.filter(
      (
        booking
      ) =>
        isWithinPeriod(
          getBookingDate(
            booking
          ),
          period
        )
    );

  // -------------------------------------------------------
  // REVENUE
  // -------------------------------------------------------

  const totalRevenue =
    periodBookings
      .filter(
        (
          booking
        ) =>
          booking.bookingStatus !==
          'CANCELLED'
      )
      .reduce(
        (
          sum,
          booking
        ) =>
          sum +
          Number(
            booking.totalAmount ||
              0
          ),
        0
      );

  // -------------------------------------------------------
  // PENDING PAYMENTS
  // -------------------------------------------------------

  const pendingPayments =
    bookings
      .filter(
        (
          booking
        ) =>
          booking.paymentStatus ===
            'PENDING' ||
          booking.paymentStatus ===
            'PARTIALLY_PAID'
      )
      .reduce(
        (
          sum,
          booking
        ) =>
          sum +
          Number(
            booking.remainingAmount ||
              0
          ),
        0
      );

  // -------------------------------------------------------
  // TODAY BOOKINGS
  // -------------------------------------------------------

  const todayBookings =
    bookings.filter(
      (
        booking
      ) =>
        isWithinPeriod(
          getBookingDate(
            booking
          ),
          'day'
        )
    ).length;

  // -------------------------------------------------------
  // BOOKING SUMMARY
  // -------------------------------------------------------

  const bookingSummary:
    BookingSummary = {
    confirmed:
      periodBookings.filter(
        (
          booking
        ) =>
          booking.bookingStatus ===
          'CONFIRMED'
      ).length,

    completed:
      periodBookings.filter(
        (
          booking
        ) =>
          booking.bookingStatus ===
          'COMPLETED'
      ).length,

    pending:
      periodBookings.filter(
        (
          booking
        ) =>
          booking.bookingStatus ===
          'PENDING'
      ).length,

    cancelled:
      periodBookings.filter(
        (
          booking
        ) =>
          booking.bookingStatus ===
          'CANCELLED'
      ).length,

    noShow:
      periodBookings.filter(
        (
          booking
        ) =>
          booking.bookingStatus ===
          'NO_SHOW'
      ).length
  };

  // -------------------------------------------------------
  // AVERAGE RATING
  // -------------------------------------------------------

  const averageRating =
    reviews.length > 0
      ? reviews.reduce(
          (
            sum,
            review
          ) =>
            sum +
            Number(
              review.rating ||
                0
            ),
          0
        ) /
        reviews.length
      : 0;

  // -------------------------------------------------------
  // PENDING APPLICATIONS
  // -------------------------------------------------------

  const pendingApplications =
    salons.filter(
      (
        salon
      ) =>
        salon.adminApprovalStatus ===
          'PENDING' &&
        !salon.isDeleted
    );

  // -------------------------------------------------------
  // RECENT BOOKINGS
  // -------------------------------------------------------

  const recentBookings =
    [...bookings]
      .sort(
        (
          a,
          b
        ) =>
          String(
            b.createdAt ||
              ''
          ).localeCompare(
            String(
              a.createdAt ||
                ''
            )
          )
      )
      .slice(
        0,
        5
      );

  // -------------------------------------------------------
  // RECENT REVIEWS
  // -------------------------------------------------------

  const recentReviews =
    [...reviews]
      .sort(
        (
          a,
          b
        ) =>
          String(
            b.createdAt ||
              ''
          ).localeCompare(
            String(
              a.createdAt ||
                ''
            )
          )
      )
      .slice(
        0,
        5
      );

  // -------------------------------------------------------
  // STATS
  // -------------------------------------------------------

  const stats:
    DashboardStats = {
    totalCustomers:
      customers.length,

    totalSalons:
      salons.filter(
        (
          salon
        ) =>
          !salon.isDeleted
      ).length,

    totalBookings:
      periodBookings.length,

    totalRevenue,

    pendingApplications:
      pendingApplications.length,

    pendingPayments,

    averageRating:
      Number(
        averageRating.toFixed(
          1
        )
      ),

    todayBookings
  };

  // -------------------------------------------------------
  // RETURN
  // -------------------------------------------------------

  return {
    stats,

    revenue:
      buildRevenueData(
        bookings
      ),

    bookingSummary,

    recentBookings,

    pendingApplications,

    recentReviews,

    customers,

    salons,

    bookings,

    reviews
  };
};

// =========================================================
// FETCH RESULT
// =========================================================

export interface DashboardFetchResult {
  customers: Customer[];
  salons: Salon[];
  bookings: Booking[];
  reviews: Review[];
}

// =========================================================
// APOLLO CLIENT QUERY INTERFACE
// =========================================================
//
// IMPORTANT:
// Do NOT use ApolloClient<NormalizedCacheObject> here.
// useApolloClient() in your project returns
// ApolloClient<object>.
//
// This interface only requires the query() method that
// dashboardApi actually uses.
// =========================================================

interface DashboardApolloClient {
  query: <TData = unknown>(
    options: {
      query: import('@apollo/client').DocumentNode;
      variables?: Record<
        string,
        unknown
      >;
      fetchPolicy?: import('@apollo/client').FetchPolicy;
    }
  ) => Promise<{
    data: TData;
  }>;
}

// =========================================================
// FETCH DASHBOARD DATA
// =========================================================

export const fetchDashboardData =
  async (
    client: DashboardApolloClient
  ): Promise<DashboardFetchResult> => {
    const [
      customersResult,
      salonsResult,
      bookingsResult,
      reviewsResult
    ] = await Promise.all([
      client.query<
        AdminCustomersResponse
      >({
        query:
          ADMIN_CUSTOMERS,
        variables: {
          search: null,
          status: null
        },
        fetchPolicy:
          'network-only'
      }),

      client.query<
        AdminSalonsResponse
      >({
        query:
          ADMIN_SALONS,
        variables: {
          search: null,
          kycStatus: null,
          salonStatus: null,
          isActive: null
        },
        fetchPolicy:
          'network-only'
      }),

      client.query<
        AdminBookingsResponse
      >({
        query:
          ADMIN_BOOKINGS,
        variables: {
          search: null,
          bookingStatus: null,
          paymentStatus: null,
          salonId: null
        },
        fetchPolicy:
          'network-only'
      }),

      client.query<
        AdminReviewsResponse
      >({
        query:
          ADMIN_REVIEWS,
        variables: {
          search: null,
          rating: null,
          status: null,
          salonId: null
        },
        fetchPolicy:
          'network-only'
      })
    ]);

    // -------------------------------------------------------
    // EXTRACT DATA
    // -------------------------------------------------------

    const customers =
      customersResult
        .data
        ?.adminCustomers
        ?.customers ??
      [];

    const salons =
      salonsResult
        .data
        ?.adminSalons
        ?.salons ??
      [];

    const bookings =
      bookingsResult
        .data
        ?.adminBookings
        ?.bookings ??
      [];

    const reviews =
      reviewsResult
        .data
        ?.adminReviews
        ?.reviews ??
      [];

    return {
      customers,
      salons,
      bookings,
      reviews
    };
  };

