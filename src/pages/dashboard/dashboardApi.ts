
import {
  ADMIN_BOOKINGS,
  ADMIN_CUSTOMERS,
  ADMIN_REVIEWS,
  ADMIN_SALONS
} from 'graphql/queries';

import type {
  DocumentNode,
  FetchPolicy
} from '@apollo/client';

// =========================================================
// ENUMS / TYPES
// =========================================================

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'EXPIRED';

export type PaymentStatus =
  | 'PENDING'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED';

export type BookingFeeStatus =
  | 'PENDING'
  | 'PAID'
  | 'EXPIRED'
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

export type DashboardPeriod =
  | 'day'
  | 'week'
  | 'month'
  | 'year';

// =========================================================
// CUSTOMER
// =========================================================

export interface Customer {
  userId: string;
  fullName: string;
  phoneNumber: string;
  role?: string;
  email?: string | null;
  providerStatus?: string | null;
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
  ownerPhoneNumber?: string | null;
  alternatePhone?: string | null;
  email?: string | null;

  address?: {
    addressLine?: string | null;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
  } | null;

  latitude?: number | null;
  longitude?: number | null;

  gstNumber?: string | null;
  panNumber?: string | null;
  aadhaarNumber?: string | null;

  logoUrl?: string | null;
  coverImageUrl?: string | null;
  galleryImages?: string[] | null;

  kycStatus?: string | null;
  verificationStatus?: string | null;

  adminApprovalStatus: ProviderApprovalStatus;
  salonStatus?: string | null;

  isActive: boolean;
  isVisible?: boolean;
  isDeleted: boolean;

  averageRating?: number | null;
  totalReviews?: number | null;
  totalAppointments?: number | null;
  totalCompletedAppointments?: number | null;
  totalCancelledAppointments?: number | null;

  totalRevenue?: number | null;

  approvedBy?: string | null;
  approvedAt?: string | null;
  rejectedBy?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  lastUpdatedBy?: string | null;

  createdAt: string;
  updatedAt: string;
}

// =========================================================
// BOOKING SERVICE
// =========================================================

export interface BookingService {
  serviceId?: string | null;
  name: string;
  category?: string | null;
  duration?: number | null;
  price?: number | null;
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
  customerPhone?: string | null;

  bookingDate: string;
  startTime: string;
  endTime?: string | null;

  staffId?: string | null;
  staffName?: string | null;

  services?: BookingService[] | null;

  totalDuration?: number | null;
  subtotal?: number | null;
  discount?: number | null;
  totalAmount: number;

  paymentMethod?: string | null;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;

  notes?: string | null;
  salonNote?: string | null;

  bookingFee: number;
  bookingFeeStatus: BookingFeeStatus;
  bookingFeePaidAt?: string | null;
  bookingFeePaymentDeadline?: string | null;

  remainingAmount?: number | null;

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

  // Clavata platform booking-fee revenue only.
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
  expired: number;
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

export interface DashboardFetchResult {
  customers: Customer[];
  salons: Salon[];
  bookings: Booking[];
  reviews: Review[];

  // Server-reported counts, where available.
  customerCount: number;
  salonCount: number;
  bookingCount: number;
  reviewCount: number;
}

// =========================================================
// API RESPONSE TYPES
// =========================================================

interface ListResponse<T> {
  success?: boolean;
  message?: string | null;
  totalCount?: number | null;
}

interface AdminCustomersResponse {
  adminCustomers?: ListResponse<Customer> & {
    customers?: Customer[] | null;
  };
}

interface AdminSalonsResponse {
  adminSalons?: ListResponse<Salon> & {
    salons?: Salon[] | null;
  };
}

interface AdminBookingsResponse {
  adminBookings?: ListResponse<Booking> & {
    bookings?: Booking[] | null;
  };
}

interface AdminReviewsResponse {
  adminReviews?: ListResponse<Review> & {
    reviews?: Review[] | null;
  };
}

// =========================================================
// APOLLO CLIENT INTERFACE
// =========================================================

interface DashboardApolloClient {
  query: <TData = unknown>(options: {
    query: DocumentNode;
    variables?: Record<string, unknown>;
    fetchPolicy?: FetchPolicy;
  }) => Promise<{
    data: TData;
  }>;
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

  return Number.isNaN(date.getTime())
    ? null
    : date;
};

export const getBookingDate = (
  booking: Booking
): Date | null => {
  const date = booking.bookingDate;

  if (!date) {
    return null;
  }

  // ISO timestamps should be parsed as-is.
  if (date.includes('T')) {
    return parseDate(date);
  }

  const time = booking.startTime || '00:00';

  return (
    parseDate(`${date}T${time}`) ??
    parseDate(date)
  );
};

const getRevenueDate = (
  booking: Booking
): Date | null => {
  // Revenue is counted when the Clavata booking fee was paid,
  // not when the customer visited the salon.
  return (
    parseDate(booking.bookingFeePaidAt) ??
    (booking.bookingFeeStatus === 'PAID'
      ? parseDate(booking.updatedAt)
      : null)
  );
};

const getMonthName = (
  date: Date
): string =>
  date.toLocaleString('en-IN', {
    month: 'short'
  });

// =========================================================
// PERIOD HELPERS
// =========================================================

export const getPeriodStart = (
  period: DashboardPeriod,
  now = new Date()
): Date => {
  const start = new Date(now);

  start.setHours(0, 0, 0, 0);

  switch (period) {
    case 'day':
      return start;

    case 'week': {
      const day = start.getDay() || 7;

      start.setDate(start.getDate() - day + 1);

      return start;
    }

    case 'month':
      start.setDate(1);
      return start;

    case 'year':
      start.setMonth(0, 1);
      return start;

    default:
      return start;
  }
};

const isWithinPeriod = (
  date: Date | null,
  period: DashboardPeriod,
  now = new Date()
): boolean => {
  if (!date) {
    return false;
  }

  const start = getPeriodStart(period, now);

  return date >= start && date <= now;
};

// =========================================================
// REVENUE CHART
// =========================================================

const buildRevenueData = (
  bookings: Booking[],
  now = new Date()
): RevenueData[] => {
  const months: RevenueData[] = [];

  for (let i = 5; i >= 0; i -= 1) {
    const monthDate = new Date(
      now.getFullYear(),
      now.getMonth() - i,
      1
    );

    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();

    const value = bookings.reduce(
      (sum, booking) => {
        if (booking.bookingFeeStatus !== 'PAID') {
          return sum;
        }

        const revenueDate = getRevenueDate(booking);

        if (!revenueDate) {
          return sum;
        }

        if (
          revenueDate.getFullYear() !== year ||
          revenueDate.getMonth() !== month
        ) {
          return sum;
        }

        return sum + Number(booking.bookingFee || 0);
      },
      0
    );

    months.push({
      month: getMonthName(monthDate),
      value
    });
  }

  return months;
};

// =========================================================
// BUILD DASHBOARD DATA
// =========================================================

export const buildDashboardData = (
  customers: Customer[],
  salons: Salon[],
  bookings: Booking[],
  reviews: Review[],
  period: DashboardPeriod,
  totals?: Partial<
    Pick<
      DashboardFetchResult,
      | 'customerCount'
      | 'salonCount'
      | 'bookingCount'
      | 'reviewCount'
    >
  >
): DashboardData => {
  const now = new Date();

  const periodBookings = bookings.filter(
    booking =>
      isWithinPeriod(
        getBookingDate(booking),
        period,
        now
      )
  );

  const periodRevenue = bookings
    .filter(
      booking =>
        booking.bookingFeeStatus === 'PAID' &&
        isWithinPeriod(
          getRevenueDate(booking),
          period,
          now
        )
    )
    .reduce(
      (sum, booking) =>
        sum + Number(booking.bookingFee || 0),
      0
    );

  // A pending booking-fee payment is relevant after salon
  // confirmation. Do not treat the salon's service balance
  // as money owed to Clavata.
  const pendingPayments = bookings
    .filter(
      booking =>
        booking.bookingStatus === 'CONFIRMED' &&
        booking.bookingFeeStatus === 'PENDING'
    )
    .reduce(
      (sum, booking) =>
        sum + Number(booking.bookingFee || 0),
      0
    );

  const todayBookings = bookings.filter(
    booking =>
      isWithinPeriod(
        getBookingDate(booking),
        'day',
        now
      )
  ).length;

  const bookingSummary: BookingSummary = {
    confirmed: periodBookings.filter(
      booking => booking.bookingStatus === 'CONFIRMED'
    ).length,

    completed: periodBookings.filter(
      booking => booking.bookingStatus === 'COMPLETED'
    ).length,

    pending: periodBookings.filter(
      booking => booking.bookingStatus === 'PENDING'
    ).length,

    cancelled: periodBookings.filter(
      booking => booking.bookingStatus === 'CANCELLED'
    ).length,

    noShow: periodBookings.filter(
      booking => booking.bookingStatus === 'NO_SHOW'
    ).length,

    expired: periodBookings.filter(
      booking => booking.bookingStatus === 'EXPIRED'
    ).length
  };

  const publishedReviews = reviews.filter(
    review => review.status === 'PUBLISHED'
  );

  const averageRating =
    publishedReviews.length > 0
      ? publishedReviews.reduce(
          (sum, review) =>
            sum + Number(review.rating || 0),
          0
        ) / publishedReviews.length
      : 0;

  const pendingApplications = salons
    .filter(
      salon =>
        salon.adminApprovalStatus === 'PENDING' &&
        !salon.isDeleted
    )
    .sort(
      (a, b) =>
        String(b.createdAt || '').localeCompare(
          String(a.createdAt || '')
        )
    );

  const recentBookings = [...bookings]
    .sort(
      (a, b) =>
        String(b.createdAt || '').localeCompare(
          String(a.createdAt || '')
        )
    )
    .slice(0, 5);

  const recentReviews = [...reviews]
    .sort(
      (a, b) =>
        String(b.createdAt || '').localeCompare(
          String(a.createdAt || '')
        )
    )
    .slice(0, 5);

  const activeSalons = salons.filter(
    salon => !salon.isDeleted
  );

  return {
    stats: {
      totalCustomers:
        totals?.customerCount ?? customers.length,

      totalSalons:
        totals?.salonCount ??
        activeSalons.length,

      totalBookings:
        periodBookings.length,

      totalRevenue: periodRevenue,

      pendingApplications:
        pendingApplications.length,

      pendingPayments,

      averageRating: Number(
        averageRating.toFixed(1)
      ),

      todayBookings
    },

    revenue: buildRevenueData(bookings, now),

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
// FETCH DASHBOARD DATA
// =========================================================

export const fetchDashboardData = async (
  client: DashboardApolloClient
): Promise<DashboardFetchResult> => {
  const [
    customersResult,
    salonsResult,
    bookingsResult,
    reviewsResult
  ] = await Promise.all([
    client.query<AdminCustomersResponse>({
      query: ADMIN_CUSTOMERS,
      variables: {
        search: null,
        status: null
      },
      fetchPolicy: 'network-only'
    }),

    client.query<AdminSalonsResponse>({
      query: ADMIN_SALONS,
      variables: {
        search: null,
        verificationStatus: null,
        adminApprovalStatus: null,
        salonStatus: null,
        isActive: null
      },
      fetchPolicy: 'network-only'
    }),

    client.query<AdminBookingsResponse>({
      query: ADMIN_BOOKINGS,
      variables: {
        search: null,
        bookingStatus: null,
        paymentStatus: null,
        salonId: null
      },
      fetchPolicy: 'network-only'
    }),

    client.query<AdminReviewsResponse>({
      query: ADMIN_REVIEWS,
      variables: {
        search: null,
        rating: null,
        status: null,
        salonId: null
      },
      fetchPolicy: 'network-only'
    })
  ]);

  const customerResponse =
    customersResult.data?.adminCustomers;

  const salonResponse =
    salonsResult.data?.adminSalons;

  const bookingResponse =
    bookingsResult.data?.adminBookings;

  const reviewResponse =
    reviewsResult.data?.adminReviews;

  // Surface resolver failures instead of silently displaying
  // an apparently successful dashboard with empty lists.
  const failedResponse = [
    customerResponse,
    salonResponse,
    bookingResponse,
    reviewResponse
  ].find(
    response => response?.success === false
  );

  if (failedResponse) {
    throw new Error(
      failedResponse.message ||
        'The server could not load dashboard data.'
    );
  }

  const customers =
    customerResponse?.customers ?? [];

  const salons =
    salonResponse?.salons ?? [];

  const bookings =
    bookingResponse?.bookings ?? [];

  const reviews =
    reviewResponse?.reviews ?? [];

  return {
    customers,
    salons,
    bookings,
    reviews,

    customerCount:
      customerResponse?.totalCount ??
      customers.length,

    salonCount:
      salonResponse?.totalCount ??
      salons.filter(salon => !salon.isDeleted).length,

    bookingCount:
      bookingResponse?.totalCount ??
      bookings.length,

    reviewCount:
      reviewResponse?.totalCount ??
      reviews.length
  };
};
