
import { useMemo, useState } from 'react';

// material-ui
import {
  Avatar,
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  IconButton,
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

// icons
import {
  EyeOutlined,
  SearchOutlined,
  ShopOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EditOutlined
} from '@ant-design/icons';

// ==============================|| TYPES ||============================== //

type KycStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
type SalonStatus = 'OPEN' | 'CLOSED' | 'TEMPORARILY_CLOSED';

interface Salon {
  salonId: string;
  salonName: string;
  ownerName: string;
  ownerPhoneNumber: string;
  email: string;
  businessType: string;

  address: {
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
  };

  kycStatus: KycStatus;
  salonStatus: SalonStatus;

  isActive: boolean;
  isVisible: boolean;

  averageRating: number;
  totalReviews: number;
  totalAppointments: number;
  totalCompletedAppointments: number;
  totalCancelledAppointments: number;
  totalRevenue: number;

  createdAt: string;
}

// ==============================|| STATIC DATA ||============================== //

const STATIC_SALONS: Salon[] = [
  {
    salonId: 'SALON001',
    salonName: 'Glow Beauty Studio',
    ownerName: 'Priya Sharma',
    ownerPhoneNumber: '+91 9876543210',
    email: 'priya@glowbeauty.com',
    businessType: 'Beauty Salon',
    address: {
      addressLine: '12, 5th Main Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560001'
    },
    kycStatus: 'APPROVED',
    salonStatus: 'OPEN',
    isActive: true,
    isVisible: true,
    averageRating: 4.8,
    totalReviews: 124,
    totalAppointments: 856,
    totalCompletedAppointments: 812,
    totalCancelledAppointments: 18,
    totalRevenue: 428500,
    createdAt: '2026-01-15'
  },
  {
    salonId: 'SALON002',
    salonName: 'Style Lounge',
    ownerName: 'Anitha Rao',
    ownerPhoneNumber: '+91 9988776655',
    email: 'anitha@stylelounge.com',
    businessType: 'Unisex Salon',
    address: {
      addressLine: '45, MG Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560025'
    },
    kycStatus: 'PENDING',
    salonStatus: 'CLOSED',
    isActive: true,
    isVisible: true,
    averageRating: 4.5,
    totalReviews: 58,
    totalAppointments: 324,
    totalCompletedAppointments: 298,
    totalCancelledAppointments: 11,
    totalRevenue: 186000,
    createdAt: '2026-02-20'
  },
  {
    salonId: 'SALON003',
    salonName: 'The Hair Company',
    ownerName: 'Rahul Kumar',
    ownerPhoneNumber: '+91 9123456789',
    email: 'rahul@haircompany.com',
    businessType: 'Hair Salon',
    address: {
      addressLine: '78, Indiranagar 100 Feet Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038'
    },
    kycStatus: 'APPROVED',
    salonStatus: 'OPEN',
    isActive: true,
    isVisible: true,
    averageRating: 4.7,
    totalReviews: 91,
    totalAppointments: 612,
    totalCompletedAppointments: 575,
    totalCancelledAppointments: 15,
    totalRevenue: 312500,
    createdAt: '2026-03-05'
  },
  {
    salonId: 'SALON004',
    salonName: 'Beauty Bliss',
    ownerName: 'Kavya Reddy',
    ownerPhoneNumber: '+91 9012345678',
    email: 'kavya@beautybliss.com',
    businessType: 'Beauty Salon',
    address: {
      addressLine: '23, Koramangala 5th Block',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560034'
    },
    kycStatus: 'REJECTED',
    salonStatus: 'CLOSED',
    isActive: false,
    isVisible: false,
    averageRating: 4.2,
    totalReviews: 32,
    totalAppointments: 156,
    totalCompletedAppointments: 132,
    totalCancelledAppointments: 17,
    totalRevenue: 72500,
    createdAt: '2026-03-18'
  },
  {
    salonId: 'SALON005',
    salonName: 'Urban Cuts',
    ownerName: 'Vikram Singh',
    ownerPhoneNumber: '+91 9345678901',
    email: 'vikram@urbancuts.com',
    businessType: 'Unisex Salon',
    address: {
      addressLine: '101, HSR Layout',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560102'
    },
    kycStatus: 'APPROVED',
    salonStatus: 'OPEN',
    isActive: true,
    isVisible: true,
    averageRating: 4.6,
    totalReviews: 76,
    totalAppointments: 483,
    totalCompletedAppointments: 451,
    totalCancelledAppointments: 14,
    totalRevenue: 245000,
    createdAt: '2026-04-01'
  },
  {
    salonId: 'SALON006',
    salonName: 'Naturals Beauty Care',
    ownerName: 'Sneha Nair',
    ownerPhoneNumber: '+91 9456789012',
    email: 'sneha@naturals.com',
    businessType: 'Beauty Salon',
    address: {
      addressLine: '16, Whitefield Main Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560066'
    },
    kycStatus: 'PENDING',
    salonStatus: 'TEMPORARILY_CLOSED',
    isActive: true,
    isVisible: true,
    averageRating: 4.4,
    totalReviews: 44,
    totalAppointments: 215,
    totalCompletedAppointments: 193,
    totalCancelledAppointments: 9,
    totalRevenue: 118500,
    createdAt: '2026-04-12'
  },
  {
    salonId: 'SALON007',
    salonName: 'Elite Hair & Spa',
    ownerName: 'Arjun Menon',
    ownerPhoneNumber: '+91 9567890123',
    email: 'arjun@elitehair.com',
    businessType: 'Hair & Spa',
    address: {
      addressLine: '9, Jayanagar 4th Block',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560011'
    },
    kycStatus: 'APPROVED',
    salonStatus: 'OPEN',
    isActive: true,
    isVisible: true,
    averageRating: 4.9,
    totalReviews: 188,
    totalAppointments: 1024,
    totalCompletedAppointments: 978,
    totalCancelledAppointments: 21,
    totalRevenue: 584000,
    createdAt: '2026-05-03'
  },
  {
    salonId: 'SALON008',
    salonName: 'Mirror Mirror Salon',
    ownerName: 'Divya Patel',
    ownerPhoneNumber: '+91 9678901234',
    email: 'divya@mirrormirror.com',
    businessType: 'Unisex Salon',
    address: {
      addressLine: '33, Banashankari 2nd Stage',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560070'
    },
    kycStatus: 'APPROVED',
    salonStatus: 'OPEN',
    isActive: false,
    isVisible: true,
    averageRating: 4.3,
    totalReviews: 63,
    totalAppointments: 291,
    totalCompletedAppointments: 268,
    totalCancelledAppointments: 12,
    totalRevenue: 154000,
    createdAt: '2026-05-20'
  }
];

// ==============================|| HELPERS ||============================== //

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

// ==============================|| KYC CHIP ||============================== //

function KycChip({ status }: { status: KycStatus }) {
  if (status === 'APPROVED') {
    return (
      <Chip
        icon={<CheckCircleOutlined />}
        label="Approved"
        size="small"
        color="success"
        variant="outlined"
      />
    );
  }

  if (status === 'REJECTED') {
    return (
      <Chip
        icon={<CloseCircleOutlined />}
        label="Rejected"
        size="small"
        color="error"
        variant="outlined"
      />
    );
  }

  return (
    <Chip
      icon={<ClockCircleOutlined />}
      label="Pending"
      size="small"
      color="warning"
      variant="outlined"
    />
  );
}

// ==============================|| STATUS CHIP ||============================== //

function StatusChip({ status }: { status: SalonStatus }) {
  switch (status) {
    case 'OPEN':
      return <Chip label="Open" size="small" color="success" />;

    case 'TEMPORARILY_CLOSED':
      return <Chip label="Temporarily Closed" size="small" color="warning" />;

    case 'CLOSED':
    default:
      return <Chip label="Closed" size="small" color="default" />;
  }
}

// ==============================|| PAGE ||============================== //

export default function Salons() {
  const [search, setSearch] = useState('');
  const [kycFilter, setKycFilter] = useState<'ALL' | KycStatus>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | SalonStatus>('ALL');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);

  // ==============================|| FILTER ||============================== //

  const filteredSalons = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return STATIC_SALONS.filter((salon) => {
      const matchesSearch =
        !searchValue ||
        salon.salonName.toLowerCase().includes(searchValue) ||
        salon.ownerName.toLowerCase().includes(searchValue) ||
        salon.email.toLowerCase().includes(searchValue) ||
        salon.ownerPhoneNumber.includes(searchValue) ||
        salon.address.city.toLowerCase().includes(searchValue);

      const matchesKyc =
        kycFilter === 'ALL' ||
        salon.kycStatus === kycFilter;

      const matchesStatus =
        statusFilter === 'ALL' ||
        salon.salonStatus === statusFilter;

      const matchesActive =
        activeFilter === 'ALL' ||
        (activeFilter === 'ACTIVE' && salon.isActive) ||
        (activeFilter === 'INACTIVE' && !salon.isActive);

      return (
        matchesSearch &&
        matchesKyc &&
        matchesStatus &&
        matchesActive
      );
    });
  }, [search, kycFilter, statusFilter, activeFilter]);

  const paginatedSalons = filteredSalons.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // ==============================|| STATS ||============================== //

  const totalSalons = STATIC_SALONS.length;

  const approvedSalons = STATIC_SALONS.filter(
    (salon) => salon.kycStatus === 'APPROVED'
  ).length;

  const pendingSalons = STATIC_SALONS.filter(
    (salon) => salon.kycStatus === 'PENDING'
  ).length;

  const activeSalons = STATIC_SALONS.filter(
    (salon) => salon.isActive
  ).length;

  // ==============================|| HANDLERS ||============================== //

  const handleKycChange = (
    event: SelectChangeEvent<'ALL' | KycStatus>
  ) => {
    setKycFilter(event.target.value as 'ALL' | KycStatus);
    setPage(0);
  };

  const handleStatusChange = (
    event: SelectChangeEvent<'ALL' | SalonStatus>
  ) => {
    setStatusFilter(event.target.value as 'ALL' | SalonStatus);
    setPage(0);
  };

  const handleActiveChange = (
    event: SelectChangeEvent<'ALL' | 'ACTIVE' | 'INACTIVE'>
  ) => {
    setActiveFilter(
      event.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE'
    );
    setPage(0);
  };

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
            Salons
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Manage registered salons, owners, KYC status and salon activity.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<ShopOutlined />}
          onClick={() => {
            // Later this can open Create Salon.
            alert('Create Salon will be connected to the backend later.');
          }}
        >
          Add Salon
        </Button>
      </Stack>

      {/* ============================== STAT CARDS ============================== */}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Total Salons
                </Typography>

                <Typography
                  variant="h3"
                  sx={{ mt: 1, fontWeight: 600 }}
                >
                  {totalSalons}
                </Typography>
              </Box>

              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: 'primary.lighter',
                  color: 'primary.main'
                }}
              >
                <ShopOutlined />
              </Avatar>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Approved
            </Typography>

            <Typography
              variant="h3"
              sx={{ mt: 1, fontWeight: 600 }}
            >
              {approvedSalons}
            </Typography>

            <Typography
              variant="caption"
              color="success.main"
            >
              KYC approved
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Pending KYC
            </Typography>

            <Typography
              variant="h3"
              sx={{ mt: 1, fontWeight: 600 }}
            >
              {pendingSalons}
            </Typography>

            <Typography
              variant="caption"
              color="warning.main"
            >
              Requires verification
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Active Salons
            </Typography>

            <Typography
              variant="h3"
              sx={{ mt: 1, fontWeight: 600 }}
            >
              {activeSalons}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
            >
              Currently active
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* ============================== FILTERS ============================== */}

      <Paper
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              size="small"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
              placeholder="Search salon, owner, phone, email or city..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined />
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4} md={2.3}>
            <FormControl fullWidth size="small">
              <InputLabel>KYC Status</InputLabel>

              <Select
                value={kycFilter}
                label="KYC Status"
                onChange={handleKycChange}
              >
                <MenuItem value="ALL">All KYC</MenuItem>
                <MenuItem value="APPROVED">Approved</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="REJECTED">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4} md={2.3}>
            <FormControl fullWidth size="small">
              <InputLabel>Salon Status</InputLabel>

              <Select
                value={statusFilter}
                label="Salon Status"
                onChange={handleStatusChange}
              >
                <MenuItem value="ALL">All Status</MenuItem>
                <MenuItem value="OPEN">Open</MenuItem>
                <MenuItem value="CLOSED">Closed</MenuItem>
                <MenuItem value="TEMPORARILY_CLOSED">
                  Temporarily Closed
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4} md={2.4}>
            <FormControl fullWidth size="small">
              <InputLabel>Activity</InputLabel>

              <Select
                value={activeFilter}
                label="Activity"
                onChange={handleActiveChange}
              >
                <MenuItem value="ALL">All</MenuItem>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* ============================== TABLE ============================== */}

      <Paper
        sx={{
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden'
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Salon</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>KYC</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Appointments</TableCell>
                <TableCell>Revenue</TableCell>
                <TableCell align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedSalons.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    align="center"
                    sx={{ py: 8 }}
                  >
                    <Typography
                      variant="h6"
                      color="text.secondary"
                    >
                      No salons found
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Try changing your search or filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSalons.map((salon) => (
                  <TableRow
                    key={salon.salonId}
                    hover
                    sx={{
                      '&:last-child td, &:last-child th': {
                        border: 0
                      }
                    }}
                  >
                    {/* SALON */}

                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                      >
                        <Avatar
                          sx={{
                            bgcolor: 'primary.main',
                            width: 40,
                            height: 40,
                            fontSize: 14
                          }}
                        >
                          {getInitials(salon.salonName)}
                        </Avatar>

                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600 }}
                          >
                            {salon.salonName}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {salon.businessType}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    {/* OWNER */}

                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500 }}
                      >
                        {salon.ownerName}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {salon.ownerPhoneNumber}
                      </Typography>
                    </TableCell>

                    {/* LOCATION */}

                    <TableCell>
                      <Typography variant="body2">
                        {salon.address.city}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {salon.address.state}
                      </Typography>
                    </TableCell>

                    {/* KYC */}

                    <TableCell>
                      <KycChip status={salon.kycStatus} />
                    </TableCell>

                    {/* STATUS */}

                    <TableCell>
                      <StatusChip status={salon.salonStatus} />

                      {!salon.isActive && (
                        <Typography
                          variant="caption"
                          color="error.main"
                          sx={{
                            display: 'block',
                            mt: 0.5
                          }}
                        >
                          Account inactive
                        </Typography>
                      )}
                    </TableCell>

                    {/* RATING */}

                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600 }}
                      >
                        ⭐ {salon.averageRating.toFixed(1)}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {salon.totalReviews} reviews
                      </Typography>
                    </TableCell>

                    {/* APPOINTMENTS */}

                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600 }}
                      >
                        {salon.totalAppointments.toLocaleString(
                          'en-IN'
                        )}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="success.main"
                      >
                        {salon.totalCompletedAppointments}{' '}
                        completed
                      </Typography>
                    </TableCell>

                    {/* REVENUE */}

                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600 }}
                      >
                        {formatCurrency(
                          salon.totalRevenue
                        )}
                      </Typography>
                    </TableCell>

                    {/* ACTIONS */}

                    <TableCell align="right">
                      <Stack
                        direction="row"
                        justifyContent="flex-end"
                      >
                        <IconButton
                          size="small"
                          title="View Salon"
                          onClick={() =>
                            setSelectedSalon(salon)
                          }
                        >
                          <EyeOutlined />
                        </IconButton>

                        <IconButton
                          size="small"
                          title="Edit Salon"
                          onClick={() =>
                            alert(
                              `Edit ${salon.salonName} - backend will be connected later.`
                            )
                          }
                        >
                          <EditOutlined />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredSalons.length}
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
      </Paper>

      {/* ============================== SALON DETAILS ============================== */}

      {selectedSalon && (
        <Paper
          sx={{
            mt: 3,
            p: 3,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            sx={{ mb: 3 }}
          >
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
            >
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: 'primary.main'
                }}
              >
                {getInitials(
                  selectedSalon.salonName
                )}
              </Avatar>

              <Box>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 600 }}
                >
                  {selectedSalon.salonName}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {selectedSalon.salonId}
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="outlined"
              onClick={() => setSelectedSalon(null)}
            >
              Close
            </Button>
          </Stack>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
              >
                Owner
              </Typography>

              <Typography
                variant="body1"
                sx={{ mt: 0.5, fontWeight: 600 }}
              >
                {selectedSalon.ownerName}
              </Typography>

              <Typography variant="body2">
                {selectedSalon.ownerPhoneNumber}
              </Typography>

              <Typography variant="body2">
                {selectedSalon.email}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
              >
                Address
              </Typography>

              <Typography
                variant="body1"
                sx={{ mt: 0.5 }}
              >
                {selectedSalon.address.addressLine}
              </Typography>

              <Typography variant="body2">
                {selectedSalon.address.city},{' '}
                {selectedSalon.address.state} -{' '}
                {selectedSalon.address.pincode}
              </Typography>
            </Grid>

            <Grid item xs={12} md={3}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
              >
                KYC
              </Typography>

              <Box sx={{ mt: 1 }}>
                <KycChip
                  status={selectedSalon.kycStatus}
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={3}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
              >
                Salon Status
              </Typography>

              <Box sx={{ mt: 1 }}>
                <StatusChip
                  status={
                    selectedSalon.salonStatus
                  }
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={3}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
              >
                Rating
              </Typography>

              <Typography
                variant="h6"
                sx={{ mt: 0.5 }}
              >
                ⭐{' '}
                {selectedSalon.averageRating.toFixed(
                  1
                )}
              </Typography>
            </Grid>

            <Grid item xs={12} md={3}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
              >
                Revenue
              </Typography>

              <Typography
                variant="h6"
                sx={{ mt: 0.5 }}
              >
                {formatCurrency(
                  selectedSalon.totalRevenue
                )}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
}

