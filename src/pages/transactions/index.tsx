
import { useMemo, useState } from 'react';

// material-ui
import {
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
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

// ant design icons
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
  TransactionOutlined
} from '@ant-design/icons';

// project import
import MainCard from 'components/MainCard';

// ==============================|| TYPES ||============================== //

type TransactionStatus = 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED';

type TransactionType =
  | 'BOOKING_PAYMENT'
  | 'BOOKING_FEE'
  | 'REFUND'
  | 'PAYOUT'
  | 'ADJUSTMENT';

interface Transaction {
  id: string;
  transactionId: string;
  bookingId: string;
  customerName: string;
  salonName: string;
  amount: number;
  fee: number;
  netAmount: number;
  type: TransactionType;
  paymentMethod: string;
  status: TransactionStatus;
  razorpayPaymentId?: string;
  createdAt: string;
}

// ==============================|| STATIC DATA ||============================== //

const TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    transactionId: 'TXN-2026-00001',
    bookingId: 'BK-10001',
    customerName: 'Ananya Sharma',
    salonName: 'Glow Beauty Studio',
    amount: 850,
    fee: 21.25,
    netAmount: 828.75,
    type: 'BOOKING_PAYMENT',
    paymentMethod: 'Razorpay',
    status: 'SUCCESS',
    razorpayPaymentId: 'pay_Qx8A12KLM',
    createdAt: '30 Aug 2026, 10:42 AM'
  },
  {
    id: '2',
    transactionId: 'TXN-2026-00002',
    bookingId: 'BK-10002',
    customerName: 'Priya Reddy',
    salonName: 'Urban Cuts',
    amount: 500,
    fee: 12.5,
    netAmount: 487.5,
    type: 'BOOKING_FEE',
    paymentMethod: 'Razorpay',
    status: 'SUCCESS',
    razorpayPaymentId: 'pay_Qx8B45MNO',
    createdAt: '30 Aug 2026, 09:35 AM'
  },
  {
    id: '3',
    transactionId: 'TXN-2026-00003',
    bookingId: 'BK-10003',
    customerName: 'Rahul Kumar',
    salonName: 'The Style Lounge',
    amount: 1200,
    fee: 30,
    netAmount: 1170,
    type: 'BOOKING_PAYMENT',
    paymentMethod: 'Razorpay',
    status: 'PENDING',
    razorpayPaymentId: 'pay_Qx8C78PQR',
    createdAt: '30 Aug 2026, 08:51 AM'
  },
  {
    id: '4',
    transactionId: 'TXN-2026-00004',
    bookingId: 'BK-10004',
    customerName: 'Sneha Gowda',
    salonName: 'Blush & Bloom',
    amount: 650,
    fee: 16.25,
    netAmount: 633.75,
    type: 'BOOKING_PAYMENT',
    paymentMethod: 'Razorpay',
    status: 'SUCCESS',
    razorpayPaymentId: 'pay_Qx8D90STU',
    createdAt: '29 Aug 2026, 07:22 PM'
  },
  {
    id: '5',
    transactionId: 'TXN-2026-00005',
    bookingId: 'BK-10005',
    customerName: 'Meera Nair',
    salonName: 'Aura Salon',
    amount: 950,
    fee: 23.75,
    netAmount: 926.25,
    type: 'REFUND',
    paymentMethod: 'Razorpay',
    status: 'REFUNDED',
    razorpayPaymentId: 'pay_Qx8E12VWX',
    createdAt: '29 Aug 2026, 05:18 PM'
  },
  {
    id: '6',
    transactionId: 'TXN-2026-00006',
    bookingId: 'BK-10006',
    customerName: 'Kavya Rao',
    salonName: 'Lavender Beauty',
    amount: 700,
    fee: 17.5,
    netAmount: 682.5,
    type: 'BOOKING_PAYMENT',
    paymentMethod: 'Razorpay',
    status: 'FAILED',
    razorpayPaymentId: 'pay_Qx8F45YZA',
    createdAt: '29 Aug 2026, 03:42 PM'
  },
  {
    id: '7',
    transactionId: 'TXN-2026-00007',
    bookingId: 'BK-10007',
    customerName: 'Arjun Patel',
    salonName: 'Elite Grooming',
    amount: 450,
    fee: 11.25,
    netAmount: 438.75,
    type: 'BOOKING_FEE',
    paymentMethod: 'Razorpay',
    status: 'SUCCESS',
    razorpayPaymentId: 'pay_Qx8G78BCD',
    createdAt: '29 Aug 2026, 01:14 PM'
  },
  {
    id: '8',
    transactionId: 'TXN-2026-00008',
    bookingId: 'BK-10008',
    customerName: 'Divya Singh',
    salonName: 'Mirror Mirror',
    amount: 1500,
    fee: 37.5,
    netAmount: 1462.5,
    type: 'BOOKING_PAYMENT',
    paymentMethod: 'Razorpay',
    status: 'SUCCESS',
    razorpayPaymentId: 'pay_Qx8H90CDE',
    createdAt: '28 Aug 2026, 08:32 PM'
  },
  {
    id: '9',
    transactionId: 'TXN-2026-00009',
    bookingId: 'BK-10009',
    customerName: 'Nisha Verma',
    salonName: 'Glam House',
    amount: 800,
    fee: 20,
    netAmount: 780,
    type: 'PAYOUT',
    paymentMethod: 'Bank Transfer',
    status: 'SUCCESS',
    createdAt: '28 Aug 2026, 04:26 PM'
  },
  {
    id: '10',
    transactionId: 'TXN-2026-00010',
    bookingId: 'BK-10010',
    customerName: 'Vikram Shetty',
    salonName: 'Style Avenue',
    amount: 1100,
    fee: 27.5,
    netAmount: 1072.5,
    type: 'BOOKING_PAYMENT',
    paymentMethod: 'Razorpay',
    status: 'SUCCESS',
    razorpayPaymentId: 'pay_Qx8J12EFG',
    createdAt: '28 Aug 2026, 11:08 AM'
  }
];

// ==============================|| HELPERS ||============================== //

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(value);

const getTypeLabel = (type: TransactionType) => {
  switch (type) {
    case 'BOOKING_PAYMENT':
      return 'Booking Payment';
    case 'BOOKING_FEE':
      return 'Booking Fee';
    case 'REFUND':
      return 'Refund';
    case 'PAYOUT':
      return 'Payout';
    case 'ADJUSTMENT':
      return 'Adjustment';
    default:
      return type;
  }
};

const getStatusColor = (
  status: TransactionStatus
): 'success' | 'warning' | 'error' | 'default' => {
  switch (status) {
    case 'SUCCESS':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'FAILED':
      return 'error';
    case 'REFUNDED':
      return 'default';
    default:
      return 'default';
  }
};

const StatusIcon = ({ status }: { status: TransactionStatus }) => {
  switch (status) {
    case 'SUCCESS':
      return <CheckCircleOutlined />;
    case 'PENDING':
      return <ClockCircleOutlined />;
    case 'FAILED':
      return <CloseCircleOutlined />;
    case 'REFUNDED':
      return <ReloadOutlined />;
    default:
      return undefined;
  }
};

// ==============================|| TRANSACTIONS ||============================== //

export default function Transactions() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'ALL' | TransactionStatus>('ALL');
  const [type, setType] = useState<'ALL' | TransactionType>('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ==============================|| FILTER ||============================== //

  const filteredTransactions = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return TRANSACTIONS.filter((transaction) => {
      const matchesSearch =
        !searchValue ||
        transaction.transactionId.toLowerCase().includes(searchValue) ||
        transaction.bookingId.toLowerCase().includes(searchValue) ||
        transaction.customerName.toLowerCase().includes(searchValue) ||
        transaction.salonName.toLowerCase().includes(searchValue) ||
        transaction.razorpayPaymentId?.toLowerCase().includes(searchValue);

      const matchesStatus =
        status === 'ALL' || transaction.status === status;

      const matchesType =
        type === 'ALL' || transaction.type === type;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [search, status, type]);

  // ==============================|| SUMMARY ||============================== //

  const summary = useMemo(() => {
    const successful = TRANSACTIONS.filter(
      (item) => item.status === 'SUCCESS'
    );

    const pending = TRANSACTIONS.filter(
      (item) => item.status === 'PENDING'
    );

    const failed = TRANSACTIONS.filter(
      (item) => item.status === 'FAILED'
    );

    const refunded = TRANSACTIONS.filter(
      (item) => item.status === 'REFUNDED'
    );

    return {
      total: successful.reduce((sum, item) => sum + item.amount, 0),
      successfulCount: successful.length,
      pendingAmount: pending.reduce((sum, item) => sum + item.amount, 0),
      failedCount: failed.length,
      refundedAmount: refunded.reduce(
        (sum, item) => sum + item.amount,
        0
      )
    };
  }, []);

  // ==============================|| HANDLERS ||============================== //

  const handleStatusChange = (event: SelectChangeEvent) => {
    setStatus(event.target.value as 'ALL' | TransactionStatus);
    setPage(0);
  };

  const handleTypeChange = (event: SelectChangeEvent) => {
    setType(event.target.value as 'ALL' | TransactionType);
    setPage(0);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleReset = () => {
    setSearch('');
    setStatus('ALL');
    setType('ALL');
    setPage(0);
  };

  const paginatedTransactions = filteredTransactions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // ==============================|| RENDER ||============================== //

  return (
    <Box>
      {/* Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Transactions
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            View and monitor all financial transactions across Clavata.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<DownloadOutlined />}
          onClick={() => console.log('Export transactions')}
        >
          Export
        </Button>
      </Stack>

      {/* Summary Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MainCard>
            <Stack spacing={1}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body2" color="text.secondary">
                  Successful Volume
                </Typography>

                <TransactionOutlined
                  style={{ fontSize: 22 }}
                />
              </Stack>

              <Typography variant="h4">
                {formatCurrency(summary.total)}
              </Typography>

              <Typography variant="caption" color="success.main">
                {summary.successfulCount} successful transactions
              </Typography>
            </Stack>
          </MainCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MainCard>
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                Pending Amount
              </Typography>

              <Typography variant="h4">
                {formatCurrency(summary.pendingAmount)}
              </Typography>

              <Typography variant="caption" color="warning.main">
                Awaiting confirmation
              </Typography>
            </Stack>
          </MainCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MainCard>
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                Failed Transactions
              </Typography>

              <Typography variant="h4">
                {summary.failedCount}
              </Typography>

              <Typography variant="caption" color="error.main">
                Requires monitoring
              </Typography>
            </Stack>
          </MainCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MainCard>
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                Refunded Amount
              </Typography>

              <Typography variant="h4">
                {formatCurrency(summary.refundedAmount)}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                Processed refunds
              </Typography>
            </Stack>
          </MainCard>
        </Grid>
      </Grid>

      {/* Filters */}
      <MainCard sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              placeholder="Search transaction, booking, customer, salon..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>

              <Select
                value={status}
                label="Status"
                onChange={handleStatusChange}
              >
                <MenuItem value="ALL">All Statuses</MenuItem>
                <MenuItem value="SUCCESS">Success</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="FAILED">Failed</MenuItem>
                <MenuItem value="REFUNDED">Refunded</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Transaction Type</InputLabel>

              <Select
                value={type}
                label="Transaction Type"
                onChange={handleTypeChange}
              >
                <MenuItem value="ALL">All Types</MenuItem>
                <MenuItem value="BOOKING_PAYMENT">
                  Booking Payment
                </MenuItem>
                <MenuItem value="BOOKING_FEE">
                  Booking Fee
                </MenuItem>
                <MenuItem value="REFUND">
                  Refund
                </MenuItem>
                <MenuItem value="PAYOUT">
                  Payout
                </MenuItem>
                <MenuItem value="ADJUSTMENT">
                  Adjustment
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid
            item
            xs={12}
            md={1}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: { xs: 'flex-start', md: 'center' }
            }}
          >
            <Button
              variant="text"
              onClick={handleReset}
              startIcon={<ReloadOutlined />}
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </MainCard>

      {/* Table */}
      <MainCard content={false}>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Transaction ID</TableCell>
                <TableCell>Booking</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Salon</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Payment Method</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="right">Fee</TableCell>
                <TableCell align="right">Net Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    hover
                    sx={{
                      '&:last-child td, &:last-child th': {
                        border: 0
                      }
                    }}
                  >
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600 }}
                      >
                        {transaction.transactionId}
                      </Typography>

                      {transaction.razorpayPaymentId && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {transaction.razorpayPaymentId}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {transaction.bookingId}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {transaction.customerName}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {transaction.salonName}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={getTypeLabel(transaction.type)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {transaction.paymentMethod}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600 }}
                      >
                        {formatCurrency(transaction.amount)}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      {formatCurrency(transaction.fee)}
                    </TableCell>

                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600 }}
                      >
                        {formatCurrency(transaction.netAmount)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        icon={
                          <StatusIcon status={transaction.status} />
                        }
                        label={transaction.status}
                        color={getStatusColor(transaction.status)}
                        size="small"
                      />
                    </TableCell>

                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ whiteSpace: 'nowrap' }}
                      >
                        {transaction.createdAt}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="text"
                        startIcon={<EyeOutlined />}
                        onClick={() =>
                          console.log(
                            'View transaction',
                            transaction
                          )
                        }
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={12}>
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
                        No transactions found
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
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

        <TablePagination
          component="div"
          count={filteredTransactions.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </MainCard>
    </Box>
  );
}

