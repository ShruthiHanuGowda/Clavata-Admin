
import { useMemo, useState } from 'react';

// material-ui
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography
} from '@mui/material';

// icons
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CalendarOutlined,
  DownloadOutlined,
  DollarOutlined,
  ShopOutlined,
  CreditCardOutlined,
  WalletOutlined,
  ReloadOutlined
} from '@ant-design/icons';

// ==============================|| TYPES ||============================== //

interface RevenueRecord {
  id: string;
  bookingId: string;
  salonName: string;
  customerName: string;
  bookingDate: string;
  paymentDate: string;
  paymentMethod: 'ONLINE' | 'PAY_AT_SALON';
  bookingFee: number;
  subtotal: number;
  discount: number;
  totalAmount: number;
  refundAmount: number;
  netRevenue: number;
  paymentStatus: 'PAID' | 'PARTIALLY_PAID' | 'REFUNDED' | 'PENDING';
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
  bookings: number;
}

// ==============================|| DUMMY DATA ||============================== //

const revenueRecords: RevenueRecord[] = [
  {
    id: 'REV-10001',
    bookingId: 'BK-10001',
    salonName: 'Glow Beauty Studio',
    customerName: 'Ananya Sharma',
    bookingDate: '2026-08-30',
    paymentDate: '2026-08-30',
    paymentMethod: 'ONLINE',
    bookingFee: 50,
    subtotal: 850,
    discount: 50,
    totalAmount: 800,
    refundAmount: 0,
    netRevenue: 800,
    paymentStatus: 'PAID'
  },
  {
    id: 'REV-10002',
    bookingId: 'BK-10002',
    salonName: 'Style & Shine Salon',
    customerName: 'Priya Rao',
    bookingDate: '2026-08-29',
    paymentDate: '2026-08-29',
    paymentMethod: 'PAY_AT_SALON',
    bookingFee: 100,
    subtotal: 1200,
    discount: 100,
    totalAmount: 1100,
    refundAmount: 0,
    netRevenue: 1100,
    paymentStatus: 'PAID'
  },
  {
    id: 'REV-10003',
    bookingId: 'BK-10003',
    salonName: 'Urban Cuts',
    customerName: 'Rahul Kumar',
    bookingDate: '2026-08-29',
    paymentDate: '2026-08-29',
    paymentMethod: 'ONLINE',
    bookingFee: 50,
    subtotal: 600,
    discount: 0,
    totalAmount: 600,
    refundAmount: 600,
    netRevenue: 0,
    paymentStatus: 'REFUNDED'
  },
  {
    id: 'REV-10004',
    bookingId: 'BK-10004',
    salonName: 'The Hair Lounge',
    customerName: 'Sneha Patel',
    bookingDate: '2026-08-28',
    paymentDate: '2026-08-28',
    paymentMethod: 'ONLINE',
    bookingFee: 75,
    subtotal: 1500,
    discount: 150,
    totalAmount: 1350,
    refundAmount: 0,
    netRevenue: 1350,
    paymentStatus: 'PAID'
  },
  {
    id: 'REV-10005',
    bookingId: 'BK-10005',
    salonName: 'Glow Beauty Studio',
    customerName: 'Meera Nair',
    bookingDate: '2026-08-27',
    paymentDate: '2026-08-27',
    paymentMethod: 'ONLINE',
    bookingFee: 50,
    subtotal: 950,
    discount: 50,
    totalAmount: 900,
    refundAmount: 0,
    netRevenue: 900,
    paymentStatus: 'PAID'
  },
  {
    id: 'REV-10006',
    bookingId: 'BK-10006',
    salonName: 'Style & Shine Salon',
    customerName: 'Kavya Singh',
    bookingDate: '2026-08-26',
    paymentDate: '2026-08-26',
    paymentMethod: 'PAY_AT_SALON',
    bookingFee: 100,
    subtotal: 700,
    discount: 0,
    totalAmount: 700,
    refundAmount: 0,
    netRevenue: 700,
    paymentStatus: 'PAID'
  },
  {
    id: 'REV-10007',
    bookingId: 'BK-10007',
    salonName: 'Urban Cuts',
    customerName: 'Arjun Reddy',
    bookingDate: '2026-08-25',
    paymentDate: '2026-08-25',
    paymentMethod: 'ONLINE',
    bookingFee: 50,
    subtotal: 500,
    discount: 0,
    totalAmount: 500,
    refundAmount: 0,
    netRevenue: 500,
    paymentStatus: 'PAID'
  },
  {
    id: 'REV-10008',
    bookingId: 'BK-10008',
    salonName: 'The Hair Lounge',
    customerName: 'Divya Menon',
    bookingDate: '2026-08-24',
    paymentDate: '2026-08-24',
    paymentMethod: 'ONLINE',
    bookingFee: 75,
    subtotal: 1800,
    discount: 200,
    totalAmount: 1600,
    refundAmount: 0,
    netRevenue: 1600,
    paymentStatus: 'PAID'
  }
];

const monthlyRevenue: MonthlyRevenue[] = [
  { month: 'Mar', revenue: 48500, bookings: 72 },
  { month: 'Apr', revenue: 62400, bookings: 91 },
  { month: 'May', revenue: 71800, bookings: 105 },
  { month: 'Jun', revenue: 85600, bookings: 124 },
  { month: 'Jul', revenue: 94200, bookings: 138 },
  { month: 'Aug', revenue: 108750, bookings: 156 }
];

// ==============================|| HELPERS ||============================== //

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

const getStatusColor = (
  status: RevenueRecord['paymentStatus']
): 'success' | 'warning' | 'error' | 'default' => {
  switch (status) {
    case 'PAID':
      return 'success';

    case 'PARTIALLY_PAID':
      return 'warning';

    case 'REFUNDED':
      return 'error';

    default:
      return 'default';
  }
};

// ==============================|| STAT CARD ||============================== //

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

function StatCard({ title, value, subtitle, icon, trend, trendUp }: StatCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
      }}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>

            <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
              {value}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
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
              color: 'primary.main'
            }}
          >
            {icon}
          </Box>
        </Stack>

        {trend && (
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 2 }}>
            {trendUp ? (
              <ArrowUpOutlined style={{ color: '#2e7d32' }} />
            ) : (
              <ArrowDownOutlined style={{ color: '#d32f2f' }} />
            )}

            <Typography
              variant="caption"
              fontWeight={600}
              color={trendUp ? 'success.main' : 'error.main'}
            >
              {trend}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              vs last month
            </Typography>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

// ==============================|| REVENUE PAGE ||============================== //

export default function Revenue() {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [salonFilter, setSalonFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const salons = useMemo(() => {
    return ['ALL', ...Array.from(new Set(revenueRecords.map((item) => item.salonName)))];
  }, []);

  const filteredRecords = useMemo(() => {
    return revenueRecords.filter((record) => {
      const matchesStatus =
        statusFilter === 'ALL' || record.paymentStatus === statusFilter;

      const matchesMethod =
        methodFilter === 'ALL' || record.paymentMethod === methodFilter;

      const matchesSalon =
        salonFilter === 'ALL' || record.salonName === salonFilter;

      const searchValue = search.toLowerCase();

      const matchesSearch =
        !searchValue ||
        record.id.toLowerCase().includes(searchValue) ||
        record.bookingId.toLowerCase().includes(searchValue) ||
        record.customerName.toLowerCase().includes(searchValue) ||
        record.salonName.toLowerCase().includes(searchValue);

      return matchesStatus && matchesMethod && matchesSalon && matchesSearch;
    });
  }, [statusFilter, methodFilter, salonFilter, search]);

  const totalRevenue = revenueRecords.reduce((sum, item) => sum + item.totalAmount, 0);

  const totalRefunds = revenueRecords.reduce((sum, item) => sum + item.refundAmount, 0);

  const netRevenue = revenueRecords.reduce((sum, item) => sum + item.netRevenue, 0);

  const onlineRevenue = revenueRecords
    .filter((item) => item.paymentMethod === 'ONLINE')
    .reduce((sum, item) => sum + item.netRevenue, 0);

  const bookingFeeRevenue = revenueRecords.reduce(
    (sum, item) => sum + item.bookingFee,
    0
  );

  const handleStatusChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleMethodChange = (event: SelectChangeEvent) => {
    setMethodFilter(event.target.value);
    setPage(0);
  };

  const handleSalonChange = (event: SelectChangeEvent) => {
    setSalonFilter(event.target.value);
    setPage(0);
  };

  const handleExport = () => {
    console.log('Export revenue report');
  };

  const maxRevenue = Math.max(...monthlyRevenue.map((item) => item.revenue));

  return (
    <Box>
      {/* ============================== HEADER ============================== */}

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Revenue
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Monitor Clavata's overall revenue and financial performance
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<DownloadOutlined />}
          onClick={handleExport}
        >
          Export Report
        </Button>
      </Stack>

      {/* ============================== STAT CARDS ============================== */}

      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            subtitle="Gross revenue"
            icon={<DollarOutlined style={{ fontSize: 23 }} />}
            trend="+14.8%"
            trendUp
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Net Revenue"
            value={formatCurrency(netRevenue)}
            subtitle="After refunds"
            icon={<WalletOutlined style={{ fontSize: 23 }} />}
            trend="+12.4%"
            trendUp
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Online Revenue"
            value={formatCurrency(onlineRevenue)}
            subtitle="Razorpay / online"
            icon={<CreditCardOutlined style={{ fontSize: 23 }} />}
            trend="+18.2%"
            trendUp
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Refunds"
            value={formatCurrency(totalRefunds)}
            subtitle="Total refunded"
            icon={<ReloadOutlined style={{ fontSize: 23 }} />}
            trend="-5.3%"
            trendUp
          />
        </Grid>
      </Grid>

      {/* ============================== SECONDARY SUMMARY ============================== */}

      <Grid container spacing={2.5} sx={{ mt: 0.2 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: 'success.lighter',
                    color: 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <DollarOutlined />
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Booking Fee Revenue
                  </Typography>

                  <Typography variant="h5" fontWeight={700}>
                    {formatCurrency(bookingFeeRevenue)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: 'info.lighter',
                    color: 'info.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ShopOutlined />
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Active Revenue Sources
                  </Typography>

                  <Typography variant="h5" fontWeight={700}>
                    {new Set(revenueRecords.map((item) => item.salonName)).size} Salons
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: 'warning.lighter',
                    color: 'warning.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <CalendarOutlined />
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    August Revenue
                  </Typography>

                  <Typography variant="h5" fontWeight={700}>
                    {formatCurrency(108750)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ============================== REVENUE CHART ============================== */}

      <Card
        sx={{
          mt: 3,
          borderRadius: 3,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
        }}
      >
        <CardContent>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={1}
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Revenue Overview
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Monthly revenue performance
              </Typography>
            </Box>

            <Chip label="Last 6 Months" variant="outlined" />
          </Stack>

          <Box
            sx={{
              mt: 4,
              display: 'flex',
              alignItems: 'flex-end',
              gap: { xs: 1.5, sm: 3 },
              height: 260,
              px: { xs: 1, sm: 3 },
              pb: 2
            }}
          >
            {monthlyRevenue.map((item) => {
              const height = (item.revenue / maxRevenue) * 190;

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
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    sx={{
                      mb: 1,
                      display: { xs: 'none', sm: 'block' }
                    }}
                  >
                    {formatCurrency(item.revenue)}
                  </Typography>

                  <Box
                    sx={{
                      width: '100%',
                      maxWidth: 70,
                      height,
                      minHeight: 8,
                      borderRadius: '8px 8px 2px 2px',
                      bgcolor: 'primary.main',
                      transition: 'height 0.3s ease',
                      '&:hover': {
                        opacity: 0.8
                      }
                    }}
                    title={`${item.month}: ${formatCurrency(item.revenue)}`}
                  />

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    {item.month}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: { xs: 'none', sm: 'block' } }}
                  >
                    {item.bookings} bookings
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </CardContent>
      </Card>

      {/* ============================== FILTERS ============================== */}

      <Card
        sx={{
          mt: 3,
          borderRadius: 3,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
        }}
      >
        <CardContent>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', md: 'center' }}
          >
            <TextField
              fullWidth
              size="small"
              label="Search revenue"
              placeholder="Revenue ID, booking, customer or salon"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
            />

            <FormControl size="small" sx={{ minWidth: 170 }}>
              <InputLabel>Status</InputLabel>

              <Select
                value={statusFilter}
                label="Status"
                onChange={handleStatusChange}
              >
                <MenuItem value="ALL">All Status</MenuItem>
                <MenuItem value="PAID">Paid</MenuItem>
                <MenuItem value="PARTIALLY_PAID">Partially Paid</MenuItem>
                <MenuItem value="REFUNDED">Refunded</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Payment Method</InputLabel>

              <Select
                value={methodFilter}
                label="Payment Method"
                onChange={handleMethodChange}
              >
                <MenuItem value="ALL">All Methods</MenuItem>
                <MenuItem value="ONLINE">Online</MenuItem>
                <MenuItem value="PAY_AT_SALON">Pay at Salon</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Salon</InputLabel>

              <Select
                value={salonFilter}
                label="Salon"
                onChange={handleSalonChange}
              >
                {salons.map((salon) => (
                  <MenuItem key={salon} value={salon}>
                    {salon === 'ALL' ? 'All Salons' : salon}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {/* ============================== REVENUE TABLE ============================== */}

      <Card
        sx={{
          mt: 3,
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
        }}
      >
        <CardContent sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            Revenue Records
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Revenue generated from completed and paid bookings
          </Typography>
        </CardContent>

        <Divider />

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Revenue ID</TableCell>
                <TableCell>Salon</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Booking Date</TableCell>
                <TableCell>Payment Method</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="right">Refund</TableCell>
                <TableCell align="right">Net Revenue</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredRecords
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((record) => (
                  <TableRow
                    key={record.id}
                    hover
                    sx={{
                      '&:last-child td, &:last-child th': {
                        border: 0
                      }
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {record.id}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        {record.bookingId}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {record.salonName}
                      </Typography>
                    </TableCell>

                    <TableCell>{record.customerName}</TableCell>

                    <TableCell>
                      {new Date(record.bookingDate).toLocaleDateString('en-IN')}
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={
                          record.paymentMethod === 'ONLINE'
                            ? 'Online'
                            : 'Pay at Salon'
                        }
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(record.totalAmount)}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      {record.refundAmount > 0 ? (
                        <Typography variant="body2" color="error.main">
                          -{formatCurrency(record.refundAmount)}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          —
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color="success.main"
                      >
                        {formatCurrency(record.netRevenue)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={record.paymentStatus.replace('_', ' ')}
                        color={getStatusColor(record.paymentStatus)}
                      />
                    </TableCell>
                  </TableRow>
                ))}

              {filteredRecords.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9}>
                    <Box
                      sx={{
                        py: 8,
                        textAlign: 'center'
                      }}
                    >
                      <Typography variant="h6" color="text.secondary">
                        No revenue records found
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        Try changing your filters or search term.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredRecords.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Card>
    </Box>
  );
}

