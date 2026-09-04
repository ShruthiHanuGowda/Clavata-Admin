import { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';

// material-ui
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  TableHead,
  TextField,
  Typography
} from '@mui/material';

// icons
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  EyeOutlined,
  FilterOutlined,
  ReloadOutlined,
  SearchOutlined,
  TransactionOutlined,
  WalletOutlined
} from '@ant-design/icons';

// ==============================|| GRAPHQL ||============================== //
// Queries are maintained centrally in queries.tsx.

import {
  GET_ADMIN_BOOKINGS,
  GET_PAYMENT_TRANSACTIONS
} from '../../graphql/queries';

// ==============================|| TYPES ||============================== //

type PaymentStatus =
  | 'PAID'
  | 'PENDING'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_PAID';

type PaymentMethod = 'ONLINE' | 'PAY_AT_SALON';

type PaymentTransactionStatus =
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED';

type PaymentTransactionType = 'BOOKING_FEE';

interface PaymentTransaction {
  paymentTransactionId: string;
  bookingId: string;
  customerUserId: string;
  salonId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string | null;
  amount: number;
  currency: string;
  paymentType: PaymentTransactionType;
  paymentMethod: PaymentMethod;
  status: PaymentTransactionStatus;
  failureReason?: string | null;
  createdAt: string;
  updatedAt: string;
  paidAt?: string | null;
}

interface Booking {
  bookingId: string;
  salonId: string;
  customerUserId: string;
  salonName: string;
  customerName: string;
  customerPhone: string;
  bookingDate: string;
  createdAt: string;
  totalAmount: number;
  bookingFee: number;
  remainingAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  bookingFeeStatus: PaymentStatus;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  paymentGateway?: string | null;
}

interface Payment {
  id: string;
  bookingId: string;
  customerName: string;
  customerPhone: string;
  salonName: string;
  amount: number;
  bookingFee: number;
  remainingAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentGateway: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string | null;
  bookingDate: string;
  createdAt: string;
  transactionStatus: PaymentTransactionStatus;
  failureReason?: string | null;
  paidAt?: string | null;
}

interface PaymentTransactionsData {
  paymentTransactions: {
    success: boolean;
    message: string;
    totalCount: number;
    transactions: PaymentTransaction[];
  };
}

interface AdminBookingsData {
  adminBookings: {
    success: boolean;
    message: string;
    totalCount: number;
    bookings: Booking[];
  };
}

interface PaymentTransactionsVariables {
  search?: string;
  status?: PaymentTransactionStatus;
  paymentType?: PaymentTransactionType;
}

// ==============================|| HELPERS ||============================== //

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);

const formatDate = (value?: string | null) => {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

const formatDateTime = (value?: string | null) => {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const getStatusColor = (
  status: PaymentStatus
): 'success' | 'warning' | 'error' | 'default' | 'info' => {
  switch (status) {
    case 'PAID':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'FAILED':
      return 'error';
    case 'REFUNDED':
      return 'default';
    case 'PARTIALLY_PAID':
      return 'info';
    default:
      return 'default';
  }
};

const getPaymentStatusFromTransaction = (
  status: PaymentTransactionStatus
): PaymentStatus => {
  switch (status) {
    case 'SUCCESS':
      return 'PAID';
    case 'REFUNDED':
      return 'REFUNDED';
    case 'FAILED':
    case 'CANCELLED':
      return 'FAILED';
    case 'PENDING':
    default:
      return 'PENDING';
  }
};

// ==============================|| STAT CARD ||============================== //

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
}

function StatCard({ title, value, subtitle, icon }: StatCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
        borderRadius: 2
      }}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {title}
            </Typography>

            <Typography variant="h4" fontWeight={700}>
              {value}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'primary.lighter',
              color: 'primary.main',
              fontSize: 23
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ==============================|| PAYMENTS PAGE ||============================== //

export default function Payments() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | PaymentStatus>('ALL');
  const [methodFilter, setMethodFilter] = useState<'ALL' | PaymentMethod>('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  /*
   * Payment transactions are the source of truth for actual payment activity.
   * Bookings are fetched separately because PaymentTransaction does not contain
   * customerName, customerPhone or salonName.
   */
  const {
    data: transactionData,
    loading: transactionsLoading,
    error: transactionsError,
    refetch: refetchTransactions
  } = useQuery<PaymentTransactionsData, PaymentTransactionsVariables>(
    GET_PAYMENT_TRANSACTIONS,
    {
      variables: {
        paymentType: 'BOOKING_FEE'
      },
      fetchPolicy: 'network-only'
    }
  );

  const {
    data: bookingData,
    loading: bookingsLoading,
    error: bookingsError,
    refetch: refetchBookings
  } = useQuery<AdminBookingsData>(GET_ADMIN_BOOKINGS, {
    fetchPolicy: 'network-only'
  });

  const loading = transactionsLoading || bookingsLoading;
  const error = transactionsError || bookingsError;

  // ==============================|| MAP API DATA ||============================== //

  const payments = useMemo<Payment[]>(() => {
    const transactions = transactionData?.paymentTransactions?.transactions ?? [];
    const bookings = bookingData?.adminBookings?.bookings ?? [];

    const bookingMap = new Map<string, Booking>(
      bookings.map((booking) => [booking.bookingId, booking])
    );

    return transactions.map((transaction) => {
      const booking = bookingMap.get(transaction.bookingId);

      /*
       * Prefer the booking payment status because it supports PARTIALLY_PAID.
       * Fall back to the transaction status when the booking is not returned.
       */
      const paymentStatus =
        booking?.paymentStatus ??
        getPaymentStatusFromTransaction(transaction.status);

      return {
        id: transaction.paymentTransactionId,
        bookingId: transaction.bookingId,
        customerName: booking?.customerName ?? transaction.customerUserId,
        customerPhone: booking?.customerPhone ?? '—',
        salonName: booking?.salonName ?? transaction.salonId,
        amount: transaction.amount,
        bookingFee: booking?.bookingFee ?? transaction.amount,
        remainingAmount: booking?.remainingAmount ?? 0,
        paymentMethod: transaction.paymentMethod,
        paymentStatus,
        paymentGateway: booking?.paymentGateway ?? 'Razorpay',
        razorpayOrderId:
          transaction.razorpayOrderId || booking?.razorpayOrderId || '—',
        razorpayPaymentId:
          transaction.razorpayPaymentId || booking?.razorpayPaymentId,
        bookingDate: booking?.bookingDate ?? transaction.createdAt,
        createdAt: transaction.createdAt,
        transactionStatus: transaction.status,
        failureReason: transaction.failureReason,
        paidAt: transaction.paidAt
      };
    });
  }, [transactionData, bookingData]);

  // ==============================|| STATISTICS ||============================== //

  const statistics = useMemo(() => {
    const paidPayments = payments.filter(
      (payment) =>
        payment.transactionStatus === 'SUCCESS' &&
        payment.paymentStatus !== 'REFUNDED'
    );

    const totalRevenue = paidPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    const totalBookingFees = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    const pendingAmount = payments
      .filter(
        (payment) =>
          payment.paymentStatus === 'PENDING' ||
          payment.paymentStatus === 'PARTIALLY_PAID'
      )
      .reduce((sum, payment) => sum + payment.amount, 0);

    const refundedAmount = payments
      .filter((payment) => payment.paymentStatus === 'REFUNDED')
      .reduce((sum, payment) => sum + payment.amount, 0);

    return {
      totalRevenue,
      totalBookingFees,
      pendingAmount,
      refundedAmount
    };
  }, [payments]);

  // ==============================|| FILTER ||============================== //

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return payments.filter((payment) => {
      const searchableValues = [
        payment.id,
        payment.bookingId,
        payment.customerName,
        payment.customerPhone,
        payment.salonName,
        payment.razorpayOrderId,
        payment.razorpayPaymentId ?? '',
        payment.paymentGateway
      ];

      const matchesSearch =
        !query ||
        searchableValues.some((value) =>
          value.toLowerCase().includes(query)
        );

      const matchesStatus =
        statusFilter === 'ALL' ||
        payment.paymentStatus === statusFilter;

      const matchesMethod =
        methodFilter === 'ALL' ||
        payment.paymentMethod === methodFilter;

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [payments, search, statusFilter, methodFilter]);

  // ==============================|| REFRESH ||============================== //

  const handleRefresh = async () => {
    try {
      await Promise.all([refetchTransactions(), refetchBookings()]);
      setPage(0);
    } catch (refreshError) {
      console.error('Failed to refresh payments:', refreshError);
    }
  };

  // ==============================|| RENDER ||============================== //

  return (
    <Box>
      {/* HEADER */}

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Payments
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Monitor booking payments and payment activity across Clavata.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={
            transactionsLoading || bookingsLoading ? (
              <CircularProgress size={16} />
            ) : (
              <ReloadOutlined />
            )
          }
          onClick={handleRefresh}
          disabled={loading}
        >
          Refresh
        </Button>
      </Stack>

      {/* ERROR */}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {transactionsError?.message ||
            bookingsError?.message ||
            'Unable to load payment data.'}
        </Alert>
      )}

      {/* STATISTICS */}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Collected Revenue"
            value={formatCurrency(statistics.totalRevenue)}
            subtitle="Successfully paid booking fees"
            icon={<DollarOutlined />}
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Booking Fees"
            value={formatCurrency(statistics.totalBookingFees)}
            subtitle="Payment transactions recorded"
            icon={<WalletOutlined />}
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Pending Payments"
            value={formatCurrency(statistics.pendingAmount)}
            subtitle="Pending or partially paid"
            icon={<ClockCircleOutlined />}
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Refunded"
            value={formatCurrency(statistics.refundedAmount)}
            subtitle="Total refunded amount"
            icon={<TransactionOutlined />}
          />
        </Grid>
      </Grid>

      {/* PAYMENT TABLE */}

      <Paper
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        {/* TABLE HEADER */}

        <Box sx={{ p: 2.5 }}>
          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={2}
            justifyContent="space-between"
          >
            <TextField
              size="small"
              placeholder="Search payment, booking, customer or salon..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
              sx={{
                width: {
                  xs: '100%',
                  lg: 400
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined />
                  </InputAdornment>
                )
              }}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Select
                size="small"
                value={statusFilter}
                onChange={(event: SelectChangeEvent<'ALL' | PaymentStatus>) => {
                  setStatusFilter(event.target.value as 'ALL' | PaymentStatus);
                  setPage(0);
                }}
                displayEmpty
                startAdornment={
                  <FilterOutlined style={{ marginRight: 8 }} />
                }
                sx={{ minWidth: 170 }}
              >
                <MenuItem value="ALL">All Status</MenuItem>
                <MenuItem value="PAID">Paid</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="PARTIALLY_PAID">Partially Paid</MenuItem>
                <MenuItem value="FAILED">Failed</MenuItem>
                <MenuItem value="REFUNDED">Refunded</MenuItem>
              </Select>

              <Select
                size="small"
                value={methodFilter}
                onChange={(event: SelectChangeEvent<'ALL' | PaymentMethod>) => {
                  setMethodFilter(event.target.value as 'ALL' | PaymentMethod);
                  setPage(0);
                }}
                displayEmpty
                sx={{ minWidth: 170 }}
              >
                <MenuItem value="ALL">All Methods</MenuItem>
                <MenuItem value="ONLINE">Online</MenuItem>
                <MenuItem value="PAY_AT_SALON">Pay at Salon</MenuItem>
              </Select>
            </Stack>
          </Stack>
        </Box>

        <Divider />

        {/* TABLE */}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Payment</strong>
                </TableCell>

                <TableCell>
                  <strong>Customer</strong>
                </TableCell>

                <TableCell>
                  <strong>Salon</strong>
                </TableCell>

                <TableCell>
                  <strong>Amount</strong>
                </TableCell>

                <TableCell>
                  <strong>Method</strong>
                </TableCell>

                <TableCell>
                  <strong>Status</strong>
                </TableCell>

                <TableCell>
                  <strong>Date</strong>
                </TableCell>

                <TableCell align="center">
                  <strong>Action</strong>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading && payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Box
                      sx={{
                        py: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <CircularProgress />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments
                  .slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage
                  )
                  .map((payment) => (
                    <TableRow
                      key={payment.id}
                      hover
                      sx={{
                        '&:last-child td': {
                          borderBottom: 0
                        }
                      }}
                    >
                      {/* PAYMENT */}

                      <TableCell>
                        <Stack spacing={0.4}>
                          <Typography fontWeight={600}>
                            {payment.id}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            Booking: {payment.bookingId}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {payment.razorpayPaymentId
                              ? `Razorpay: ${payment.razorpayPaymentId}`
                              : 'Razorpay payment ID unavailable'}
                          </Typography>
                        </Stack>
                      </TableCell>

                      {/* CUSTOMER */}

                      <TableCell>
                        <Stack spacing={0.4}>
                          <Typography fontWeight={600}>
                            {payment.customerName}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {payment.customerPhone}
                          </Typography>
                        </Stack>
                      </TableCell>

                      {/* SALON */}

                      <TableCell>
                        <Typography fontWeight={500}>
                          {payment.salonName}
                        </Typography>
                      </TableCell>

                      {/* AMOUNT */}

                      <TableCell>
                        <Stack spacing={0.3}>
                          <Typography fontWeight={700}>
                            {formatCurrency(payment.amount)}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            Fee: {formatCurrency(payment.bookingFee)}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            Remaining:{' '}
                            {formatCurrency(payment.remainingAmount)}
                          </Typography>
                        </Stack>
                      </TableCell>

                      {/* METHOD */}

                      <TableCell>
                        <Chip
                          label={
                            payment.paymentMethod === 'ONLINE'
                              ? 'Online'
                              : 'Pay at Salon'
                          }
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>

                      {/* STATUS */}

                      <TableCell>
                        <Stack spacing={0.5} alignItems="flex-start">
                          <Chip
                            label={payment.paymentStatus.replace('_', ' ')}
                            color={getStatusColor(payment.paymentStatus)}
                            size="small"
                            icon={
                              payment.paymentStatus === 'PAID' ? (
                                <CheckCircleOutlined />
                              ) : payment.paymentStatus === 'PENDING' ? (
                                <ClockCircleOutlined />
                              ) : payment.paymentStatus === 'FAILED' ? (
                                <CloseCircleOutlined />
                              ) : undefined
                            }
                          />

                          {payment.failureReason && (
                            <Typography
                              variant="caption"
                              color="error.main"
                              sx={{ maxWidth: 180 }}
                            >
                              {payment.failureReason}
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>

                      {/* DATE */}

                      <TableCell>
                        <Stack spacing={0.3}>
                          <Typography variant="body2">
                            {formatDate(payment.bookingDate)}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            Created: {formatDateTime(payment.createdAt)}
                          </Typography>

                          {payment.paidAt && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Paid: {formatDateTime(payment.paidAt)}
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>

                      {/* ACTION */}

                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => {
                            console.log('Payment details:', payment);
                          }}
                          aria-label="View payment details"
                        >
                          <EyeOutlined />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              )}

              {!loading && filteredPayments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8}>
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
                        No payments found
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        Try changing your search or filters.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* PAGINATION */}

        <TablePagination
          component="div"
          count={filteredPayments.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>
    </Box>
  );
}
