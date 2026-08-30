
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

// charts
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

// ==============================|| TYPES ||============================== //

type Period = '7days' | '30days' | '3months' | '12months';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  positive?: boolean;
  icon: React.ReactNode;
  subtitle?: string;
}

// ==============================|| DUMMY DATA ||============================== //

const weeklyRevenue = [
  { name: 'Mon', revenue: 18500, bookings: 32 },
  { name: 'Tue', revenue: 22400, bookings: 41 },
  { name: 'Wed', revenue: 19800, bookings: 37 },
  { name: 'Thu', revenue: 27600, bookings: 48 },
  { name: 'Fri', revenue: 32100, bookings: 56 },
  { name: 'Sat', revenue: 42800, bookings: 72 },
  { name: 'Sun', revenue: 38900, bookings: 64 }
];

const monthlyRevenue = [
  { name: 'Jan', revenue: 420000, bookings: 620 },
  { name: 'Feb', revenue: 465000, bookings: 684 },
  { name: 'Mar', revenue: 498000, bookings: 721 },
  { name: 'Apr', revenue: 535000, bookings: 768 },
  { name: 'May', revenue: 582000, bookings: 824 },
  { name: 'Jun', revenue: 621000, bookings: 891 },
  { name: 'Jul', revenue: 684000, bookings: 965 },
  { name: 'Aug', revenue: 721000, bookings: 1018 }
];

const bookingStatusData = [
  { name: 'Completed', value: 642 },
  { name: 'Confirmed', value: 184 },
  { name: 'Pending', value: 76 },
  { name: 'Cancelled', value: 58 },
  { name: 'No Show', value: 21 }
];

const servicePerformance = [
  { name: 'Haircut', bookings: 284, revenue: 142000 },
  { name: 'Hair Color', bookings: 172, revenue: 258000 },
  { name: 'Facial', bookings: 196, revenue: 176400 },
  { name: 'Manicure', bookings: 158, revenue: 94800 },
  { name: 'Pedicure', bookings: 141, revenue: 112800 },
  { name: 'Hair Spa', bookings: 124, revenue: 148800 }
];

const salonPerformance = [
  {
    salon: 'Glow Studio',
    bookings: 284,
    revenue: 284000,
    rating: 4.8
  },
  {
    salon: 'The Beauty Lounge',
    bookings: 246,
    revenue: 251000,
    rating: 4.7
  },
  {
    salon: 'Urban Cuts',
    bookings: 218,
    revenue: 198000,
    rating: 4.6
  },
  {
    salon: 'Style Avenue',
    bookings: 192,
    revenue: 176000,
    rating: 4.5
  },
  {
    salon: 'Blush & Bloom',
    bookings: 174,
    revenue: 165000,
    rating: 4.5
  }
];

const customerGrowth = [
  { name: 'Jan', customers: 820 },
  { name: 'Feb', customers: 940 },
  { name: 'Mar', customers: 1120 },
  { name: 'Apr', customers: 1260 },
  { name: 'May', customers: 1430 },
  { name: 'Jun', customers: 1610 },
  { name: 'Jul', customers: 1850 },
  { name: 'Aug', customers: 2140 }
];

const COLORS = [
  '#1677ff',
  '#52c41a',
  '#faad14',
  '#ff4d4f',
  '#722ed1'
];

// ==============================|| STAT CARD ||============================== //

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

            <Stack direction="row" spacing={0.75} alignItems="center">
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
                  color: positive ? 'success.main' : 'error.main',
                  fontWeight: 600
                }}
              >
                {change}
              </Typography>

              {subtitle && (
                <Typography variant="caption" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Stack>
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

// ==============================|| TOOLTIP ||============================== //

const formatCurrency = (value: number) =>
  `₹${value.toLocaleString('en-IN')}`;

// ==============================|| ANALYTICS ||============================== //

export default function Analytics() {
  const [period, setPeriod] = useState<Period>('30days');

  const revenueData = useMemo(() => {
    if (period === '7days') {
      return weeklyRevenue;
    }

    return monthlyRevenue;
  }, [period]);

  const handlePeriodChange = (event: SelectChangeEvent) => {
    setPeriod(event.target.value as Period);
  };

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
            <InputLabel>Period</InputLabel>

            <Select
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

      {/* ============================== KPI CARDS ============================== */}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Revenue"
            value="₹72.1L"
            change="12.8%"
            positive
            subtitle="vs previous period"
            icon={<DollarOutlined />}
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Bookings"
            value="4,856"
            change="18.4%"
            positive
            subtitle="vs previous period"
            icon={<CalendarOutlined />}
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Customers"
            value="12,482"
            change="15.2%"
            positive
            subtitle="vs previous period"
            icon={<TeamOutlined />}
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Active Salons"
            value="284"
            change="8.6%"
            positive
            subtitle="vs previous period"
            icon={<ShopOutlined />}
          />
        </Grid>
      </Grid>

      {/* ============================== SECONDARY KPIs ============================== */}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Completed Bookings"
            value="3,942"
            change="14.5%"
            positive
            icon={<CheckCircleOutlined />}
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Average Booking Value"
            value="₹1,485"
            change="6.2%"
            positive
            icon={<ShoppingCartOutlined />}
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Average Rating"
            value="4.6"
            change="0.3"
            positive
            icon={<StarOutlined />}
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Cancellation Rate"
            value="7.4%"
            change="2.1%"
            positive
            icon={<ClockCircleOutlined />}
          />
        </Grid>
      </Grid>

      {/* ============================== REVENUE + BOOKINGS ============================== */}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={8}>
          <MainCard
            title="Revenue & Bookings"
            secondary={
              <Chip
                label="Live data placeholder"
                size="small"
                variant="outlined"
              />
            }
          >
            <Box sx={{ width: '100%', height: 360 }}>
              <ResponsiveContainer>
                <AreaChart data={revenueData}>
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
                    tickFormatter={(value) =>
                      `₹${Number(value) / 1000}K`
                    }
                  />

                  <Tooltip
                    formatter={(value, name) => [
                      typeof value === 'number' ? value.toLocaleString() : String(value ?? ''),
                      String(name ?? '')
                    ]}
                  />

                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#1677ff"
                    fill="url(#revenueGradient)"
                    strokeWidth={2}
                  />

                  <Line
                    type="monotone"
                    dataKey="bookings"
                    stroke="#52c41a"
                    strokeWidth={2}
                    yAxisId={0}
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
                    {bookingStatusData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
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

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={6}>
          <MainCard title="Customer Growth">
            <Box sx={{ width: '100%', height: 320 }}>
              <ResponsiveContainer>
                <LineChart data={customerGrowth}>
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
                    stroke="#722ed1"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </MainCard>
        </Grid>

        <Grid item xs={12} lg={6}>
          <MainCard title="Top Services">
            <Box sx={{ width: '100%', height: 320 }}>
              <ResponsiveContainer>
                <BarChart
                  data={servicePerformance}
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
                    width={90}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="bookings"
                    name="Bookings"
                    fill="#1677ff"
                    radius={[0, 6, 6, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </MainCard>
        </Grid>
      </Grid>

      {/* ============================== SERVICE PERFORMANCE ============================== */}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <MainCard title="Service Performance">
            <Box sx={{ width: '100%', height: 350 }}>
              <ResponsiveContainer>
                <BarChart data={servicePerformance}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis dataKey="name" />

                  <YAxis />

                  <Tooltip
                    formatter={(value, name) => {
                      const numericValue = typeof value === 'number' ? value : Number(value ?? 0);
                      const label = String(name);

                      return [
                        label === 'revenue' ? formatCurrency(numericValue) : numericValue,
                        label === 'revenue' ? 'Revenue' : 'Bookings'
                      ];
                    }}
                  />
                  <Legend />

                  <Bar
                    dataKey="bookings"
                    name="Bookings"
                    fill="#1677ff"
                    radius={[6, 6, 0, 0]}
                  />

                  <Bar
                    dataKey="revenue"
                    name="Revenue"
                    fill="#52c41a"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </MainCard>
        </Grid>
      </Grid>

      {/* ============================== TOP SALONS ============================== */}

      <Grid container spacing={2.5}>
        <Grid item xs={12}>
          <MainCard title="Top Performing Salons">
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
                    borderColor: 'divider'
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
                    <th>Revenue</th>
                    <th>Rating</th>
                    <th>Performance</th>
                  </tr>
                </thead>

                <tbody>
                  {salonPerformance.map((salon, index) => (
                    <tr key={salon.salon}>
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
                        <Typography variant="body2">
                          {salon.bookings.toLocaleString()}
                        </Typography>
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
                            style={{
                              color: '#faad14'
                            }}
                          />

                          <Typography variant="body2">
                            {salon.rating}
                          </Typography>
                        </Stack>
                      </td>

                      <td>
                        <Chip
                          label={
                            index === 0
                              ? 'Excellent'
                              : index < 3
                                ? 'Very Good'
                                : 'Good'
                          }
                          size="small"
                          color={
                            index === 0
                              ? 'success'
                              : 'default'
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Box>
            </Box>
          </MainCard>
        </Grid>
      </Grid>
    </Box>
  );
}

