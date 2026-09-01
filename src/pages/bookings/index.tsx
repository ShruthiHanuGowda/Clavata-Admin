import { useMemo, useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';

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
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Snackbar,
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
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  EyeOutlined,
  SearchOutlined,
  UserOutlined
} from '@ant-design/icons';

// ============================================================
// TYPES
// ============================================================

type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

type PaymentStatus =
  | 'PENDING'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED';

type PaymentMethod =
  | 'PAY_AT_SALON'
  | 'ONLINE';

interface BookingService {
  serviceId: string;
  name: string;
  category: string;
  duration: number;
  price: number;
}

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

  staffId?: string | null;
  staffName?: string | null;

  services: BookingService[];

  totalDuration: number;
  subtotal: number;
  discount: number;
  totalAmount: number;

  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;

  notes?: string | null;
  salonNote?: string | null;

  bookingFee: number;
  bookingFeeStatus: PaymentStatus;
  bookingFeePaidAt?: string | null;

  remainingAmount: number;

  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  paymentGateway?: string | null;

  reviewSubmitted?: boolean | null;
  rating?: number | null;
  review?: string | null;
  reviewedAt?: string | null;

  createdAt: string;
  updatedAt: string;
}

interface AdminBookingListResponse {
  success: boolean;
  message: string;
  bookings: Booking[];
  totalCount: number;
}

// ============================================================
// GRAPHQL QUERIES
// ============================================================

const ADMIN_BOOKINGS = gql`
  query AdminBookings(
    $search: String
    $bookingStatus: BookingStatus
    $paymentStatus: PaymentStatus
    $salonId: ID
  ) {
    adminBookings(
      search: $search
      bookingStatus: $bookingStatus
      paymentStatus: $paymentStatus
      salonId: $salonId
    ) {
      success
      message
      totalCount

      bookings {
        bookingId
        salonId
        customerUserId

        salonName
        customerName
        customerPhone

        bookingDate
        startTime
        endTime

        staffId
        staffName

        services {
          serviceId
          name
          category
          duration
          price
        }

        totalDuration
        subtotal
        discount
        totalAmount

        paymentMethod
        paymentStatus
        bookingStatus

        notes
        salonNote

        bookingFee
        bookingFeeStatus
        bookingFeePaidAt

        remainingAmount

        razorpayOrderId
        razorpayPaymentId
        paymentGateway

        reviewSubmitted
        rating
        review
        reviewedAt

        createdAt
        updatedAt
      }
    }
  }
`;

const UPDATE_BOOKING_STATUS = gql`
  mutation UpdateBookingStatus(
    $input: UpdateBookingStatusInput!
  ) {
    updateBookingStatus(input: $input) {
      success
      message

      booking {
        bookingId
        salonId
        customerUserId

        salonName
        customerName
        customerPhone

        bookingDate
        startTime
        endTime

        staffId
        staffName

        services {
          serviceId
          name
          category
          duration
          price
        }

        totalDuration
        subtotal
        discount
        totalAmount

        paymentMethod
        paymentStatus
        bookingStatus

        notes
        salonNote

        bookingFee
        bookingFeeStatus
        bookingFeePaidAt

        remainingAmount

        razorpayOrderId
        razorpayPaymentId
        paymentGateway

        reviewSubmitted
        rating
        review
        reviewedAt

        createdAt
        updatedAt
      }
    }
  }
`;

// ============================================================
// HELPERS
// ============================================================

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(value || 0));

const formatStatus = (value: string) =>
  value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getStatusColor = (
  status: BookingStatus
):
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error' => {
  switch (status) {
    case 'CONFIRMED':
      return 'primary';

    case 'COMPLETED':
      return 'success';

    case 'PENDING':
      return 'warning';

    case 'CANCELLED':
    case 'NO_SHOW':
      return 'error';

    default:
      return 'default';
  }
};

const getPaymentColor = (
  status: PaymentStatus
):
  | 'default'
  | 'success'
  | 'warning'
  | 'error' => {
  switch (status) {
    case 'PAID':
      return 'success';

    case 'PENDING':
    case 'PARTIALLY_PAID':
      return 'warning';

    case 'FAILED':
    case 'REFUNDED':
      return 'error';

    default:
      return 'default';
  }
};

// ============================================================
// STAT CARD
// ============================================================

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}

function StatCard({
  title,
  value,
  icon,
  description
}: StatCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        height: '100%'
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
      >
        <Box>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {title}
          </Typography>

          <Typography
            variant="h4"
            sx={{
              mt: 1,
              fontWeight: 700
            }}
          >
            {value}
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
          >
            {description}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'primary.lighter',
            color: 'primary.main',
            fontSize: 21
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Paper>
  );
}

// ============================================================
// BOOKING DETAILS
// ============================================================

interface BookingDetailsProps {
  booking: Booking;
}

function BookingDetails({
  booking
}: BookingDetailsProps) {
  return (
    <Stack spacing={2.5}>
      {/* HEADER */}

      <Box>
        <Typography
          variant="subtitle1"
          fontWeight={700}
        >
          Booking Information
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          {booking.bookingId}
        </Typography>
      </Box>

      <Divider />

      {/* BASIC INFORMATION */}

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography
            variant="caption"
            color="text.secondary"
          >
            Customer
          </Typography>

          <Typography
            variant="body1"
            fontWeight={600}
          >
            {booking.customerName}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            {booking.customerPhone}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography
            variant="caption"
            color="text.secondary"
          >
            Customer ID
          </Typography>

          <Typography
            variant="body2"
            fontWeight={600}
            sx={{
              wordBreak: 'break-all'
            }}
          >
            {booking.customerUserId}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography
            variant="caption"
            color="text.secondary"
          >
            Salon
          </Typography>

          <Typography
            variant="body1"
            fontWeight={600}
          >
            {booking.salonName}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            {booking.salonId}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography
            variant="caption"
            color="text.secondary"
          >
            Date
          </Typography>

          <Typography
            variant="body1"
            fontWeight={600}
          >
            {booking.bookingDate}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography
            variant="caption"
            color="text.secondary"
          >
            Time
          </Typography>

          <Typography
            variant="body1"
            fontWeight={600}
          >
            {booking.startTime} - {booking.endTime}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography
            variant="caption"
            color="text.secondary"
          >
            Staff
          </Typography>

          <Typography
            variant="body1"
            fontWeight={600}
          >
            {booking.staffName || 'Not assigned'}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography
            variant="caption"
            color="text.secondary"
          >
            Payment Method
          </Typography>

          <Typography
            variant="body1"
            fontWeight={600}
          >
            {booking.paymentMethod ===
            'PAY_AT_SALON'
              ? 'Pay at Salon'
              : 'Online'}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography
            variant="caption"
            color="text.secondary"
          >
            Booking Status
          </Typography>

          <Box sx={{ mt: 0.5 }}>
            <Chip
              size="small"
              label={formatStatus(
                booking.bookingStatus
              )}
              color={getStatusColor(
                booking.bookingStatus
              )}
            />
          </Box>
        </Grid>
      </Grid>

      <Divider />

      {/* SERVICES */}

      <Box>
        <Typography
          variant="subtitle1"
          fontWeight={700}
          sx={{ mb: 1.5 }}
        >
          Services
        </Typography>

        <Stack spacing={1}>
          {booking.services.map(
            (service) => (
              <Box
                key={service.serviceId}
                sx={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems: 'center',
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor:
                    'background.default'
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                  >
                    {service.name}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    {service.category} •{' '}
                    {service.duration} mins
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  fontWeight={600}
                >
                  {formatCurrency(
                    service.price
                  )}
                </Typography>
              </Box>
            )
          )}
        </Stack>
      </Box>

      <Divider />

      {/* AMOUNT */}

      <Box>
        <Stack spacing={1}>
          <Stack
            direction="row"
            justifyContent="space-between"
          >
            <Typography color="text.secondary">
              Subtotal
            </Typography>

            <Typography>
              {formatCurrency(
                booking.subtotal
              )}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            justifyContent="space-between"
          >
            <Typography color="text.secondary">
              Discount
            </Typography>

            <Typography>
              -{' '}
              {formatCurrency(
                booking.discount
              )}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            justifyContent="space-between"
          >
            <Typography color="text.secondary">
              Booking Fee
            </Typography>

            <Typography>
              {formatCurrency(
                booking.bookingFee
              )}
            </Typography>
          </Stack>

          <Divider />

          <Stack
            direction="row"
            justifyContent="space-between"
          >
            <Typography fontWeight={700}>
              Total
            </Typography>

            <Typography fontWeight={700}>
              {formatCurrency(
                booking.totalAmount
              )}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            justifyContent="space-between"
          >
            <Typography color="text.secondary">
              Remaining at Salon
            </Typography>

            <Typography fontWeight={600}>
              {formatCurrency(
                booking.remainingAmount
              )}
            </Typography>
          </Stack>
        </Stack>
      </Box>

      {/* NOTES */}

      {booking.notes && (
        <>
          <Divider />

          <Box>
            <Typography
              variant="subtitle2"
              fontWeight={700}
            >
              Customer Notes
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              {booking.notes}
            </Typography>
          </Box>
        </>
      )}

      {booking.salonNote && (
        <>
          <Divider />

          <Box>
            <Typography
              variant="subtitle2"
              fontWeight={700}
            >
              Salon Note
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              {booking.salonNote}
            </Typography>
          </Box>
        </>
      )}

      {/* PAYMENT DETAILS */}

      {booking.razorpayOrderId && (
        <>
          <Divider />

          <Box>
            <Typography
              variant="subtitle2"
              fontWeight={700}
            >
              Payment Details
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Gateway:{' '}
              {booking.paymentGateway ||
                'Razorpay'}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Order ID:{' '}
              {booking.razorpayOrderId}
            </Typography>

            {booking.razorpayPaymentId && (
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Payment ID:{' '}
                {booking.razorpayPaymentId}
              </Typography>
            )}
          </Box>
        </>
      )}

      {/* REVIEW */}

      {booking.reviewSubmitted && (
        <>
          <Divider />

          <Box>
            <Typography
              variant="subtitle2"
              fontWeight={700}
            >
              Customer Review
            </Typography>

            <Typography
              variant="body2"
              sx={{ mt: 0.5 }}
            >
              Rating:{' '}
              {booking.rating ?? '-'} / 5
            </Typography>

            {booking.review && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {booking.review}
              </Typography>
            )}

            {booking.reviewedAt && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: 'block',
                  mt: 1
                }}
              >
                Reviewed: {booking.reviewedAt}
              </Typography>
            )}
          </Box>
        </>
      )}
    </Stack>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function Bookings() {
  const [search, setSearch] =
    useState('');

  const [
    statusFilter,
    setStatusFilter
  ] = useState<
    'ALL' | BookingStatus
  >('ALL');

  const [
    paymentFilter,
    setPaymentFilter
  ] = useState<
    'ALL' | PaymentStatus
  >('ALL');

  const [page, setPage] =
    useState(0);

  const [
    rowsPerPage,
    setRowsPerPage
  ] = useState(10);

  const [
    selectedBooking,
    setSelectedBooking
  ] = useState<Booking | null>(
    null
  );

  const [
    snackbar,
    setSnackbar
  ] = useState({
    open: false,
    message: '',
    severity:
      'success' as
        | 'success'
        | 'error'
        | 'info'
        | 'warning'
  });

  // ============================================================
  // QUERY
  // ============================================================

  const {
    data,
    loading,
    error,
    refetch
  } = useQuery<{
    adminBookings: AdminBookingListResponse;
  }>(ADMIN_BOOKINGS, {
    variables: {
      search:
        search.trim() || null,

      bookingStatus:
        statusFilter === 'ALL'
          ? null
          : statusFilter,

      paymentStatus:
        paymentFilter === 'ALL'
          ? null
          : paymentFilter,

      salonId: null
    },

    fetchPolicy:
      'cache-and-network'
  });

  const bookings =
    data?.adminBookings
      ?.bookings ?? [];

  const totalCount =
    data?.adminBookings
      ?.totalCount ??
    bookings.length;

  // ============================================================
  // MUTATION
  // ============================================================

  const [
    updateBookingStatus,
    {
      loading: updatingStatus
    }
  ] = useMutation(
    UPDATE_BOOKING_STATUS
  );

  // ============================================================
  // STATISTICS
  // ============================================================

  const statistics =
    useMemo(() => {
      const total =
        bookings.length;

      const pending =
        bookings.filter(
          (booking) =>
            booking.bookingStatus ===
            'PENDING'
        ).length;

      const confirmed =
        bookings.filter(
          (booking) =>
            booking.bookingStatus ===
            'CONFIRMED'
        ).length;

      const completed =
        bookings.filter(
          (booking) =>
            booking.bookingStatus ===
            'COMPLETED'
        ).length;

      const cancelled =
        bookings.filter(
          (booking) =>
            booking.bookingStatus ===
            'CANCELLED'
        ).length;

      const revenue =
        bookings
          .filter(
            (booking) =>
              booking.bookingStatus ===
              'COMPLETED'
          )
          .reduce(
            (sum, booking) =>
              sum +
              Number(
                booking.totalAmount ||
                  0
              ),
            0
          );

      return {
        total,
        pending,
        confirmed,
        completed,
        cancelled,
        revenue
      };
    }, [bookings]);

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleStatusChange = (
    event: SelectChangeEvent
  ) => {
    setStatusFilter(
      event.target.value as
        | 'ALL'
        | BookingStatus
    );

    setPage(0);
  };

  const handlePaymentChange = (
    event: SelectChangeEvent
  ) => {
    setPaymentFilter(
      event.target.value as
        | 'ALL'
        | PaymentStatus
    );

    setPage(0);
  };

  const handleRowsPerPageChange = (
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

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearch(
      event.target.value
    );

    setPage(0);
  };

  // ============================================================
  // UPDATE BOOKING STATUS
  // ============================================================

  const handleUpdateStatus =
    async (
      bookingStatus: BookingStatus
    ) => {
      if (!selectedBooking) {
        return;
      }

      try {
        const result =
          await updateBookingStatus({
            variables: {
              input: {
                bookingId:
                  selectedBooking.bookingId,

                bookingStatus,

                salonNote:
                  selectedBooking.salonNote ||
                  null
              }
            }
          });

        const response =
          result.data
            ?.updateBookingStatus;

        if (!response?.success) {
          throw new Error(
            response?.message ||
              'Failed to update booking status.'
          );
        }

        setSnackbar({
          open: true,
          message:
            response.message ||
            'Booking status updated successfully.',
          severity: 'success'
        });

        if (response.booking) {
          setSelectedBooking(
            response.booking
          );
        }

        await refetch();
      } catch (
        mutationError
      ) {
        setSnackbar({
          open: true,
          message:
            mutationError instanceof
            Error
              ? mutationError.message
              : 'Failed to update booking status.',
          severity: 'error'
        });
      }
    };

  // ============================================================
  // PAGINATION
  // ============================================================

  const paginatedBookings =
    useMemo(() => {
      return bookings.slice(
        page * rowsPerPage,
        page * rowsPerPage +
          rowsPerPage
      );
    }, [
      bookings,
      page,
      rowsPerPage
    ]);

  // ============================================================
  // LOADING
  // ============================================================

  if (loading && !data) {
    return (
      <Box
        sx={{
          minHeight: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent:
            'center'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <Box>
        <Alert severity="error">
          Failed to load bookings:{' '}
          {error.message}
        </Alert>
      </Box>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <Box>
      {/* PAGE HEADER */}

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
            fontWeight={700}
          >
            Bookings
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Monitor and manage all
            salon appointments
            across Clavata.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={
            <CalendarOutlined />
          }
          onClick={() =>
            refetch()
          }
          disabled={loading}
        >
          Refresh
        </Button>
      </Stack>

      {/* STATISTICS */}

      <Grid
        container
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Grid
          item
          xs={12}
          sm={6}
          md={4}
          lg={2.4}
        >
          <StatCard
            title="Total Bookings"
            value={String(
              statistics.total
            )}
            description="All bookings"
            icon={
              <CalendarOutlined />
            }
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          md={4}
          lg={2.4}
        >
          <StatCard
            title="Pending"
            value={String(
              statistics.pending
            )}
            description="Awaiting confirmation"
            icon={
              <ClockCircleOutlined />
            }
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          md={4}
          lg={2.4}
        >
          <StatCard
            title="Confirmed"
            value={String(
              statistics.confirmed
            )}
            description="Upcoming appointments"
            icon={
              <CheckCircleOutlined />
            }
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          md={4}
          lg={2.4}
        >
          <StatCard
            title="Completed"
            value={String(
              statistics.completed
            )}
            description="Successfully completed"
            icon={
              <CheckCircleOutlined />
            }
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          md={4}
          lg={2.4}
        >
          <StatCard
            title="Revenue"
            value={formatCurrency(
              statistics.revenue
            )}
            description="From completed bookings"
            icon={
              <DollarOutlined />
            }
          />
        </Grid>
      </Grid>

      {/* MAIN TABLE */}

      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2
        }}
      >
        {/* FILTERS */}

        <Box sx={{ p: 2.5 }}>
          <Stack
            direction={{
              xs: 'column',
              md: 'row'
            }}
            spacing={2}
            justifyContent="space-between"
          >
            <TextField
              fullWidth
              placeholder="Search booking, customer, salon or staff..."
              value={search}
              onChange={
                handleSearchChange
              }
              sx={{
                maxWidth: 450
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined />
                  </InputAdornment>
                )
              }}
            />

            <Stack
              direction={{
                xs: 'column',
                sm: 'row'
              }}
              spacing={2}
            >
              <Select
                size="small"
                value={
                  statusFilter
                }
                onChange={
                  handleStatusChange
                }
                sx={{
                  minWidth: 160
                }}
              >
                <MenuItem value="ALL">
                  All Status
                </MenuItem>

                <MenuItem value="PENDING">
                  Pending
                </MenuItem>

                <MenuItem value="CONFIRMED">
                  Confirmed
                </MenuItem>

                <MenuItem value="COMPLETED">
                  Completed
                </MenuItem>

                <MenuItem value="CANCELLED">
                  Cancelled
                </MenuItem>

                <MenuItem value="NO_SHOW">
                  No Show
                </MenuItem>
              </Select>

              <Select
                size="small"
                value={
                  paymentFilter
                }
                onChange={
                  handlePaymentChange
                }
                sx={{
                  minWidth: 160
                }}
              >
                <MenuItem value="ALL">
                  All Payments
                </MenuItem>

                <MenuItem value="PENDING">
                  Pending
                </MenuItem>

                <MenuItem value="PARTIALLY_PAID">
                  Partially Paid
                </MenuItem>

                <MenuItem value="PAID">
                  Paid
                </MenuItem>

                <MenuItem value="FAILED">
                  Failed
                </MenuItem>

                <MenuItem value="REFUNDED">
                  Refunded
                </MenuItem>
              </Select>
            </Stack>
          </Stack>
        </Box>

        <Divider />

        {/* TABLE */}

        <TableContainer
          sx={{
            overflowX: 'auto'
          }}
        >
          <Table
            sx={{
              minWidth: 1200
            }}
          >
            <TableHead>
              <TableRow>
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
                  Date & Time
                </TableCell>

                <TableCell>
                  Staff
                </TableCell>

                <TableCell>
                  Amount
                </TableCell>

                <TableCell>
                  Payment
                </TableCell>

                <TableCell>
                  Status
                </TableCell>

                <TableCell align="right">
                  Action
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedBookings.map(
                (booking) => (
                  <TableRow
                    key={
                      booking.bookingId
                    }
                    hover
                    sx={{
                      cursor:
                        'pointer'
                    }}
                    onClick={() =>
                      setSelectedBooking(
                        booking
                      )
                    }
                  >
                    {/* BOOKING */}

                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                      >
                        {
                          booking.bookingId
                        }
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {
                          booking
                            .services
                            .length
                        }{' '}
                        {booking
                          .services
                          .length ===
                        1
                          ? 'service'
                          : 'services'}
                      </Typography>
                    </TableCell>

                    {/* CUSTOMER */}

                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={1.2}
                        alignItems="center"
                      >
                        <Box
                          sx={{
                            width: 34,
                            height: 34,
                            borderRadius:
                              '50%',
                            display:
                              'flex',
                            alignItems:
                              'center',
                            justifyContent:
                              'center',
                            bgcolor:
                              'primary.lighter',
                            color:
                              'primary.main'
                          }}
                        >
                          <UserOutlined />
                        </Box>

                        <Box>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                          >
                            {
                              booking.customerName
                            }
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {
                              booking.customerPhone
                            }
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    {/* SALON */}

                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                      >
                        {
                          booking.salonName
                        }
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {
                          booking.salonId
                        }
                      </Typography>
                    </TableCell>

                    {/* DATE */}

                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                      >
                        {
                          booking.bookingDate
                        }
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {
                          booking.startTime
                        }{' '}
                        -{' '}
                        {
                          booking.endTime
                        }
                      </Typography>
                    </TableCell>

                    {/* STAFF */}

                    <TableCell>
                      <Typography variant="body2">
                        {
                          booking.staffName ||
                          'Unassigned'
                        }
                      </Typography>
                    </TableCell>

                    {/* AMOUNT */}

                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                      >
                        {formatCurrency(
                          booking.totalAmount
                        )}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Fee:{' '}
                        {formatCurrency(
                          booking.bookingFee
                        )}
                      </Typography>
                    </TableCell>

                    {/* PAYMENT */}

                    <TableCell>
                      <Chip
                        size="small"
                        label={formatStatus(
                          booking.paymentStatus
                        )}
                        color={getPaymentColor(
                          booking.paymentStatus
                        )}
                        variant="outlined"
                      />
                    </TableCell>

                    {/* STATUS */}

                    <TableCell>
                      <Chip
                        size="small"
                        label={formatStatus(
                          booking.bookingStatus
                        )}
                        color={getStatusColor(
                          booking.bookingStatus
                        )}
                      />
                    </TableCell>

                    {/* ACTION */}

                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={(
                          event
                        ) => {
                          event.stopPropagation();

                          setSelectedBooking(
                            booking
                          );
                        }}
                      >
                        <EyeOutlined />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )
              )}

              {paginatedBookings.length ===
                0 && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                  >
                    <Box
                      sx={{
                        py: 7,
                        textAlign:
                          'center'
                      }}
                    >
                      <CloseCircleOutlined
                        style={{
                          fontSize: 32,
                          opacity: 0.4
                        }}
                      />

                      <Typography
                        variant="h6"
                        color="text.secondary"
                        sx={{
                          mt: 1
                        }}
                      >
                        No bookings
                        found
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        There are no
                        bookings
                        matching the
                        current
                        filters.
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
          count={totalCount}
          page={page}
          onPageChange={(
            _,
            newPage
          ) =>
            setPage(newPage)
          }
          rowsPerPage={
            rowsPerPage
          }
          onRowsPerPageChange={
            handleRowsPerPageChange
          }
          rowsPerPageOptions={[
            5,
            10,
            25,
            50
          ]}
        />
      </Paper>

      {/* BOOKING DETAILS DIALOG */}

      <Dialog
        open={Boolean(
          selectedBooking
        )}
        onClose={() =>
          setSelectedBooking(
            null
          )
        }
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h5"
                fontWeight={700}
              >
                Booking Details
              </Typography>

              {selectedBooking && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {
                    selectedBooking.bookingId
                  }
                </Typography>
              )}
            </Box>

            {selectedBooking && (
              <Chip
                label={formatStatus(
                  selectedBooking.bookingStatus
                )}
                color={getStatusColor(
                  selectedBooking.bookingStatus
                )}
              />
            )}
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          {selectedBooking && (
            <BookingDetails
              booking={
                selectedBooking
              }
            />
          )}
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
            gap: 1
          }}
        >
          <Button
            onClick={() =>
              setSelectedBooking(
                null
              )
            }
          >
            Close
          </Button>

          {/* PENDING -> CONFIRMED */}

          {selectedBooking
            ?.bookingStatus ===
            'PENDING' && (
            <Button
              variant="contained"
              disabled={
                updatingStatus
              }
              onClick={() =>
                handleUpdateStatus(
                  'CONFIRMED'
                )
              }
            >
              {updatingStatus
                ? 'Confirming...'
                : 'Confirm Booking'}
            </Button>
          )}

          {/* CONFIRMED -> CANCELLED / COMPLETED */}

          {selectedBooking
            ?.bookingStatus ===
            'CONFIRMED' && (
            <>
              <Button
                variant="outlined"
                color="error"
                disabled={
                  updatingStatus
                }
                onClick={() =>
                  handleUpdateStatus(
                    'CANCELLED'
                  )
                }
              >
                Cancel
              </Button>

              <Button
                variant="contained"
                disabled={
                  updatingStatus
                }
                onClick={() =>
                  handleUpdateStatus(
                    'COMPLETED'
                  )
                }
              >
                {updatingStatus
                  ? 'Completing...'
                  : 'Complete'}
              </Button>
            </>
          )}

          {/* COMPLETED */}

          {selectedBooking
            ?.bookingStatus ===
            'COMPLETED' &&
            !selectedBooking.reviewSubmitted && (
              <Chip
                label="Awaiting Customer Review"
                variant="outlined"
              />
            )}
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() =>
          setSnackbar(
            (
              previous
            ) => ({
              ...previous,
              open: false
            })
          )
        }
      >
        <Alert
          severity={
            snackbar.severity
          }
          onClose={() =>
            setSnackbar(
              (
                previous
              ) => ({
                ...previous,
                open: false
              })
            )
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}