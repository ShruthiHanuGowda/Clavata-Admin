import { useMemo, useState } from 'react';

// material-ui
import {
  Box,
  Button,
  Chip,
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

// ==============================|| TYPES ||============================== //

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

type PaymentStatus = 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'FAILED' | 'REFUNDED';

type PaymentMethod = 'PAY_AT_SALON' | 'ONLINE';

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
  salonName: string;

  customerUserId: string;
  customerName: string;
  customerPhone: string;

  bookingDate: string;
  startTime: string;
  endTime: string;

  staffId?: string;
  staffName?: string;

  services: BookingService[];

  totalDuration: number;
  subtotal: number;
  discount: number;
  totalAmount: number;

  bookingFee: number;
  remainingAmount: number;

  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  bookingFeeStatus: PaymentStatus;

  bookingStatus: BookingStatus;

  notes?: string;
  salonNote?: string;

  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentGateway?: string;

  reviewSubmitted?: boolean;
  rating?: number;
}

// ==============================|| STATIC DATA ||============================== //

const bookings: Booking[] = [
  {
    bookingId: 'BK-10001',
    salonId: 'SALON-001',
    salonName: 'Glow Beauty Studio',

    customerUserId: 'USR-001',
    customerName: 'Ananya Sharma',
    customerPhone: '+91 9876543210',

    bookingDate: '2026-08-30',
    startTime: '10:00 AM',
    endTime: '11:30 AM',

    staffId: 'STF-001',
    staffName: 'Priya',

    services: [
      {
        serviceId: 'SRV-001',
        name: 'Hair Cut',
        category: 'Hair',
        duration: 45,
        price: 500
      },
      {
        serviceId: 'SRV-002',
        name: 'Hair Spa',
        category: 'Hair',
        duration: 45,
        price: 800
      }
    ],

    totalDuration: 90,
    subtotal: 1300,
    discount: 100,
    totalAmount: 1200,

    bookingFee: 100,
    remainingAmount: 1100,

    paymentMethod: 'ONLINE',
    paymentStatus: 'PARTIALLY_PAID',
    bookingFeeStatus: 'PAID',

    bookingStatus: 'CONFIRMED',

    notes: 'Customer requested morning appointment.',

    razorpayOrderId: 'order_demo_10001',
    razorpayPaymentId: 'pay_demo_10001',
    paymentGateway: 'RAZORPAY',

    reviewSubmitted: false
  },

  {
    bookingId: 'BK-10002',
    salonId: 'SALON-002',
    salonName: 'Urban Glam Salon',

    customerUserId: 'USR-002',
    customerName: 'Rahul Kumar',
    customerPhone: '+91 9988776655',

    bookingDate: '2026-08-30',
    startTime: '12:00 PM',
    endTime: '01:00 PM',

    staffId: 'STF-004',
    staffName: 'Arjun',

    services: [
      {
        serviceId: 'SRV-005',
        name: 'Men Haircut',
        category: 'Hair',
        duration: 45,
        price: 400
      }
    ],

    totalDuration: 45,
    subtotal: 400,
    discount: 0,
    totalAmount: 400,

    bookingFee: 25,
    remainingAmount: 375,

    paymentMethod: 'PAY_AT_SALON',
    paymentStatus: 'PENDING',
    bookingFeeStatus: 'PENDING',

    bookingStatus: 'PENDING',

    reviewSubmitted: false
  },

  {
    bookingId: 'BK-10003',
    salonId: 'SALON-003',
    salonName: 'Luxe Hair & Spa',

    customerUserId: 'USR-003',
    customerName: 'Sneha Reddy',
    customerPhone: '+91 9123456789',

    bookingDate: '2026-08-29',
    startTime: '03:00 PM',
    endTime: '05:00 PM',

    staffId: 'STF-008',
    staffName: 'Meera',

    services: [
      {
        serviceId: 'SRV-010',
        name: 'Facial',
        category: 'Skin',
        duration: 60,
        price: 1200
      },
      {
        serviceId: 'SRV-011',
        name: 'Manicure',
        category: 'Nails',
        duration: 60,
        price: 700
      }
    ],

    totalDuration: 120,
    subtotal: 1900,
    discount: 200,
    totalAmount: 1700,

    bookingFee: 100,
    remainingAmount: 1600,

    paymentMethod: 'ONLINE',
    paymentStatus: 'PAID',
    bookingFeeStatus: 'PAID',

    bookingStatus: 'COMPLETED',

    reviewSubmitted: true,
    rating: 5
  },

  {
    bookingId: 'BK-10004',
    salonId: 'SALON-001',
    salonName: 'Glow Beauty Studio',

    customerUserId: 'USR-004',
    customerName: 'Pooja Rao',
    customerPhone: '+91 9000011111',

    bookingDate: '2026-08-28',
    startTime: '05:00 PM',
    endTime: '06:00 PM',

    staffId: 'STF-002',
    staffName: 'Kavya',

    services: [
      {
        serviceId: 'SRV-020',
        name: 'Hair Coloring',
        category: 'Hair',
        duration: 60,
        price: 1500
      }
    ],

    totalDuration: 60,
    subtotal: 1500,
    discount: 0,
    totalAmount: 1500,

    bookingFee: 100,
    remainingAmount: 1400,

    paymentMethod: 'ONLINE',
    paymentStatus: 'REFUNDED',
    bookingFeeStatus: 'REFUNDED',

    bookingStatus: 'CANCELLED',

    notes: 'Customer cancelled the appointment.'
  },

  {
    bookingId: 'BK-10005',
    salonId: 'SALON-004',
    salonName: 'Blush & Bloom',

    customerUserId: 'USR-005',
    customerName: 'Megha Patel',
    customerPhone: '+91 9555555555',

    bookingDate: '2026-08-27',
    startTime: '11:00 AM',
    endTime: '12:30 PM',

    staffId: 'STF-011',
    staffName: 'Aishwarya',

    services: [
      {
        serviceId: 'SRV-030',
        name: 'Bridal Makeup Trial',
        category: 'Makeup',
        duration: 90,
        price: 2500
      }
    ],

    totalDuration: 90,
    subtotal: 2500,
    discount: 250,
    totalAmount: 2250,

    bookingFee: 250,
    remainingAmount: 2000,

    paymentMethod: 'ONLINE',
    paymentStatus: 'PAID',
    bookingFeeStatus: 'PAID',

    bookingStatus: 'COMPLETED',

    reviewSubmitted: true,
    rating: 4.5
  },

  {
    bookingId: 'BK-10006',
    salonId: 'SALON-005',
    salonName: 'The Hair Lounge',

    customerUserId: 'USR-006',
    customerName: 'Vikram Singh',
    customerPhone: '+91 9444444444',

    bookingDate: '2026-08-31',
    startTime: '02:00 PM',
    endTime: '03:00 PM',

    staffId: 'STF-015',
    staffName: 'Rohit',

    services: [
      {
        serviceId: 'SRV-040',
        name: 'Beard Styling',
        category: 'Grooming',
        duration: 30,
        price: 300
      },
      {
        serviceId: 'SRV-041',
        name: 'Haircut',
        category: 'Hair',
        duration: 30,
        price: 500
      }
    ],

    totalDuration: 60,
    subtotal: 800,
    discount: 0,
    totalAmount: 800,

    bookingFee: 50,
    remainingAmount: 750,

    paymentMethod: 'PAY_AT_SALON',
    paymentStatus: 'PENDING',
    bookingFeeStatus: 'PENDING',

    bookingStatus: 'CONFIRMED'
  }
];

// ==============================|| HELPERS ||============================== //

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);

const getStatusColor = (
  status: BookingStatus
): 'default' | 'primary' | 'success' | 'warning' | 'error' => {
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
): 'default' | 'success' | 'warning' | 'error' => {
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

// ==============================|| STAT CARD ||============================== //

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}

function StatCard({ title, value, icon, description }: StatCardProps) {
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
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>

          <Typography variant="h4" sx={{ mt: 1, fontWeight: 700 }}>
            {value}
          </Typography>

          <Typography variant="caption" color="text.secondary">
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

// ==============================|| BOOKING DETAILS ||============================== //

interface BookingDetailsProps {
  booking: Booking;
}

function BookingDetails({ booking }: BookingDetailsProps) {
  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="subtitle1" fontWeight={700}>
          Booking Information
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {booking.bookingId}
        </Typography>
      </Box>

      <Divider />

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="caption" color="text.secondary">
            Customer
          </Typography>

          <Typography variant="body1" fontWeight={600}>
            {booking.customerName}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {booking.customerPhone}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="caption" color="text.secondary">
            Salon
          </Typography>

          <Typography variant="body1" fontWeight={600}>
            {booking.salonName}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="caption" color="text.secondary">
            Date
          </Typography>

          <Typography variant="body1" fontWeight={600}>
            {booking.bookingDate}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="caption" color="text.secondary">
            Time
          </Typography>

          <Typography variant="body1" fontWeight={600}>
            {booking.startTime} - {booking.endTime}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="caption" color="text.secondary">
            Staff
          </Typography>

          <Typography variant="body1" fontWeight={600}>
            {booking.staffName || 'Not assigned'}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Typography variant="caption" color="text.secondary">
            Payment Method
          </Typography>

          <Typography variant="body1" fontWeight={600}>
            {booking.paymentMethod === 'PAY_AT_SALON' ? 'Pay at Salon' : 'Online'}
          </Typography>
        </Grid>
      </Grid>

      <Divider />

      <Box>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
          Services
        </Typography>

        <Stack spacing={1}>
          {booking.services.map((service) => (
            <Box
              key={service.serviceId}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: 'background.default'
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {service.name}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  {service.category} • {service.duration} mins
                </Typography>
              </Box>

              <Typography variant="body2" fontWeight={600}>
                {formatCurrency(service.price)}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      <Divider />

      <Box>
        <Stack spacing={1}>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Subtotal</Typography>
            <Typography>{formatCurrency(booking.subtotal)}</Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Discount</Typography>
            <Typography>- {formatCurrency(booking.discount)}</Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Booking Fee</Typography>
            <Typography>{formatCurrency(booking.bookingFee)}</Typography>
          </Stack>

          <Divider />

          <Stack direction="row" justifyContent="space-between">
            <Typography fontWeight={700}>Total</Typography>
            <Typography fontWeight={700}>
              {formatCurrency(booking.totalAmount)}
            </Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Remaining at Salon</Typography>
            <Typography fontWeight={600}>
              {formatCurrency(booking.remainingAmount)}
            </Typography>
          </Stack>
        </Stack>
      </Box>

      {booking.notes && (
        <>
          <Divider />

          <Box>
            <Typography variant="subtitle2" fontWeight={700}>
              Customer Notes
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {booking.notes}
            </Typography>
          </Box>
        </>
      )}

      {booking.razorpayOrderId && (
        <>
          <Divider />

          <Box>
            <Typography variant="subtitle2" fontWeight={700}>
              Payment Details
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Gateway: {booking.paymentGateway || 'Razorpay'}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Order ID: {booking.razorpayOrderId}
            </Typography>

            {booking.razorpayPaymentId && (
              <Typography variant="body2" color="text.secondary">
                Payment ID: {booking.razorpayPaymentId}
              </Typography>
            )}
          </Box>
        </>
      )}
    </Stack>
  );
}

// ==============================|| MAIN COMPONENT ||============================== //

export default function Bookings() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | BookingStatus>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | PaymentStatus>('ALL');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // ==============================|| STATISTICS ||============================== //

  const statistics = useMemo(() => {
    const total = bookings.length;

    const pending = bookings.filter(
      (booking) => booking.bookingStatus === 'PENDING'
    ).length;

    const confirmed = bookings.filter(
      (booking) => booking.bookingStatus === 'CONFIRMED'
    ).length;

    const completed = bookings.filter(
      (booking) => booking.bookingStatus === 'COMPLETED'
    ).length;

    const cancelled = bookings.filter(
      (booking) => booking.bookingStatus === 'CANCELLED'
    ).length;

    const revenue = bookings
      .filter((booking) => booking.bookingStatus === 'COMPLETED')
      .reduce((sum, booking) => sum + booking.totalAmount, 0);

    return {
      total,
      pending,
      confirmed,
      completed,
      cancelled,
      revenue
    };
  }, []);

  // ==============================|| FILTER ||============================== //

  const filteredBookings = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesSearch =
        !searchValue ||
        booking.bookingId.toLowerCase().includes(searchValue) ||
        booking.customerName.toLowerCase().includes(searchValue) ||
        booking.customerPhone.toLowerCase().includes(searchValue) ||
        booking.salonName.toLowerCase().includes(searchValue) ||
        booking.staffName?.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === 'ALL' ||
        booking.bookingStatus === statusFilter;

      const matchesPayment =
        paymentFilter === 'ALL' ||
        booking.paymentStatus === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [search, statusFilter, paymentFilter]);

  // ==============================|| HANDLERS ||============================== //

  const handleStatusChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value as 'ALL' | BookingStatus);
    setPage(0);
  };

  const handlePaymentChange = (event: SelectChangeEvent) => {
    setPaymentFilter(event.target.value as 'ALL' | PaymentStatus);
    setPage(0);
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // ==============================|| RENDER ||============================== //

  return (
    <Box>
      {/* PAGE HEADER */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Bookings
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Monitor and manage all salon appointments across Clavata.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<CalendarOutlined />}
          onClick={() => {
            // Later this can open Create Booking.
            alert('Create Booking will be connected later.');
          }}
        >
          Create Booking
        </Button>
      </Stack>

      {/* STATISTICS */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <StatCard
            title="Total Bookings"
            value={String(statistics.total)}
            description="All bookings"
            icon={<CalendarOutlined />}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <StatCard
            title="Pending"
            value={String(statistics.pending)}
            description="Awaiting confirmation"
            icon={<ClockCircleOutlined />}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <StatCard
            title="Confirmed"
            value={String(statistics.confirmed)}
            description="Upcoming appointments"
            icon={<CheckCircleOutlined />}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <StatCard
            title="Completed"
            value={String(statistics.completed)}
            description="Successfully completed"
            icon={<CheckCircleOutlined />}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <StatCard
            title="Revenue"
            value={formatCurrency(statistics.revenue)}
            description="From completed bookings"
            icon={<DollarOutlined />}
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
        {/* FILTER HEADER */}
        <Box sx={{ p: 2.5 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            justifyContent="space-between"
          >
            <TextField
              fullWidth
              placeholder="Search booking, customer, salon or staff..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
              sx={{ maxWidth: 450 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined />
                  </InputAdornment>
                )
              }}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Select
                size="small"
                value={statusFilter}
                onChange={handleStatusChange}
                sx={{ minWidth: 160 }}
              >
                <MenuItem value="ALL">All Status</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
                <MenuItem value="NO_SHOW">No Show</MenuItem>
              </Select>

              <Select
                size="small"
                value={paymentFilter}
                onChange={handlePaymentChange}
                sx={{ minWidth: 160 }}
              >
                <MenuItem value="ALL">All Payments</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="PARTIALLY_PAID">
                  Partially Paid
                </MenuItem>
                <MenuItem value="PAID">Paid</MenuItem>
                <MenuItem value="FAILED">Failed</MenuItem>
                <MenuItem value="REFUNDED">Refunded</MenuItem>
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
                <TableCell>Booking</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Salon</TableCell>
                <TableCell>Date & Time</TableCell>
                <TableCell>Staff</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredBookings
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((booking) => (
                  <TableRow
                    key={booking.bookingId}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => setSelectedBooking(booking)}
                  >
                    {/* BOOKING */}
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {booking.bookingId}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {booking.services.length}{' '}
                        {booking.services.length === 1
                          ? 'service'
                          : 'services'}
                      </Typography>
                    </TableCell>

                    {/* CUSTOMER */}
                    <TableCell>
                      <Stack direction="row" spacing={1.2} alignItems="center">
                        <Box
                          sx={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'primary.lighter',
                            color: 'primary.main'
                          }}
                        >
                          <UserOutlined />
                        </Box>

                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {booking.customerName}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {booking.customerPhone}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    {/* SALON */}
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {booking.salonName}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {booking.salonId}
                      </Typography>
                    </TableCell>

                    {/* DATE */}
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {booking.bookingDate}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {booking.startTime} - {booking.endTime}
                      </Typography>
                    </TableCell>

                    {/* STAFF */}
                    <TableCell>
                      <Typography variant="body2">
                        {booking.staffName || 'Unassigned'}
                      </Typography>
                    </TableCell>

                    {/* AMOUNT */}
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {formatCurrency(booking.totalAmount)}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Fee: {formatCurrency(booking.bookingFee)}
                      </Typography>
                    </TableCell>

                    {/* PAYMENT */}
                    <TableCell>
                      <Chip
                        size="small"
                        label={booking.paymentStatus.replace('_', ' ')}
                        color={getPaymentColor(booking.paymentStatus)}
                        variant="outlined"
                      />
                    </TableCell>

                    {/* STATUS */}
                    <TableCell>
                      <Chip
                        size="small"
                        label={booking.bookingStatus.replace('_', ' ')}
                        color={getStatusColor(booking.bookingStatus)}
                      />
                    </TableCell>

                    {/* ACTION */}
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedBooking(booking);
                        }}
                      >
                        <EyeOutlined />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}

              {filteredBookings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9}>
                    <Box sx={{ py: 7, textAlign: 'center' }}>
                      <CloseCircleOutlined
                        style={{
                          fontSize: 32,
                          color: 'inherit',
                          opacity: 0.4
                        }}
                      />

                      <Typography
                        variant="h6"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        No bookings found
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
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
          count={filteredBookings.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      {/* BOOKING DETAILS DIALOG */}
      <Dialog
        open={Boolean(selectedBooking)}
        onClose={() => setSelectedBooking(null)}
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
              <Typography variant="h5" fontWeight={700}>
                Booking Details
              </Typography>

              {selectedBooking && (
                <Typography variant="body2" color="text.secondary">
                  {selectedBooking.bookingId}
                </Typography>
              )}
            </Box>

            {selectedBooking && (
              <Chip
                label={selectedBooking.bookingStatus.replace('_', ' ')}
                color={getStatusColor(selectedBooking.bookingStatus)}
              />
            )}
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          {selectedBooking && (
            <BookingDetails booking={selectedBooking} />
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSelectedBooking(null)}>
            Close
          </Button>

          {selectedBooking?.bookingStatus === 'PENDING' && (
            <Button
              variant="contained"
              onClick={() => {
                alert(
                  `Confirm booking ${selectedBooking.bookingId} later through GraphQL`
                );
              }}
            >
              Confirm Booking
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}