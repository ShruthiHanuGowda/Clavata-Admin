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
import { REFUNDS_QUERY } from '../../graphql/queries';
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

type PaymentMethod =
  | 'PAY_AT_SALON'
  | 'ONLINE';

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

  reason: RefundReason;
  status: RefundStatus;

  paymentMethod: PaymentMethod;

  razorpayPaymentId?: string | null;
  razorpayRefundId?: string | null;

  requestedAt: string;
  processedAt?: string | null;

  createdAt: string;
  updatedAt: string;
}

interface RefundsResponse {
  refunds: {
    success: boolean;
    message: string;
    refunds: Refund[];
    totalCount: number;
  };
}

// ==============================|| HELPERS ||============================== //

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
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

const getReasonLabel = (
  reason: RefundReason
): string => {
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
  status: RefundStatus
): 'success' | 'warning' | 'error' | 'info' | 'default' => {
  switch (status) {
    case 'COMPLETED':
      return 'success';

    case 'APPROVED':
      return 'info';

    case 'PROCESSING':
    case 'REQUESTED':
      return 'warning';

    case 'REJECTED':
      return 'error';

    default:
      return 'default';
  }
};

const StatusIcon = ({
  status
}: {
  status: RefundStatus;
}) => {
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

  const [
    status,
    setStatus
  ] = useState<'ALL' | RefundStatus>('ALL');

  const [
    reason,
    setReason
  ] = useState<'ALL' | RefundReason>('ALL');

  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] =
    useState(10);

  const [
    selectedRefund,
    setSelectedRefund
  ] = useState<Refund | null>(null);

  // ==============================|| VARIABLES ||============================== //

  const variables = useMemo(
    () => ({
      bookingId: null,
      customerUserId: null,
      salonId: null,

      status:
        status === 'ALL'
          ? null
          : status,

      reason:
        reason === 'ALL'
          ? null
          : reason,

      search:
        search.trim() || null
    }),
    [search, status, reason]
  );

  // ==============================|| QUERY ||============================== //

  const {
    data,
    loading,
    error,
    refetch
  } = useQuery<RefundsResponse>(
    REFUNDS_QUERY,
    {
      variables,
      fetchPolicy: 'network-only'
    }
  );

  const refunds =
    data?.refunds?.refunds ?? [];

  const totalCount =
    data?.refunds?.totalCount ??
    refunds.length;

  // ==============================|| SUMMARY ||============================== //

  const summary = useMemo(() => {
    const completed =
      refunds.filter(
        (refund) =>
          refund.status === 'COMPLETED'
      );

    const pending =
      refunds.filter(
        (refund) =>
          refund.status === 'REQUESTED' ||
          refund.status === 'PROCESSING' ||
          refund.status === 'APPROVED'
      );

    const rejected =
      refunds.filter(
        (refund) =>
          refund.status === 'REJECTED'
      );

    return {
      totalRefunded:
        completed.reduce(
          (sum, refund) =>
            sum +
            Number(
              refund.refundAmount
            ),
          0
        ),

      pendingAmount:
        pending.reduce(
          (sum, refund) =>
            sum +
            Number(
              refund.refundAmount
            ),
          0
        ),

      pendingCount:
        pending.length,

      rejectedCount:
        rejected.length,

      totalRequests:
        refunds.length
    };
  }, [refunds]);

  // ==============================|| PAGINATION ||============================== //

  const paginatedRefunds =
    useMemo(() => {
      return refunds.slice(
        page * rowsPerPage,
        page * rowsPerPage +
          rowsPerPage
      );
    }, [
      refunds,
      page,
      rowsPerPage
    ]);

  // ==============================|| HANDLERS ||============================== //

  const handleStatusChange = (
    event: SelectChangeEvent
  ) => {
    setStatus(
      event.target.value as
        | 'ALL'
        | RefundStatus
    );

    setPage(0);
  };

  const handleReasonChange = (
    event: SelectChangeEvent
  ) => {
    setReason(
      event.target.value as
        | 'ALL'
        | RefundReason
    );

    setPage(0);
  };

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handleReset = () => {
    setSearch('');
    setStatus('ALL');
    setReason('ALL');
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

  // ==============================|| EXPORT ||============================== //

  const handleExport = () => {
    if (!refunds.length) {
      return;
    }

    const headers = [
      'Refund ID',
      'Booking ID',
      'Transaction ID',
      'Customer User ID',
      'Customer Name',
      'Customer Phone',
      'Salon ID',
      'Salon Name',
      'Original Amount',
      'Refund Amount',
      'Reason',
      'Status',
      'Payment Method',
      'Razorpay Payment ID',
      'Razorpay Refund ID',
      'Requested At',
      'Processed At',
      'Created At',
      'Updated At'
    ];

    const rows = refunds.map(
      (refund) => [
        refund.refundId,
        refund.bookingId,
        refund.paymentTransactionId,
        refund.customerUserId,
        refund.customerName,
        refund.customerPhone,
        refund.salonId,
        refund.salonName,
        refund.originalAmount,
        refund.refundAmount,
        refund.reason,
        refund.status,
        refund.paymentMethod,
        refund.razorpayPaymentId ??
          '',
        refund.razorpayRefundId ??
          '',
        refund.requestedAt,
        refund.processedAt ??
          '',
        refund.createdAt,
        refund.updatedAt
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
      `refunds-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`
    );

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

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
          Failed to load refunds.
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
            sx={{ fontWeight: 600 }}
          >
            Refunds
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Manage customer refund
            requests and monitor refund
            processing.
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
            onClick={handleExport}
            disabled={
              !refunds.length
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
        {/* Total Refunded */}

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
                  Total Refunded
                </Typography>

                <DollarOutlined
                  style={{
                    fontSize: 22
                  }}
                />
              </Stack>

              <Typography variant="h4">
                {formatCurrency(
                  summary.totalRefunded
                )}
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
                Pending Refunds
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
                requests awaiting
                processing
              </Typography>
            </Stack>
          </MainCard>
        </Grid>

        {/* Requests */}

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
                Total Requests
              </Typography>

              <Typography variant="h4">
                {
                  summary.totalRequests
                }
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
                Rejected
              </Typography>

              <Typography variant="h4">
                {
                  summary.rejectedCount
                }
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

          <Grid
            item
            xs={12}
            md={5}
          >
            <TextField
              fullWidth
              placeholder="Search refund, booking, customer, salon..."
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
            md={3}
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

          <Grid
            item
            xs={12}
            sm={6}
            md={3}
          >
            <FormControl fullWidth>
              <InputLabel>
                Reason
              </InputLabel>

              <Select
                value={reason}
                label="Reason"
                onChange={
                  handleReasonChange
                }
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
              {!loading &&
              paginatedRefunds.length >
                0 ? (
                paginatedRefunds.map(
                  (refund) => (
                    <TableRow
                      key={
                        refund.refundId
                      }
                      hover
                      sx={{
                        '&:last-child td, &:last-child th':
                          {
                            border: 0
                          }
                      }}
                    >
                      {/* Refund ID */}

                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600
                          }}
                        >
                          {
                            refund.refundId
                          }
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {
                            refund.paymentTransactionId
                          }
                        </Typography>
                      </TableCell>

                      {/* Booking */}

                      <TableCell>
                        <Typography variant="body2">
                          {
                            refund.bookingId
                          }
                        </Typography>
                      </TableCell>

                      {/* Customer */}

                      <TableCell>
                        <Typography variant="body2">
                          {
                            refund.customerName
                          }
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {
                            refund.customerPhone
                          }
                        </Typography>
                      </TableCell>

                      {/* Salon */}

                      <TableCell>
                        <Typography variant="body2">
                          {
                            refund.salonName
                          }
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
                          {getPaymentMethodLabel(
                            refund.paymentMethod
                          )}
                        </Typography>

                        {refund.razorpayPaymentId && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {
                              refund.razorpayPaymentId
                            }
                          </Typography>
                        )}
                      </TableCell>

                      {/* Status */}

                      <TableCell>
                        <Chip
                          icon={
                            <StatusIcon
                              status={
                                refund.status
                              }
                            />
                          }
                          label={
                            refund.status
                          }
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
                            whiteSpace:
                              'nowrap'
                          }}
                        >
                          {formatDate(
                            refund.requestedAt
                          )}
                        </Typography>

                        {refund.processedAt && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            Processed:{' '}
                            {formatDate(
                              refund.processedAt
                            )}
                          </Typography>
                        )}
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
                            setSelectedRefund(
                              refund
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
                    colSpan={11}
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
                        No refunds found
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        Try changing your
                        search or filters.
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

      {/* ============================== REFUND DETAILS ============================== */}

      <Dialog
        open={Boolean(
          selectedRefund
        )}
        onClose={() =>
          setSelectedRefund(null)
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Refund Details
        </DialogTitle>

        <DialogContent dividers>
          {selectedRefund && (
            <Stack spacing={2}>
              <DetailRow
                label="Refund ID"
                value={
                  selectedRefund.refundId
                }
              />

              <DetailRow
                label="Booking ID"
                value={
                  selectedRefund.bookingId
                }
              />

              <DetailRow
                label="Transaction ID"
                value={
                  selectedRefund.paymentTransactionId
                }
              />

              <DetailRow
                label="Customer"
                value={`${selectedRefund.customerName} (${selectedRefund.customerPhone})`}
              />

              <DetailRow
                label="Customer User ID"
                value={
                  selectedRefund.customerUserId
                }
              />

              <DetailRow
                label="Salon"
                value={
                  selectedRefund.salonName
                }
              />

              <DetailRow
                label="Salon ID"
                value={
                  selectedRefund.salonId
                }
              />

              <DetailRow
                label="Original Amount"
                value={formatCurrency(
                  selectedRefund.originalAmount
                )}
              />

              <DetailRow
                label="Refund Amount"
                value={formatCurrency(
                  selectedRefund.refundAmount
                )}
              />

              <DetailRow
                label="Reason"
                value={getReasonLabel(
                  selectedRefund.reason
                )}
              />

              <DetailRow
                label="Status"
                value={
                  selectedRefund.status
                }
              />

              <DetailRow
                label="Payment Method"
                value={getPaymentMethodLabel(
                  selectedRefund.paymentMethod
                )}
              />

              <DetailRow
                label="Razorpay Payment ID"
                value={
                  selectedRefund.razorpayPaymentId ||
                  '-'
                }
              />

              <DetailRow
                label="Razorpay Refund ID"
                value={
                  selectedRefund.razorpayRefundId ||
                  '-'
                }
              />

              <DetailRow
                label="Requested At"
                value={formatDate(
                  selectedRefund.requestedAt
                )}
              />

              <DetailRow
                label="Processed At"
                value={formatDate(
                  selectedRefund.processedAt
                )}
              />

              <DetailRow
                label="Created At"
                value={formatDate(
                  selectedRefund.createdAt
                )}
              />

              <DetailRow
                label="Updated At"
                value={formatDate(
                  selectedRefund.updatedAt
                )}
              />
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setSelectedRefund(null)
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
      spacing={1}
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

