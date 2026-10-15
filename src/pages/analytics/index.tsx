
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import {
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography
} from '@mui/material';

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  StarOutlined,
  TeamOutlined,
  ShopOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';

import MainCard from 'components/MainCard';
import useDashboardData from '../dashboard/useDashboardData';

import type {
  Booking,
  DashboardPeriod,
  Salon
} from '../dashboard/dashboardApi';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

// =========================================================
// TYPES
// =========================================================

type Period = '7days' | '30days' | '3months' | '12months';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  positive?: boolean;
  icon: ReactNode;
  subtitle?: string;
}

interface RevenueChartItem {
  name: string;
  revenue: number;
  bookings: number;
}

interface BookingStatusItem {
  name: string;
  value: number;
}

interface ServicePerformanceItem {
  id: string;
  name: string;
  bookings: number;
  revenue: number;
}

interface SalonPerformanceItem {
  id: string;
  salon: string;
  bookings: number;
  revenue: number;
  rating: number;
}

interface CustomerGrowthItem {
  name: string;
  customers: number;
}

interface DateRange {
  start: Date;
  end: Date;
}

// =========================================================
// CONSTANTS
// =========================================================

const BOOKING_FEE = 9;

const COLORS = [
  '#7C3AED',
  '#2563EB',
  '#F59E0B',
  '#EF4444',
  '#0891B2'
];

// =========================================================
// FORMATTERS
// =========================================================

const formatCurrency = (value: number): string =>
  `₹${Math.round(value).toLocaleString('en-IN')}`;

const formatCompactCurrency = (value: number): string => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(1)}Cr`;
  }

  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  }

  if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }

  return formatCurrency(value);
};

const parseDate = (value?: string | null): Date | null => {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const getBookingDate = (booking: Booking): Date | null => {
  const bookingDate = booking.bookingDate;

  if (!bookingDate) return null;

  if (booking.startTime) {
    const combined = new Date(
      `${bookingDate}T${booking.startTime}`
    );

    if (!Number.isNaN(combined.getTime())) {
      return combined;
    }
  }

  return parseDate(bookingDate);
};

const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const endOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

const addDays = (date: Date, amount: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
};

const addMonths = (date: Date, amount: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + amount);
  return result;
};

// =========================================================
// PERIOD HELPERS
// =========================================================

const getPeriodDates = (
  period: Period,
  now = new Date()
): DateRange => {
  const end = endOfDay(now);
  let start: Date;

  switch (period) {
    case '7days':
      start = startOfDay(addDays(now, -6));
      break;

    case '30days':
      start = startOfDay(addDays(now, -29));
      break;

    case '3months':
      start = startOfDay(addMonths(now, -3));
      break;

    case '12months':
      start = startOfDay(addMonths(now, -12));
      break;

    default:
      start = startOfDay(addDays(now, -29));
  }

  return { start, end };
};

const isDateInRange = (
  date: Date | null,
  range: DateRange
): boolean =>
  date !== null &&
  date.getTime() >= range.start.getTime() &&
  date.getTime() <= range.end.getTime();

const isBookingInRange = (
  booking: Booking,
  range: DateRange
): boolean =>
  isDateInRange(getBookingDate(booking), range);

// Only successful booking-fee payments count as Clavata revenue.
// Do not count the service amount as platform revenue.
const isPaidBookingFee = (booking: Booking): boolean =>
  booking.bookingFeeStatus === 'PAID';

const getPlatformRevenue = (booking: Booking): number =>
  isPaidBookingFee(booking) ? BOOKING_FEE : 0;

// =========================================================
// STAT CARD
// =========================================================

function StatCard({
  title,
  value,
  change,
  positive = true,
  icon,
  subtitle
}: StatCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          spacing={2}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              {title}
            </Typography>

            <Typography
              variant="h4"
              sx={{ fontWeight: 700, mb: 1 }}
            >
              {value}
            </Typography>

            {(change || subtitle) && (
              <Stack
                direction="row"
                spacing={0.75}
                alignItems="center"
                flexWrap="wrap"
              >
                {change && (
                  <>
                    {positive ? (
                      <ArrowUpOutlined
                        style={{ color: '#16A34A', fontSize: 12 }}
                      />
                    ) : (
                      <ArrowDownOutlined
                        style={{ color: '#DC2626', fontSize: 12 }}
                      />
                    )}

                    <Typography
                      variant="caption"
                      sx={{
                        color: positive ? 'success.main' : 'error.main',
                        fontWeight: 600
                      }}
                    >
                      {change}
                    </Typography>
                  </>
                )}

                {subtitle && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    {subtitle}
                  </Typography>
                )}
              </Stack>
            )}
          </Box>

          <Box
            sx={{
              width: 48,
              height: 48,
              flexShrink: 0,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'primary.lighter',
              color: 'primary.main',
              fontSize: 22
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// =========================================================
// ANALYTICS
// =========================================================

export default function Analytics() {
  const [period, setPeriod] = useState<Period>('30days');

  /*
   * The hook currently accepts week/month/year.
   * The selected period is filtered locally as well.
   *
   * IMPORTANT:
   * For 3-month and 12-month analytics, useDashboardData
   * must return enough historical data. A month-only API
   * response cannot produce accurate 3-month statistics.
   */
  const dashboardPeriod: DashboardPeriod =
    period === '7days'
      ? 'week'
      : period === '12months'
        ? 'year'
        : 'month';

  const { data, loading, error, refetch } =
    useDashboardData(dashboardPeriod);

  const customers = data?.customers ?? [];
  const salons = data?.salons ?? [];
  const bookings = data?.bookings ?? [];
  const reviews = data?.reviews ?? [];

  const periodRange = useMemo(
    () => getPeriodDates(period),
    [period]
  );

  const periodBookings = useMemo(
    () =>
      bookings.filter((booking: Booking) =>
        isBookingInRange(booking, periodRange)
      ),
    [bookings, periodRange]
  );

  // =======================================================
  // REVENUE & BOOKINGS CHART
  // =======================================================

  const revenueData = useMemo<RevenueChartItem[]>(() => {
    const now = new Date();
    const result: RevenueChartItem[] = [];

    if (period === '7days' || period === '30days') {
      const numberOfDays = period === '7days' ? 7 : 30;

      for (let i = numberOfDays - 1; i >= 0; i--) {
        const date = startOfDay(addDays(now, -i));
        const nextDay = endOfDay(date);

        const dayBookings = bookings.filter((booking: Booking) => {
          const bookingDate = getBookingDate(booking);

          return (
            bookingDate !== null &&
            bookingDate >= date &&
            bookingDate <= nextDay
          );
        });

        result.push({
          name:
            period === '7days'
              ? date.toLocaleDateString('en-IN', {
                  weekday: 'short'
                })
              : date.toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short'
                }),
          revenue: dayBookings.reduce(
            (sum, booking) => sum + getPlatformRevenue(booking),
            0
          ),
          bookings: dayBookings.length
        });
      }

      return result;
    }

    const numberOfMonths = period === '3months' ? 3 : 12;

    for (let i = numberOfMonths - 1; i >= 0; i--) {
      const date = addMonths(now, -i);
      const year = date.getFullYear();
      const month = date.getMonth();

      const monthBookings = bookings.filter((booking: Booking) => {
        const bookingDate = getBookingDate(booking);

        return (
          bookingDate !== null &&
          bookingDate.getFullYear() === year &&
          bookingDate.getMonth() === month
        );
      });

      result.push({
        name: date.toLocaleString('en-IN', {
          month: 'short',
          year: period === '12months' ? '2-digit' : undefined
        }),
        revenue: monthBookings.reduce(
          (sum, booking) => sum + getPlatformRevenue(booking),
          0
        ),
        bookings: monthBookings.length
      });
    }

    return result;
  }, [bookings, period]);

  // =======================================================
  // BOOKING STATUS
  // =======================================================

  const bookingStatusData = useMemo<BookingStatusItem[]>(
    () => [
      {
        name: 'Completed',
        value: periodBookings.filter(
          booking => booking.bookingStatus === 'COMPLETED'
        ).length
      },
      {
        name: 'Confirmed',
        value: periodBookings.filter(
          booking => booking.bookingStatus === 'CONFIRMED'
        ).length
      },
      {
        name: 'Pending',
        value: periodBookings.filter(
          booking => booking.bookingStatus === 'PENDING'
        ).length
      },
      {
        name: 'Cancelled',
        value: periodBookings.filter(
          booking => booking.bookingStatus === 'CANCELLED'
        ).length
      },
      {
        name: 'No Show',
        value: periodBookings.filter(
          booking => booking.bookingStatus === 'NO_SHOW'
        ).length
      }
    ],
    [periodBookings]
  );

  // =======================================================
  // CUSTOMER GROWTH
  // =======================================================

  const customerGrowth = useMemo<CustomerGrowthItem[]>(() => {
    const now = new Date();

    if (period === '7days' || period === '30days') {
      const days = period === '7days' ? 7 : 30;
      const result: CustomerGrowthItem[] = [];

      for (let i = days - 1; i >= 0; i--) {
        const date = startOfDay(addDays(now, -i));
        const end = endOfDay(date);

        const count = customers.filter(customer => {
          const created = parseDate(customer.createdAt);

          return (
            created !== null &&
            created >= date &&
            created <= end
          );
        }).length;

        result.push({
          name:
            period === '7days'
              ? date.toLocaleDateString('en-IN', {
                  weekday: 'short'
                })
              : date.toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short'
                }),
          customers: count
        });
      }

      return result;
    }

    const months = period === '3months' ? 3 : 12;
    const result: CustomerGrowthItem[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = addMonths(now, -i);
      const year = date.getFullYear();
      const month = date.getMonth();

      const count = customers.filter(customer => {
        const created = parseDate(customer.createdAt);

        return (
          created !== null &&
          created.getFullYear() === year &&
          created.getMonth() === month
        );
      }).length;

      result.push({
        name: date.toLocaleString('en-IN', {
          month: 'short',
          year: period === '12months' ? '2-digit' : undefined
        }),
        customers: count
      });
    }

    return result;
  }, [customers, period]);

  // =======================================================
  // SERVICE PERFORMANCE
  // =======================================================

  const servicePerformance = useMemo<ServicePerformanceItem[]>(() => {
    const serviceMap = new Map<string, ServicePerformanceItem>();

    periodBookings.forEach((booking: Booking) => {
      // services can be undefined or null
      (booking.services ?? []).forEach(service => {
        const serviceName =
          typeof service.name === 'string' && service.name.trim()
            ? service.name.trim()
            : 'Unnamed Service';

        const serviceId =
          service.serviceId || serviceName;

        const existing = serviceMap.get(serviceId);

        if (existing) {
          existing.bookings += 1;
          existing.revenue += Number(service.price ?? 0);
        } else {
          serviceMap.set(serviceId, {
            id: serviceId,
            name: serviceName,
            bookings: 1,
            // This is service value, not Clavata revenue.
            revenue: Number(service.price ?? 0)
          });
        }
      });
    });

    return Array.from(serviceMap.values())
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 10);
  }, [periodBookings]);

  // =======================================================
  // SALON PERFORMANCE
  // =======================================================

  const salonPerformance = useMemo<SalonPerformanceItem[]>(() => {
    const salonMap = new Map<string, SalonPerformanceItem>();

    periodBookings.forEach((booking: Booking) => {
      const salonId = booking.salonId;

      if (!salonId) return;

      const existing = salonMap.get(salonId);

      if (existing) {
        existing.bookings += 1;

        if (booking.bookingStatus !== 'CANCELLED') {
          existing.revenue += Number(booking.totalAmount ?? 0);
        }
      } else {
        salonMap.set(salonId, {
          id: salonId,
          salon: booking.salonName || 'Unknown Salon',
          bookings: 1,
          // Service amount is paid to the salon directly.
          revenue:
            booking.bookingStatus !== 'CANCELLED'
              ? Number(booking.totalAmount ?? 0)
              : 0,
          rating: 0
        });
      }
    });

    const result = Array.from(salonMap.values());

    result.forEach(salon => {
      // Match by ID, not name, because salon names may repeat.
      const matchingSalon = salons.find(
        (item: Salon) => item.salonId === salon.id
      );

      salon.rating = Number(matchingSalon?.averageRating ?? 0);
    });

    return result
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [periodBookings, salons]);

  // =======================================================
  // KPI VALUES
  // =======================================================

  const paidFeeBookings = useMemo(
    () => periodBookings.filter(isPaidBookingFee),
    [periodBookings]
  );

  const totalRevenue = useMemo(
    () =>
      paidFeeBookings.reduce(
        (sum, booking) => sum + getPlatformRevenue(booking),
        0
      ),
    [paidFeeBookings]
  );

  const totalBookings = periodBookings.length;

  const completedBookings = periodBookings.filter(
    booking => booking.bookingStatus === 'COMPLETED'
  ).length;

  const activeSalons = salons.filter(
    (salon: Salon) =>
      salon.isActive &&
      salon.isVisible &&
      !salon.isDeleted
  ).length;

  const averageBookingValue =
    totalBookings > 0
      ? periodBookings.reduce(
          (sum, booking) => sum + Number(booking.totalAmount ?? 0),
          0
        ) / totalBookings
      : 0;

  const averageRating =
    reviews.length > 0
      ? reviews.reduce(
          (sum, review) => sum + Number(review.rating ?? 0),
          0
        ) / reviews.length
      : 0;

  const cancelledBookings = periodBookings.filter(
    booking => booking.bookingStatus === 'CANCELLED'
  ).length;

  const cancellationRate =
    totalBookings > 0
      ? (cancelledBookings / totalBookings) * 100
      : 0;

  const changeLabel =
    period === '7days'
      ? 'Last 7 days'
      : period === '30days'
        ? 'Last 30 days'
        : period === '3months'
          ? 'Last 3 months'
          : 'Last 12 months';

  // =======================================================
  // PERIOD CHANGE
  // =======================================================

  const handlePeriodChange = (
    event: { target: { value: unknown } }
  ): void => {
    setPeriod(event.target.value as Period);
  };

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <Typography color="text.secondary">
          Loading analytics...
        </Typography>
      </Box>
    );
  }

  // =======================================================
  // ERROR
  // =======================================================

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <MainCard>
          <Stack spacing={2} alignItems="center">
            <Typography color="error" variant="h6">
              Unable to load analytics
            </Typography>

            <Typography color="text.secondary">
              {String(error)}
            </Typography>

            <Chip
              label="Retry"
              color="primary"
              onClick={() => {
                void refetch();
              }}
              clickable
            />
          </Stack>
        </MainCard>
      </Box>
    );
  }

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <Box>
      <Grid
        container
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Grid item>
          <Stack spacing={0.5}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Analytics
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Monitor your salon platform performance and business insights.
            </Typography>
          </Stack>
        </Grid>

        <Grid item>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="analytics-period-label">
              Period
            </InputLabel>

            <Select<Period>
              labelId="analytics-period-label"
              value={period}
              label="Period"
              onChange={handlePeriodChange}
            >
              <MenuItem value="7days">Last 7 days</MenuItem>
              <MenuItem value="30days">Last 30 days</MenuItem>
              <MenuItem value="3months">Last 3 months</MenuItem>
              <MenuItem value="12months">Last 12 months</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* PRIMARY KPIs */}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Clavata Booking Fee Revenue"
            value={formatCompactCurrency(totalRevenue)}
            subtitle={changeLabel}
            icon={<DollarOutlined />}
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Bookings"
            value={totalBookings.toLocaleString('en-IN')}
            subtitle={changeLabel}
            icon={<CalendarOutlined />}
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Customers"
            value={customers.length.toLocaleString('en-IN')}
            subtitle="All customers"
            icon={<TeamOutlined />}
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Active Salons"
            value={activeSalons.toLocaleString('en-IN')}
            subtitle="Currently active"
            icon={<ShopOutlined />}
          />
        </Grid>
      </Grid>

      {/* SECONDARY KPIs */}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Completed Bookings"
            value={completedBookings.toLocaleString('en-IN')}
            icon={<CheckCircleOutlined />}
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Average Service Booking Value"
            value={formatCurrency(Math.round(averageBookingValue))}
            icon={<ShoppingCartOutlined />}
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Average Review Rating"
            value={averageRating.toFixed(1)}
            icon={<StarOutlined />}
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Cancellation Rate"
            value={`${cancellationRate.toFixed(1)}%`}
            icon={<ClockCircleOutlined />}
          />
        </Grid>
      </Grid>

      {/* REVENUE & BOOKING STATUS */}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={8}>
          <MainCard
            title="Clavata Booking Fee Revenue & Bookings"
            secondary={
              <Chip
                label="Based on loaded data"
                size="small"
                color="primary"
                variant="outlined"
              />
            }
          >
            <Box sx={{ width: '100%', height: 360 }}>
              <ResponsiveContainer>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient
                      id="clavataRevenueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#7C3AED"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="#7C3AED"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis
                    yAxisId="revenue"
                    tickFormatter={(value: number) =>
                      formatCompactCurrency(value)
                    }
                  />
                  <YAxis
                    yAxisId="bookings"
                    orientation="right"
                  />

                  <Tooltip
                    formatter={(value: unknown, name: unknown) => {
                      const numericValue = Number(value ?? 0);
                      const label = String(name ?? '');

                      return [
                        label === 'Revenue'
                          ? formatCurrency(numericValue)
                          : numericValue.toLocaleString('en-IN'),
                        label
                      ];
                    }}
                  />

                  <Legend />

                  <Area
                    yAxisId="revenue"
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#7C3AED"
                    fill="url(#clavataRevenueGradient)"
                    strokeWidth={2}
                  />

                  <Line
                    yAxisId="bookings"
                    type="monotone"
                    dataKey="bookings"
                    name="Bookings"
                    stroke="#2563EB"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </MainCard>
        </Grid>

        <Grid item xs={12} lg={4}>
          <MainCard title="Booking Status">
            <Box sx={{ width: '100%', height: 360 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={bookingStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    innerRadius={75}
                    outerRadius={115}
                    paddingAngle={3}
                  >
                    {bookingStatusData.map((item, index) => (
                      <Cell
                        key={`${item.name}-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </MainCard>
        </Grid>
      </Grid>

      {/* CUSTOMER GROWTH & TOP SERVICES */}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={6}>
          <MainCard title="Customer Growth">
            <Box sx={{ width: '100%', height: 320 }}>
              <ResponsiveContainer>
                <LineChart data={customerGrowth}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="customers"
                    name="New Customers"
                    stroke="#7C3AED"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </MainCard>
        </Grid>

        <Grid item xs={12} lg={6}>
          <MainCard title="Top Services by Bookings">
            <Box sx={{ width: '100%', height: 320 }}>
              <ResponsiveContainer>
                <BarChart
                  data={servicePerformance}
                  layout="vertical"
                  margin={{ left: 20, right: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                  />
                  <Tooltip />

                  <Bar
                    dataKey="bookings"
                    name="Bookings"
                    fill="#7C3AED"
                    radius={[0, 6, 6, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </MainCard>
        </Grid>
      </Grid>

      {/* SERVICE PERFORMANCE */}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <MainCard title="Service Performance">
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mb: 1 }}
            >
              Service value represents salon services, not Clavata booking-fee revenue.
            </Typography>

            <Box sx={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                <BarChart data={servicePerformance}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    height={65}
                  />
                  <YAxis
                    yAxisId="bookings"
                    allowDecimals={false}
                  />
                  <YAxis
                    yAxisId="value"
                    orientation="right"
                    tickFormatter={formatCompactCurrency}
                  />

                  <Tooltip
                    formatter={(value: unknown, name: unknown) => {
                      const numericValue = Number(value ?? 0);
                      const label = String(name ?? '');

                      return [
                        label === 'Service Value'
                          ? formatCurrency(numericValue)
                          : numericValue.toLocaleString('en-IN'),
                        label
                      ];
                    }}
                  />

                  <Legend />

                  <Bar
                    yAxisId="bookings"
                    dataKey="bookings"
                    name="Bookings"
                    fill="#7C3AED"
                    radius={[6, 6, 0, 0]}
                  />

                  <Bar
                    yAxisId="value"
                    dataKey="revenue"
                    name="Service Value"
                    fill="#2563EB"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </MainCard>
        </Grid>
      </Grid>

      {/* TOP SALONS */}

      <Grid container spacing={2.5}>
        <Grid item xs={12}>
          <MainCard title="Top Performing Salons">
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mb: 1 }}
            >
              Ranked by service booking value. Service payments go directly to salons.
            </Typography>

            <Box sx={{ overflowX: 'auto' }}>
              <Box
                component="table"
                sx={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  '& th': {
                    textAlign: 'left',
                    padding: '14px 12px',
                    color: 'text.secondary',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    whiteSpace: 'nowrap'
                  },
                  '& td': {
                    padding: '16px 12px',
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }
                }}
              >
                <thead>
                  <tr>
                    <th>Salon</th>
                    <th>Bookings</th>
                    <th>Service Value</th>
                    <th>Rating</th>
                    <th>Performance</th>
                  </tr>
                </thead>

                <tbody>
                  {salonPerformance.map((salon, index) => (
                    <tr key={salon.id}>
                      <td>
                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="center"
                        >
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              flexShrink: 0,
                              borderRadius: 2,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: 'primary.lighter',
                              color: 'primary.main'
                            }}
                          >
                            <EnvironmentOutlined />
                          </Box>

                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              {salon.salon}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Rank #{index + 1}
                            </Typography>
                          </Box>
                        </Stack>
                      </td>

                      <td>
                        {salon.bookings.toLocaleString('en-IN')}
                      </td>

                      <td>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600 }}
                        >
                          {formatCurrency(salon.revenue)}
                        </Typography>
                      </td>

                      <td>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                        >
                          <StarOutlined
                            style={{ color: '#F59E0B' }}
                          />

                          <Typography variant="body2">
                            {salon.rating.toFixed(1)}
                          </Typography>
                        </Stack>
                      </td>

                      <td>
                        <Chip
                          label={
                            index === 0
                              ? 'Top Performer'
                              : index < 3
                                ? 'Strong'
                                : 'Growing'
                          }
                          size="small"
                          color={index === 0 ? 'primary' : 'default'}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Box>
            </Box>

            {salonPerformance.length === 0 && (
              <Box sx={{ py: 5, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  No salon booking data available for this period.
                </Typography>
              </Box>
            )}
          </MainCard>
        </Grid>
      </Grid>
    </Box>
  );
}
