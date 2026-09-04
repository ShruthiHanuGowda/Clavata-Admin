import { useMemo, useState } from 'react';
import { gql, useQuery } from '@apollo/client';

// material-ui
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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

// ==============================|| GRAPHQL ||============================== //

const PAYMENT_TRANSACTIONS = gql`
  query PaymentTransactions(
    $bookingId: ID
    $customerUserId: ID
    $salonId: ID
    $status: PaymentTransactionStatus
    $paymentType: PaymentTransactionType
    $search: String
  ) {
    paymentTransactions(
      bookingId: $bookingId
      customerUserId: $customerUserId
      salonId: $salonId
      status: $status
      paymentType: $paymentType
      search: $search
    ) {
      success
      message
      totalCount

      transactions {
        paymentTransactionId
        bookingId

        customerUserId
        customerName

        salonId
        salonName

        razorpayOrderId
        razorpayPaymentId

        amount
        fee
        netAmount
        currency

        paymentType
        paymentMethod
        status

        failureReason

        createdAt
        updatedAt
        paidAt
      }
    }
  }
`;

// ==============================|| TYPES ||============================== //

type TransactionStatus =
  | 'SUCCESS'
  | 'PENDING'
  | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED';

type TransactionType = 'BOOKING_FEE';

type PaymentMethod =
  | 'PAY_AT_SALON'
  | 'ONLINE';

interface PaymentTransaction {
  paymentTransactionId: string;

  bookingId: string;

  customerUserId: string;
  customerName?: string | null;

  salonId: string;
  salonName?: string | null;

  razorpayOrderId: string;
  razorpayPaymentId?: string | null;

  amount: number;
  fee: number;
  netAmount: number;

  currency: string;

  paymentType: TransactionType;
  paymentMethod: PaymentMethod;

  status: TransactionStatus;

  failureReason?: string | null;

  createdAt: string;
  updatedAt: string;

  paidAt?: string | null;
}

interface PaymentTransactionsResponse {
  paymentTransactions: {
    success: boolean;
    message: string;
    totalCount: number;
    transactions: PaymentTransaction[];
  };
}

// ==============================|| HELPERS ||============================== //

const formatCurrency = (
  value: number,
  currency: string = 'INR'
): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2
  }).format(Number(value) || 0);

const formatDate = (
  dateString?: string | null
): string => {
  if (!dateString) {
    return '-';
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const getTypeLabel = (
  type: TransactionType
): string => {
  switch (type) {
    case 'BOOKING_FEE':
      return 'Booking Fee';

    default:
      return type;
  }
};

const getPaymentMethodLabel = (
  method: PaymentMethod
): string => {
  switch (method) {
    case 'PAY_AT_SALON':
      return 'Pay at Salon';

    case 'ONLINE':
      return 'Online';

    default:
      return method;
  }
};

const getStatusColor = (
  status: TransactionStatus
):
  | 'success'
  | 'warning'
  | 'error'
  | 'default' => {
  switch (status) {
    case 'SUCCESS':
      return 'success';

    case 'PENDING':
      return 'warning';

    case 'FAILED':
      return 'error';

    case 'REFUNDED':
    case 'CANCELLED':
      return 'default';

    default:
      return 'default';
  }
};

const StatusIcon = ({
  status
}: {
  status: TransactionStatus;
}) => {
  switch (status) {
    case 'SUCCESS':
      return <CheckCircleOutlined />;

    case 'PENDING':
      return <ClockCircleOutlined />;

    case 'FAILED':
      return <CloseCircleOutlined />;

    case 'REFUNDED':
    case 'CANCELLED':
      return <ReloadOutlined />;

    default:
      return undefined;
  }
};

// ==============================|| TRANSACTIONS ||============================== //

export default function Transactions() {
  const [search, setSearch] = useState('');

  const [status, setStatus] = useState<
    'ALL' | TransactionStatus
  >('ALL');

  const [type, setType] = useState<
    'ALL' | TransactionType
  >('ALL');

  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] =
    useState(10);

  const [
    selectedTransaction,
    setSelectedTransaction
  ] = useState<PaymentTransaction | null>(
    null
  );

  // ==============================|| GRAPHQL VARIABLES ||============================== //

  const variables = useMemo(
    () => ({
      search: search.trim() || null,

      status:
        status === 'ALL'
          ? null
          : status,

      paymentType:
        type === 'ALL'
          ? null
          : type,

      bookingId: null,

      customerUserId: null,

      salonId: null
    }),
    [search, status, type]
  );

  // ==============================|| QUERY ||============================== //

  const {
    data,
    loading,
    error,
    refetch
  } = useQuery<PaymentTransactionsResponse>(
    PAYMENT_TRANSACTIONS,
    {
      variables,
      fetchPolicy: 'network-only'
    }
  );

  const transactions =
    data?.paymentTransactions?.transactions ??
    [];

  const totalCount =
    data?.paymentTransactions?.totalCount ??
    transactions.length;

  // ==============================|| PAGINATION ||============================== //

  const paginatedTransactions = useMemo(() => {
    return transactions.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [
    transactions,
    page,
    rowsPerPage
  ]);

  // ==============================|| SUMMARY ||============================== //

  const summary = useMemo(() => {
    const successful =
      transactions.filter(
        (item) =>
          item.status === 'SUCCESS'
      );

    const pending =
      transactions.filter(
        (item) =>
          item.status === 'PENDING'
      );

    const failed =
      transactions.filter(
        (item) =>
          item.status === 'FAILED'
      );

    const refunded =
      transactions.filter(
        (item) =>
          item.status === 'REFUNDED'
      );

    const cancelled =
      transactions.filter(
        (item) =>
          item.status === 'CANCELLED'
      );

    return {
      successfulAmount:
        successful.reduce(
          (sum, item) =>
            sum +
            Number(item.amount || 0),
          0
        ),

      successfulCount:
        successful.length,

      pendingAmount:
        pending.reduce(
          (sum, item) =>
            sum +
            Number(item.amount || 0),
          0
        ),

      pendingCount:
        pending.length,

      failedCount:
        failed.length,

      refundedAmount:
        refunded.reduce(
          (sum, item) =>
            sum +
            Number(item.amount || 0),
          0
        ),

      cancelledCount:
        cancelled.length
    };
  }, [transactions]);

  // ==============================|| HANDLERS ||============================== //

  const handleStatusChange = (
    event: SelectChangeEvent
  ) => {
    setStatus(
      event.target.value as
        | 'ALL'
        | TransactionStatus
    );

    setPage(0);
  };

  const handleTypeChange = (
    event: SelectChangeEvent
  ) => {
    setType(
      event.target.value as
        | 'ALL'
        | TransactionType
    );

    setPage(0);
  };

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearch(event.target.value);

    setPage(0);
  };

  const handleChangePage = (
    _event: unknown,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(
      parseInt(
        event.target.value,
        10
      )
    );

    setPage(0);
  };

  const handleReset = () => {
    setSearch('');

    setStatus('ALL');

    setType('ALL');

    setPage(0);
  };

  // ==============================|| EXPORT ||============================== //

  const handleExport = () => {
    if (!transactions.length) {
      return;
    }

    const headers = [
      'Transaction ID',
      'Booking ID',
      'Customer User ID',
      'Customer Name',
      'Salon ID',
      'Salon Name',
      'Razorpay Order ID',
      'Razorpay Payment ID',
      'Amount',
      'Fee',
      'Net Amount',
      'Currency',
      'Payment Type',
      'Payment Method',
      'Status',
      'Failure Reason',
      'Created At',
      'Updated At',
      'Paid At'
    ];

    const rows = transactions.map(
      (transaction) => [
        transaction.paymentTransactionId,

        transaction.bookingId,

        transaction.customerUserId,

        transaction.customerName ??
          '',

        transaction.salonId,

        transaction.salonName ??
          '',

        transaction.razorpayOrderId,

        transaction.razorpayPaymentId ??
          '',

        transaction.amount,

        transaction.fee,

        transaction.netAmount,

        transaction.currency,

        transaction.paymentType,

        transaction.paymentMethod,

        transaction.status,

        transaction.failureReason ??
          '',

        transaction.createdAt,

        transaction.updatedAt,

        transaction.paidAt ?? ''
      ]
    );

    const csv = [
      headers,
      ...rows
    ]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value).replace(
                /"/g,
                '""'
              )}"`
          )
          .join(',')
      )
      .join('\n');

    const blob = new Blob(
      [csv],
      {
        type:
          'text/csv;charset=utf-8;'
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement('a');

    link.href = url;

    link.setAttribute(
      'download',
      `payment-transactions-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`
    );

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // ==============================|| ERROR ||============================== //

  if (error) {
    return (
      <Box>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() =>
                refetch()
              }
            >
              Retry
            </Button>
          }
        >
          Failed to load payment
          transactions.

          {error.message
            ? ` ${error.message}`
            : ''}
        </Alert>
      </Box>
    );
  }

  // ==============================|| RENDER ||============================== //

  return (
    <Box>
      {/* ============================== HEADER ============================== */}

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
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600
            }}
          >
            Transactions
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            View and monitor all
            financial transactions
            across Clavata.
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1}
        >
          <Button
            variant="outlined"
            startIcon={
              <ReloadOutlined />
            }
            onClick={() =>
              refetch()
            }
            disabled={loading}
          >
            Refresh
          </Button>

          <Button
            variant="outlined"
            startIcon={
              <DownloadOutlined />
            }
            onClick={
              handleExport
            }
            disabled={
              !transactions.length
            }
          >
            Export
          </Button>
        </Stack>
      </Stack>

      {/* ============================== LOADING ============================== */}

      {loading && (
        <Box
          sx={{
            display: 'flex',
            justifyContent:
              'center',
            py: 2
          }}
        >
          <CircularProgress
            size={28}
          />
        </Box>
      )}

      {/* ============================== SUMMARY ============================== */}

      <Grid
        container
        spacing={2.5}
        sx={{ mb: 3 }}
      >
        {/* Successful */}

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
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
                  Successful Volume
                </Typography>

                <TransactionOutlined
                  style={{
                    fontSize: 22
                  }}
                />
              </Stack>

              <Typography variant="h4">
                {formatCurrency(
                  summary.successfulAmount
                )}
              </Typography>

              <Typography
                variant="caption"
                color="success.main"
              >
                {
                  summary.successfulCount
                }{' '}
                successful
                transactions
              </Typography>
            </Stack>
          </MainCard>
        </Grid>

        {/* Pending */}

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <MainCard>
            <Stack spacing={1}>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Pending Amount
              </Typography>

              <Typography variant="h4">
                {formatCurrency(
                  summary.pendingAmount
                )}
              </Typography>

              <Typography
                variant="caption"
                color="warning.main"
              >
                {
                  summary.pendingCount
                }{' '}
                awaiting
                confirmation
              </Typography>
            </Stack>
          </MainCard>
        </Grid>

        {/* Failed */}

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <MainCard>
            <Stack spacing={1}>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Failed Transactions
              </Typography>

              <Typography variant="h4">
                {
                  summary.failedCount
                }
              </Typography>

              <Typography
                variant="caption"
                color="error.main"
              >
                Requires monitoring
              </Typography>
            </Stack>
          </MainCard>
        </Grid>

        {/* Refunded */}

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <MainCard>
            <Stack spacing={1}>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Refunded Amount
              </Typography>

              <Typography variant="h4">
                {formatCurrency(
                  summary.refundedAmount
                )}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                {
                  summary.cancelledCount
                }{' '}
                cancelled
              </Typography>
            </Stack>
          </MainCard>
        </Grid>
      </Grid>

      {/* ============================== FILTERS ============================== */}

      <MainCard sx={{ mb: 3 }}>
        <Grid
          container
          spacing={2}
        >
          {/* Search */}

          <Grid
            item
            xs={12}
            md={6}
          >
            <TextField
              fullWidth
              placeholder="Search transaction, customer, salon, booking or Razorpay ID..."
              value={search}
              onChange={
                handleSearchChange
              }
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

          <Grid
            item
            xs={12}
            sm={6}
            md={2.5}
          >
            <FormControl fullWidth>
              <InputLabel>
                Status
              </InputLabel>

              <Select
                value={status}
                label="Status"
                onChange={
                  handleStatusChange
                }
              >
                <MenuItem value="ALL">
                  All Statuses
                </MenuItem>

                <MenuItem value="SUCCESS">
                  Success
                </MenuItem>

                <MenuItem value="PENDING">
                  Pending
                </MenuItem>

                <MenuItem value="FAILED">
                  Failed
                </MenuItem>

                <MenuItem value="CANCELLED">
                  Cancelled
                </MenuItem>

                <MenuItem value="REFUNDED">
                  Refunded
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Type */}

          <Grid
            item
            xs={12}
            sm={6}
            md={2.5}
          >
            <FormControl fullWidth>
              <InputLabel>
                Transaction Type
              </InputLabel>

              <Select
                value={type}
                label="Transaction Type"
                onChange={
                  handleTypeChange
                }
              >
                <MenuItem value="ALL">
                  All Types
                </MenuItem>

                <MenuItem value="BOOKING_FEE">
                  Booking Fee
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
              alignItems:
                'center',
              justifyContent: {
                xs: 'flex-start',
                md: 'center'
              }
            }}
          >
            <Button
              variant="text"
              onClick={
                handleReset
              }
              startIcon={
                <ReloadOutlined />
              }
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
          sx={{
            overflowX: 'auto'
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  Transaction ID
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
                  Type
                </TableCell>

                <TableCell>
                  Payment Method
                </TableCell>

                <TableCell align="right">
                  Amount
                </TableCell>

                <TableCell align="right">
                  Fee
                </TableCell>

                <TableCell align="right">
                  Net Amount
                </TableCell>

                <TableCell>
                  Status
                </TableCell>

                <TableCell>
                  Date
                </TableCell>

                <TableCell align="center">
                  Action
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {!loading &&
              paginatedTransactions.length >
                0 ? (
                paginatedTransactions.map(
                  (
                    transaction
                  ) => (
                    <TableRow
                      key={
                        transaction.paymentTransactionId
                      }
                      hover
                      sx={{
                        '&:last-child td, &:last-child th':
                          {
                            border: 0
                          }
                      }}
                    >
                      {/* Transaction ID */}

                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600
                          }}
                        >
                          {
                            transaction.paymentTransactionId
                          }
                        </Typography>

                        {transaction.razorpayPaymentId && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {
                              transaction.razorpayPaymentId
                            }
                          </Typography>
                        )}
                      </TableCell>

                      {/* Booking */}

                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: 150,
                            overflow:
                              'hidden',
                            textOverflow:
                              'ellipsis',
                            whiteSpace:
                              'nowrap'
                          }}
                        >
                          {
                            transaction.bookingId
                          }
                        </Typography>
                      </TableCell>

                      {/* Customer */}

                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            maxWidth: 160,
                            overflow:
                              'hidden',
                            textOverflow:
                              'ellipsis',
                            whiteSpace:
                              'nowrap'
                          }}
                        >
                          {transaction.customerName ||
                            'Unknown Customer'}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display:
                              'block',
                            maxWidth: 160,
                            overflow:
                              'hidden',
                            textOverflow:
                              'ellipsis',
                            whiteSpace:
                              'nowrap'
                          }}
                        >
                          {
                            transaction.customerUserId
                          }
                        </Typography>
                      </TableCell>

                      {/* Salon */}

                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            maxWidth: 160,
                            overflow:
                              'hidden',
                            textOverflow:
                              'ellipsis',
                            whiteSpace:
                              'nowrap'
                          }}
                        >
                          {transaction.salonName ||
                            'Unknown Salon'}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display:
                              'block',
                            maxWidth: 160,
                            overflow:
                              'hidden',
                            textOverflow:
                              'ellipsis',
                            whiteSpace:
                              'nowrap'
                          }}
                        >
                          {
                            transaction.salonId
                          }
                        </Typography>
                      </TableCell>

                      {/* Type */}

                      <TableCell>
                        <Chip
                          label={getTypeLabel(
                            transaction.paymentType
                          )}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>

                      {/* Payment Method */}

                      <TableCell>
                        <Typography variant="body2">
                          {getPaymentMethodLabel(
                            transaction.paymentMethod
                          )}
                        </Typography>
                      </TableCell>

                      {/* Amount */}

                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600
                          }}
                        >
                          {formatCurrency(
                            transaction.amount,
                            transaction.currency
                          )}
                        </Typography>
                      </TableCell>

                      {/* Fee */}

                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {formatCurrency(
                            transaction.fee,
                            transaction.currency
                          )}
                        </Typography>
                      </TableCell>

                      {/* Net Amount */}

                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600
                          }}
                        >
                          {formatCurrency(
                            transaction.netAmount,
                            transaction.currency
                          )}
                        </Typography>
                      </TableCell>

                      {/* Status */}

                      <TableCell>
                        <Chip
                          icon={
                            <StatusIcon
                              status={
                                transaction.status
                              }
                            />
                          }
                          label={
                            transaction.status
                          }
                          color={getStatusColor(
                            transaction.status
                          )}
                          size="small"
                        />
                      </TableCell>

                      {/* Date */}

                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            whiteSpace:
                              'nowrap'
                          }}
                        >
                          {formatDate(
                            transaction.createdAt
                          )}
                        </Typography>
                      </TableCell>

                      {/* Action */}

                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="text"
                          startIcon={
                            <EyeOutlined />
                          }
                          onClick={() =>
                            setSelectedTransaction(
                              transaction
                            )
                          }
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                )
              ) : !loading ? (
                <TableRow>
                  <TableCell
                    colSpan={12}
                  >
                    <Box
                      sx={{
                        py: 8,
                        textAlign:
                          'center'
                      }}
                    >
                      <Typography
                        variant="h6"
                        color="text.secondary"
                      >
                        No transactions
                        found
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 1
                        }}
                      >
                        Try changing
                        your search
                        or filters.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}

        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={
            handleChangePage
          }
          rowsPerPage={
            rowsPerPage
          }
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

      {/* ============================== TRANSACTION DETAILS ============================== */}

      <Dialog
        open={Boolean(
          selectedTransaction
        )}
        onClose={() =>
          setSelectedTransaction(
            null
          )
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Transaction Details
        </DialogTitle>

        <DialogContent dividers>
          {selectedTransaction && (
            <Stack spacing={2}>
              <DetailRow
                label="Transaction ID"
                value={
                  selectedTransaction.paymentTransactionId
                }
              />

              <DetailRow
                label="Booking ID"
                value={
                  selectedTransaction.bookingId
                }
              />

              <DetailRow
                label="Customer"
                value={
                  selectedTransaction.customerName ||
                  '-'
                }
              />

              <DetailRow
                label="Customer User ID"
                value={
                  selectedTransaction.customerUserId
                }
              />

              <DetailRow
                label="Salon"
                value={
                  selectedTransaction.salonName ||
                  '-'
                }
              />

              <DetailRow
                label="Salon ID"
                value={
                  selectedTransaction.salonId
                }
              />

              <DetailRow
                label="Razorpay Order ID"
                value={
                  selectedTransaction.razorpayOrderId
                }
              />

              <DetailRow
                label="Razorpay Payment ID"
                value={
                  selectedTransaction.razorpayPaymentId ||
                  '-'
                }
              />

              <DetailRow
                label="Amount"
                value={formatCurrency(
                  selectedTransaction.amount,
                  selectedTransaction.currency
                )}
              />

              <DetailRow
                label="Gateway Fee"
                value={formatCurrency(
                  selectedTransaction.fee,
                  selectedTransaction.currency
                )}
              />

              <DetailRow
                label="Net Amount"
                value={formatCurrency(
                  selectedTransaction.netAmount,
                  selectedTransaction.currency
                )}
              />

              <DetailRow
                label="Currency"
                value={
                  selectedTransaction.currency
                }
              />

              <DetailRow
                label="Payment Type"
                value={getTypeLabel(
                  selectedTransaction.paymentType
                )}
              />

              <DetailRow
                label="Payment Method"
                value={getPaymentMethodLabel(
                  selectedTransaction.paymentMethod
                )}
              />

              <DetailRow
                label="Status"
                value={
                  selectedTransaction.status
                }
              />

              <DetailRow
                label="Failure Reason"
                value={
                  selectedTransaction.failureReason ||
                  '-'
                }
              />

              <DetailRow
                label="Created At"
                value={formatDate(
                  selectedTransaction.createdAt
                )}
              />

              <DetailRow
                label="Updated At"
                value={formatDate(
                  selectedTransaction.updatedAt
                )}
              />

              <DetailRow
                label="Paid At"
                value={formatDate(
                  selectedTransaction.paidAt
                )}
              />
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setSelectedTransaction(
                null
              )
            }
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ==============================|| DETAIL ROW ||============================== //

interface DetailRowProps {
  label: string;
  value: string;
}

function DetailRow({
  label,
  value
}: DetailRowProps) {
  return (
    <Stack
      direction={{
        xs: 'column',
        sm: 'row'
      }}
      spacing={2}
      justifyContent="space-between"
      sx={{
        py: 0.75,
        borderBottom:
          '1px solid',
        borderColor:
          'divider'
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          fontWeight: 500,
          minWidth: 150
        }}
      >
        {label}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          textAlign: {
            xs: 'left',
            sm: 'right'
          },
          wordBreak:
            'break-word'
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}