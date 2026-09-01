import { useMemo, useState } from 'react';
// material-ui
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
  SelectChangeEvent,
  Stack,
  Typography
} from '@mui/material';

// ant design icons
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

// project imports
import MainCard from 'components/MainCard';

// dashboard hook
import useDashboardData from '../dashboard/useDashboardData';

// dashboard types
import {
  Booking,
  BookingStatus,
  DashboardPeriod,
  Salon
} from '../dashboard/dashboardApi';

// charts
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

type Period =
  | '7days'
  | '30days'
  | '3months'
  | '12months';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  positive?: boolean;
  icon: React.ReactNode;
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
  name: string;
  bookings: number;
  revenue: number;
}

interface SalonPerformanceItem {
  salon: string;
  bookings: number;
  revenue: number;
  rating: number;
}

interface CustomerGrowthItem {
  name: string;
  customers: number;
}

// =========================================================
// CONSTANTS
// =========================================================

const COLORS: string[] = [
  '#1677ff',
  '#52c41a',
  '#faad14',
  '#ff4d4f',
  '#722ed1'
];

// =========================================================
// HELPERS
// =========================================================

const formatCurrency = (value: number): string => {
  return `₹${value.toLocaleString('en-IN')}`;
};

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

  return `₹${value.toLocaleString('en-IN')}`;
};

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

const getBookingDate = (
  booking: Booking
): Date | null => {
  if (
    booking.bookingDate &&
    booking.startTime
  ) {
    const combined = `${booking.bookingDate} ${booking.startTime}`;

    const date = new Date(combined);

    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  return parseDate(
    booking.bookingDate
  );
};

// =========================================================
// PERIOD HELPERS
// =========================================================

const getPeriodDates = (
  period: Period
): {
  start: Date;
  end: Date;
} => {
  const end = new Date();

  const start = new Date();

  if (period === '7days') {
    start.setDate(
      end.getDate() - 6
    );
  }

  if (period === '30days') {
    start.setDate(
      end.getDate() - 29
    );
  }

  if (period === '3months') {
    start.setMonth(
      end.getMonth() - 3
    );
  }

  if (period === '12months') {
    start.setFullYear(
      end.getFullYear() - 1
    );
  }

  start.setHours(
    0,
    0,
    0,
    0
  );

  end.setHours(
    23,
    59,
    59,
    999
  );

  return {
    start,
    end
  };
};

const isBookingInPeriod = (
  booking: Booking,
  period: Period
): boolean => {
  const bookingDate =
    getBookingDate(booking);

  if (!bookingDate) {
    return false;
  }

  const {
    start,
    end
  } = getPeriodDates(period);

  return (
    bookingDate >= start &&
    bookingDate <= end
  );
};

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
        boxShadow:
          '0 2px 8px rgba(0,0,0,0.04)'
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              {title}
            </Typography>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 1
              }}
            >
              {value}
            </Typography>

            {change && (
              <Stack
                direction="row"
                spacing={0.75}
                alignItems="center"
              >
                {positive ? (
                  <ArrowUpOutlined
                    style={{
                      color: '#52c41a',
                      fontSize: 12
                    }}
                  />
                ) : (
                  <ArrowDownOutlined
                    style={{
                      color: '#ff4d4f',
                      fontSize: 12
                    }}
                  />
                )}

                <Typography
                  variant="caption"
                  sx={{
                    color: positive
                      ? 'success.main'
                      : 'error.main',
                    fontWeight: 600
                  }}
                >
                  {change}
                </Typography>

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
  const [
    period,
    setPeriod
  ] = useState<Period>('30days');

  /*
   * Convert Analytics period into
   * Dashboard API period.
   */
  const dashboardPeriod: DashboardPeriod =
    period === '7days'
      ? 'week'
      : period === '30days'
        ? 'month'
        : period === '3months'
          ? 'month'
          : 'year';

  const {
    data,
    loading,
    error,
    refetch
  } = useDashboardData(
    dashboardPeriod
  );

  // =======================================================
  // RAW DATA
  // =======================================================

  const customers =
    data?.customers ?? [];

  const salons =
    data?.salons ?? [];

  const bookings =
    data?.bookings ?? [];

  const reviews =
    data?.reviews ?? [];

  // =======================================================
  // PERIOD BOOKINGS
  // =======================================================

  const periodBookings =
    useMemo<Booking[]>(
      () =>
        bookings.filter(
          (booking: Booking) =>
            isBookingInPeriod(
              booking,
              period
            )
        ),
      [
        bookings,
        period
      ]
    );

  // =======================================================
  // REVENUE CHART
  // =======================================================

  const revenueData =
    useMemo<RevenueChartItem[]>(() => {
      if (
        period === '7days'
      ) {
        const result: RevenueChartItem[] =
          [];

        for (
          let i = 6;
          i >= 0;
          i--
        ) {
          const date =
            new Date();

          date.setDate(
            date.getDate() - i
          );

          const dayBookings =
            bookings.filter(
              (
                booking: Booking
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
                  date.getFullYear() &&
                  bookingDate.getMonth() ===
                  date.getMonth() &&
                  bookingDate.getDate() ===
                  date.getDate()
                );
              }
            );

          const revenue =
            dayBookings
              .filter(
                (
                  booking: Booking
                ) =>
                  booking.bookingStatus !==
                  'CANCELLED'
              )
              .reduce(
                (
                  sum: number,
                  booking: Booking
                ) =>
                  sum +
                  Number(
                    booking.totalAmount ||
                    0
                  ),
                0
              );

          result.push({
            name:
              date.toLocaleDateString(
                'en-IN',
                {
                  weekday: 'short'
                }
              ),
            revenue,
            bookings:
              dayBookings.length
          });
        }

        return result;
      }

      const result: RevenueChartItem[] =
        [];

      const months =
        period === '12months'
          ? 12
          : period === '3months'
            ? 3
            : 1;

      for (
        let i = months - 1;
        i >= 0;
        i--
      ) {
        const date =
          new Date();

        date.setMonth(
          date.getMonth() - i
        );

        const year =
          date.getFullYear();

        const month =
          date.getMonth();

        const monthBookings =
          bookings.filter(
            (
              booking: Booking
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
                month
              );
            }
          );

        const revenue =
          monthBookings
            .filter(
              (
                booking: Booking
              ) =>
                booking.bookingStatus !==
                'CANCELLED'
            )
            .reduce(
              (
                sum: number,
                booking: Booking
              ) =>
                sum +
                Number(
                  booking.totalAmount ||
                  0
                ),
              0
            );

        result.push({
          name:
            date.toLocaleString(
              'en-IN',
              {
                month: 'short'
              }
            ),
          revenue,
          bookings:
            monthBookings.length
        });
      }

      return result;
    }, [
      bookings,
      period
    ]);

  // =======================================================
  // BOOKING STATUS
  // =======================================================

  const bookingStatusData =
    useMemo<BookingStatusItem[]>(
      () => [
        {
          name: 'Completed',
          value:
            periodBookings.filter(
              (
                booking: Booking
              ) =>
                booking.bookingStatus ===
                'COMPLETED'
            ).length
        },
        {
          name: 'Confirmed',
          value:
            periodBookings.filter(
              (
                booking: Booking
              ) =>
                booking.bookingStatus ===
                'CONFIRMED'
            ).length
        },
        {
          name: 'Pending',
          value:
            periodBookings.filter(
              (
                booking: Booking
              ) =>
                booking.bookingStatus ===
                'PENDING'
            ).length
        },
        {
          name: 'Cancelled',
          value:
            periodBookings.filter(
              (
                booking: Booking
              ) =>
                booking.bookingStatus ===
                'CANCELLED'
            ).length
        },
        {
          name: 'No Show',
          value:
            periodBookings.filter(
              (
                booking: Booking
              ) =>
                booking.bookingStatus ===
                'NO_SHOW'
            ).length
        }
      ],
      [
        periodBookings
      ]
    );

  // =======================================================
  // CUSTOMER GROWTH
  // =======================================================

  const customerGrowth =
    useMemo<CustomerGrowthItem[]>(
      () => {
        const result: CustomerGrowthItem[] =
          [];

        const months =
          period === '12months'
            ? 12
            : period === '3months'
              ? 3
              : 1;

        for (
          let i = months - 1;
          i >= 0;
          i--
        ) {
          const date =
            new Date();

          date.setMonth(
            date.getMonth() - i
          );

          const year =
            date.getFullYear();

          const month =
            date.getMonth();

          const count =
            customers.filter(
              (customer) => {
                const created =
                  parseDate(
                    customer.createdAt
                  );

                if (!created) {
                  return false;
                }

                return (
                  created.getFullYear() ===
                  year &&
                  created.getMonth() ===
                  month
                );
              }
            ).length;

          result.push({
            name:
              date.toLocaleString(
                'en-IN',
                {
                  month: 'short'
                }
              ),
            customers: count
          });
        }

        /*
         * For 7 days / 30 days show
         * actual period customer counts.
         */
        if (
          period === '7days' ||
          period === '30days'
        ) {
          const {
            start,
            end
          } =
            getPeriodDates(
              period
            );

          const filtered =
            customers.filter(
              (customer) => {
                const created =
                  parseDate(
                    customer.createdAt
                  );

                return (
                  created !== null &&
                  created >= start &&
                  created <= end
                );
              }
            ).length;

          return [
            {
              name: 'Customers',
              customers:
                filtered
            }
          ];
        }

        return result;
      },
      [
        customers,
        period
      ]
    );

  // =======================================================
  // SERVICE PERFORMANCE
  // =======================================================

  const servicePerformance =
    useMemo<ServicePerformanceItem[]>(
      () => {
        const serviceMap =
          new Map<
            string,
            ServicePerformanceItem
          >();

        periodBookings.forEach(
          (booking: Booking) => {
            booking.services.forEach(
              (service) => {
                const serviceId =
                  service.serviceId ||
                  service.name;

                const existing =
                  serviceMap.get(
                    serviceId
                  );

                if (existing) {
                  existing.bookings +=
                    1;

                  existing.revenue +=
                    Number(
                      service.price ||
                      0
                    );
                } else {
                  serviceMap.set(
                    serviceId,
                    {
                      name:
                        service.name,
                      bookings: 1,
                      revenue:
                        Number(
                          service.price ||
                          0
                        )
                    }
                  );
                }
              }
            );
          }
        );

        return Array.from(
          serviceMap.values()
        )
          .sort(
            (
              a: ServicePerformanceItem,
              b: ServicePerformanceItem
            ) =>
              b.bookings -
              a.bookings
          )
          .slice(0, 10);
      },
      [
        periodBookings
      ]
    );

  // =======================================================
  // SALON PERFORMANCE
  // =======================================================

  const salonPerformance =
    useMemo<SalonPerformanceItem[]>(
      () => {
        const salonMap =
          new Map<
            string,
            SalonPerformanceItem
          >();

        periodBookings.forEach(
          (booking: Booking) => {
            const salonId =
              booking.salonId;

            const existing =
              salonMap.get(
                salonId
              );

            if (existing) {
              existing.bookings +=
                1;

              if (
                booking.bookingStatus !==
                'CANCELLED'
              ) {
                existing.revenue +=
                  Number(
                    booking.totalAmount ||
                    0
                  );
              }
            } else {
              salonMap.set(
                salonId,
                {
                  salon:
                    booking.salonName ||
                    'Unknown Salon',
                  bookings: 1,
                  revenue:
                    booking.bookingStatus !==
                      'CANCELLED'
                      ? Number(
                        booking.totalAmount ||
                        0
                      )
                      : 0,
                  rating: 0
                }
              );
            }
          }
        );

        const result =
          Array.from(
            salonMap.values()
          );

        result.forEach(
          (
            salon: SalonPerformanceItem
          ) => {
            const matchingSalon =
              salons.find(
                (
                  item: Salon
                ) =>
                  item.salonName ===
                  salon.salon
              );

            salon.rating =
              Number(
                matchingSalon?.averageRating ||
                0
              );
          }
        );

        return result
          .sort(
            (
              a: SalonPerformanceItem,
              b: SalonPerformanceItem
            ) =>
              b.revenue -
              a.revenue
          )
          .slice(0, 10);
      },
      [
        periodBookings,
        salons
      ]
    );

  // =======================================================
  // KPI VALUES
  // =======================================================

  const totalRevenue =
    periodBookings
      .filter(
        (booking: Booking) =>
          booking.bookingStatus !==
          'CANCELLED'
      )
      .reduce(
        (
          sum: number,
          booking: Booking
        ) =>
          sum +
          Number(
            booking.totalAmount ||
            0
          ),
        0
      );

  const totalBookings =
    periodBookings.length;

  const completedBookings =
    periodBookings.filter(
      (booking: Booking) =>
        booking.bookingStatus ===
        'COMPLETED'
    ).length;

  const activeSalons =
    salons.filter(
      (salon: Salon) =>
        salon.isActive &&
        salon.isVisible &&
        !salon.isDeleted
    ).length;

  const averageBookingValue =
    totalBookings > 0
      ? totalRevenue /
      totalBookings
      : 0;

  const averageRating =
    reviews.length > 0
      ? reviews.reduce(
        (
          sum: number,
          review
        ) =>
          sum +
          Number(
            review.rating || 0
          ),
        0
      ) /
      reviews.length
      : 0;

  const cancelledBookings =
    periodBookings.filter(
      (booking: Booking) =>
        booking.bookingStatus ===
        'CANCELLED'
    ).length;

  const cancellationRate =
    totalBookings > 0
      ? (
        (cancelledBookings /
          totalBookings) *
        100
      )
      : 0;

  // =======================================================
  // PERIOD CHANGE
  // =======================================================

  const changeLabel =
    period === '7days'
      ? 'Last 7 days'
      : period === '30days'
        ? 'Last 30 days'
        : period === '3months'
          ? 'Last 3 months'
          : 'Last 12 months';

  // =======================================================
  // PERIOD CHANGE HANDLER
  // =======================================================

  const handlePeriodChange = (
    event: SelectChangeEvent<Period>
  ): void => {
    setPeriod(
      event.target.value as Period
    );
  };

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <Box
        sx={{
          p: 3,
          display: 'flex',
          justifyContent: 'center'
        }}
      >
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
          <Stack
            spacing={2}
            alignItems="center"
          >
            <Typography
              color="error"
              variant="h6"
            >
              Unable to load analytics
            </Typography>

            <Typography
              color="text.secondary"
            >
              {error}
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
      {/* ============================== HEADER ============================== */}

      <Grid
        container
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Grid item>
          <Stack spacing={0.5}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700 }}
            >
              Analytics
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Monitor your salon platform
              performance and business
              insights.
            </Typography>
          </Stack>
        </Grid>

        <Grid item>
          <FormControl
            size="small"
            sx={{ minWidth: 160 }}
          >
            <InputLabel>
              Period
            </InputLabel>

            <Select<Period>
              value={period}
              label="Period"
              onChange={
                handlePeriodChange
              }
            >
              <MenuItem value="7days">
                Last 7 days
              </MenuItem>

              <MenuItem value="30days">
                Last 30 days
              </MenuItem>

              <MenuItem value="3months">
                Last 3 months
              </MenuItem>

              <MenuItem value="12months">
                Last 12 months
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* ============================== KPI CARDS ============================== */}

      <Grid
        container
        spacing={2.5}
        sx={{ mb: 3 }}
      >
        <Grid
          item
          xs={12}
          sm={6}
          lg={3}
        >
          <StatCard
            title="Total Revenue"
            value={formatCompactCurrency(
              totalRevenue
            )}
            subtitle={changeLabel}
            icon={
              <DollarOutlined />
            }
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          lg={3}
        >
          <StatCard
            title="Total Bookings"
            value={totalBookings.toLocaleString(
              'en-IN'
            )}
            subtitle={changeLabel}
            icon={
              <CalendarOutlined />
            }
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          lg={3}
        >
          <StatCard
            title="Total Customers"
            value={customers.length.toLocaleString(
              'en-IN'
            )}
            subtitle="All customers"
            icon={
              <TeamOutlined />
            }
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          lg={3}
        >
          <StatCard
            title="Active Salons"
            value={activeSalons.toLocaleString(
              'en-IN'
            )}
            subtitle="Currently active"
            icon={
              <ShopOutlined />
            }
          />
        </Grid>
      </Grid>

      {/* ============================== SECONDARY KPIs ============================== */}

      <Grid
        container
        spacing={2.5}
        sx={{ mb: 3 }}
      >
        <Grid
          item
          xs={12}
          sm={6}
          lg={3}
        >
          <StatCard
            title="Completed Bookings"
            value={completedBookings.toLocaleString(
              'en-IN'
            )}
            icon={
              <CheckCircleOutlined />
            }
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          lg={3}
        >
          <StatCard
            title="Average Booking Value"
            value={formatCurrency(
              Math.round(
                averageBookingValue
              )
            )}
            icon={
              <ShoppingCartOutlined />
            }
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          lg={3}
        >
          <StatCard
            title="Average Rating"
            value={averageRating.toFixed(
              1
            )}
            icon={
              <StarOutlined />
            }
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          lg={3}
        >
          <StatCard
            title="Cancellation Rate"
            value={`${cancellationRate.toFixed(
              1
            )}%`}
            icon={
              <ClockCircleOutlined />
            }
          />
        </Grid>
      </Grid>

      {/* ============================== REVENUE + BOOKINGS ============================== */}

      <Grid
        container
        spacing={2.5}
        sx={{ mb: 3 }}
      >
        <Grid
          item
          xs={12}
          lg={8}
        >
          <MainCard
            title="Revenue & Bookings"
            secondary={
              <Chip
                label="Live data"
                size="small"
                color="success"
                variant="outlined"
              />
            }
          >
            <Box
              sx={{
                width: '100%',
                height: 360
              }}
            >
              <ResponsiveContainer>
                <AreaChart
                  data={revenueData}
                >
                  <defs>
                    <linearGradient
                      id="revenueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopOpacity={0.3}
                      />

                      <stop
                        offset="95%"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis dataKey="name" />

                  <YAxis
                    tickFormatter={(
                      value: number
                    ) =>
                      `₹${(
                        value / 1000
                      ).toFixed(0)}K`
                    }
                  />

                  <Tooltip
                    formatter={(
                      value: unknown,
                      name: unknown
                    ) => {
                      const numericValue =
                        Number(
                          value || 0
                        );

                      const label =
                        String(
                          name || ''
                        );

                      return [
                        label ===
                          'revenue'
                          ? formatCurrency(
                            numericValue
                          )
                          : numericValue.toLocaleString(
                            'en-IN'
                          ),
                        label ===
                          'revenue'
                          ? 'Revenue'
                          : 'Bookings'
                      ];
                    }}
                  />

                  <Legend />

                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#1677ff"
                    fill="url(#revenueGradient)"
                    strokeWidth={2}
                  />

                  <Line
                    type="monotone"
                    dataKey="bookings"
                    name="Bookings"
                    stroke="#52c41a"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </MainCard>
        </Grid>

        <Grid
          item
          xs={12}
          lg={4}
        >
          <MainCard title="Booking Status">
            <Box
              sx={{
                width: '100%',
                height: 360
              }}
            >
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={
                      bookingStatusData
                    }
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    innerRadius={75}
                    outerRadius={115}
                    paddingAngle={3}
                  >
                    {bookingStatusData.map(
                      (
                        item: BookingStatusItem,
                        index: number
                      ) => (
                        <Cell
                          key={`${item.name}-${index}`}
                          fill={
                            COLORS[
                            index %
                            COLORS.length
                            ]
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip />

                  <Legend
                    verticalAlign="bottom"
                    height={36}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </MainCard>
        </Grid>
      </Grid>

      {/* ============================== CUSTOMER GROWTH ============================== */}

      <Grid
        container
        spacing={2.5}
        sx={{ mb: 3 }}
      >
        <Grid
          item
          xs={12}
          lg={6}
        >
          <MainCard title="Customer Growth">
            <Box
              sx={{
                width: '100%',
                height: 320
              }}
            >
              <ResponsiveContainer>
                <LineChart
                  data={
                    customerGrowth
                  }
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis dataKey="name" />

                  <YAxis />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="customers"
                    name="Customers"
                    stroke="#722ed1"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </MainCard>
        </Grid>

        <Grid
          item
          xs={12}
          lg={6}
        >
          <MainCard title="Top Services">
            <Box
              sx={{
                width: '100%',
                height: 320
              }}
            >
              <ResponsiveContainer>
                <BarChart
                  data={
                    servicePerformance
                  }
                  layout="vertical"
                  margin={{
                    left: 20,
                    right: 20
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                  />

                  <XAxis type="number" />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="bookings"
                    name="Bookings"
                    fill="#1677ff"
                    radius={[
                      0,
                      6,
                      6,
                      0
                    ]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </MainCard>
        </Grid>
      </Grid>

      {/* ============================== SERVICE PERFORMANCE ============================== */}

      <Grid
        container
        spacing={2.5}
        sx={{ mb: 3 }}
      >
        <Grid
          item
          xs={12}
        >
          <MainCard title="Service Performance">
            <Box
              sx={{
                width: '100%',
                height: 350
              }}
            >
              <ResponsiveContainer>
                <BarChart
                  data={
                    servicePerformance
                  }
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis dataKey="name" />

                  <YAxis />

                  <Tooltip
                    formatter={(
                      value: unknown,
                      name: unknown
                    ) => {
                      const numericValue =
                        Number(
                          value || 0
                        );

                      const label =
                        String(
                          name || ''
                        );

                      return [
                        label ===
                          'Revenue'
                          ? formatCurrency(
                            numericValue
                          )
                          : numericValue.toLocaleString(
                            'en-IN'
                          ),
                        label
                      ];
                    }}
                  />

                  <Legend />

                  <Bar
                    dataKey="bookings"
                    name="Bookings"
                    fill="#1677ff"
                    radius={[
                      6,
                      6,
                      0,
                      0
                    ]}
                  />

                  <Bar
                    dataKey="revenue"
                    name="Revenue"
                    fill="#52c41a"
                    radius={[
                      6,
                      6,
                      0,
                      0
                    ]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </MainCard>
        </Grid>
      </Grid>

      {/* ============================== TOP SALONS ============================== */}

      <Grid
        container
        spacing={2.5}
      >
        <Grid
          item
          xs={12}
        >
          <MainCard title="Top Performing Salons">
            <Box
              sx={{
                overflowX: 'auto'
              }}
            >
              <Box
                component="table"
                sx={{
                  width: '100%',
                  borderCollapse:
                    'collapse',

                  '& th': {
                    textAlign:
                      'left',
                    padding:
                      '14px 12px',
                    color:
                      'text.secondary',
                    fontSize:
                      '0.8rem',
                    fontWeight: 600,
                    borderBottom:
                      '1px solid',
                    borderColor:
                      'divider'
                  },

                  '& td': {
                    padding:
                      '16px 12px',
                    borderBottom:
                      '1px solid',
                    borderColor:
                      'divider'
                  }
                }}
              >
                <thead>
                  <tr>
                    <th>
                      Salon
                    </th>

                    <th>
                      Bookings
                    </th>

                    <th>
                      Revenue
                    </th>

                    <th>
                      Rating
                    </th>

                    <th>
                      Performance
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {salonPerformance.map(
                    (
                      salon: SalonPerformanceItem,
                      index: number
                    ) => (
                      <tr
                        key={
                          salon.salon
                        }
                      >
                        <td>
                          <Stack
                            direction="row"
                            spacing={
                              1.5
                            }
                            alignItems="center"
                          >
                            <Box
                              sx={{
                                width: 36,
                                height: 36,
                                borderRadius: 2,
                                display:
                                  'flex',
                                alignItems:
                                  'center',
                                justifyContent:
                                  'center',
                                bgcolor:
                                  'primary.lighter',
                                color:
                                  'primary.main'
                              }}
                            >
                              <EnvironmentOutlined />
                            </Box>

                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600
                                }}
                              >
                                {
                                  salon.salon
                                }
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Rank #
                                {index +
                                  1}
                              </Typography>
                            </Box>
                          </Stack>
                        </td>

                        <td>
                          <Typography variant="body2">
                            {salon.bookings.toLocaleString(
                              'en-IN'
                            )}
                          </Typography>
                        </td>

                        <td>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600
                            }}
                          >
                            {formatCurrency(
                              salon.revenue
                            )}
                          </Typography>
                        </td>

                        <td>
                          <Stack
                            direction="row"
                            spacing={
                              0.5
                            }
                            alignItems="center"
                          >
                            <StarOutlined
                              style={{
                                color:
                                  '#faad14'
                              }}
                            />

                            <Typography variant="body2">
                              {salon.rating.toFixed(
                                1
                              )}
                            </Typography>
                          </Stack>
                        </td>

                        <td>
                          <Chip
                            label={
                              index ===
                                0
                                ? 'Excellent'
                                : index <
                                  3
                                  ? 'Very Good'
                                  : 'Good'
                            }
                            size="small"
                            color={
                              index ===
                                0
                                ? 'success'
                                : 'default'
                            }
                          />
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </Box>
            </Box>

            {salonPerformance.length ===
              0 && (
                <Box
                  sx={{
                    py: 5,
                    textAlign:
                      'center'
                  }}
                >
                  <Typography color="text.secondary">
                    No salon booking
                    data available
                    for this period.
                  </Typography>
                </Box>
              )}
          </MainCard>
        </Grid>
      </Grid>
    </Box>
  );
}