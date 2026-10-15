import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';

import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  TextField,
  Typography
} from '@mui/material';

import {
  EyeOutlined,
  SearchOutlined,
  ShopOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  UserOutlined
} from '@ant-design/icons';

import {
  ADMIN_SALONS,
  ADMIN_PROVIDERS
} from '../../graphql/queries';

// ============================================================
// TYPES
// ============================================================

type KycStatus =
  | 'NOT_SUBMITTED'
  | 'SUBMITTED'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'REJECTED';

type SalonStatus =
  | 'OPEN'
  | 'CLOSED'
  | 'TEMPORARILY_CLOSED';

type ProviderStatus =
  | 'NOT_REGISTERED'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED';

type TabValue = 0 | 1;

interface SalonAddress {
  addressLine?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
}

interface Salon {
  salonId: string;
  ownerUserId: string;
  salonName: string;
  ownerName: string;
  ownerPhoneNumber: string;
  alternatePhone?: string | null;
  email: string;
  address?: SalonAddress | null;

  latitude?: number | null;
  longitude?: number | null;

  gstNumber?: string | null;
  panNumber?: string | null;
  aadhaarNumber?: string | null;

  logoUrl?: string | null;
  coverImageUrl?: string | null;
  galleryImages?: string[];

  kycStatus: KycStatus;
  salonStatus: SalonStatus;

  isActive: boolean;
  isVisible: boolean;
  isDeleted: boolean;

  averageRating: number;
  totalReviews: number;
  totalAppointments: number;
  totalCompletedAppointments: number;
  totalCancelledAppointments: number;
  totalRevenue: number;

  approvedBy?: string | null;
  approvedAt?: string | null;
  rejectedBy?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;

  lastUpdatedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AdminProvider {
  userId: string;
  fullName?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  role?: string | null;
  providerStatus: ProviderStatus;
  salonId?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface AdminSalonsResponse {
  adminSalons: {
    success: boolean;
    message: string;
    totalCount: number;
    salons: Salon[];
  };
}

interface AdminProvidersResponse {
  adminProviders: {
    success: boolean;
    message: string;
    totalCount: number;
    providers: AdminProvider[];
  };
}

interface AdminSalonsVariables {
  search?: string | null;
  kycStatus?: KycStatus | null;
  salonStatus?: SalonStatus | null;
  isActive?: boolean | null;
}

interface AdminProvidersVariables {
  search?: string | null;
  providerStatus?: ProviderStatus | null;
}

// ============================================================
// HELPERS
// ============================================================

const formatDate = (date?: string | null) => {
  if (!date) return '—';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(parsedDate);
};

const formatCurrency = (value?: number | null) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value || 0);

const getInitials = (name?: string | null) => {
  if (!name?.trim()) return 'P';

  return name
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

const formatNumber = (value?: number | null) =>
  Number(value || 0).toLocaleString('en-IN');

// ============================================================
// STATUS CHIPS
// ============================================================

function KycChip({ status }: { status?: KycStatus | null }) {
  switch (status) {
    case 'NOT_SUBMITTED':
      return (
        <Chip label="Not Submitted" size="small" variant="outlined" />
      );

    case 'SUBMITTED':
      return (
        <Chip
          icon={<ClockCircleOutlined />}
          label="Submitted"
          size="small"
          color="warning"
          variant="outlined"
        />
      );

    case 'IN_REVIEW':
      return (
        <Chip
          icon={<ClockCircleOutlined />}
          label="In Review"
          size="small"
          color="info"
          variant="outlined"
        />
      );

    case 'APPROVED':
      return (
        <Chip
          icon={<CheckCircleOutlined />}
          label="Approved"
          size="small"
          color="success"
          variant="outlined"
        />
      );

    case 'REJECTED':
      return (
        <Chip
          icon={<CloseCircleOutlined />}
          label="Rejected"
          size="small"
          color="error"
          variant="outlined"
        />
      );

    default:
      return (
        <Chip label="Unknown" size="small" variant="outlined" />
      );
  }
}

function SalonStatusChip({
  status
}: {
  status?: SalonStatus | null;
}) {
  switch (status) {
    case 'OPEN':
      return <Chip label="Open" size="small" color="success" />;

    case 'TEMPORARILY_CLOSED':
      return (
        <Chip
          label="Temporarily Closed"
          size="small"
          color="warning"
        />
      );

    default:
      return <Chip label="Closed" size="small" />;
  }
}

function ProviderStatusChip({
  status
}: {
  status?: ProviderStatus | null;
}) {
  switch (status) {
    case 'APPROVED':
      return (
        <Chip
          label="Approved"
          color="success"
          size="small"
          variant="outlined"
        />
      );

    case 'PENDING':
      return (
        <Chip
          label="Pending"
          color="warning"
          size="small"
          variant="outlined"
        />
      );

    case 'REJECTED':
      return (
        <Chip
          label="Rejected"
          color="error"
          size="small"
          variant="outlined"
        />
      );

    case 'NOT_REGISTERED':
    default:
      return (
        <Chip
          label="Not Registered"
          color="default"
          size="small"
          variant="outlined"
        />
      );
  }
}

// ============================================================
// REUSABLE STAT CARD
// ============================================================

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = 'primary.main'
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
}) {
  return (
    <Paper
      sx={{
        p: 2.5,
        height: '100%',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>

          <Typography
            variant="h4"
            sx={{ mt: 1, fontWeight: 700 }}
          >
            {value}
          </Typography>

          {subtitle && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 0.5 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        <Avatar
          sx={{
            width: 46,
            height: 46,
            bgcolor: color,
            color: '#fff',
            flexShrink: 0
          }}
        >
          {icon}
        </Avatar>
      </Stack>
    </Paper>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function Salons() {
  // ----------------------------------------------------------
  // MAIN TAB
  // ----------------------------------------------------------

  const [activeTab, setActiveTab] = useState<TabValue>(0);

  // ----------------------------------------------------------
  // SALON FILTERS
  // ----------------------------------------------------------

  const [salonSearch, setSalonSearch] = useState('');

  const [kycFilter, setKycFilter] = useState<
    'ALL' | KycStatus
  >('ALL');

  const [salonStatusFilter, setSalonStatusFilter] = useState<
    'ALL' | SalonStatus
  >('ALL');

  const [activeFilter, setActiveFilter] = useState<
    'ALL' | 'ACTIVE' | 'INACTIVE'
  >('ALL');

  // ----------------------------------------------------------
  // PROVIDER FILTERS
  // ----------------------------------------------------------

  const [providerSearch, setProviderSearch] = useState('');

  // ----------------------------------------------------------
  // PAGINATION
  // ----------------------------------------------------------

  const [salonPage, setSalonPage] = useState(0);
  const [providerPage, setProviderPage] = useState(0);

  const [salonRowsPerPage, setSalonRowsPerPage] = useState(10);
  const [providerRowsPerPage, setProviderRowsPerPage] =
    useState(10);

  // ----------------------------------------------------------
  // SELECTED SALON
  // ----------------------------------------------------------

  const [selectedSalon, setSelectedSalon] =
    useState<Salon | null>(null);

  // ----------------------------------------------------------
  // SALON QUERY VARIABLES
  // ----------------------------------------------------------

  const salonVariables = useMemo<AdminSalonsVariables>(
    () => ({
      search: salonSearch.trim() || null,

      kycStatus:
        kycFilter === 'ALL' ? null : kycFilter,

      salonStatus:
        salonStatusFilter === 'ALL'
          ? null
          : salonStatusFilter,

      isActive:
        activeFilter === 'ALL'
          ? null
          : activeFilter === 'ACTIVE'
    }),
    [
      salonSearch,
      kycFilter,
      salonStatusFilter,
      activeFilter
    ]
  );

  // ----------------------------------------------------------
  // PROVIDER QUERY VARIABLES
  //
  // Only request NOT_REGISTERED providers on the second tab.
  // ----------------------------------------------------------

  const providerVariables = useMemo<AdminProvidersVariables>(
    () => ({
      search: providerSearch.trim() || null,
      providerStatus: 'NOT_REGISTERED'
    }),
    [providerSearch]
  );

  // ----------------------------------------------------------
  // REGISTERED SALONS QUERY
  // ----------------------------------------------------------

  const {
    data: salonData,
    loading: salonLoading,
    error: salonError,
    refetch: refetchSalons
  } = useQuery<
    AdminSalonsResponse,
    AdminSalonsVariables
  >(ADMIN_SALONS, {
    variables: salonVariables,
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    skip: activeTab !== 0
  });

  // ----------------------------------------------------------
  // NOT REGISTERED PROVIDERS QUERY
  // ----------------------------------------------------------

  const {
    data: providerData,
    loading: providerLoading,
    error: providerError,
    refetch: refetchProviders
  } = useQuery<
    AdminProvidersResponse,
    AdminProvidersVariables
  >(ADMIN_PROVIDERS, {
    variables: providerVariables,
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    skip: activeTab !== 1
  });

  // ----------------------------------------------------------
  // DATA
  // ----------------------------------------------------------

  const salons = salonData?.adminSalons?.salons || [];

  const providers = useMemo(
    () =>
      (providerData?.adminProviders?.providers || []).filter(
        (provider) =>
          provider.providerStatus === 'NOT_REGISTERED'
      ),
    [providerData]
  );

  const totalSalons =
    salonData?.adminSalons?.totalCount ?? salons.length;

  const totalUnregisteredProviders =
    providerData?.adminProviders?.totalCount ??
    providers.length;

  // ----------------------------------------------------------
  // STATS
  // ----------------------------------------------------------

  const approvedSalons = salons.filter(
    (salon) => salon.kycStatus === 'APPROVED'
  ).length;

const pendingSalons = salons.filter(
  (salon) =>
    salon.kycStatus === 'NOT_SUBMITTED' ||
    salon.kycStatus === 'SUBMITTED' ||
    salon.kycStatus === 'IN_REVIEW'
).length;

  const activeSalons = salons.filter(
    (salon) => salon.isActive
  ).length;

  // ----------------------------------------------------------
  // PAGINATION
  // ----------------------------------------------------------

  const paginatedSalons = salons.slice(
    salonPage * salonRowsPerPage,
    salonPage * salonRowsPerPage + salonRowsPerPage
  );

  const paginatedProviders = providers.slice(
    providerPage * providerRowsPerPage,
    providerPage * providerRowsPerPage + providerRowsPerPage
  );

  // ----------------------------------------------------------
  // RESET PAGINATION WHEN FILTERS CHANGE
  // ----------------------------------------------------------

  useEffect(() => {
    setSalonPage(0);
  }, [
    salonSearch,
    kycFilter,
    salonStatusFilter,
    activeFilter
  ]);

  useEffect(() => {
    setProviderPage(0);
  }, [providerSearch]);

  // ----------------------------------------------------------
  // KEEP SELECTED SALON UP TO DATE
  // ----------------------------------------------------------

  useEffect(() => {
    if (!selectedSalon) return;

    const updatedSalon = salons.find(
      (salon) => salon.salonId === selectedSalon.salonId
    );

    if (updatedSalon) {
      setSelectedSalon(updatedSalon);
    }
  }, [salons, selectedSalon?.salonId]);

  // ----------------------------------------------------------
  // REFRESH
  // ----------------------------------------------------------

  const handleRefresh = () => {
    if (activeTab === 0) {
      void refetchSalons(salonVariables);
    } else {
      void refetchProviders(providerVariables);
    }
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  const loading = activeTab === 0
    ? salonLoading
    : providerLoading;

  const error = activeTab === 0
    ? salonError
    : providerError;

  return (
    <Box>
      {/* HEADER */}

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Provider Management
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Manage registered salons and providers who
            have not completed salon registration.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={
            loading
              ? <CircularProgress size={16} />
              : <ReloadOutlined />
          }
          onClick={handleRefresh}
          disabled={loading}
        >
          Refresh
        </Button>
      </Stack>

      {/* TABS */}

      <Paper
        sx={{
          mb: 3,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, value: TabValue) => {
            setActiveTab(value);
            setSelectedSalon(null);
          }}
          variant="scrollable"
          allowScrollButtonsMobile
        >
          <Tab
            icon={<ShopOutlined />}
            iconPosition="start"
            label="Registered Salons"
          />

          <Tab
            icon={<UserOutlined />}
            iconPosition="start"
            label={
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <span>Not Registered Providers</span>

                {providerData?.adminProviders?.success && (
                  <Chip
                    label={totalUnregisteredProviders}
                    size="small"
                  />
                )}
              </Stack>
            }
          />
        </Tabs>
      </Paper>

      {/* ERROR */}

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={handleRefresh}
            >
              Retry
            </Button>
          }
        >
          {error.message || 'Unable to load data.'}
        </Alert>
      )}

      {/* API ERRORS */}

      {activeTab === 0 &&
        !salonLoading &&
        !salonError &&
        salonData?.adminSalons?.success === false && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {salonData.adminSalons.message ||
              'Failed to retrieve salons.'}
          </Alert>
        )}

      {activeTab === 1 &&
        !providerLoading &&
        !providerError &&
        providerData?.adminProviders?.success === false && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {providerData.adminProviders.message ||
              'Failed to retrieve providers.'}
          </Alert>
        )}

      {/* ======================================================
          REGISTERED SALONS
      ====================================================== */}

      {activeTab === 0 && (
        <>
          {/* SALON STATISTICS */}

          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Salons"
                value={salonLoading ? '—' : totalSalons}
                icon={<ShopOutlined />}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Approved"
                value={salonLoading ? '—' : approvedSalons}
                subtitle="KYC approved"
                icon={<CheckCircleOutlined />}
                color="success.main"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Pending KYC"
                value={salonLoading ? '—' : pendingSalons}
                subtitle="Requires verification"
                icon={<ClockCircleOutlined />}
                color="warning.main"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Active Salons"
                value={salonLoading ? '—' : activeSalons}
                subtitle="Currently active"
                icon={<CheckCircleOutlined />}
                color="info.main"
              />
            </Grid>
          </Grid>

          {/* SALON FILTERS */}

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
                  value={salonSearch}
                  onChange={(event) =>
                    setSalonSearch(event.target.value)
                  }
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
                    onChange={(event) =>
                      setKycFilter(
                        event.target.value as 'ALL' | KycStatus
                      )
                    }
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
                    value={salonStatusFilter}
                    label="Salon Status"
                    onChange={(event) =>
                      setSalonStatusFilter(
                        event.target.value as
                        | 'ALL'
                        | SalonStatus
                      )
                    }
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
                    onChange={(event) =>
                      setActiveFilter(
                        event.target.value as
                        | 'ALL'
                        | 'ACTIVE'
                        | 'INACTIVE'
                      )
                    }
                  >
                    <MenuItem value="ALL">All</MenuItem>
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="INACTIVE">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {/* SALON TABLE */}

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
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {salonLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                        <CircularProgress />

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 2 }}
                        >
                          Loading salons...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : paginatedSalons.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 7 }}>
                        <ShopOutlined />

                        <Typography variant="h6" sx={{ mt: 1 }}>
                          No salons found
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          Try changing your search or filters.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedSalons.map((salon) => (
                      <TableRow hover key={salon.salonId}>
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                          >
                            <Avatar
                              src={salon.logoUrl || undefined}
                              sx={{ bgcolor: 'primary.main' }}
                            >
                              {!salon.logoUrl &&
                                getInitials(salon.salonName)}
                            </Avatar>

                            <Box>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {salon.salonName || 'Unnamed Salon'}
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {salon.salonId}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {salon.ownerName || '—'}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {salon.ownerPhoneNumber || '—'}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            {salon.address?.city || '—'}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {salon.address?.state || '—'}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <KycChip status={salon.kycStatus} />
                        </TableCell>

                        <TableCell>
                          <Stack spacing={0.5} alignItems="flex-start">
                            <SalonStatusChip status={salon.salonStatus} />

                            {!salon.isActive && (
                              <Typography
                                variant="caption"
                                color="error.main"
                              >
                                Inactive
                              </Typography>
                            )}

                            {salon.isActive && !salon.isVisible && (
                              <Typography
                                variant="caption"
                                color="warning.main"
                              >
                                Hidden
                              </Typography>
                            )}
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            ⭐ {Number(salon.averageRating || 0).toFixed(1)}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {formatNumber(salon.totalReviews)} reviews
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {formatNumber(salon.totalAppointments)}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="success.main"
                          >
                            {formatNumber(
                              salon.totalCompletedAppointments
                            )}{' '}
                            completed
                          </Typography>

                          {Number(salon.totalCancelledAppointments || 0) > 0 && (
                            <Typography
                              variant="caption"
                              color="error.main"
                              sx={{ display: 'block' }}
                            >
                              {formatNumber(
                                salon.totalCancelledAppointments
                              )}{' '}
                              cancelled
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          {formatCurrency(salon.totalRevenue)}
                        </TableCell>

                        <TableCell align="right">
                          <IconButton
                            size="small"
                            title="View Salon"
                            onClick={() => setSelectedSalon(salon)}
                          >
                            <EyeOutlined />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {!salonLoading && salons.length > 0 && (
              <TablePagination
                component="div"
                count={salons.length}
                page={salonPage}
                onPageChange={(_, page) => setSalonPage(page)}
                rowsPerPage={salonRowsPerPage}
                onRowsPerPageChange={(event) => {
                  setSalonRowsPerPage(Number(event.target.value));
                  setSalonPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25]}
              />
            )}
          </Paper>

          {/* SALON DETAILS */}

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
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={2}
                sx={{ mb: 3 }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    src={selectedSalon.logoUrl || undefined}
                    sx={{ width: 56, height: 56 }}
                  >
                    {!selectedSalon.logoUrl &&
                      getInitials(selectedSalon.salonName)}
                  </Avatar>

                  <Box>
                    <Typography variant="h5" fontWeight={700}>
                      {selectedSalon.salonName}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {selectedSalon.salonId}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Registered {formatDate(selectedSalon.createdAt)}
                    </Typography>
                  </Box>
                </Stack>

                <Button
                  variant="outlined"
                  onClick={() => setSelectedSalon(null)}
                >
                  Close Details
                </Button>
              </Stack>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Owner
                  </Typography>

                  <Typography sx={{ mt: 0.5 }} fontWeight={600}>
                    {selectedSalon.ownerName || '—'}
                  </Typography>

                  <Typography variant="body2">
                    {selectedSalon.ownerPhoneNumber || '—'}
                  </Typography>

                  {selectedSalon.alternatePhone && (
                    <Typography variant="body2">
                      Alternate: {selectedSalon.alternatePhone}
                    </Typography>
                  )}

                  <Typography variant="body2">
                    {selectedSalon.email || '—'}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 1 }}
                  >
                    Owner User ID: {selectedSalon.ownerUserId || '—'}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Address
                  </Typography>

                  <Typography sx={{ mt: 0.5 }}>
                    {selectedSalon.address?.addressLine || '—'}
                  </Typography>

                  <Typography variant="body2">
                    {[
                      selectedSalon.address?.city,
                      selectedSalon.address?.state,
                      selectedSalon.address?.pincode
                    ].filter(Boolean).join(', ') || '—'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    KYC Status
                  </Typography>

                  <Box sx={{ mt: 1 }}>
                    <KycChip status={selectedSalon.kycStatus} />
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Salon Status
                  </Typography>

                  <Box sx={{ mt: 1 }}>
                    <SalonStatusChip status={selectedSalon.salonStatus} />
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Account
                  </Typography>

                  <Box sx={{ mt: 1 }}>
                    <Chip
                      label={selectedSalon.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      color={selectedSalon.isActive ? 'success' : 'error'}
                      variant="outlined"
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Customer Visibility
                  </Typography>

                  <Box sx={{ mt: 1 }}>
                    <Chip
                      label={selectedSalon.isVisible ? 'Visible' : 'Hidden'}
                      size="small"
                      color={selectedSalon.isVisible ? 'success' : 'warning'}
                      variant="outlined"
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Rating
                  </Typography>

                  <Typography variant="h6" sx={{ mt: 0.5 }}>
                    ⭐ {Number(selectedSalon.averageRating || 0).toFixed(1)}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    {formatNumber(selectedSalon.totalReviews)} reviews
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Appointments
                  </Typography>

                  <Typography variant="h6" sx={{ mt: 0.5 }}>
                    {formatNumber(selectedSalon.totalAppointments)}
                  </Typography>

                  <Typography variant="caption" color="success.main">
                    {formatNumber(selectedSalon.totalCompletedAppointments)}
                    {' '}completed
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Cancelled Appointments
                  </Typography>

                  <Typography variant="h6" sx={{ mt: 0.5 }}>
                    {formatNumber(selectedSalon.totalCancelledAppointments)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Revenue
                  </Typography>

                  <Typography variant="h6" sx={{ mt: 0.5 }}>
                    {formatCurrency(selectedSalon.totalRevenue)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    GST Number
                  </Typography>

                  <Typography sx={{ mt: 0.5 }}>
                    {selectedSalon.gstNumber || 'Not provided'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    PAN Number
                  </Typography>

                  <Typography sx={{ mt: 0.5 }}>
                    {selectedSalon.panNumber || 'Not provided'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Aadhaar Number
                  </Typography>

                  <Typography sx={{ mt: 0.5 }}>
                    {selectedSalon.aadhaarNumber || 'Not provided'}
                  </Typography>
                </Grid>

                {selectedSalon.approvedAt && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Approved
                    </Typography>

                    <Typography sx={{ mt: 0.5 }}>
                      {formatDate(selectedSalon.approvedAt)}
                    </Typography>

                    {selectedSalon.approvedBy && (
                      <Typography variant="caption" color="text.secondary">
                        By {selectedSalon.approvedBy}
                      </Typography>
                    )}
                  </Grid>
                )}

                {selectedSalon.rejectedAt && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Rejected
                    </Typography>

                    <Typography sx={{ mt: 0.5 }}>
                      {formatDate(selectedSalon.rejectedAt)}
                    </Typography>

                    {selectedSalon.rejectionReason && (
                      <Typography
                        variant="body2"
                        color="error.main"
                        sx={{ mt: 0.5 }}
                      >
                        {selectedSalon.rejectionReason}
                      </Typography>
                    )}
                  </Grid>
                )}

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created At
                  </Typography>

                  <Typography sx={{ mt: 0.5 }}>
                    {formatDate(selectedSalon.createdAt)}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Last Updated
                  </Typography>

                  <Typography sx={{ mt: 0.5 }}>
                    {formatDate(selectedSalon.updatedAt)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          )}
        </>
      )}

      {/* ======================================================
          NOT REGISTERED PROVIDERS
      ====================================================== */}

      {activeTab === 1 && (
        <>
          {/* PROVIDER STATISTICS */}

          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Not Registered Providers"
                value={providerLoading
                  ? '—'
                  : totalUnregisteredProviders}
                subtitle="Provider accounts without completed registration"
                icon={<UserOutlined />}
                color="warning.main"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Registration Status"
                value="Not Registered"
                subtitle="Salon registration not completed"
                icon={<ClockCircleOutlined />}
                color="info.main"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Current Results"
                value={providerLoading ? '—' : providers.length}
                subtitle="Providers returned by the current query"
                icon={<UserOutlined />}
              />
            </Grid>
          </Grid>

          {/* PROVIDER SEARCH */}

          <Paper
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <TextField
              fullWidth
              size="small"
              value={providerSearch}
              onChange={(event) =>
                setProviderSearch(event.target.value)
              }
              placeholder="Search provider name, phone, email or user ID..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined />
                  </InputAdornment>
                )
              }}
            />

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 1 }}
            >
              Only provider accounts with status NOT_REGISTERED are shown.
            </Typography>
          </Paper>

          {/* PROVIDERS TABLE */}

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
                    <TableCell>Provider</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Provider User ID</TableCell>
                    <TableCell>Registration Status</TableCell>
                    <TableCell>Account Created</TableCell>
                    <TableCell>Last Updated</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {providerLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        align="center"
                        sx={{ py: 8 }}
                      >
                        <CircularProgress />

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 2 }}
                        >
                          Loading providers...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : providers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        align="center"
                        sx={{ py: 8 }}
                      >
                        <Avatar
                          sx={{
                            width: 56,
                            height: 56,
                            mx: 'auto',
                            bgcolor: 'action.hover',
                            color: 'text.secondary'
                          }}
                        >
                          <UserOutlined />
                        </Avatar>

                        <Typography variant="h6" sx={{ mt: 2 }}>
                          No unregistered providers found
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          {providerSearch.trim()
                            ? 'Try another search term.'
                            : 'All returned provider accounts have completed registration, or no matching accounts were found.'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedProviders.map((provider) => (
                      <TableRow
                        hover
                        key={provider.userId}
                      >
                        {/* PROVIDER */}

                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                          >
                            <Avatar
                              sx={{
                                width: 42,
                                height: 42,
                                bgcolor: 'primary.main'
                              }}
                            >
                              {getInitials(provider.fullName)}
                            </Avatar>

                            <Box>
                              <Typography
                                variant="subtitle2"
                                fontWeight={600}
                              >
                                {provider.fullName || 'Unnamed Provider'}
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {/* {provider.role || 'PROVIDER'} */}
                                Provider account
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        {/* CONTACT */}

                        <TableCell>
                          <Typography variant="body2">
                            {provider.phoneNumber || 'No phone number'}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {provider.email || 'No email'}
                          </Typography>
                        </TableCell>

                        {/* USER ID */}

                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: 'monospace',
                              overflowWrap: 'anywhere'
                            }}
                          >
                            {provider.userId}
                          </Typography>
                        </TableCell>

                        {/* STATUS */}

                        <TableCell>
                          <Stack spacing={0.75} alignItems="flex-start">
                            <ProviderStatusChip
                              status={provider.providerStatus}
                            />

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Salon profile not registered
                            </Typography>
                          </Stack>
                        </TableCell>

                        {/* CREATED */}

                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(provider.createdAt)}
                          </Typography>
                        </TableCell>

                        {/* UPDATED */}

                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(provider.updatedAt)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {!providerLoading && providers.length > 0 && (
              <TablePagination
                component="div"
                count={providers.length}
                page={providerPage}
                onPageChange={(_, page) => setProviderPage(page)}
                rowsPerPage={providerRowsPerPage}
                onRowsPerPageChange={(event) => {
                  setProviderRowsPerPage(
                    Number(event.target.value)
                  );
                  setProviderPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25]}
              />
            )}
          </Paper>
        </>
      )}
    </Box>
  );
}