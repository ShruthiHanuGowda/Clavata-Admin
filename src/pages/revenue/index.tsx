import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';

// material-ui
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
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

// query
import { REVENUE_QUERY } from '../../graphql/queries';

// ==============================|| TYPES ||============================== //

type PaymentMethod = 'ONLINE' | 'PAY_AT_SALON';

type PaymentStatus =
  | 'PAID'
  | 'PARTIALLY_PAID'
  | 'REFUNDED'
  | 'PENDING'
  | 'FAILED';

type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

type RefundStatus =
  | 'REQUESTED'
  | 'PROCESSING'
  | 'APPROVED'
  | 'COMPLETED'
  | 'REJECTED';

interface Booking {
  bookingId: string;
  salonId: string;
  customerUserId: string;
  salonName: string;
  customerName: string;
  customerPhone: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  subtotal: number;
  discount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  bookingFee: number;
  bookingFeeStatus: PaymentStatus;
  bookingFeePaidAt?: string | null;
  remainingAmount: number;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  paymentGateway?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Refund {
  refundId: string;
  bookingId: string;
  paymentTransactionId: string;
  customerUserId: string;
  customerName: string;
  customerPhone: string;
  salonId: string;
  salonName: string;
  originalAmount: number;
  refundAmount: number;
  reason: string;
  status: RefundStatus;
  paymentMethod: PaymentMethod;
  razorpayPaymentId?: string | null;
  razorpayRefundId?: string | null;
  requestedAt: string;
  processedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface RevenueRecord {
  id: string;
  bookingId: string;
  salonId: string;
  salonName: string;
  customerName: string;
  bookingDate: string;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  bookingFee: number;
  subtotal: number;
  discount: number;
  totalAmount: number;
  refundAmount: number;
  netRevenue: number;
  paymentStatus: PaymentStatus;
}

interface AdminBookingsResponse {
  adminBookings: {
    success: boolean;
    message: string;
    totalCount: number;
    bookings: Booking[];
  };
}

interface RefundsResponse {
  refunds: {
    success: boolean;
    message: string;
    totalCount: number;
    refunds: Refund[];
  };
}

interface RevenueQueryResponse extends AdminBookingsResponse, RefundsResponse {}

interface RevenueQueryVariables {
  search?: string;
  bookingStatus?: BookingStatus;
  paymentStatus?: PaymentStatus;
}

// ==============================|| HELPERS ||============================== //

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value || 0);
};

const formatDate = (value?: string | null) => {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString('en-IN');
};

const getStatusColor = (
  status: PaymentStatus
): 'success' | 'warning' | 'error' | 'default' => {
  switch (status) {
    case 'PAID':
      return 'success';

    case 'PARTIALLY_PAID':
      return 'warning';

    case 'REFUNDED':
    case 'FAILED':
      return 'error';

    default:
      return 'default';
  }
};

const normalizeSearch = (value: string) => value.trim().toLowerCase();

const getRefundAmountForBooking = (
  bookingId: string,
  refunds: Refund[]
): number => {
  return refunds
    .filter(
      (refund) =>
        refund.bookingId === bookingId &&
        refund.status === 'COMPLETED'
    )
    .reduce((sum, refund) => sum + Number(refund.refundAmount || 0), 0);
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

function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendUp
}: StatCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
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
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            sx={{ mt: 2 }}
          >
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
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [salonFilter, setSalonFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // ============================== QUERY ============================== //

  const {
    data,
    loading,
    error,
    refetch
  } = useQuery<RevenueQueryResponse, RevenueQueryVariables>(
    REVENUE_QUERY,
    {
      variables: {},
      fetchPolicy: 'network-only'
    }
  );

  const bookings = data?.adminBookings?.bookings ?? [];
  const refunds = data?.refunds?.refunds ?? [];

  // ============================== REVENUE RECORDS ============================== //

  const revenueRecords = useMemo<RevenueRecord[]>(() => {
    return bookings.map((booking) => {
      const refundAmount = getRefundAmountForBooking(
        booking.bookingId,
        refunds
      );

      const totalAmount = Number(booking.totalAmount || 0);

      const netRevenue = Math.max(
        0,
        totalAmount - refundAmount
      );

      const paymentDate =
        booking.bookingFeePaidAt ||
        booking.updatedAt ||
        booking.createdAt;

      return {
        id: booking.bookingId,
        bookingId: booking.bookingId,
        salonId: booking.salonId,
        salonName: booking.salonName || 'Unknown Salon',
        customerName: booking.customerName || 'Unknown Customer',
        bookingDate: booking.bookingDate,
        paymentDate,
        paymentMethod: booking.paymentMethod,
        bookingFee: Number(booking.bookingFee || 0),
        subtotal: Number(booking.subtotal || 0),
        discount: Number(booking.discount || 0),
        totalAmount,
        refundAmount,
        netRevenue,
        paymentStatus: booking.paymentStatus
      };
    });
  }, [bookings, refunds]);

  // ============================== SALONS ============================== //

  const salons = useMemo(() => {
    const uniqueSalons = Array.from(
      new Set(
        revenueRecords
          .map((record) => record.salonName)
          .filter(Boolean)
      )
    );

    return ['ALL', ...uniqueSalons];
  }, [revenueRecords]);

  // ============================== FILTER ============================== //

  const filteredRecords = useMemo(() => {
    const searchValue = normalizeSearch(search);

    return revenueRecords.filter((record) => {
      const matchesStatus =
        statusFilter === 'ALL' ||
        record.paymentStatus === statusFilter;

      const matchesMethod =
        methodFilter === 'ALL' ||
        record.paymentMethod === methodFilter;

      const matchesSalon =
        salonFilter === 'ALL' ||
        record.salonName === salonFilter;

      const matchesSearch =
        !searchValue ||
        record.id.toLowerCase().includes(searchValue) ||
        record.bookingId.toLowerCase().includes(searchValue) ||
        record.customerName.toLowerCase().includes(searchValue) ||
        record.salonName.toLowerCase().includes(searchValue);

      return (
        matchesStatus &&
        matchesMethod &&
        matchesSalon &&
        matchesSearch
      );
    });
  }, [
    revenueRecords,
    statusFilter,
    methodFilter,
    salonFilter,
    search
  ]);

  // ============================== SUMMARY ============================== //

  const summary = useMemo(() => {
    const totalRevenue = revenueRecords.reduce(
      (sum, item) => sum + item.totalAmount,
      0
    );

    const totalRefunds = revenueRecords.reduce(
      (sum, item) => sum + item.refundAmount,
      0
    );

    const netRevenue = revenueRecords.reduce(
      (sum, item) => sum + item.netRevenue,
      0
    );

    const onlineRevenue = revenueRecords
      .filter((item) => item.paymentMethod === 'ONLINE')
      .reduce(
        (sum, item) => sum + item.netRevenue,
        0
      );

    const bookingFeeRevenue = revenueRecords
      .filter((item) => item.bookingFee > 0)
      .reduce(
        (sum, item) => sum + item.bookingFee,
        0
      );

    const activeSalons = new Set(
      revenueRecords.map((item) => item.salonId)
    ).size;

    return {
      totalRevenue,
      totalRefunds,
      netRevenue,
      onlineRevenue,
      bookingFeeRevenue,
      activeSalons
    };
  }, [revenueRecords]);

  // ============================== MONTHLY REVENUE ============================== //

  const monthlyRevenue = useMemo(() => {
    const now = new Date();

    const months: {
      month: string;
      revenue: number;
      bookings: number;
      key: string;
    }[] = [];

    for (let i = 5; i >= 0; i -= 1) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, '0')}`;

      months.push({
        key,
        month: date.toLocaleDateString('en-IN', {
          month: 'short'
        }),
        revenue: 0,
        bookings: 0
      });
    }

    revenueRecords.forEach((record) => {
      if (!record.bookingDate) return;

      const date = new Date(record.bookingDate);

      if (Number.isNaN(date.getTime())) return;

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, '0')}`;

      const month = months.find((item) => item.key === key);

      if (month) {
        month.revenue += record.netRevenue;
        month.bookings += 1;
      }
    });

    return months;
  }, [revenueRecords]);

  const maxRevenue = Math.max(
    ...monthlyRevenue.map((item) => item.revenue),
    1
  );

  // ============================== CURRENT MONTH ============================== //

  const currentMonthRevenue = useMemo(() => {
    const now = new Date();

    return revenueRecords
      .filter((record) => {
        const date = new Date(record.bookingDate);

        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      })
      .reduce(
        (sum, record) => sum + record.netRevenue,
        0
      );
  }, [revenueRecords]);

  // ============================== TREND ============================== //

  const revenueTrend = useMemo(() => {
    if (monthlyRevenue.length < 2) {
      return {
        value: '0.0%',
        up: true
      };
    }

    const current =
      monthlyRevenue[monthlyRevenue.length - 1].revenue;

    const previous =
      monthlyRevenue[monthlyRevenue.length - 2].revenue;

    if (previous === 0) {
      return {
        value: current > 0 ? '+100.0%' : '0.0%',
        up: current >= 0
      };
    }

    const percentage =
      ((current - previous) / previous) * 100;

    return {
      value: `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`,
      up: percentage >= 0
    };
  }, [monthlyRevenue]);

  // ============================== HANDLERS ============================== //

  const handleStatusChange = (
    event: SelectChangeEvent
  ) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleMethodChange = (
    event: SelectChangeEvent
  ) => {
    setMethodFilter(event.target.value);
    setPage(0);
  };

  const handleSalonChange = (
    event: SelectChangeEvent
  ) => {
    setSalonFilter(event.target.value);
    setPage(0);
  };

  const handleExport = () => {
    const headers = [
      'Revenue ID',
      'Booking ID',
      'Salon',
      'Customer',
      'Booking Date',
      'Payment Date',
      'Payment Method',
      'Booking Fee',
      'Subtotal',
      'Discount',
      'Total Amount',
      'Refund Amount',
      'Net Revenue',
      'Payment Status'
    ];

    const rows = filteredRecords.map((record) => [
      record.id,
      record.bookingId,
      record.salonName,
      record.customerName,
      record.bookingDate,
      record.paymentDate,
      record.paymentMethod,
      record.bookingFee,
      record.subtotal,
      record.discount,
      record.totalAmount,
      record.refundAmount,
      record.netRevenue,
      record.paymentStatus
    ]);

    const csv = [
      headers,
      ...rows
    ]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value ?? '').replace(/"/g, '""')}"`
          )
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;
    link.download = `revenue-report-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // ============================== LOADING ============================== //

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography color="text.secondary">
            Loading revenue data...
          </Typography>
        </Stack>
      </Box>
    );
  }

  // ============================== ERROR ============================== //

  if (error) {
    return (
      <Box sx={{ py: 8 }}>
        <Stack
          alignItems="center"
          spacing={2}
          textAlign="center"
        >
          <Typography variant="h6" color="error">
            Failed to load revenue data
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            {error.message}
          </Typography>

          <Button
            variant="contained"
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </Stack>
      </Box>
    );
  }

  // ============================== PAGE ============================== //

  return (
    <Box>
      {/* ============================== HEADER ============================== */}

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{
          xs: 'flex-start',
          sm: 'center'
        }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Revenue
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Monitor Clavata's overall revenue and financial
            performance
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<DownloadOutlined />}
          onClick={handleExport}
          disabled={filteredRecords.length === 0}
        >
          Export Report
        </Button>
      </Stack>

      {/* ============================== STAT CARDS ============================== */}

      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Revenue"
            value={formatCurrency(summary.totalRevenue)}
            subtitle="Gross booking revenue"
            icon={
              <DollarOutlined style={{ fontSize: 23 }} />
            }
            trend={revenueTrend.value}
            trendUp={revenueTrend.up}
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Net Revenue"
            value={formatCurrency(summary.netRevenue)}
            subtitle="After completed refunds"
            icon={
              <WalletOutlined style={{ fontSize: 23 }} />
            }
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Online Revenue"
            value={formatCurrency(summary.onlineRevenue)}
            subtitle="Online payment bookings"
            icon={
              <CreditCardOutlined
                style={{ fontSize: 23 }}
              />
            }
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Refunds"
            value={formatCurrency(summary.totalRefunds)}
            subtitle="Completed refunds"
            icon={
              <ReloadOutlined style={{ fontSize: 23 }} />
            }
          />
        </Grid>
      </Grid>

      {/* ============================== SECONDARY SUMMARY ============================== */}

      <Grid
        container
        spacing={2.5}
        sx={{ mt: 0.2 }}
      >
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
              >
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
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Booking Fee Revenue
                  </Typography>

                  <Typography
                    variant="h5"
                    fontWeight={700}
                  >
                    {formatCurrency(
                      summary.bookingFeeRevenue
                    )}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
              >
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
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Active Revenue Sources
                  </Typography>

                  <Typography
                    variant="h5"
                    fontWeight={700}
                  >
                    {summary.activeSalons} Salons
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
              >
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
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Current Month Revenue
                  </Typography>

                  <Typography
                    variant="h5"
                    fontWeight={700}
                  >
                    {formatCurrency(
                      currentMonthRevenue
                    )}
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
            direction={{
              xs: 'column',
              sm: 'row'
            }}
            justifyContent="space-between"
            alignItems={{
              xs: 'flex-start',
              sm: 'center'
            }}
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
                Monthly revenue performance
              </Typography>
            </Box>

            <Chip
              label="Last 6 Months"
              variant="outlined"
            />
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
              const height =
                (item.revenue / maxRevenue) * 190;

              return (
                <Box
                  key={item.key}
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
                      display: {
                        xs: 'none',
                        sm: 'block'
                      }
                    }}
                  >
                    {formatCurrency(item.revenue)}
                  </Typography>

                  <Box
                    sx={{
                      width: '100%',
                      maxWidth: 70,
                      height,
                      minHeight:
                        item.revenue > 0 ? 8 : 2,
                      borderRadius:
                        '8px 8px 2px 2px',
                      bgcolor: 'primary.main',
                      transition:
                        'height 0.3s ease',
                      '&:hover': {
                        opacity: 0.8
                      }
                    }}
                    title={`${item.month}: ${formatCurrency(
                      item.revenue
                    )}`}
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
                    sx={{
                      display: {
                        xs: 'none',
                        sm: 'block'
                      }
                    }}
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
            direction={{
              xs: 'column',
              md: 'row'
            }}
            spacing={2}
            alignItems={{
              xs: 'stretch',
              md: 'center'
            }}
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

            <FormControl
              size="small"
              sx={{ minWidth: 170 }}
            >
              <InputLabel>Status</InputLabel>

              <Select
                value={statusFilter}
                label="Status"
                onChange={handleStatusChange}
              >
                <MenuItem value="ALL">
                  All Status
                </MenuItem>

                <MenuItem value="PAID">
                  Paid
                </MenuItem>

                <MenuItem value="PARTIALLY_PAID">
                  Partially Paid
                </MenuItem>

                <MenuItem value="REFUNDED">
                  Refunded
                </MenuItem>

                <MenuItem value="PENDING">
                  Pending
                </MenuItem>

                <MenuItem value="FAILED">
                  Failed
                </MenuItem>
              </Select>
            </FormControl>

            <FormControl
              size="small"
              sx={{ minWidth: 180 }}
            >
              <InputLabel>
                Payment Method
              </InputLabel>

              <Select
                value={methodFilter}
                label="Payment Method"
                onChange={handleMethodChange}
              >
                <MenuItem value="ALL">
                  All Methods
                </MenuItem>

                <MenuItem value="ONLINE">
                  Online
                </MenuItem>

                <MenuItem value="PAY_AT_SALON">
                  Pay at Salon
                </MenuItem>
              </Select>
            </FormControl>

            <FormControl
              size="small"
              sx={{ minWidth: 180 }}
            >
              <InputLabel>Salon</InputLabel>

              <Select
                value={salonFilter}
                label="Salon"
                onChange={handleSalonChange}
              >
                {salons.map((salon) => (
                  <MenuItem
                    key={salon}
                    value={salon}
                  >
                    {salon === 'ALL'
                      ? 'All Salons'
                      : salon}
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
          boxShadow:
            '0 2px 12px rgba(0,0,0,0.06)'
        }}
      >
        <CardContent sx={{ pb: 1 }}>
          <Typography
            variant="h6"
            fontWeight={700}
          >
            Revenue Records
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Revenue generated from bookings
          </Typography>
        </CardContent>

        <Divider />

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  Revenue ID
                </TableCell>

                <TableCell>
                  Salon
                </TableCell>

                <TableCell>
                  Customer
                </TableCell>

                <TableCell>
                  Booking Date
                </TableCell>

                <TableCell>
                  Payment Method
                </TableCell>

                <TableCell align="right">
                  Total
                </TableCell>

                <TableCell align="right">
                  Refund
                </TableCell>

                <TableCell align="right">
                  Net Revenue
                </TableCell>

                <TableCell>
                  Status
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredRecords
                .slice(
                  page * rowsPerPage,
                  page * rowsPerPage +
                    rowsPerPage
                )
                .map((record) => (
                  <TableRow
                    key={record.id}
                    hover
                    sx={{
                      '&:last-child td, &:last-child th':
                        {
                          border: 0
                        }
                    }}
                  >
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                      >
                        {record.id}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {record.bookingId}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight={500}
                      >
                        {record.salonName}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      {record.customerName}
                    </TableCell>

                    <TableCell>
                      {formatDate(
                        record.bookingDate
                      )}
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={
                          record.paymentMethod ===
                          'ONLINE'
                            ? 'Online'
                            : 'Pay at Salon'
                        }
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        fontWeight={600}
                      >
                        {formatCurrency(
                          record.totalAmount
                        )}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      {record.refundAmount > 0 ? (
                        <Typography
                          variant="body2"
                          color="error.main"
                        >
                          -
                          {formatCurrency(
                            record.refundAmount
                          )}
                        </Typography>
                      ) : (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
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
                        {formatCurrency(
                          record.netRevenue
                        )}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={record.paymentStatus.replace(
                          '_',
                          ' '
                        )}
                        color={getStatusColor(
                          record.paymentStatus
                        )}
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
                      <Typography
                        variant="h6"
                        color="text.secondary"
                      >
                        No revenue records found
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Try changing your filters
                        or search term.
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
          onPageChange={(_, newPage) =>
            setPage(newPage)
          }
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(
              parseInt(event.target.value, 10)
            );
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Card>
    </Box>
  );
}