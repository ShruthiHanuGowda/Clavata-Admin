
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
  DollarOutlined
} from '@ant-design/icons';

// project import
import MainCard from 'components/MainCard';

// ==============================|| TYPES ||============================== //

type RefundStatus =
  | 'REQUESTED'
  | 'PROCESSING'
  | 'APPROVED'
  | 'COMPLETED'
  | 'REJECTED';

type RefundReason =
  | 'CUSTOMER_CANCELLED'
  | 'SALON_CANCELLED'
  | 'PAYMENT_FAILED'
  | 'DUPLICATE_PAYMENT'
  | 'SERVICE_NOT_PROVIDED'
  | 'OTHER';

interface Refund {
  id: string;
  refundId: string;
  bookingId: string;
  transactionId: string;
  customerName: string;
  customerPhone: string;
  salonName: string;
  originalAmount: number;
  refundAmount: number;
  reason: RefundReason;
  status: RefundStatus;
  paymentMethod: string;
  razorpayPaymentId?: string;
  razorpayRefundId?: string;
  requestedAt: string;
  processedAt?: string;
}

// ==============================|| STATIC DATA ||============================== //

const REFUNDS: Refund[] = [
  {
    id: '1',
    refundId: 'REF-2026-00001',
    bookingId: 'BK-10005',
    transactionId: 'TXN-2026-00005',
    customerName: 'Meera Nair',
    customerPhone: '+91 98765 43210',
    salonName: 'Aura Salon',
    originalAmount: 950,
    refundAmount: 950,
    reason: 'CUSTOMER_CANCELLED',
    status: 'COMPLETED',
    paymentMethod: 'Razorpay',
    razorpayPaymentId: 'pay_Qx8E12VWX',
    razorpayRefundId: 'rfnd_Qx8REF001',
    requestedAt: '29 Aug 2026, 04:32 PM',
    processedAt: '29 Aug 2026, 05:18 PM'
  },
  {
    id: '2',
    refundId: 'REF-2026-00002',
    bookingId: 'BK-10011',
    transactionId: 'TXN-2026-00011',
    customerName: 'Priya Reddy',
    customerPhone: '+91 99887 66554',
    salonName: 'Urban Cuts',
    originalAmount: 700,
    refundAmount: 700,
    reason: 'SALON_CANCELLED',
    status: 'APPROVED',
    paymentMethod: 'Razorpay',
    razorpayPaymentId: 'pay_Qx8REF002',
    requestedAt: '30 Aug 2026, 09:10 AM'
  },
  {
    id: '3',
    refundId: 'REF-2026-00003',
    bookingId: 'BK-10012',
    transactionId: 'TXN-2026-00012',
    customerName: 'Ananya Sharma',
    customerPhone: '+91 91234 56789',
    salonName: 'Glow Beauty Studio',
    originalAmount: 850,
    refundAmount: 850,
    reason: 'PAYMENT_FAILED',
    status: 'PROCESSING',
    paymentMethod: 'Razorpay',
    razorpayPaymentId: 'pay_Qx8REF003',
    requestedAt: '30 Aug 2026, 10:05 AM'
  },
  {
    id: '4',
    refundId: 'REF-2026-00004',
    bookingId: 'BK-10013',
    transactionId: 'TXN-2026-00013',
    customerName: 'Sneha Gowda',
    customerPhone: '+91 90123 45678',
    salonName: 'Blush & Bloom',
    originalAmount: 600,
    refundAmount: 600,
    reason: 'DUPLICATE_PAYMENT',
    status: 'REQUESTED',
    paymentMethod: 'Razorpay',
    razorpayPaymentId: 'pay_Qx8REF004',
    requestedAt: '30 Aug 2026, 11:24 AM'
  },
  {
    id: '5',
    refundId: 'REF-2026-00005',
    bookingId: 'BK-10014',
    transactionId: 'TXN-2026-00014',
    customerName: 'Rahul Kumar',
    customerPhone: '+91 93456 78901',
    salonName: 'The Style Lounge',
    originalAmount: 1200,
    refundAmount: 1000,
    reason: 'SERVICE_NOT_PROVIDED',
    status: 'COMPLETED',
    paymentMethod: 'Razorpay',
    razorpayPaymentId: 'pay_Qx8REF005',
    razorpayRefundId: 'rfnd_Qx8REF005',
    requestedAt: '28 Aug 2026, 02:15 PM',
    processedAt: '28 Aug 2026, 03:02 PM'
  },
  {
    id: '6',
    refundId: 'REF-2026-00006',
    bookingId: 'BK-10015',
    transactionId: 'TXN-2026-00015',
    customerName: 'Kavya Rao',
    customerPhone: '+91 98761 23456',
    salonName: 'Lavender Beauty',
    originalAmount: 750,
    refundAmount: 750,
    reason: 'CUSTOMER_CANCELLED',
    status: 'REJECTED',
    paymentMethod: 'Razorpay',
    razorpayPaymentId: 'pay_Qx8REF006',
    requestedAt: '27 Aug 2026, 01:45 PM'
  },
  {
    id: '7',
    refundId: 'REF-2026-00007',
    bookingId: 'BK-10016',
    transactionId: 'TXN-2026-00016',
    customerName: 'Divya Singh',
    customerPhone: '+91 97654 32109',
    salonName: 'Mirror Mirror',
    originalAmount: 1500,
    refundAmount: 1500,
    reason: 'SALON_CANCELLED',
    status: 'COMPLETED',
    paymentMethod: 'Razorpay',
    razorpayPaymentId: 'pay_Qx8REF007',
    razorpayRefundId: 'rfnd_Qx8REF007',
    requestedAt: '26 Aug 2026, 06:22 PM',
    processedAt: '26 Aug 2026, 07:05 PM'
  },
  {
    id: '8',
    refundId: 'REF-2026-00008',
    bookingId: 'BK-10017',
    transactionId: 'TXN-2026-00017',
    customerName: 'Nisha Verma',
    customerPhone: '+91 96543 21098',
    salonName: 'Glam House',
    originalAmount: 800,
    refundAmount: 800,
    reason: 'OTHER',
    status: 'PROCESSING',
    paymentMethod: 'Razorpay',
    razorpayPaymentId: 'pay_Qx8REF008',
    requestedAt: '30 Aug 2026, 08:18 AM'
  }
];

// ==============================|| HELPERS ||============================== //

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(value);

const getReasonLabel = (reason: RefundReason) => {
  switch (reason) {
    case 'CUSTOMER_CANCELLED':
      return 'Customer Cancelled';

    case 'SALON_CANCELLED':
      return 'Salon Cancelled';

    case 'PAYMENT_FAILED':
      return 'Payment Failed';

    case 'DUPLICATE_PAYMENT':
      return 'Duplicate Payment';

    case 'SERVICE_NOT_PROVIDED':
      return 'Service Not Provided';

    case 'OTHER':
      return 'Other';

    default:
      return reason;
  }
};

const getStatusColor = (
  status: RefundStatus
): 'success' | 'warning' | 'error' | 'info' | 'default' => {
  switch (status) {
    case 'COMPLETED':
      return 'success';

    case 'APPROVED':
      return 'info';

    case 'PROCESSING':
      return 'warning';

    case 'REQUESTED':
      return 'warning';

    case 'REJECTED':
      return 'error';

    default:
      return 'default';
  }
};

const StatusIcon = ({ status }: { status: RefundStatus }) => {
  switch (status) {
    case 'COMPLETED':
      return <CheckCircleOutlined />;

    case 'PROCESSING':
    case 'REQUESTED':
    case 'APPROVED':
      return <ClockCircleOutlined />;

    case 'REJECTED':
      return <CloseCircleOutlined />;

    default:
      return undefined;
  }
};

// ==============================|| REFUNDS PAGE ||============================== //

export default function Refunds() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'ALL' | RefundStatus>('ALL');
  const [reason, setReason] = useState<'ALL' | RefundReason>('ALL');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ==============================|| FILTER ||============================== //

  const filteredRefunds = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return REFUNDS.filter((refund) => {
      const matchesSearch =
        !searchValue ||
        refund.refundId.toLowerCase().includes(searchValue) ||
        refund.bookingId.toLowerCase().includes(searchValue) ||
        refund.transactionId.toLowerCase().includes(searchValue) ||
        refund.customerName.toLowerCase().includes(searchValue) ||
        refund.salonName.toLowerCase().includes(searchValue) ||
        refund.customerPhone.toLowerCase().includes(searchValue) ||
        refund.razorpayPaymentId
          ?.toLowerCase()
          .includes(searchValue) ||
        refund.razorpayRefundId
          ?.toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        status === 'ALL' || refund.status === status;

      const matchesReason =
        reason === 'ALL' || refund.reason === reason;

      return matchesSearch && matchesStatus && matchesReason;
    });
  }, [search, status, reason]);

  // ==============================|| SUMMARY ||============================== //

  const summary = useMemo(() => {
    const completed = REFUNDS.filter(
      (refund) => refund.status === 'COMPLETED'
    );

    const pending = REFUNDS.filter(
      (refund) =>
        refund.status === 'REQUESTED' ||
        refund.status === 'PROCESSING' ||
        refund.status === 'APPROVED'
    );

    const rejected = REFUNDS.filter(
      (refund) => refund.status === 'REJECTED'
    );

    return {
      totalRefunded: completed.reduce(
        (sum, refund) => sum + refund.refundAmount,
        0
      ),

      pendingAmount: pending.reduce(
        (sum, refund) => sum + refund.refundAmount,
        0
      ),

      pendingCount: pending.length,

      rejectedCount: rejected.length,

      totalRequests: REFUNDS.length
    };
  }, []);

  // ==============================|| HANDLERS ||============================== //

  const handleStatusChange = (event: SelectChangeEvent) => {
    setStatus(event.target.value as 'ALL' | RefundStatus);
    setPage(0);
  };

  const handleReasonChange = (event: SelectChangeEvent) => {
    setReason(event.target.value as 'ALL' | RefundReason);
    setPage(0);
  };

  const handleReset = () => {
    setSearch('');
    setStatus('ALL');
    setReason('ALL');
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

  const paginatedRefunds = filteredRefunds.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // ==============================|| RENDER ||============================== //

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
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Refunds
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Manage customer refund requests and monitor refund processing.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<DownloadOutlined />}
          onClick={() => console.log('Export refunds')}
        >
          Export
        </Button>
      </Stack>

      {/* ============================== SUMMARY ============================== */}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Total Refunded */}

        <Grid item xs={12} sm={6} md={3}>
          <MainCard>
            <Stack spacing={1}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Total Refunded
                </Typography>

                <DollarOutlined
                  style={{ fontSize: 22 }}
                />
              </Stack>

              <Typography variant="h4">
                {formatCurrency(summary.totalRefunded)}
              </Typography>

              <Typography
                variant="caption"
                color="success.main"
              >
                Successfully refunded
              </Typography>
            </Stack>
          </MainCard>
        </Grid>

        {/* Pending */}

        <Grid item xs={12} sm={6} md={3}>
          <MainCard>
            <Stack spacing={1}>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Pending Refunds
              </Typography>

              <Typography variant="h4">
                {formatCurrency(summary.pendingAmount)}
              </Typography>

              <Typography
                variant="caption"
                color="warning.main"
              >
                {summary.pendingCount} requests awaiting processing
              </Typography>
            </Stack>
          </MainCard>
        </Grid>

        {/* Requests */}

        <Grid item xs={12} sm={6} md={3}>
          <MainCard>
            <Stack spacing={1}>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Total Requests
              </Typography>

              <Typography variant="h4">
                {summary.totalRequests}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                All refund requests
              </Typography>
            </Stack>
          </MainCard>
        </Grid>

        {/* Rejected */}

        <Grid item xs={12} sm={6} md={3}>
          <MainCard>
            <Stack spacing={1}>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Rejected
              </Typography>

              <Typography variant="h4">
                {summary.rejectedCount}
              </Typography>

              <Typography
                variant="caption"
                color="error.main"
              >
                Refund requests rejected
              </Typography>
            </Stack>
          </MainCard>
        </Grid>
      </Grid>

      {/* ============================== FILTERS ============================== */}

      <MainCard sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          {/* Search */}

          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              placeholder="Search refund, booking, customer, salon..."
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

          {/* Status */}

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>

              <Select
                value={status}
                label="Status"
                onChange={handleStatusChange}
              >
                <MenuItem value="ALL">
                  All Statuses
                </MenuItem>

                <MenuItem value="REQUESTED">
                  Requested
                </MenuItem>

                <MenuItem value="PROCESSING">
                  Processing
                </MenuItem>

                <MenuItem value="APPROVED">
                  Approved
                </MenuItem>

                <MenuItem value="COMPLETED">
                  Completed
                </MenuItem>

                <MenuItem value="REJECTED">
                  Rejected
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Reason */}

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Reason</InputLabel>

              <Select
                value={reason}
                label="Reason"
                onChange={handleReasonChange}
              >
                <MenuItem value="ALL">
                  All Reasons
                </MenuItem>

                <MenuItem value="CUSTOMER_CANCELLED">
                  Customer Cancelled
                </MenuItem>

                <MenuItem value="SALON_CANCELLED">
                  Salon Cancelled
                </MenuItem>

                <MenuItem value="PAYMENT_FAILED">
                  Payment Failed
                </MenuItem>

                <MenuItem value="DUPLICATE_PAYMENT">
                  Duplicate Payment
                </MenuItem>

                <MenuItem value="SERVICE_NOT_PROVIDED">
                  Service Not Provided
                </MenuItem>

                <MenuItem value="OTHER">
                  Other
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Reset */}

          <Grid
            item
            xs={12}
            md={1}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: {
                xs: 'flex-start',
                md: 'center'
              }
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

      {/* ============================== TABLE ============================== */}

      <MainCard content={false}>
        <TableContainer
          component={Paper}
          elevation={0}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  Refund ID
                </TableCell>

                <TableCell>
                  Booking
                </TableCell>

                <TableCell>
                  Customer
                </TableCell>

                <TableCell>
                  Salon
                </TableCell>

                <TableCell>
                  Reason
                </TableCell>

                <TableCell align="right">
                  Original Amount
                </TableCell>

                <TableCell align="right">
                  Refund Amount
                </TableCell>

                <TableCell>
                  Payment
                </TableCell>

                <TableCell>
                  Status
                </TableCell>

                <TableCell>
                  Requested
                </TableCell>

                <TableCell align="center">
                  Action
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedRefunds.length > 0 ? (
                paginatedRefunds.map((refund) => (
                  <TableRow
                    key={refund.id}
                    hover
                    sx={{
                      '&:last-child td, &:last-child th': {
                        border: 0
                      }
                    }}
                  >
                    {/* Refund ID */}

                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600 }}
                      >
                        {refund.refundId}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {refund.transactionId}
                      </Typography>
                    </TableCell>

                    {/* Booking */}

                    <TableCell>
                      <Typography variant="body2">
                        {refund.bookingId}
                      </Typography>
                    </TableCell>

                    {/* Customer */}

                    <TableCell>
                      <Typography variant="body2">
                        {refund.customerName}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {refund.customerPhone}
                      </Typography>
                    </TableCell>

                    {/* Salon */}

                    <TableCell>
                      <Typography variant="body2">
                        {refund.salonName}
                      </Typography>
                    </TableCell>

                    {/* Reason */}

                    <TableCell>
                      <Chip
                        label={getReasonLabel(
                          refund.reason
                        )}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>

                    {/* Original Amount */}

                    <TableCell align="right">
                      {formatCurrency(
                        refund.originalAmount
                      )}
                    </TableCell>

                    {/* Refund Amount */}

                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600
                        }}
                      >
                        {formatCurrency(
                          refund.refundAmount
                        )}
                      </Typography>
                    </TableCell>

                    {/* Payment */}

                    <TableCell>
                      <Typography variant="body2">
                        {refund.paymentMethod}
                      </Typography>

                      {refund.razorpayPaymentId && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {refund.razorpayPaymentId}
                        </Typography>
                      )}
                    </TableCell>

                    {/* Status */}

                    <TableCell>
                      <Chip
                        icon={
                          <StatusIcon
                            status={refund.status}
                          />
                        }
                        label={refund.status}
                        color={getStatusColor(
                          refund.status
                        )}
                        size="small"
                      />
                    </TableCell>

                    {/* Requested */}

                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {refund.requestedAt}
                      </Typography>

                      {refund.processedAt && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Processed: {refund.processedAt}
                        </Typography>
                      )}
                    </TableCell>

                    {/* Action */}

                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="text"
                        startIcon={<EyeOutlined />}
                        onClick={() =>
                          console.log(
                            'View refund',
                            refund
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
                  <TableCell
                    colSpan={11}
                  >
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
                        No refunds found
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        Try changing your search
                        or filters.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}

        <TablePagination
          component="div"
          count={filteredRefunds.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={
            handleChangeRowsPerPage
          }
          rowsPerPageOptions={[
            5,
            10,
            25,
            50
          ]}
        />
      </MainCard>
    </Box>
  );
}

