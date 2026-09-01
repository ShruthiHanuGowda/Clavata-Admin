import {
  useMemo,
  useState
} from 'react';

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

const formatCurrency = (
  value: number
): string =>
  new Intl.NumberFormat(
    'en-IN',
    {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }
  ).format(
    Number(value || 0)
  );

const formatCompactCurrency = (
  value: number
): string => {
  const number =
    Number(value || 0);

  if (number >= 10000000) {
    return `₹${(
      number / 10000000
    ).toFixed(1)}Cr`;
  }

  if (number >= 100000) {
    return `₹${(
      number / 100000
    ).toFixed(2)}L`;
  }

  if (number >= 1000) {
    return `₹${(
      number / 1000
    ).toFixed(1)}K`;
  }

  return formatCurrency(
    number
  );
};

const getInitials = (
  name?: string | null
): string => {
  if (!name) {
    return '??';
  }

  return name
    .trim()
    .split(/\s+/)
    .map(
      (part) =>
        part.charAt(0)
    )
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

// =========================================================
// STATUS CONFIG
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
  }
};

// =========================================================
// STAT CARD
// =========================================================

interface StatCardProps {
  data: StatCard;
}

function DashboardStatCard({
  data
}: StatCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow:
          '0 2px 10px rgba(0,0,0,0.04)',
        transition:
          'all 0.2s ease',

        '&:hover': {
          transform:
            'translateY(-2px)',

          boxShadow:
            '0 8px 24px rgba(0,0,0,0.08)'
        }
      }}
    >
      <CardContent
        sx={{
          p: 2.5
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 1,
                fontWeight: 500
              }}
            >
              {data.title}
            </Typography>

            <Typography
              variant="h4"
              fontWeight={700}
              sx={{
                mb: 0.75
              }}
            >
              {data.value}
            </Typography>

            <Stack
              direction="row"
              spacing={0.75}
              alignItems="center"
            >
              {data.positive ? (
                <ArrowUpOutlined
                  style={{
                    color:
                      '#2e7d32',
                    fontSize: 13
                  }}
                />
              ) : (
                <ArrowDownOutlined
                  style={{
                    color:
                      '#d32f2f',
                    fontSize: 13
                  }}
                />
              )}

              <Typography
                variant="caption"
                fontWeight={700}
                color={
                  data.positive
                    ? 'success.main'
                    : 'error.main'
                }
              >
                {data.change}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                {data.subtitle}
              </Typography>
            </Stack>
          </Box>

          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent:
                'center',
              bgcolor:
                'primary.lighter',
              color:
                'primary.main',
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

function RevenueChart({
  data
}: RevenueChartProps) {
  const maxValue =
    Math.max(
      ...data.map(
        (item) =>
          item.value
      ),
      1
    );

  const totalRevenue =
    data.reduce(
      (sum, item) =>
        sum + item.value,
      0
    );

  const thisMonth =
    data.length > 0
      ? data[data.length - 1]
        .value
      : 0;

  return (
    <Box sx={{ mt: 3 }}>
      {data.length === 0 ? (
        <Box
          sx={{
            height: 260,
            display: 'flex',
            alignItems:
              'center',
            justifyContent:
              'center'
          }}
        >
          <Typography
            color="text.secondary"
          >
            No revenue data available
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            height: 260,
            display: 'flex',
            alignItems:
              'flex-end',
            gap: {
              xs: 1,
              sm: 2
            },
            px: 1
          }}
        >
          {data.map(
            (item, index) => {
              const height =
                (item.value /
                  maxValue) *
                210;

              const isLatest =
                index ===
                data.length - 1;

              return (
                <Box
                  key={`${item.month}-${index}`}
                  sx={{
                    flex: 1,
                    height: '100%',
                    display: 'flex',
                    flexDirection:
                      'column',
                    justifyContent:
                      'flex-end',
                    alignItems:
                      'center'
                  }}
                >
                  <Tooltip
                    title={formatCurrency(
                      item.value
                    )}
                  >
                    <Box
                      sx={{
                        width: '70%',
                        maxWidth: 48,
                        height,
                        minHeight:
                          item.value >
                            0
                            ? 20
                            : 4,
                        borderRadius:
                          '8px 8px 3px 3px',
                        bgcolor:
                          'primary.main',
                        opacity:
                          isLatest
                            ? 1
                            : 0.65,
                        transition:
                          'all 0.2s ease',
                        cursor:
                          'pointer',

                        '&:hover': {
                          opacity: 1,
                          transform:
                            'scaleY(1.02)'
                        }
                      }}
                    />
                  </Tooltip>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      mt: 1
                    }}
                  >
                    {item.month}
                  </Typography>
                </Box>
              );
            }
          )}
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          justifyContent:
            'space-between',
          mt: 2,
          px: 1
        }}
      >
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
          >
            Last 6 months
          </Typography>

          <Typography
            variant="h6"
            fontWeight={700}
          >
            {formatCompactCurrency(
              totalRevenue
            )}
          </Typography>
        </Box>

        <Box
          sx={{
            textAlign: 'right'
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
          >
            This month
          </Typography>

          <Typography
            variant="h6"
            fontWeight={700}
            color="success.main"
          >
            {formatCompactCurrency(
              thisMonth
            )}
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
  total: number;
}

function BookingStatusCard({
  confirmed,
  completed,
  pending,
  cancelled,
  noShow,
  total
}: BookingStatusProps) {
  const items = [
    {
      label: 'Confirmed',
      value: confirmed,
      color:
        'success.main'
    },
    {
      label: 'Completed',
      value: completed,
      color: 'info.main'
    },
    {
      label: 'Pending',
      value: pending,
      color:
        'warning.main'
    },
    {
      label: 'Cancelled',
      value: cancelled,
      color: 'error.main'
    },
    {
      label: 'No Show',
      value: noShow,
      color:
        'text.secondary'
    }
  ];

  return (
    <Stack
      spacing={2.5}
      sx={{
        mt: 2.5
      }}
    >
      {items.map(
        (item) => {
          const percentage =
            total > 0
              ? Math.round(
                (item.value /
                  total) *
                100
              )
              : 0;

          return (
            <Box
              key={item.label}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{
                  mb: 0.75
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={500}
                >
                  {item.label}
                </Typography>

                <Typography
                  variant="body2"
                  fontWeight={700}
                >
                  {item.value}{' '}
                  ({percentage}%)
                </Typography>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={
                  percentage
                }
                sx={{
                  height: 7,
                  borderRadius: 5,
                  bgcolor:
                    'action.hover',

                  '& .MuiLinearProgress-bar':
                  {
                    borderRadius: 5,
                    bgcolor:
                      item.color
                  }
                }}
              />
            </Box>
          );
        }
      )}
    </Stack>
  );
}

// =========================================================
// DATE DISPLAY
// =========================================================

const formatDate = (
  value?: string | null
): string => {
  if (!value) {
    return '-';
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }
  );
};

// =========================================================
// DASHBOARD
// =========================================================

export default function Dashboard() {
  const [period, setPeriod] =
    useState<DashboardPeriod>(
      'month'
    );

  const {
    data,
    loading,
    error,
    refetch
  } =
    useDashboardData(
      period
    );

  // =======================================================
  // PERIOD CHANGE
  // =======================================================

  const handlePeriodChange =
    (
      event: SelectChangeEvent
    ) => {
      setPeriod(
        event.target
          .value as DashboardPeriod
      );
    };

  // =======================================================
  // STATS
  // =======================================================

  const stats =
    useMemo<
      StatCard[]
    >(() => {
      if (!data) {
        return [];
      }

      const s =
        data.stats;

      return [
        {
          title:
            'Total Customers',

          value:
            s.totalCustomers.toLocaleString(
              'en-IN'
            ),

          change: 'Live',

          positive: true,

          icon:
            <TeamOutlined />,

          subtitle:
            'Registered customers'
        },

        {
          title:
            'Total Salons',

          value:
            s.totalSalons.toLocaleString(
              'en-IN'
            ),

          change: 'Live',

          positive: true,

          icon:
            <ShopOutlined />,

          subtitle:
            'Salons on platform'
        },

        {
          title:
            'Total Bookings',

          value:
            s.totalBookings.toLocaleString(
              'en-IN'
            ),

          change: 'Live',

          positive: true,

          icon:
            <CalendarOutlined />,

          subtitle:
            'Bookings for selected period'
        },

        {
          title:
            'Revenue',

          value:
            formatCompactCurrency(
              s.totalRevenue
            ),

          change: 'Live',

          positive: true,

          icon:
            <DollarOutlined />,

          subtitle:
            'Booking revenue'
        },

        {
          title:
            'Pending Applications',

          value:
            s.pendingApplications.toLocaleString(
              'en-IN'
            ),

          change: 'Action',

          positive: false,

          icon:
            <FileTextOutlined />,

          subtitle:
            'Awaiting verification'
        },

        {
          title:
            'Pending Payments',

          value:
            formatCompactCurrency(
              s.pendingPayments
            ),

          change: 'Live',

          positive: false,

          icon:
            <WalletOutlined />,

          subtitle:
            'Outstanding amount'
        },

        {
          title:
            'Average Rating',

          value:
            s.averageRating.toFixed(
              1
            ),

          change: 'Live',

          positive: true,

          icon:
            <StarFilled />,

          subtitle:
            'Platform-wide rating'
        },

        {
          title:
            "Today's Bookings",

          value:
            s.todayBookings.toLocaleString(
              'en-IN'
            ),

          change: 'Live',

          positive: true,

          icon:
            <ClockCircleOutlined />,

          subtitle:
            'Appointments today'
        }
      ];
    }, [data]);

  // =======================================================
  // LOADING
  // =======================================================

  if (
    loading &&
    !data
  ) {
    return (
      <Box
        sx={{
          minHeight: 500,
          display: 'flex',
          alignItems:
            'center',
          justifyContent:
            'center'
        }}
      >
        <Stack
          spacing={2}
          alignItems="center"
        >
          <CircularProgress />

          <Typography
            color="text.secondary"
          >
            Loading dashboard...
          </Typography>
        </Stack>
      </Box>
    );
  }

  // =======================================================
  // ERROR
  // =======================================================

  if (
    error &&
    !data
  ) {
    return (
      <Box>
        <Alert
          severity="error"
          sx={{
            mb: 2,
            borderRadius: 2
          }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={
                refetch
              }
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  // =======================================================
  // SAFETY
  // =======================================================

  if (!data) {
    return null;
  }

  return (
    <Box>
      {/* ===================================================
          HEADER
      =================================================== */}

      <Stack
        direction={{
          xs: 'column',
          sm: 'row'
        }}
        justifyContent="space-between"
        alignItems={{
          xs: 'flex-start',
          sm: 'center'
        }}
        spacing={2}
        sx={{
          mb: 3
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              mb: 0.5
            }}
          >
            Dashboard
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Welcome back. Here's what's happening across Clavata today.
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1.5}
        >
          <Select
            size="small"
            value={period}
            onChange={
              handlePeriodChange
            }
            sx={{
              minWidth: 130,
              bgcolor:
                'background.paper',
              borderRadius: 2
            }}
          >
            <MenuItem value="day">
              Today
            </MenuItem>

            <MenuItem value="week">
              This Week
            </MenuItem>

            <MenuItem value="month">
              This Month
            </MenuItem>

            <MenuItem value="year">
              This Year
            </MenuItem>
          </Select>

          <Button
            variant="outlined"
            onClick={
              refetch
            }
            disabled={loading}
            sx={{
              borderRadius: 2,
              textTransform:
                'none',
              fontWeight: 600
            }}
          >
            Refresh
          </Button>
        </Stack>
      </Stack>

      {/* ===================================================
          WARNING
      =================================================== */}

      {data.stats
        .pendingApplications >
        0 && (
          <Alert
            severity="warning"
            icon={<ClockCircleOutlined />}
            sx={{
              mb: 3,
              borderRadius: 2.5,
              alignItems: 'center'
            }}
            action={
              <Button
                color="inherit"
                size="small"
                sx={{ fontWeight: 700 }}
              >
                Review Now
              </Button>
            }
          >
            <strong>{data?.stats.pendingApplications ?? 0} salon applications</strong>{' '}
            are waiting for verification.
          </Alert>
        )}

      {/* ===================================================
          STATS
      =================================================== */}

      <Grid
        container
        spacing={2.5}
        sx={{
          mb: 3
        }}
      >
        {stats.map(
          (stat) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              lg={3}
              key={
                stat.title
              }
            >
              <DashboardStatCard
                data={
                  stat
                }
              />
            </Grid>
          )
        )}
      </Grid>

      {/* ===================================================
          REVENUE + BOOKING STATUS
      =================================================== */}

      <Grid
        container
        spacing={2.5}
        sx={{
          mb: 3
        }}
      >
        <Grid
          item
          xs={12}
          lg={8}
        >
          <Card
            sx={{
              borderRadius: 3,
              border:
                '1px solid',
              borderColor:
                'divider',
              boxShadow:
                '0 2px 10px rgba(0,0,0,0.04)'
            }}
          >
            <CardContent
              sx={{
                p: 2.5
              }}
            >
              <Stack
                direction={{
                  xs: 'column',
                  sm: 'row'
                }}
                justifyContent="space-between"
                spacing={1}
              >
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                  >
                    Revenue Overview
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Revenue generated from bookings
                  </Typography>
                </Box>

                <Chip
                  label={
                    `${data.bookings.length} total bookings`
                  }
                  color="primary"
                  size="small"
                />
              </Stack>

              <RevenueChart
                data={
                  data.revenue
                }
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid
          item
          xs={12}
          lg={4}
        >
          <Card
            sx={{
              height: '100%',
              borderRadius: 3,
              border:
                '1px solid',
              borderColor:
                'divider',
              boxShadow:
                '0 2px 10px rgba(0,0,0,0.04)'
            }}
          >
            <CardContent
              sx={{
                p: 2.5
              }}
            >
              <Typography
                variant="h6"
                fontWeight={700}
              >
                Booking Status
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Selected period distribution
              </Typography>

              <BookingStatusCard
                confirmed={
                  data
                    .bookingSummary
                    .confirmed
                }
                completed={
                  data
                    .bookingSummary
                    .completed
                }
                pending={
                  data
                    .bookingSummary
                    .pending
                }
                cancelled={
                  data
                    .bookingSummary
                    .cancelled
                }
                noShow={
                  data
                    .bookingSummary
                    .noShow
                }
                total={
                  data.stats
                    .totalBookings
                }
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ===================================================
          RECENT BOOKINGS
      =================================================== */}

      <Grid
        container
        spacing={2.5}
        sx={{
          mb: 3
        }}
      >
        <Grid
          item
          xs={12}
          lg={8}
        >
          <Card
            sx={{
              borderRadius: 3,
              border:
                '1px solid',
              borderColor:
                'divider',
              boxShadow:
                '0 2px 10px rgba(0,0,0,0.04)'
            }}
          >
            <CardContent
              sx={{
                p: 0
              }}
            >
              <Box
                sx={{
                  p: 2.5
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                    >
                      Recent Bookings
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Latest customer appointments
                    </Typography>
                  </Box>

                  <Button
                    size="small"
                    endIcon={
                      <EyeOutlined />
                    }
                    sx={{
                      textTransform:
                        'none'
                    }}
                  >
                    View All
                  </Button>
                </Stack>
              </Box>

              <Divider />

              {data.recentBookings
                .length ===
                0 ? (
                <Box
                  sx={{
                    p: 4,
                    textAlign:
                      'center'
                  }}
                >
                  <Typography
                    color="text.secondary"
                  >
                    No bookings found.
                  </Typography>
                </Box>
              ) : (
                data.recentBookings.map(
                  (
                    booking,
                    index
                  ) => (
                    <Box
                      key={
                        booking.bookingId
                      }
                    >
                      <Box
                        sx={{
                          px: 2.5,
                          py: 2,

                          '&:hover':
                          {
                            bgcolor:
                              'action.hover'
                          }
                        }}
                      >
                        <Grid
                          container
                          alignItems="center"
                          spacing={2}
                        >
                          <Grid
                            item
                            xs={12}
                            sm={4}
                          >
                            <Stack
                              direction="row"
                              spacing={1.5}
                              alignItems="center"
                            >
                              <Avatar
                                sx={{
                                  width: 40,
                                  height: 40,
                                  bgcolor:
                                    'primary.lighter',
                                  color:
                                    'primary.main',
                                  fontSize: 14,
                                  fontWeight: 700
                                }}
                              >
                                {getInitials(
                                  booking.customerName
                                )}
                              </Avatar>

                              <Box
                                sx={{
                                  minWidth: 0
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  fontWeight={700}
                                  noWrap
                                >
                                  {
                                    booking.customerName
                                  }
                                </Typography>

                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  noWrap
                                >
                                  {
                                    booking.bookingId
                                  }
                                </Typography>
                              </Box>
                            </Stack>
                          </Grid>

                          <Grid
                            item
                            xs={12}
                            sm={3}
                          >
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              noWrap
                            >
                              {
                                booking
                                  .services
                                  ?.map(
                                    service =>
                                      service.name
                                  )
                                  .join(
                                    ', '
                                  ) ||
                                'Service'
                              }
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                              noWrap
                            >
                              {
                                booking.salonName
                              }
                            </Typography>
                          </Grid>

                          <Grid
                            item
                            xs={6}
                            sm={2}
                          >
                            <Typography
                              variant="body2"
                              fontWeight={600}
                            >
                              {formatDate(
                                booking.bookingDate
                              )}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {
                                booking.startTime
                              }
                            </Typography>
                          </Grid>

                          <Grid
                            item
                            xs={6}
                            sm={2}
                          >
                            <Typography
                              variant="body2"
                              fontWeight={700}
                            >
                              {formatCurrency(
                                booking.totalAmount
                              )}
                            </Typography>

                            <Chip
                              label={
                                statusConfig[
                                  booking
                                    .bookingStatus
                                ]
                                  ?.label ||
                                booking.bookingStatus
                              }
                              color={
                                statusConfig[
                                  booking
                                    .bookingStatus
                                ]
                                  ?.color ||
                                'default'
                              }
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
                            sx={{
                              textAlign:
                                'right'
                            }}
                          >
                            <IconButton
                              size="small"
                            >
                              <MoreOutlined />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </Box>

                      {index <
                        data
                          .recentBookings
                          .length -
                        1 && (
                          <Divider />
                        )}
                    </Box>
                  )
                )
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <Grid
          item
          xs={12}
          lg={4}
        >
          <Card
            sx={{
              borderRadius: 3,
              border:
                '1px solid',
              borderColor:
                'divider',
              boxShadow:
                '0 2px 10px rgba(0,0,0,0.04)'
            }}
          >
            <CardContent
              sx={{
                p: 2.5
              }}
            >
              <Typography
                variant="h6"
                fontWeight={700}
              >
                Quick Actions
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 2.5
                }}
              >
                Frequently used admin actions
              </Typography>

              <Stack spacing={1.5}>
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{
                    justifyContent:
                      'flex-start',
                    textTransform:
                      'none',
                    borderColor:
                      'divider',
                    color:
                      'text.primary',
                    borderRadius: 2,
                    p: 1.5
                  }}
                >
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: 2,
                      display:
                        'flex',
                      alignItems:
                        'center',
                      justifyContent:
                        'center',
                      mr: 1.5,
                      bgcolor:
                        'action.hover',
                      color:
                        'warning.main'
                    }}
                  >
                    <ShopOutlined />
                  </Box>

                  <Box
                    sx={{
                      textAlign:
                        'left'
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={700}
                    >
                      Review Salon Applications
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {
                        data.stats
                          .pendingApplications
                      }{' '}
                      pending
                    </Typography>
                  </Box>
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  sx={{
                    justifyContent:
                      'flex-start',
                    textTransform:
                      'none',
                    borderColor:
                      'divider',
                    color:
                      'text.primary',
                    borderRadius: 2,
                    p: 1.5
                  }}
                >
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: 2,
                      display:
                        'flex',
                      alignItems:
                        'center',
                      justifyContent:
                        'center',
                      mr: 1.5,
                      bgcolor:
                        'action.hover',
                      color:
                        'primary.main'
                    }}
                  >
                    <UserOutlined />
                  </Box>

                  <Box
                    sx={{
                      textAlign:
                        'left'
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={700}
                    >
                      Manage Customers
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {
                        data.stats
                          .totalCustomers
                      }{' '}
                      registered
                    </Typography>
                  </Box>
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  sx={{
                    justifyContent:
                      'flex-start',
                    textTransform:
                      'none',
                    borderColor:
                      'divider',
                    color:
                      'text.primary',
                    borderRadius: 2,
                    p: 1.5
                  }}
                >
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: 2,
                      display:
                        'flex',
                      alignItems:
                        'center',
                      justifyContent:
                        'center',
                      mr: 1.5,
                      bgcolor:
                        'action.hover',
                      color:
                        'info.main'
                    }}
                  >
                    <CalendarOutlined />
                  </Box>

                  <Box
                    sx={{
                      textAlign:
                        'left'
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={700}
                    >
                      Manage Bookings
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {
                        data.stats
                          .todayBookings
                      }{' '}
                      today
                    </Typography>
                  </Box>
                </Button>

                <Button
                  variant="outlined"
                  fullWidth
                  sx={{
                    justifyContent:
                      'flex-start',
                    textTransform:
                      'none',
                    borderColor:
                      'divider',
                    color:
                      'text.primary',
                    borderRadius: 2,
                    p: 1.5
                  }}
                >
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: 2,
                      display:
                        'flex',
                      alignItems:
                        'center',
                      justifyContent:
                        'center',
                      mr: 1.5,
                      bgcolor:
                        'action.hover',
                      color:
                        'success.main'
                    }}
                  >
                    <WalletOutlined />
                  </Box>

                  <Box
                    sx={{
                      textAlign:
                        'left'
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={700}
                    >
                      View Transactions
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {
                        formatCompactCurrency(
                          data.stats
                            .pendingPayments
                        )
                      }{' '}
                      pending
                    </Typography>
                  </Box>
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ===================================================
          APPLICATIONS + REVIEWS
      =================================================== */}

      <Grid
        container
        spacing={2.5}
      >
        {/* =================================================
            APPLICATIONS
        ================================================= */}

        <Grid
          item
          xs={12}
          lg={7}
        >
          <Card
            sx={{
              borderRadius: 3,
              border:
                '1px solid',
              borderColor:
                'divider',
              boxShadow:
                '0 2px 10px rgba(0,0,0,0.04)'
            }}
          >
            <CardContent
              sx={{
                p: 0
              }}
            >
              <Box
                sx={{
                  p: 2.5
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                    >
                      Salon Applications
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Applications requiring verification
                    </Typography>
                  </Box>

                  <Button
                    size="small"
                    sx={{
                      textTransform:
                        'none'
                    }}
                  >
                    View All
                  </Button>
                </Stack>
              </Box>

              <Divider />

              {data.pendingApplications
                .length ===
                0 ? (
                <Box
                  sx={{
                    p: 4,
                    textAlign:
                      'center'
                  }}
                >
                  <Typography
                    color="text.secondary"
                  >
                    No pending applications.
                  </Typography>
                </Box>
              ) : (
                data.pendingApplications
                  .slice(0, 5)
                  .map(
                    (
                      application,
                      index
                    ) => (
                      <Box
                        key={
                          application.salonId
                        }
                      >
                        <Box
                          sx={{
                            px: 2.5,
                            py: 2
                          }}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1.5}
                          >
                            <Avatar
                              sx={{
                                width: 42,
                                height: 42,
                                bgcolor:
                                  'primary.lighter',
                                color:
                                  'primary.main'
                              }}
                            >
                              <HomeOutlined />
                            </Avatar>

                            <Box
                              sx={{
                                flex: 1,
                                minWidth: 0
                              }}
                            >
                              <Typography
                                variant="body2"
                                fontWeight={700}
                                noWrap
                              >
                                {
                                  application.salonName
                                }
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {
                                  application.ownerName
                                }{' '}
                                •{' '}
                                {
                                  application
                                    .address
                                    ?.city
                                }
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                              >
                                Submitted{' '}
                                {formatDate(
                                  application.createdAt
                                )}
                              </Typography>
                            </Box>

                            <Chip
                              label="Pending"
                              color="warning"
                              size="small"
                              sx={{
                                mr: 1
                              }}
                            />

                            <Button
                              variant="outlined"
                              size="small"
                              sx={{
                                textTransform:
                                  'none',
                                borderRadius:
                                  1.5
                              }}
                            >
                              Review
                            </Button>
                          </Stack>
                        </Box>

                        {index <
                          Math.min(
                            data
                              .pendingApplications
                              .length,
                            5
                          ) -
                          1 && (
                            <Divider />
                          )}
                      </Box>
                    )
                  )
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* =================================================
            REVIEWS
        ================================================= */}

        <Grid
          item
          xs={12}
          lg={5}
        >
          <Card
            sx={{
              borderRadius: 3,
              border:
                '1px solid',
              borderColor:
                'divider',
              boxShadow:
                '0 2px 10px rgba(0,0,0,0.04)'
            }}
          >
            <CardContent
              sx={{
                p: 0
              }}
            >
              <Box
                sx={{
                  p: 2.5
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                    >
                      Recent Reviews
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Latest customer feedback
                    </Typography>
                  </Box>

                  <Button
                    size="small"
                    sx={{
                      textTransform:
                        'none'
                    }}
                  >
                    View All
                  </Button>
                </Stack>
              </Box>

              <Divider />

              {data.recentReviews
                .length ===
                0 ? (
                <Box
                  sx={{
                    p: 4,
                    textAlign:
                      'center'
                  }}
                >
                  <Typography
                    color="text.secondary"
                  >
                    No reviews found.
                  </Typography>
                </Box>
              ) : (
                data.recentReviews.map(
                  (
                    review,
                    index
                  ) => (
                    <Box
                      key={
                        review.reviewId
                      }
                    >
                      <Box
                        sx={{
                          px: 2.5,
                          py: 2
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1.5}
                        >
                          <Avatar
                            sx={{
                              width: 38,
                              height: 38,
                              bgcolor:
                                'primary.lighter',
                              color:
                                'primary.main',
                              fontSize: 13,
                              fontWeight: 700
                            }}
                          >
                            {getInitials(
                              review.customerName
                            )}
                          </Avatar>

                          <Box
                            sx={{
                              flex: 1
                            }}
                          >
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                            >
                              <Typography
                                variant="body2"
                                fontWeight={700}
                              >
                                {
                                  review.customerName
                                }
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {formatDate(
                                  review.createdAt
                                )}
                              </Typography>
                            </Stack>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                              sx={{
                                mb: 0.5
                              }}
                            >
                              {
                                review.salonName
                              }
                            </Typography>

                            <Stack
                              direction="row"
                              spacing={0.25}
                              sx={{
                                mb: 0.75
                              }}
                            >
                              {[1, 2, 3, 4, 5].map(
                                (star) => (
                                  <StarFilled
                                    key={
                                      star
                                    }
                                    style={{
                                      fontSize: 13,

                                      color:
                                        star <=
                                          review.rating
                                          ? '#f59e0b'
                                          : '#d9d9d9'
                                    }}
                                  />
                                )
                              )}
                            </Stack>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                lineHeight:
                                  1.5
                              }}
                            >
                              {
                                review.review
                              }
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>

                      {index <
                        data
                          .recentReviews
                          .length -
                        1 && (
                          <Divider />
                        )}
                    </Box>
                  )
                )
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}