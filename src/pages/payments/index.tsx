
import { useMemo, useState } from 'react';

// material-ui
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
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

// ==============================|| TYPES ||============================== //

type PaymentStatus = 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_PAID';

type PaymentMethod = 'ONLINE' | 'PAY_AT_SALON';

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
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  bookingDate: string;
  createdAt: string;
}

// ==============================|| MOCK DATA ||============================== //

const mockPayments: Payment[] = [
  {
    id: 'PAY-10001',
    bookingId: 'BK-10001',
    customerName: 'Ananya Sharma',
    customerPhone: '+91 9876543210',
    salonName: 'Glow Beauty Studio',
    amount: 850,
    bookingFee: 100,
    remainingAmount: 750,
    paymentMethod: 'ONLINE',
    paymentStatus: 'PAID',
    paymentGateway: 'Razorpay',
    razorpayOrderId: 'order_RZP10001',
    razorpayPaymentId: 'pay_RZP10001',
    bookingDate: '30 Aug 2026',
    createdAt: '30 Aug 2026, 10:30 AM'
  },
  {
    id: 'PAY-10002',
    bookingId: 'BK-10002',
    customerName: 'Priya Reddy',
    customerPhone: '+91 9988776655',
    salonName: 'Urban Hair Lounge',
    amount: 1200,
    bookingFee: 200,
    remainingAmount: 1000,
    paymentMethod: 'PAY_AT_SALON',
    paymentStatus: 'PARTIALLY_PAID',
    paymentGateway: 'Razorpay',
    razorpayOrderId: 'order_RZP10002',
    razorpayPaymentId: 'pay_RZP10002',
    bookingDate: '30 Aug 2026',
    createdAt: '30 Aug 2026, 09:15 AM'
  },
  {
    id: 'PAY-10003',
    bookingId: 'BK-10003',
    customerName: 'Rahul Kumar',
    customerPhone: '+91 9123456789',
    salonName: 'The Barber Club',
    amount: 650,
    bookingFee: 50,
    remainingAmount: 600,
    paymentMethod: 'ONLINE',
    paymentStatus: 'PENDING',
    paymentGateway: 'Razorpay',
    razorpayOrderId: 'order_RZP10003',
    bookingDate: '29 Aug 2026',
    createdAt: '29 Aug 2026, 06:40 PM'
  },
  {
    id: 'PAY-10004',
    bookingId: 'BK-10004',
    customerName: 'Sneha Patel',
    customerPhone: '+91 9345678901',
    salonName: 'Blush & Bloom',
    amount: 1500,
    bookingFee: 250,
    remainingAmount: 1250,
    paymentMethod: 'ONLINE',
    paymentStatus: 'FAILED',
    paymentGateway: 'Razorpay',
    razorpayOrderId: 'order_RZP10004',
    bookingDate: '29 Aug 2026',
    createdAt: '29 Aug 2026, 04:20 PM'
  },
  {
    id: 'PAY-10005',
    bookingId: 'BK-10005',
    customerName: 'Megha Gowda',
    customerPhone: '+91 9871234567',
    salonName: 'Style Avenue',
    amount: 950,
    bookingFee: 100,
    remainingAmount: 850,
    paymentMethod: 'ONLINE',
    paymentStatus: 'REFUNDED',
    paymentGateway: 'Razorpay',
    razorpayOrderId: 'order_RZP10005',
    razorpayPaymentId: 'pay_RZP10005',
    bookingDate: '28 Aug 2026',
    createdAt: '28 Aug 2026, 02:10 PM'
  },
  {
    id: 'PAY-10006',
    bookingId: 'BK-10006',
    customerName: 'Arjun Singh',
    customerPhone: '+91 9988123456',
    salonName: 'Gentlemen Cuts',
    amount: 700,
    bookingFee: 100,
    remainingAmount: 600,
    paymentMethod: 'ONLINE',
    paymentStatus: 'PAID',
    paymentGateway: 'Razorpay',
    razorpayOrderId: 'order_RZP10006',
    razorpayPaymentId: 'pay_RZP10006',
    bookingDate: '28 Aug 2026',
    createdAt: '28 Aug 2026, 11:45 AM'
  },
  {
    id: 'PAY-10007',
    bookingId: 'BK-10007',
    customerName: 'Divya Nair',
    customerPhone: '+91 9876541230',
    salonName: 'Serenity Spa',
    amount: 2200,
    bookingFee: 300,
    remainingAmount: 1900,
    paymentMethod: 'PAY_AT_SALON',
    paymentStatus: 'PARTIALLY_PAID',
    paymentGateway: 'Razorpay',
    razorpayOrderId: 'order_RZP10007',
    razorpayPaymentId: 'pay_RZP10007',
    bookingDate: '27 Aug 2026',
    createdAt: '27 Aug 2026, 08:30 PM'
  },
  {
    id: 'PAY-10008',
    bookingId: 'BK-10008',
    customerName: 'Kiran Rao',
    customerPhone: '+91 9000012345',
    salonName: 'Mirror Mirror Salon',
    amount: 1100,
    bookingFee: 150,
    remainingAmount: 950,
    paymentMethod: 'ONLINE',
    paymentStatus: 'PAID',
    paymentGateway: 'Razorpay',
    razorpayOrderId: 'order_RZP10008',
    razorpayPaymentId: 'pay_RZP10008',
    bookingDate: '27 Aug 2026',
    createdAt: '27 Aug 2026, 05:15 PM'
  }
];

// ==============================|| HELPERS ||============================== //

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);

const getStatusColor = (status: PaymentStatus) => {
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
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ==============================|| STATISTICS ||============================== //

  const statistics = useMemo(() => {
    const paidPayments = payments.filter((payment) => payment.paymentStatus === 'PAID');

    const totalRevenue = paidPayments.reduce((sum, payment) => sum + payment.amount, 0);

    const totalBookingFees = payments.reduce((sum, payment) => sum + payment.bookingFee, 0);

    const pendingAmount = payments
      .filter(
        (payment) =>
          payment.paymentStatus === 'PENDING' ||
          payment.paymentStatus === 'PARTIALLY_PAID'
      )
      .reduce((sum, payment) => sum + payment.bookingFee, 0);

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
      const matchesSearch =
        !query ||
        payment.id.toLowerCase().includes(query) ||
        payment.bookingId.toLowerCase().includes(query) ||
        payment.customerName.toLowerCase().includes(query) ||
        payment.customerPhone.toLowerCase().includes(query) ||
        payment.salonName.toLowerCase().includes(query) ||
        payment.razorpayPaymentId?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === 'ALL' || payment.paymentStatus === statusFilter;

      const matchesMethod =
        methodFilter === 'ALL' || payment.paymentMethod === methodFilter;

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [payments, search, statusFilter, methodFilter]);

  // ==============================|| REFRESH ||============================== //

  const handleRefresh = () => {
    // Later replace this with GraphQL refetch().
    setPayments([...mockPayments]);
    setSearch('');
    setStatusFilter('ALL');
    setMethodFilter('ALL');
    setPage(0);
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
          startIcon={<ReloadOutlined />}
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      </Stack>

      {/* STATISTICS */}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Collected Revenue"
            value={formatCurrency(statistics.totalRevenue)}
            subtitle="Successfully paid bookings"
            icon={<DollarOutlined />}
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Booking Fees"
            value={formatCurrency(statistics.totalBookingFees)}
            subtitle="Total booking fees recorded"
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
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setPage(0);
                }}
                displayEmpty
                startAdornment={<FilterOutlined style={{ marginRight: 8 }} />}
                sx={{ minWidth: 170 }}
              >
                <MenuItem value="ALL">All Status</MenuItem>
                <MenuItem value="PAID">Paid</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="PARTIALLY_PAID">
                  Partially Paid
                </MenuItem>
                <MenuItem value="FAILED">Failed</MenuItem>
                <MenuItem value="REFUNDED">Refunded</MenuItem>
              </Select>

              <Select
                size="small"
                value={methodFilter}
                onChange={(event) => {
                  setMethodFilter(event.target.value);
                  setPage(0);
                }}
                displayEmpty
                sx={{ minWidth: 170 }}
              >
                <MenuItem value="ALL">All Methods</MenuItem>
                <MenuItem value="ONLINE">Online</MenuItem>
                <MenuItem value="PAY_AT_SALON">
                  Pay at Salon
                </MenuItem>
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
              {filteredPayments
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
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
                          {payment.bookingId}
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
                    </TableCell>

                    {/* DATE */}

                    <TableCell>
                      <Stack spacing={0.3}>
                        <Typography variant="body2">
                          {payment.bookingDate}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {payment.createdAt}
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* ACTION */}

                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => {
                          console.log('Payment details:', payment);
                        }}
                      >
                        <EyeOutlined />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}

              {filteredPayments.length === 0 && (
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

