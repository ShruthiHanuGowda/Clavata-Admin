
import React, { useMemo, useState } from 'react';

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Tooltip,
  Typography
} from '@mui/material';

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  EyeOutlined,
  FileTextOutlined,
  HomeOutlined,
  MoreOutlined,
  ShopOutlined,
  StarFilled,
  TeamOutlined,
  UserOutlined,
  WalletOutlined
} from '@ant-design/icons';

import {
  BookingStatus,
  DashboardPeriod
} from './dashboardApi';

import useDashboardData from './useDashboardData';

// =========================================================
// TYPES
// =========================================================

interface StatCard {
  title: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ReactNode;
  subtitle: string;
}

// =========================================================
// HELPERS
// =========================================================

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(value || 0));

const formatCompactCurrency = (value: number): string => {
  const number = Number(value || 0);

  if (number >= 10000000) {
    return `₹${(number / 10000000).toFixed(1)}Cr`;
  }

  if (number >= 100000) {
    return `₹${(number / 100000).toFixed(2)}L`;
  }

  if (number >= 1000) {
    return `₹${(number / 1000).toFixed(1)}K`;
  }

  return formatCurrency(number);
};

const getInitials = (name?: string | null): string => {
  if (!name?.trim()) {
    return 'CL';
  }

  return name
    .trim()
    .split(/\s+/)
    .map(part => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

const formatDate = (value?: string | null): string => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const getErrorMessage = (error: unknown): string =>
  error instanceof Error
    ? error.message
    : 'Something went wrong. Please try again.';

// =========================================================
// BOOKING STATUS CONFIG
// =========================================================

const statusConfig: Record<
  BookingStatus,
  {
    label: string;
    color:
      | 'success'
      | 'warning'
      | 'info'
      | 'error'
      | 'default';
  }
> = {
  CONFIRMED: {
    label: 'Confirmed',
    color: 'success'
  },
  PENDING: {
    label: 'Pending',
    color: 'warning'
  },
  COMPLETED: {
    label: 'Completed',
    color: 'info'
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'error'
  },
  NO_SHOW: {
    label: 'No Show',
    color: 'default'
  },
  EXPIRED: {
    label: 'Expired',
    color: 'default'
  }
};

// =========================================================
// SHARED CARD STYLES
// =========================================================

const cardSx = {
  height: '100%',
  borderRadius: 3,
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: '0 2px 10px rgba(0,0,0,0.04)'
};

const sectionTitleSx = {
  fontWeight: 700,
  letterSpacing: '-0.2px'
};

// =========================================================
// STAT CARD
// =========================================================

interface StatCardProps {
  data: StatCard;
}

function DashboardStatCard({ data }: StatCardProps) {
  return (
    <Card
      sx={{
        ...cardSx,
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
        }
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={1.5}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1, fontWeight: 500 }}
            >
              {data.title}
            </Typography>

            <Typography
              variant="h4"
              fontWeight={700}
              sx={{
                mb: 0.75,
                letterSpacing: '-0.8px',
                overflowWrap: 'anywhere'
              }}
            >
              {data.value}
            </Typography>

            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              flexWrap="wrap"
            >
              {data.positive ? (
                <ArrowUpOutlined
                  style={{ color: '#2e7d32', fontSize: 13 }}
                />
              ) : (
                <ArrowDownOutlined
                  style={{ color: '#d32f2f', fontSize: 13 }}
                />
              )}

              <Typography
                variant="caption"
                fontWeight={700}
                color={data.positive ? 'success.main' : 'warning.main'}
              >
                {data.change}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {data.subtitle}
              </Typography>
            </Stack>
          </Box>

          <Box
            sx={{
              width: 48,
              height: 48,
              minWidth: 48,
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'action.hover',
              color: 'primary.main',
              fontSize: 22
            }}
          >
            {data.icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// =========================================================
// REVENUE CHART
// =========================================================

interface RevenueChartProps {
  data: {
    month: string;
    value: number;
  }[];
}

function RevenueChart({ data }: RevenueChartProps) {
  const maxValue = Math.max(
    ...data.map(item => Number(item.value || 0)),
    1
  );

  const totalRevenue = data.reduce(
    (sum, item) => sum + Number(item.value || 0),
    0
  );

  const thisMonth = data.length > 0
    ? Number(data[data.length - 1].value || 0)
    : 0;

  return (
    <Box sx={{ mt: 3 }}>
      {data.length === 0 ? (
        <Box
          sx={{
            height: 260,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography color="text.secondary">
            No revenue data available
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            height: 260,
            display: 'flex',
            alignItems: 'flex-end',
            gap: { xs: 1, sm: 2 },
            px: 1
          }}
        >
          {data.map((item, index) => {
            const value = Number(item.value || 0);
            const height = value > 0
              ? Math.max((value / maxValue) * 210, 8)
              : 4;

            const isLatest = index === data.length - 1;

            return (
              <Box
                key={`${item.month}-${index}`}
                sx={{
                  flex: 1,
                  height: '100%',
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  alignItems: 'center'
                }}
              >
                <Tooltip
                  title={`${item.month}: ${formatCurrency(value)}`}
                  arrow
                >
                  <Box
                    sx={{
                      width: '70%',
                      maxWidth: 48,
                      height,
                      minHeight: 4,
                      borderRadius: '8px 8px 3px 3px',
                      bgcolor: 'primary.main',
                      opacity: isLatest ? 1 : 0.65,
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        opacity: 1,
                        filter: 'brightness(1.08)'
                      }
                    }}
                  />
                </Tooltip>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {item.month}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}

      <Divider sx={{ mt: 2 }} />

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 2,
          mt: 2,
          px: 1
        }}
      >
        <Box>
          <Typography variant="caption" color="text.secondary">
            Last 6 months
          </Typography>

          <Typography variant="h6" fontWeight={700}>
            {formatCompactCurrency(totalRevenue)}
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="caption" color="text.secondary">
            Latest month
          </Typography>

          <Typography variant="h6" fontWeight={700} color="success.main">
            {formatCompactCurrency(thisMonth)}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

// =========================================================
// BOOKING STATUS
// =========================================================

interface BookingStatusProps {
  confirmed: number;
  completed: number;
  pending: number;
  cancelled: number;
  noShow: number;
  expired: number;
  total: number;
}

function BookingStatusCard({
  confirmed,
  completed,
  pending,
  cancelled,
  noShow,
  expired,
  total
}: BookingStatusProps) {
  const items = [
    { label: 'Confirmed', value: confirmed, color: 'success.main' },
    { label: 'Completed', value: completed, color: 'info.main' },
    { label: 'Pending', value: pending, color: 'warning.main' },
    { label: 'Cancelled', value: cancelled, color: 'error.main' },
    { label: 'No Show', value: noShow, color: 'text.secondary' },
    { label: 'Expired', value: expired, color: 'text.disabled' }
  ];

  return (
    <Stack spacing={2.25} sx={{ mt: 2.5 }}>
      {items.map(item => {
        const percentage = total > 0
          ? Math.min(100, Math.round((item.value / total) * 100))
          : 0;

        return (
          <Box key={item.label}>
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ mb: 0.75 }}
            >
              <Typography variant="body2" fontWeight={500}>
                {item.label}
              </Typography>

              <Typography variant="body2" fontWeight={700}>
                {item.value.toLocaleString('en-IN')} ({percentage}%)
              </Typography>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={percentage}
              sx={{
                height: 7,
                borderRadius: 5,
                bgcolor: 'action.hover',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 5,
                  bgcolor: item.color
                }
              }}
            />
          </Box>
        );
      })}

      {total === 0 && (
        <Typography variant="caption" color="text.secondary">
          No bookings were recorded in this period.
        </Typography>
      )}
    </Stack>
  );
}

// =========================================================
// SECTION HEADER
// =========================================================

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}

function SectionHeader({
  title,
  subtitle,
  action
}: SectionHeaderProps) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      spacing={2}
      sx={{ p: 2.5 }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h6" sx={sectionTitleSx}>
          {title}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>

      {action}
    </Stack>
  );
}

// =========================================================
// DASHBOARD
// =========================================================

export default function Dashboard() {
  const [period, setPeriod] = useState<DashboardPeriod>('month');

  const {
    data,
    loading,
    error,
    refetch
  } = useDashboardData(period);

  const handlePeriodChange = (
    event: SelectChangeEvent<DashboardPeriod>
  ) => {
    setPeriod(event.target.value as DashboardPeriod);
  };

  const stats = useMemo<StatCard[]>(() => {
    if (!data) {
      return [];
    }

    const s = data.stats;

    return [
      {
        title: 'Total Customers',
        value: s.totalCustomers.toLocaleString('en-IN'),
        change: 'Live',
        positive: true,
        icon: <TeamOutlined />,
        subtitle: 'Registered customers'
      },
      {
        title: 'Total Salons',
        value: s.totalSalons.toLocaleString('en-IN'),
        change: 'Live',
        positive: true,
        icon: <ShopOutlined />,
        subtitle: 'Salons on platform'
      },
      {
        title: 'Total Bookings',
        value: s.totalBookings.toLocaleString('en-IN'),
        change: 'Period',
        positive: true,
        icon: <CalendarOutlined />,
        subtitle: 'Selected period'
      },
      {
        title: 'Clavata Revenue',
        value: formatCompactCurrency(s.totalRevenue),
        change: 'Platform',
        positive: true,
        icon: <DollarOutlined />,
        subtitle: 'Paid booking fees'
      },
      {
        title: 'Pending Applications',
        value: s.pendingApplications.toLocaleString('en-IN'),
        change: 'Action',
        positive: s.pendingApplications === 0,
        icon: <FileTextOutlined />,
        subtitle: 'Awaiting review'
      },
      {
        title: 'Pending Booking Fees',
        value: formatCompactCurrency(s.pendingPayments),
        change: 'Pending',
        positive: s.pendingPayments === 0,
        icon: <WalletOutlined />,
        subtitle: 'Confirmed bookings only'
      },
      {
        title: 'Average Rating',
        value: s.averageRating.toFixed(1),
        change: 'Published',
        positive: s.averageRating >= 3,
        icon: <StarFilled />,
        subtitle: 'Published reviews'
      },
      {
        title: "Today's Bookings",
        value: s.todayBookings.toLocaleString('en-IN'),
        change: 'Today',
        positive: true,
        icon: <ClockCircleOutlined />,
        subtitle: 'Appointments scheduled'
      }
    ];
  }, [data]);

  // =======================================================
  // INITIAL LOADING
  // =======================================================

  if (loading && !data) {
    return (
      <Box
        sx={{
          minHeight: 420,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress />

          <Typography color="text.secondary">
            Loading Clavata dashboard...
          </Typography>
        </Stack>
      </Box>
    );
  }

  // =======================================================
  // INITIAL ERROR
  // =======================================================

  if (error && !data) {
    return (
      <Box sx={{ p: { xs: 1, md: 2 } }}>
        <Alert
          severity="error"
          sx={{ borderRadius: 2.5 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => void refetch()}
            >
              Retry
            </Button>
          }
        >
          {getErrorMessage(error)}
        </Alert>
      </Box>
    );
  }

  if (!data) {
    return null;
  }

  // =======================================================
  // MAIN DASHBOARD
  // =======================================================

  return (
    <Box sx={{ width: '100%', pb: 3 }}>
      {/* HEADER */}

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              mb: 0.5,
              letterSpacing: '-0.8px'
            }}
          >
            Dashboard
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Welcome back. Here's what's happening across Clavata.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Select
            size="small"
            value={period}
            onChange={handlePeriodChange}
            inputProps={{ 'aria-label': 'Dashboard date period' }}
            sx={{
              minWidth: 140,
              bgcolor: 'background.paper',
              borderRadius: 2
            }}
          >
            <MenuItem value="day">Today</MenuItem>
            <MenuItem value="week">This Week</MenuItem>
            <MenuItem value="month">This Month</MenuItem>
            <MenuItem value="year">This Year</MenuItem>
          </Select>

          <Button
            variant="outlined"
            onClick={() => void refetch()}
            disabled={loading}
            sx={{
              minWidth: 105,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            {loading ? (
              <CircularProgress size={18} />
            ) : (
              'Refresh'
            )}
          </Button>
        </Stack>
      </Stack>

      {/* REFRESH STATUS / ERROR */}

      {loading && data && (
        <LinearProgress sx={{ mb: 2, borderRadius: 2 }} />
      )}

      {error && data && (
        <Alert
          severity="warning"
          sx={{ mb: 2, borderRadius: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => void refetch()}
            >
              Retry
            </Button>
          }
        >
          Refresh failed. The dashboard is showing the last successfully loaded data.
          {' '}
          {getErrorMessage(error)}
        </Alert>
      )}

      {/* PENDING APPLICATION ALERT */}

      {data.stats.pendingApplications > 0 && (
        <Alert
          severity="warning"
          icon={<ClockCircleOutlined />}
          sx={{
            mb: 3,
            borderRadius: 2.5,
            alignItems: 'center'
          }}
        >
          <strong>
            {data.stats.pendingApplications.toLocaleString('en-IN')} salon applications
          </strong>
          {' '}are waiting for review.
        </Alert>
      )}

      {/* STAT CARDS */}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {stats.map(stat => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={stat.title}>
            <DashboardStatCard data={stat} />
          </Grid>
        ))}
      </Grid>

      {/* REVENUE AND BOOKING STATUS */}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={8}>
          <Card sx={cardSx}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                spacing={1}
              >
                <Box>
                  <Typography variant="h6" sx={sectionTitleSx}>
                    Revenue Overview
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Clavata booking-fee revenue from successful payments
                  </Typography>
                </Box>

                <Chip
                  label={`${data.stats.totalBookings.toLocaleString('en-IN')} bookings in period`}
                  color="primary"
                  size="small"
                  variant="outlined"
                />
              </Stack>

              <RevenueChart data={data.revenue} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={cardSx}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={sectionTitleSx}>
                Booking Status
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Distribution for the selected period
              </Typography>

              <BookingStatusCard
                confirmed={data.bookingSummary.confirmed}
                completed={data.bookingSummary.completed}
                pending={data.bookingSummary.pending}
                cancelled={data.bookingSummary.cancelled}
                noShow={data.bookingSummary.noShow}
                expired={data.bookingSummary.expired}
                total={data.stats.totalBookings}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* RECENT BOOKINGS AND QUICK ACTIONS */}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={8}>
          <Card sx={cardSx}>
            <Box>
              <SectionHeader
                title="Recent Bookings"
                subtitle="Latest customer appointments"
                action={
                  <Tooltip title="Refresh dashboard data">
                    <IconButton
                      size="small"
                      onClick={() => void refetch()}
                      disabled={loading}
                      aria-label="Refresh recent bookings"
                    >
                      <MoreOutlined />
                    </IconButton>
                  </Tooltip>
                }
              />

              <Divider />

              {data.recentBookings.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <CalendarOutlined
                    style={{
                      fontSize: 28,
                      color: '#9e9e9e',
                      marginBottom: 8
                    }}
                  />

                  <Typography color="text.secondary">
                    No bookings found.
                  </Typography>
                </Box>
              ) : (
                data.recentBookings.map((booking, index) => {
                  const status = statusConfig[booking.bookingStatus];

                  return (
                    <React.Fragment key={booking.bookingId}>
                      <Box
                        sx={{
                          px: 2.5,
                          py: 2,
                          transition: 'background-color 0.2s',
                          '&:hover': {
                            bgcolor: 'action.hover'
                          }
                        }}
                      >
                        <Grid container alignItems="center" spacing={2}>
                          <Grid item xs={12} sm={4}>
                            <Stack
                              direction="row"
                              spacing={1.5}
                              alignItems="center"
                            >
                              <Avatar
                                sx={{
                                  width: 40,
                                  height: 40,
                                  bgcolor: 'action.hover',
                                  color: 'primary.main',
                                  fontSize: 14,
                                  fontWeight: 700
                                }}
                              >
                                {getInitials(booking.customerName)}
                              </Avatar>

                              <Box sx={{ minWidth: 0 }}>
                                <Typography
                                  variant="body2"
                                  fontWeight={700}
                                  noWrap
                                >
                                  {booking.customerName || 'Customer'}
                                </Typography>

                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  noWrap
                                >
                                  {booking.bookingId}
                                </Typography>
                              </Box>
                            </Stack>
                          </Grid>

                          <Grid item xs={12} sm={3}>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              noWrap
                            >
                              {booking.services
                                ?.map(service => service.name)
                                .filter(Boolean)
                                .join(', ') || 'Service'}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                              noWrap
                              display="block"
                            >
                              {booking.salonName || 'Salon'}
                            </Typography>
                          </Grid>

                          <Grid item xs={6} sm={2}>
                            <Typography variant="body2" fontWeight={600}>
                              {formatDate(booking.bookingDate)}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {booking.startTime || '-'}
                            </Typography>
                          </Grid>

                          <Grid item xs={6} sm={2}>
                            <Typography variant="body2" fontWeight={700}>
                              {formatCurrency(Number(booking.totalAmount || 0))}
                            </Typography>

                            <Chip
                              label={status?.label || booking.bookingStatus}
                              color={status?.color || 'default'}
                              size="small"
                              sx={{
                                mt: 0.5,
                                height: 22,
                                fontSize: 11
                              }}
                            />
                          </Grid>

                          <Grid
                            item
                            xs={12}
                            sm={1}
                            sx={{ textAlign: { xs: 'left', sm: 'right' } }}
                          >
                            <Tooltip
                              title={`Booking fee: ${booking.bookingFeeStatus}`}
                            >
                              <Chip
                                size="small"
                                variant="outlined"
                                label={
                                  booking.bookingFeeStatus === 'PAID'
                                    ? 'Fee paid'
                                    : booking.bookingFeeStatus
                                }
                                color={
                                  booking.bookingFeeStatus === 'PAID'
                                    ? 'success'
                                    : booking.bookingFeeStatus === 'PENDING'
                                      ? 'warning'
                                      : 'default'
                                }
                              />
                            </Tooltip>
                          </Grid>
                        </Grid>
                      </Box>

                      {index < data.recentBookings.length - 1 && <Divider />}
                    </React.Fragment>
                  );
                })
              )}
            </Box>
          </Card>
        </Grid>

        {/* QUICK ACTIONS */}

        <Grid item xs={12} lg={4}>
          <Card sx={cardSx}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={sectionTitleSx}>
                Quick Actions
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2.5 }}
              >
                Shortcuts to common admin tasks
              </Typography>

              <Stack spacing={1.5}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() =>
                    window.location.assign('/salons')
                  }
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    borderColor: 'divider',
                    color: 'text.primary',
                    borderRadius: 2,
                    p: 1.5
                  }}
                >
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 1.5,
                      bgcolor: 'action.hover',
                      color: 'warning.main'
                    }}
                  >
                    <ShopOutlined />
                  </Box>

                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="body2" fontWeight={700}>
                      Review Salon Applications
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      {data.stats.pendingApplications} pending
                    </Typography>
                  </Box>
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() =>
                    window.location.assign('/customers')
                  }
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    borderColor: 'divider',
                    color: 'text.primary',
                    borderRadius: 2,
                    p: 1.5
                  }}
                >
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 1.5,
                      bgcolor: 'action.hover',
                      color: 'primary.main'
                    }}
                  >
                    <UserOutlined />
                  </Box>

                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="body2" fontWeight={700}>
                      Manage Customers
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      {data.stats.totalCustomers} registered
                    </Typography>
                  </Box>
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() =>
                    window.location.assign('/bookings')
                  }
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    borderColor: 'divider',
                    color: 'text.primary',
                    borderRadius: 2,
                    p: 1.5
                  }}
                >
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 1.5,
                      bgcolor: 'action.hover',
                      color: 'info.main'
                    }}
                  >
                    <CalendarOutlined />
                  </Box>

                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="body2" fontWeight={700}>
                      Manage Bookings
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      {data.stats.todayBookings} today
                    </Typography>
                  </Box>
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() =>
                    window.location.assign('/transactions')
                  }
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    borderColor: 'divider',
                    color: 'text.primary',
                    borderRadius: 2,
                    p: 1.5
                  }}
                >
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 1.5,
                      bgcolor: 'action.hover',
                      color: 'success.main'
                    }}
                  >
                    <WalletOutlined />
                  </Box>

                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="body2" fontWeight={700}>
                      View Transactions
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      {formatCompactCurrency(data.stats.totalRevenue)} collected
                    </Typography>
                  </Box>
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* SALON APPLICATIONS AND REVIEWS */}

      <Grid container spacing={2.5}>
        {/* SALON APPLICATIONS */}

        <Grid item xs={12} lg={7}>
          <Card sx={cardSx}>
            <SectionHeader
              title="Salon Applications"
              subtitle="Applications requiring review"
              action={
                <Button
                  size="small"
                  onClick={() => window.location.assign('/salons')}
                  sx={{ textTransform: 'none' }}
                >
                  View All
                </Button>
              }
            />

            <Divider />

            {data.pendingApplications.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <HomeOutlined
                  style={{
                    fontSize: 28,
                    color: '#9e9e9e',
                    marginBottom: 8
                  }}
                />

                <Typography color="text.secondary">
                  No pending applications.
                </Typography>
              </Box>
            ) : (
              data.pendingApplications.slice(0, 5).map(
                (application, index) => (
                  <React.Fragment key={application.salonId}>
                    <Box
                      sx={{
                        px: 2.5,
                        py: 2,
                        '&:hover': {
                          bgcolor: 'action.hover'
                        }
                      }}
                    >
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        alignItems={{ xs: 'stretch', sm: 'center' }}
                        spacing={1.5}
                      >
                        <Avatar
                          sx={{
                            width: 42,
                            height: 42,
                            bgcolor: 'action.hover',
                            color: 'primary.main'
                          }}
                        >
                          <HomeOutlined />
                        </Avatar>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={700} noWrap>
                            {application.salonName || 'Unnamed salon'}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            {application.ownerName || 'Owner not available'}
                            {' • '}
                            {application.address?.city || 'Location unavailable'}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            Submitted {formatDate(application.createdAt)}
                          </Typography>
                        </Box>

                        <Chip
                          label="Pending review"
                          color="warning"
                          size="small"
                        />

                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() =>
                            window.location.assign('/salons')
                          }
                          sx={{
                            textTransform: 'none',
                            borderRadius: 1.5
                          }}
                        >
                          Review
                        </Button>
                      </Stack>
                    </Box>

                    {index <
                      Math.min(data.pendingApplications.length, 5) - 1 && (
                      <Divider />
                    )}
                  </React.Fragment>
                )
              )
            )}
          </Card>
        </Grid>

        {/* RECENT REVIEWS */}

        <Grid item xs={12} lg={5}>
          <Card sx={cardSx}>
            <SectionHeader
              title="Recent Reviews"
              subtitle="Latest customer feedback"
              action={
                <Button
                  size="small"
                  onClick={() => window.location.assign('/reviews')}
                  sx={{ textTransform: 'none' }}
                >
                  View All
                </Button>
              }
            />

            <Divider />

            {data.recentReviews.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <StarFilled
                  style={{
                    fontSize: 28,
                    color: '#9e9e9e',
                    marginBottom: 8
                  }}
                />

                <Typography color="text.secondary">
                  No reviews found.
                </Typography>
              </Box>
            ) : (
              data.recentReviews.map((review, index) => (
                <React.Fragment key={review.reviewId}>
                  <Box sx={{ px: 2.5, py: 2 }}>
                    <Stack direction="row" spacing={1.5}>
                      <Avatar
                        sx={{
                          width: 38,
                          height: 38,
                          bgcolor: 'action.hover',
                          color: 'primary.main',
                          fontSize: 13,
                          fontWeight: 700
                        }}
                      >
                        {getInitials(review.customerName)}
                      </Avatar>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack
                          direction={{ xs: 'column', sm: 'row' }}
                          justifyContent="space-between"
                          spacing={0.5}
                        >
                          <Typography variant="body2" fontWeight={700} noWrap>
                            {review.customerName || 'Customer'}
                          </Typography>

                          <Typography variant="caption" color="text.secondary">
                            {formatDate(review.createdAt)}
                          </Typography>
                        </Stack>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{ mb: 0.75 }}
                        >
                          {review.salonName || 'Salon'}
                        </Typography>

                        <Stack
                          direction="row"
                          spacing={0.25}
                          sx={{ mb: 0.75 }}
                        >
                          {[1, 2, 3, 4, 5].map(star => (
                            <StarFilled
                              key={star}
                              style={{
                                fontSize: 13,
                                color:
                                  star <= Number(review.rating || 0)
                                    ? '#f59e0b'
                                    : '#d9d9d9'
                              }}
                            />
                          ))}
                        </Stack>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            lineHeight: 1.6,
                            overflowWrap: 'anywhere'
                          }}
                        >
                          {review.review || 'No written feedback.'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  {index < data.recentReviews.length - 1 && <Divider />}
                </React.Fragment>
              ))
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
