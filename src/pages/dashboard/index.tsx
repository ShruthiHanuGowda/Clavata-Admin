
import { useMemo, useState } from 'react';

// material-ui
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  Tooltip,
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
  EyeOutlined,
  FileTextOutlined,
  HomeOutlined,
  MoreOutlined,
  ShopOutlined,
  StarFilled,
  TeamOutlined,
  UserAddOutlined,
  UserOutlined,
  WalletOutlined
} from '@ant-design/icons';

// ==============================|| TYPES ||============================== //

type BookingStatus = 'CONFIRMED' | 'PENDING' | 'COMPLETED' | 'CANCELLED';

interface StatCard {
  title: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ReactNode;
  subtitle: string;
}

interface Booking {
  id: string;
  customer: string;
  salon: string;
  service: string;
  date: string;
  time: string;
  amount: number;
  status: BookingStatus;
}

interface SalonApplication {
  id: string;
  salonName: string;
  ownerName: string;
  city: string;
  submitted: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface Review {
  id: string;
  customer: string;
  salon: string;
  rating: number;
  review: string;
  date: string;
}

// ==============================|| DUMMY DATA ||============================== //

const bookings: Booking[] = [
  {
    id: 'BK-1001',
    customer: 'Ananya Sharma',
    salon: 'Glow Beauty Studio',
    service: 'Hair Styling',
    date: '30 Aug 2026',
    time: '10:30 AM',
    amount: 850,
    status: 'CONFIRMED'
  },
  {
    id: 'BK-1002',
    customer: 'Rahul Kumar',
    salon: 'Urban Cuts',
    service: 'Haircut',
    date: '30 Aug 2026',
    time: '11:00 AM',
    amount: 450,
    status: 'COMPLETED'
  },
  {
    id: 'BK-1003',
    customer: 'Priya R',
    salon: 'Blush Salon',
    service: 'Facial',
    date: '30 Aug 2026',
    time: '12:30 PM',
    amount: 1200,
    status: 'PENDING'
  },
  {
    id: 'BK-1004',
    customer: 'Sneha Gowda',
    salon: 'The Hair Lounge',
    service: 'Hair Spa',
    date: '30 Aug 2026',
    time: '2:00 PM',
    amount: 1500,
    status: 'CONFIRMED'
  },
  {
    id: 'BK-1005',
    customer: 'Arjun Rao',
    salon: 'Gentlemen Studio',
    service: 'Beard Grooming',
    date: '29 Aug 2026',
    time: '5:30 PM',
    amount: 600,
    status: 'CANCELLED'
  }
];

const applications: SalonApplication[] = [
  {
    id: 'APP-001',
    salonName: 'Luxury Looks Salon',
    ownerName: 'Meera N',
    city: 'Bengaluru',
    submitted: 'Today, 9:45 AM',
    status: 'PENDING'
  },
  {
    id: 'APP-002',
    salonName: 'Style Studio',
    ownerName: 'Vikram S',
    city: 'Mysuru',
    submitted: 'Today, 8:20 AM',
    status: 'PENDING'
  },
  {
    id: 'APP-003',
    salonName: 'Blossom Beauty',
    ownerName: 'Kavya R',
    city: 'Bengaluru',
    submitted: 'Yesterday',
    status: 'PENDING'
  }
];

const reviews: Review[] = [
  {
    id: 'RV-001',
    customer: 'Ananya Sharma',
    salon: 'Glow Beauty Studio',
    rating: 5,
    review: 'Excellent service and very professional staff.',
    date: 'Today'
  },
  {
    id: 'RV-002',
    customer: 'Rahul Kumar',
    salon: 'Urban Cuts',
    rating: 4,
    review: 'Good haircut and friendly staff.',
    date: 'Yesterday'
  },
  {
    id: 'RV-003',
    customer: 'Priya R',
    salon: 'Blush Salon',
    rating: 5,
    review: 'Loved the ambience and service.',
    date: 'Yesterday'
  }
];

// ==============================|| HELPERS ||============================== //

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();

const statusConfig = {
  CONFIRMED: {
    label: 'Confirmed',
    color: 'success' as const
  },
  PENDING: {
    label: 'Pending',
    color: 'warning' as const
  },
  COMPLETED: {
    label: 'Completed',
    color: 'info' as const
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'error' as const
  }
};

// ==============================|| STAT CARD ||============================== //

interface StatCardProps {
  data: StatCard;
}

function DashboardStatCard({ data }: StatCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
        }
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1, fontWeight: 500 }}
            >
              {data.title}
            </Typography>

            <Typography variant="h4" fontWeight={700} sx={{ mb: 0.75 }}>
              {data.value}
            </Typography>

            <Stack direction="row" spacing={0.75} alignItems="center">
              {data.positive ? (
                <ArrowUpOutlined style={{ color: '#2e7d32', fontSize: 13 }} />
              ) : (
                <ArrowDownOutlined style={{ color: '#d32f2f', fontSize: 13 }} />
              )}

              <Typography
                variant="caption"
                fontWeight={700}
                color={data.positive ? 'success.main' : 'error.main'}
              >
                {data.change}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                vs last month
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
              justifyContent: 'center',
              bgcolor: 'primary.lighter',
              color: 'primary.main',
              fontSize: 22
            }}
          >
            {data.icon}
          </Box>
        </Stack>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 2 }}
        >
          {data.subtitle}
        </Typography>
      </CardContent>
    </Card>
  );
}

// ==============================|| REVENUE CHART ||============================== //

function RevenueChart() {
  const data = [
    { month: 'Mar', value: 82000 },
    { month: 'Apr', value: 105000 },
    { month: 'May', value: 97000 },
    { month: 'Jun', value: 132000 },
    { month: 'Jul', value: 158000 },
    { month: 'Aug', value: 184000 }
  ];

  const maxValue = Math.max(...data.map((item) => item.value));

  return (
    <Box sx={{ mt: 3 }}>
      <Box
        sx={{
          height: 260,
          display: 'flex',
          alignItems: 'flex-end',
          gap: { xs: 1, sm: 2 },
          px: 1
        }}
      >
        {data.map((item) => {
          const height = (item.value / maxValue) * 210;

          return (
            <Box
              key={item.month}
              sx={{
                flex: 1,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'center'
              }}
            >
              <Tooltip title={formatCurrency(item.value)}>
                <Box
                  sx={{
                    width: '70%',
                    maxWidth: 48,
                    height,
                    minHeight: 20,
                    borderRadius: '8px 8px 3px 3px',
                    bgcolor: 'primary.main',
                    opacity: item.month === 'Aug' ? 1 : 0.65,
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      opacity: 1,
                      transform: 'scaleY(1.02)'
                    }
                  }}
                />
              </Tooltip>

              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                {item.month}
              </Typography>
            </Box>
          );
        })}
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mt: 2,
          px: 1
        }}
      >
        <Box>
          <Typography variant="caption" color="text.secondary">
            Total revenue
          </Typography>
          <Typography variant="h6" fontWeight={700}>
            ₹7.58L
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="caption" color="text.secondary">
            This month
          </Typography>
          <Typography variant="h6" fontWeight={700} color="success.main">
            ₹1.84L
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

// ==============================|| BOOKING STATUS ||============================== //

function BookingStatusCard() {
  const statusData = [
    {
      label: 'Confirmed',
      value: 68,
      total: 100,
      color: 'success.main'
    },
    {
      label: 'Completed',
      value: 52,
      total: 100,
      color: 'info.main'
    },
    {
      label: 'Pending',
      value: 18,
      total: 100,
      color: 'warning.main'
    },
    {
      label: 'Cancelled',
      value: 7,
      total: 100,
      color: 'error.main'
    }
  ];

  return (
    <Stack spacing={2.5} sx={{ mt: 2.5 }}>
      {statusData.map((item) => (
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
              {item.value}%
            </Typography>
          </Stack>

          <LinearProgress
            variant="determinate"
            value={item.value}
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
      ))}
    </Stack>
  );
}

// ==============================|| DASHBOARD ||============================== //

export default function Dashboard() {
  const [period, setPeriod] = useState('month');

  const handlePeriodChange = (event: SelectChangeEvent) => {
    setPeriod(event.target.value);
  };

  const stats = useMemo<StatCard[]>(
    () => [
      {
        title: 'Total Customers',
        value: '12,840',
        change: '+12.5%',
        positive: true,
        icon: <TeamOutlined />,
        subtitle: 'Registered customer accounts'
      },
      {
        title: 'Total Salons',
        value: '486',
        change: '+8.2%',
        positive: true,
        icon: <ShopOutlined />,
        subtitle: 'Active salons on platform'
      },
      {
        title: 'Total Bookings',
        value: '3,842',
        change: '+18.4%',
        positive: true,
        icon: <CalendarOutlined />,
        subtitle: 'Bookings this month'
      },
      {
        title: 'Revenue',
        value: '₹1.84L',
        change: '+21.7%',
        positive: true,
        icon: <DollarOutlined />,
        subtitle: 'Platform booking revenue'
      },
      {
        title: 'Pending Applications',
        value: '27',
        change: '-6.4%',
        positive: true,
        icon: <FileTextOutlined />,
        subtitle: 'Salon applications awaiting review'
      },
      {
        title: 'Pending Payments',
        value: '₹42,650',
        change: '+4.8%',
        positive: false,
        icon: <WalletOutlined />,
        subtitle: 'Payments requiring attention'
      },
      {
        title: 'Average Rating',
        value: '4.7',
        change: '+2.1%',
        positive: true,
        icon: <StarFilled />,
        subtitle: 'Platform-wide salon rating'
      },
      {
        title: "Today's Bookings",
        value: '184',
        change: '+14.2%',
        positive: true,
        icon: <ClockCircleOutlined />,
        subtitle: 'Appointments scheduled today'
      }
    ],
    []
  );

  return (
    <Box>
      {/* ================= HEADER ================= */}

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
            Dashboard
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Welcome back. Here's what's happening across Clavata today.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Select
            size="small"
            value={period}
            onChange={handlePeriodChange}
            sx={{
              minWidth: 130,
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
            variant="contained"
            startIcon={<FileTextOutlined />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            Generate Report
          </Button>
        </Stack>
      </Stack>

      {/* ================= QUICK ALERT ================= */}

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
        <strong>27 salon applications</strong> are waiting for verification.
      </Alert>

      {/* ================= STAT CARDS ================= */}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={stat.title}>
            <DashboardStatCard data={stat} />
          </Grid>
        ))}
      </Grid>

      {/* ================= REVENUE + BOOKING STATUS ================= */}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={8}>
          <Card
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 2px 10px rgba(0,0,0,0.04)'
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                spacing={1}
              >
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    Revenue Overview
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Revenue generated from bookings
                  </Typography>
                </Box>

                <Chip
                  label="+21.7% growth"
                  color="success"
                  size="small"
                  icon={<ArrowUpOutlined />}
                />
              </Stack>

              <RevenueChart />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card
            sx={{
              height: '100%',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 2px 10px rgba(0,0,0,0.04)'
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={700}>
                Booking Status
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Current month's booking distribution
              </Typography>

              <BookingStatusCard />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ================= RECENT BOOKINGS ================= */}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={8}>
          <Card
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 2px 10px rgba(0,0,0,0.04)'
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2.5 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      Recent Bookings
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Latest customer appointments
                    </Typography>
                  </Box>

                  <Button
                    size="small"
                    endIcon={<EyeOutlined />}
                    sx={{ textTransform: 'none' }}
                  >
                    View All
                  </Button>
                </Stack>
              </Box>

              <Divider />

              {bookings.map((booking, index) => (
                <Box key={booking.id}>
                  <Box
                    sx={{
                      px: 2.5,
                      py: 2,
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    <Grid container alignItems="center" spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: 'primary.lighter',
                              color: 'primary.main',
                              fontSize: 14,
                              fontWeight: 700
                            }}
                          >
                            {getInitials(booking.customer)}
                          </Avatar>

                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              noWrap
                            >
                              {booking.customer}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                              noWrap
                            >
                              {booking.id}
                            </Typography>
                          </Box>
                        </Stack>
                      </Grid>

                      <Grid item xs={12} sm={3}>
                        <Typography variant="body2" fontWeight={600}>
                          {booking.service}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          {booking.salon}
                        </Typography>
                      </Grid>

                      <Grid item xs={6} sm={2}>
                        <Typography variant="body2" fontWeight={600}>
                          {booking.date}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          {booking.time}
                        </Typography>
                      </Grid>

                      <Grid item xs={6} sm={2}>
                        <Typography variant="body2" fontWeight={700}>
                          {formatCurrency(booking.amount)}
                        </Typography>

                        <Chip
                          label={statusConfig[booking.status].label}
                          color={statusConfig[booking.status].color}
                          size="small"
                          sx={{
                            mt: 0.5,
                            height: 22,
                            fontSize: 11
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={1} sx={{ textAlign: 'right' }}>
                        <IconButton size="small">
                          <MoreOutlined />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Box>

                  {index < bookings.length - 1 && <Divider />}
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* ================= QUICK ACTIONS ================= */}

        <Grid item xs={12} lg={4}>
          <Card
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 2px 10px rgba(0,0,0,0.04)'
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" fontWeight={700}>
                Quick Actions
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                Frequently used admin actions
              </Typography>

              <Stack spacing={1.5}>
                {[
                  {
                    title: 'Review Salon Applications',
                    subtitle: '27 applications pending',
                    icon: <ShopOutlined />,
                    color: 'warning.main'
                  },
                  {
                    title: 'Manage Customers',
                    subtitle: '12,840 registered users',
                    icon: <UserOutlined />,
                    color: 'primary.main'
                  },
                  {
                    title: 'Manage Bookings',
                    subtitle: '184 bookings today',
                    icon: <CalendarOutlined />,
                    color: 'info.main'
                  },
                  {
                    title: 'View Transactions',
                    subtitle: 'Review recent payments',
                    icon: <WalletOutlined />,
                    color: 'success.main'
                  }
                ].map((action) => (
                  <Button
                    key={action.title}
                    variant="outlined"
                    fullWidth
                    sx={{
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      borderColor: 'divider',
                      color: 'text.primary',
                      borderRadius: 2,
                      p: 1.5,
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'primary.lighter'
                      }
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
                        color: action.color
                      }}
                    >
                      {action.icon}
                    </Box>

                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="body2" fontWeight={700}>
                        {action.title}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        {action.subtitle}
                      </Typography>
                    </Box>
                  </Button>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ================= APPLICATIONS + REVIEWS ================= */}

      <Grid container spacing={2.5}>
        {/* Salon Applications */}

        <Grid item xs={12} lg={7}>
          <Card
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 2px 10px rgba(0,0,0,0.04)'
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2.5 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      Salon Applications
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Applications requiring verification
                    </Typography>
                  </Box>

                  <Button
                    size="small"
                    sx={{ textTransform: 'none' }}
                  >
                    View All
                  </Button>
                </Stack>
              </Box>

              <Divider />

              {applications.map((application, index) => (
                <Box key={application.id}>
                  <Box sx={{ px: 2.5, py: 2 }}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1.5}
                    >
                      <Avatar
                        sx={{
                          width: 42,
                          height: 42,
                          bgcolor: 'primary.lighter',
                          color: 'primary.main'
                        }}
                      >
                        <HomeOutlined />
                      </Avatar>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          noWrap
                        >
                          {application.salonName}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          {application.ownerName} • {application.city}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          Submitted {application.submitted}
                        </Typography>
                      </Box>

                      <Chip
                        label="Pending"
                        color="warning"
                        size="small"
                        sx={{ mr: 1 }}
                      />

                      <Button
                        variant="outlined"
                        size="small"
                        sx={{
                          textTransform: 'none',
                          borderRadius: 1.5
                        }}
                      >
                        Review
                      </Button>
                    </Stack>
                  </Box>

                  {index < applications.length - 1 && <Divider />}
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Reviews */}

        <Grid item xs={12} lg={5}>
          <Card
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 2px 10px rgba(0,0,0,0.04)'
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2.5 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      Recent Reviews
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Latest customer feedback
                    </Typography>
                  </Box>

                  <Button
                    size="small"
                    sx={{ textTransform: 'none' }}
                  >
                    View All
                  </Button>
                </Stack>
              </Box>

              <Divider />

              {reviews.map((review, index) => (
                <Box key={review.id}>
                  <Box sx={{ px: 2.5, py: 2 }}>
                    <Stack direction="row" spacing={1.5}>
                      <Avatar
                        sx={{
                          width: 38,
                          height: 38,
                          bgcolor: 'primary.lighter',
                          color: 'primary.main',
                          fontSize: 13,
                          fontWeight: 700
                        }}
                      >
                        {getInitials(review.customer)}
                      </Avatar>

                      <Box sx={{ flex: 1 }}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                        >
                          <Typography variant="body2" fontWeight={700}>
                            {review.customer}
                          </Typography>

                          <Typography variant="caption" color="text.secondary">
                            {review.date}
                          </Typography>
                        </Stack>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{ mb: 0.5 }}
                        >
                          {review.salon}
                        </Typography>

                        <Stack direction="row" spacing={0.25} sx={{ mb: 0.75 }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <StarFilled
                              key={star}
                              style={{
                                fontSize: 13,
                                color: star <= review.rating ? '#f59e0b' : '#d9d9d9'
                              }}
                            />
                          ))}
                        </Stack>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            lineHeight: 1.5
                          }}
                        >
                          {review.review}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  {index < reviews.length - 1 && <Divider />}
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

