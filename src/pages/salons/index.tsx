
import { useEffect, useState } from 'react';

// Apollo
import { useQuery } from '@apollo/client';

// Material UI
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

// Ant Design Icons
import {
  EyeOutlined,
  SearchOutlined,
  ShopOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';

// IMPORTANT:
// Change this import path to wherever your ADMIN_SALONS query is located.
import { ADMIN_SALONS } from '../../graphql/queries';

// ==============================|| TYPES ||============================== //

type KycStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

type SalonStatus =
  | 'OPEN'
  | 'CLOSED'
  | 'TEMPORARILY_CLOSED';

interface SalonAddress {
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
}

interface Salon {
  salonId: string;
  ownerUserId: string;
  salonName: string;
  ownerName: string;
  businessType: string;
  ownerPhoneNumber: string;
  alternatePhone?: string | null;
  email: string;

  address: SalonAddress;

  latitude?: number | null;
  longitude?: number | null;

  gstNumber?: string | null;
  panNumber?: string | null;
  aadhaarNumber?: string | null;

  bankAccount?: string | null;
  ifsc?: string | null;
  accountHolderName?: string | null;

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

interface AdminSalonsResponse {
  adminSalons: {
    success: boolean;
    message: string;
    totalCount: number;
    salons: Salon[];
  };
}

interface AdminSalonsVariables {
  search?: string | null;
  kycStatus?: KycStatus | null;
  salonStatus?: SalonStatus | null;
  isActive?: boolean | null;
}

// ==============================|| HELPERS ||============================== //

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value || 0);
};

const getInitials = (name: string) => {
  if (!name) {
    return 'S';
  }

  return name
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

const formatDate = (date?: string | null) => {
  if (!date) {
    return '—';
  }

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

// ==============================|| KYC CHIP ||============================== //

function KycChip({
  status
}: {
  status: KycStatus;
}) {
  switch (status) {
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

    case 'PENDING':
    default:
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
}

// ==============================|| STATUS CHIP ||============================== //

function StatusChip({
  status
}: {
  status: SalonStatus;
}) {
  switch (status) {
    case 'OPEN':
      return (
        <Chip
          label="Open"
          size="small"
          color="success"
        />
      );

    case 'TEMPORARILY_CLOSED':
      return (
        <Chip
          label="Temporarily Closed"
          size="small"
          color="warning"
        />
      );

    case 'CLOSED':
    default:
      return (
        <Chip
          label="Closed"
          size="small"
          color="default"
        />
      );
  }
}

// ==============================|| PAGE ||============================== //

export default function Salons() {
  // ============================================================
  // FILTER STATE
  // ============================================================

  const [search, setSearch] = useState('');

  const [kycFilter, setKycFilter] = useState<
    'ALL' | KycStatus
  >('ALL');

  const [statusFilter, setStatusFilter] = useState<
    'ALL' | SalonStatus
  >('ALL');

  const [activeFilter, setActiveFilter] = useState<
    'ALL' | 'ACTIVE' | 'INACTIVE'
  >('ALL');

  // ============================================================
  // PAGINATION
  // ============================================================

  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ============================================================
  // SELECTED SALON
  // ============================================================

  const [selectedSalon, setSelectedSalon] =
    useState<Salon | null>(null);

  // ============================================================
  // GRAPHQL VARIABLES
  // ============================================================

  const queryVariables: AdminSalonsVariables = {
    search: search.trim() || null,

    kycStatus:
      kycFilter === 'ALL'
        ? null
        : kycFilter,

    salonStatus:
      statusFilter === 'ALL'
        ? null
        : statusFilter,

    isActive:
      activeFilter === 'ALL'
        ? null
        : activeFilter === 'ACTIVE'
  };

  // ============================================================
  // GRAPHQL QUERY
  // ============================================================

  const {
    data,
    loading,
    error,
    refetch
  } = useQuery<
    AdminSalonsResponse,
    AdminSalonsVariables
  >(ADMIN_SALONS, {
    variables: queryVariables,

    fetchPolicy: 'network-only',

    notifyOnNetworkStatusChange: true
  });

  // ============================================================
  // SALONS FROM API
  // ============================================================

  const salons: Salon[] =
    data?.adminSalons?.salons || [];

  const totalCount =
    data?.adminSalons?.totalCount || 0;

  // ============================================================
  // RESET PAGINATION WHEN FILTER CHANGES
  // ============================================================

  useEffect(() => {
    setPage(0);
  }, [
    search,
    kycFilter,
    statusFilter,
    activeFilter
  ]);

  // ============================================================
  // RESET SELECTED SALON IF DATA CHANGES
  // ============================================================

  useEffect(() => {
    if (!selectedSalon) {
      return;
    }

    const updatedSalon = salons.find(
      (salon) =>
        salon.salonId === selectedSalon.salonId
    );

    if (updatedSalon) {
      setSelectedSalon(updatedSalon);
    }
  }, [salons]);

  // ============================================================
  // FRONTEND PAGINATION
  //
  // Backend currently returns all matching salons.
  // Therefore pagination is handled here.
  // ============================================================

  const paginatedSalons = salons.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // ============================================================
  // STATS
  //
  // These are based on the salons returned by the API.
  // ============================================================

  const totalSalons = salons.length;

  const approvedSalons = salons.filter(
    (salon) =>
      salon.kycStatus === 'APPROVED'
  ).length;

  const pendingSalons = salons.filter(
    (salon) =>
      salon.kycStatus === 'PENDING'
  ).length;

  const activeSalons = salons.filter(
    (salon) =>
      salon.isActive === true
  ).length;

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleKycChange = (
    event: SelectChangeEvent<
      'ALL' | KycStatus
    >
  ) => {
    setKycFilter(
      event.target.value as
        | 'ALL'
        | KycStatus
    );
  };

  const handleStatusChange = (
    event: SelectChangeEvent<
      'ALL' | SalonStatus
    >
  ) => {
    setStatusFilter(
      event.target.value as
        | 'ALL'
        | SalonStatus
    );
  };

  const handleActiveChange = (
    event: SelectChangeEvent<
      'ALL' | 'ACTIVE' | 'INACTIVE'
    >
  ) => {
    setActiveFilter(
      event.target.value as
        | 'ALL'
        | 'ACTIVE'
        | 'INACTIVE'
    );
  };

  const handleRefresh = () => {
    refetch(queryVariables);
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <Box>
      {/* ======================================================
          HEADER
      ====================================================== */}

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
          {/* <Typography
            variant="h4"
            sx={{ fontWeight: 600 }}
          >
            Salons
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Manage registered salons, owners,
            KYC status and salon activity.
          </Typography> */}
        </Box>

        <Stack
          direction="row"
          spacing={1}
        >
          <Button
            variant="outlined"
            startIcon={
              loading ? (
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

          <Button
            variant="contained"
            startIcon={<ShopOutlined />}
            onClick={() => {
              /*
               * Add Salon functionality can be connected
               * to your CREATE_SALON mutation later.
               */
            }}
          >
            Add Salon
          </Button>
        </Stack>
      </Stack>

      {/* ======================================================
          ERROR
      ====================================================== */}

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
          {error.message ||
            'Failed to load salons.'}
        </Alert>
      )}

      {/* ======================================================
          API BUSINESS ERROR
      ====================================================== */}

      {!loading &&
        !error &&
        data?.adminSalons &&
        !data.adminSalons.success && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
          >
            {data.adminSalons.message ||
              'Failed to retrieve salons.'}
          </Alert>
        )}

      {/* ======================================================
          STAT CARDS
      ====================================================== */}

      <Grid
        container
        spacing={2.5}
        sx={{ mb: 3 }}
      >
        {/* TOTAL */}

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
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
                  sx={{
                    mt: 1,
                    fontWeight: 600
                  }}
                >
                  {loading
                    ? '—'
                    : totalSalons}
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

        {/* APPROVED */}

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
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
              sx={{
                mt: 1,
                fontWeight: 600
              }}
            >
              {loading
                ? '—'
                : approvedSalons}
            </Typography>

            <Typography
              variant="caption"
              color="success.main"
            >
              KYC approved
            </Typography>
          </Paper>
        </Grid>

        {/* PENDING */}

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
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
              sx={{
                mt: 1,
                fontWeight: 600
              }}
            >
              {loading
                ? '—'
                : pendingSalons}
            </Typography>

            <Typography
              variant="caption"
              color="warning.main"
            >
              Requires verification
            </Typography>
          </Paper>
        </Grid>

        {/* ACTIVE */}

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
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
              sx={{
                mt: 1,
                fontWeight: 600
              }}
            >
              {loading
                ? '—'
                : activeSalons}
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

      {/* ======================================================
          FILTERS
      ====================================================== */}

      <Paper
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Grid
          container
          spacing={2}
        >
          {/* SEARCH */}

          <Grid
            item
            xs={12}
            md={5}
          >
            <TextField
              fullWidth
              size="small"
              value={search}
              onChange={(event) => {
                setSearch(
                  event.target.value
                );
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

          {/* KYC */}

          <Grid
            item
            xs={12}
            sm={4}
            md={2.3}
          >
            <FormControl
              fullWidth
              size="small"
            >
              <InputLabel>
                KYC Status
              </InputLabel>

              <Select
                value={kycFilter}
                label="KYC Status"
                onChange={
                  handleKycChange
                }
              >
                <MenuItem value="ALL">
                  All KYC
                </MenuItem>

                <MenuItem value="APPROVED">
                  Approved
                </MenuItem>

                <MenuItem value="PENDING">
                  Pending
                </MenuItem>

                <MenuItem value="REJECTED">
                  Rejected
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* SALON STATUS */}

          <Grid
            item
            xs={12}
            sm={4}
            md={2.3}
          >
            <FormControl
              fullWidth
              size="small"
            >
              <InputLabel>
                Salon Status
              </InputLabel>

              <Select
                value={statusFilter}
                label="Salon Status"
                onChange={
                  handleStatusChange
                }
              >
                <MenuItem value="ALL">
                  All Status
                </MenuItem>

                <MenuItem value="OPEN">
                  Open
                </MenuItem>

                <MenuItem value="CLOSED">
                  Closed
                </MenuItem>

                <MenuItem value="TEMPORARILY_CLOSED">
                  Temporarily Closed
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* ACTIVE */}

          <Grid
            item
            xs={12}
            sm={4}
            md={2.4}
          >
            <FormControl
              fullWidth
              size="small"
            >
              <InputLabel>
                Activity
              </InputLabel>

              <Select
                value={activeFilter}
                label="Activity"
                onChange={
                  handleActiveChange
                }
              >
                <MenuItem value="ALL">
                  All
                </MenuItem>

                <MenuItem value="ACTIVE">
                  Active
                </MenuItem>

                <MenuItem value="INACTIVE">
                  Inactive
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* ======================================================
          TABLE
      ====================================================== */}

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
                <TableCell>
                  Salon
                </TableCell>

                <TableCell>
                  Owner
                </TableCell>

                <TableCell>
                  Location
                </TableCell>

                <TableCell>
                  KYC
                </TableCell>

                <TableCell>
                  Status
                </TableCell>

                <TableCell>
                  Rating
                </TableCell>

                <TableCell>
                  Appointments
                </TableCell>

                <TableCell>
                  Revenue
                </TableCell>

                <TableCell align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {/* LOADING */}

              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    align="center"
                    sx={{ py: 8 }}
                  >
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
              ) : paginatedSalons.length ===
                0 ? (
                /* EMPTY */

                <TableRow>
                  <TableCell
                    colSpan={9}
                    align="center"
                    sx={{ py: 8 }}
                  >
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        mx: 'auto',
                        mb: 2,
                        bgcolor:
                          'action.hover',
                        color:
                          'text.secondary'
                      }}
                    >
                      <ShopOutlined />
                    </Avatar>

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
                      Try changing your
                      search or filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                /* DATA */

                paginatedSalons.map(
                  (salon) => (
                    <TableRow
                      key={
                        salon.salonId
                      }
                      hover
                      sx={{
                        '&:last-child td, &:last-child th':
                          {
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
                            src={
                              salon.logoUrl ||
                              undefined
                            }
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor:
                                'primary.main',
                              fontSize: 14
                            }}
                          >
                            {!salon.logoUrl &&
                              getInitials(
                                salon.salonName
                              )}
                          </Avatar>

                          <Box>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 600
                              }}
                            >
                              {salon.salonName ||
                                'Unnamed Salon'}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {salon.businessType ||
                                '—'}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      {/* OWNER */}

                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500
                          }}
                        >
                          {salon.ownerName ||
                            '—'}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {salon.ownerPhoneNumber ||
                            '—'}
                        </Typography>
                      </TableCell>

                      {/* LOCATION */}

                      <TableCell>
                        <Typography
                          variant="body2"
                        >
                          {salon.address
                            ?.city ||
                            '—'}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {salon.address
                            ?.state ||
                            '—'}
                        </Typography>

                        {salon.address
                          ?.pincode && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display:
                                'block'
                            }}
                          >
                            {
                              salon.address
                                .pincode
                            }
                          </Typography>
                        )}
                      </TableCell>

                      {/* KYC */}

                      <TableCell>
                        <KycChip
                          status={
                            salon.kycStatus
                          }
                        />
                      </TableCell>

                      {/* STATUS */}

                      <TableCell>
                        <StatusChip
                          status={
                            salon.salonStatus
                          }
                        />

                        {!salon.isActive && (
                          <Typography
                            variant="caption"
                            color="error.main"
                            sx={{
                              display:
                                'block',
                              mt: 0.5
                            }}
                          >
                            Account inactive
                          </Typography>
                        )}

                        {salon.isActive &&
                          !salon.isVisible && (
                            <Typography
                              variant="caption"
                              color="warning.main"
                              sx={{
                                display:
                                  'block',
                                mt: 0.5
                              }}
                            >
                              Hidden from
                              customers
                            </Typography>
                          )}
                      </TableCell>

                      {/* RATING */}

                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600
                          }}
                        >
                          ⭐{' '}
                          {Number(
                            salon.averageRating ||
                              0
                          ).toFixed(1)}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {Number(
                            salon.totalReviews ||
                              0
                          ).toLocaleString(
                            'en-IN'
                          )}{' '}
                          reviews
                        </Typography>
                      </TableCell>

                      {/* APPOINTMENTS */}

                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600
                          }}
                        >
                          {Number(
                            salon.totalAppointments ||
                              0
                          ).toLocaleString(
                            'en-IN'
                          )}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="success.main"
                        >
                          {Number(
                            salon.totalCompletedAppointments ||
                              0
                          ).toLocaleString(
                            'en-IN'
                          )}{' '}
                          completed
                        </Typography>

                        {Number(
                          salon.totalCancelledAppointments ||
                            0
                        ) > 0 && (
                          <Typography
                            variant="caption"
                            color="error.main"
                            sx={{
                              display:
                                'block'
                            }}
                          >
                            {Number(
                              salon.totalCancelledAppointments ||
                                0
                            ).toLocaleString(
                              'en-IN'
                            )}{' '}
                            cancelled
                          </Typography>
                        )}
                      </TableCell>

                      {/* REVENUE */}

                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600
                          }}
                        >
                          {formatCurrency(
                            Number(
                              salon.totalRevenue ||
                                0
                            )
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
                              setSelectedSalon(
                                salon
                              )
                            }
                          >
                            <EyeOutlined />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* PAGINATION */}

        {!loading &&
          salons.length > 0 && (
            <TablePagination
              component="div"
              count={salons.length}
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
              onRowsPerPageChange={(
                event
              ) => {
                setRowsPerPage(
                  parseInt(
                    event.target.value,
                    10
                  )
                );

                setPage(0);
              }}
              rowsPerPageOptions={[
                5,
                10,
                25
              ]}
            />
          )}
      </Paper>

      {/* ======================================================
          SALON DETAILS
      ====================================================== */}

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
          {/* DETAIL HEADER */}

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
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
            >
              <Avatar
                src={
                  selectedSalon.logoUrl ||
                  undefined
                }
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor:
                    'primary.main'
                }}
              >
                {!selectedSalon.logoUrl &&
                  getInitials(
                    selectedSalon.salonName
                  )}
              </Avatar>

              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600
                  }}
                >
                  {
                    selectedSalon.salonName
                  }
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {
                    selectedSalon.salonId
                  }
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Registered{' '}
                  {formatDate(
                    selectedSalon.createdAt
                  )}
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="outlined"
              onClick={() =>
                setSelectedSalon(
                  null
                )
              }
            >
              Close
            </Button>
          </Stack>

          <Grid
            container
            spacing={3}
          >
            {/* OWNER */}

            <Grid
              item
              xs={12}
              md={6}
            >
              <Typography
                variant="subtitle2"
                color="text.secondary"
              >
                Owner
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  mt: 0.5,
                  fontWeight: 600
                }}
              >
                {
                  selectedSalon.ownerName
                }
              </Typography>

              <Typography variant="body2">
                {
                  selectedSalon.ownerPhoneNumber
                }
              </Typography>

              {selectedSalon.alternatePhone && (
                <Typography variant="body2">
                  {
                    selectedSalon.alternatePhone
                  }
                </Typography>
              )}

              <Typography variant="body2">
                {
                  selectedSalon.email
                }
              </Typography>
            </Grid>

            {/* ADDRESS */}

            <Grid
              item
              xs={12}
              md={6}
            >
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
                {
                  selectedSalon.address
                    ?.addressLine
                }
              </Typography>

              <Typography variant="body2">
                {
                  selectedSalon.address
                    ?.city
                }
                ,{' '}
                {
                  selectedSalon.address
                    ?.state
                }{' '}
                -{' '}
                {
                  selectedSalon.address
                    ?.pincode
                }
              </Typography>
            </Grid>

            {/* KYC */}

            <Grid
              item
              xs={12}
              sm={6}
              md={3}
            >
              <Typography
                variant="subtitle2"
                color="text.secondary"
              >
                KYC
              </Typography>

              <Box sx={{ mt: 1 }}>
                <KycChip
                  status={
                    selectedSalon.kycStatus
                  }
                />
              </Box>
            </Grid>

            {/* STATUS */}

            <Grid
              item
              xs={12}
              sm={6}
              md={3}
            >
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

            {/* ACTIVE */}

            <Grid
              item
              xs={12}
              sm={6}
              md={3}
            >
              <Typography
                variant="subtitle2"
                color="text.secondary"
              >
                Account
              </Typography>

              <Box sx={{ mt: 1 }}>
                <Chip
                  label={
                    selectedSalon.isActive
                      ? 'Active'
                      : 'Inactive'
                  }
                  size="small"
                  color={
                    selectedSalon.isActive
                      ? 'success'
                      : 'error'
                  }
                  variant="outlined"
                />
              </Box>
            </Grid>

            {/* VISIBILITY */}

            <Grid
              item
              xs={12}
              sm={6}
              md={3}
            >
              <Typography
                variant="subtitle2"
                color="text.secondary"
              >
                Customer Visibility
              </Typography>

              <Box sx={{ mt: 1 }}>
                <Chip
                  label={
                    selectedSalon.isVisible
                      ? 'Visible'
                      : 'Hidden'
                  }
                  size="small"
                  color={
                    selectedSalon.isVisible
                      ? 'success'
                      : 'warning'
                  }
                  variant="outlined"
                />
              </Box>
            </Grid>

            {/* RATING */}

            <Grid
              item
              xs={12}
              sm={6}
              md={3}
            >
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
                {Number(
                  selectedSalon.averageRating ||
                    0
                ).toFixed(1)}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                {Number(
                  selectedSalon.totalReviews ||
                    0
                ).toLocaleString(
                  'en-IN'
                )}{' '}
                reviews
              </Typography>
            </Grid>

            {/* APPOINTMENTS */}

            <Grid
              item
              xs={12}
              sm={6}
              md={3}
            >
              <Typography
                variant="subtitle2"
                color="text.secondary"
              >
                Appointments
              </Typography>

              <Typography
                variant="h6"
                sx={{ mt: 0.5 }}
              >
                {Number(
                  selectedSalon.totalAppointments ||
                    0
                ).toLocaleString(
                  'en-IN'
                )}
              </Typography>

              <Typography
                variant="caption"
                color="success.main"
              >
                {Number(
                  selectedSalon.totalCompletedAppointments ||
                    0
                ).toLocaleString(
                  'en-IN'
                )}{' '}
                completed
              </Typography>
            </Grid>

            {/* CANCELLED */}

            <Grid
              item
              xs={12}
              sm={6}
              md={3}
            >
              <Typography
                variant="subtitle2"
                color="text.secondary"
              >
                Cancelled
              </Typography>

              <Typography
                variant="h6"
                sx={{ mt: 0.5 }}
              >
                {Number(
                  selectedSalon.totalCancelledAppointments ||
                    0
                ).toLocaleString(
                  'en-IN'
                )}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                cancelled appointments
              </Typography>
            </Grid>

            {/* REVENUE */}

            <Grid
              item
              xs={12}
              sm={6}
              md={3}
            >
              <Typography
                variant="subtitle2"
                color="text.secondary"
              >
                Total Revenue
              </Typography>

              <Typography
                variant="h6"
                sx={{ mt: 0.5 }}
              >
                {formatCurrency(
                  Number(
                    selectedSalon.totalRevenue ||
                      0
                  )
                )}
              </Typography>
            </Grid>

            {/* BUSINESS TYPE */}

            <Grid
              item
              xs={12}
              md={4}
            >
              <Typography
                variant="subtitle2"
                color="text.secondary"
              >
                Business Type
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  mt: 0.5,
                  fontWeight: 500
                }}
              >
                {
                  selectedSalon.businessType ||
                  '—'
                }
              </Typography>
            </Grid>

            {/* GST */}

            <Grid
              item
              xs={12}
              sm={6}
              md={4}
            >
              <Typography
                variant="subtitle2"
                color="text.secondary"
              >
                GST Number
              </Typography>

              <Typography
                variant="body1"
                sx={{ mt: 0.5 }}
              >
                {
                  selectedSalon.gstNumber ||
                  'Not provided'
                }
              </Typography>
            </Grid>

            {/* PAN */}

            <Grid
              item
              xs={12}
              sm={6}
              md={4}
            >
              <Typography
                variant="subtitle2"
                color="text.secondary"
              >
                PAN Number
              </Typography>

              <Typography
                variant="body1"
                sx={{ mt: 0.5 }}
              >
                {
                  selectedSalon.panNumber ||
                  'Not provided'
                }
              </Typography>
            </Grid>

            {/* APPROVED */}

            {selectedSalon.approvedAt && (
              <Grid
                item
                xs={12}
                md={6}
              >
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                >
                  Approved
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ mt: 0.5 }}
                >
                  {formatDate(
                    selectedSalon.approvedAt
                  )}
                </Typography>

                {selectedSalon.approvedBy && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    By{' '}
                    {
                      selectedSalon.approvedBy
                    }
                  </Typography>
                )}
              </Grid>
            )}

            {/* REJECTED */}

            {selectedSalon.rejectedAt && (
              <Grid
                item
                xs={12}
                md={6}
              >
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                >
                  Rejected
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ mt: 0.5 }}
                >
                  {formatDate(
                    selectedSalon.rejectedAt
                  )}
                </Typography>

                {selectedSalon.rejectionReason && (
                  <Typography
                    variant="caption"
                    color="error.main"
                    sx={{
                      display:
                        'block'
                    }}
                  >
                    {
                      selectedSalon.rejectionReason
                    }
                  </Typography>
                )}
              </Grid>
            )}

            {/* CREATED */}

            <Grid
              item
              xs={12}
              md={6}
            >
              <Typography
                variant="subtitle2"
                color="text.secondary"
              >
                Created At
              </Typography>

              <Typography
                variant="body2"
                sx={{ mt: 0.5 }}
              >
                {formatDate(
                  selectedSalon.createdAt
                )}
              </Typography>
            </Grid>

            {/* UPDATED */}

            <Grid
              item
              xs={12}
              md={6}
            >
              <Typography
                variant="subtitle2"
                color="text.secondary"
              >
                Last Updated
              </Typography>

              <Typography
                variant="body2"
                sx={{ mt: 0.5 }}
              >
                {formatDate(
                  selectedSalon.updatedAt
                )}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
}

