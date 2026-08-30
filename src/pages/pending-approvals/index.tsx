
import { useMemo, useState } from 'react';

// material-ui
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
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
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';

// icons
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  FileTextOutlined,
  HistoryOutlined,
  SearchOutlined,
  ShopOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  ClockCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';

import { useQuery } from '@apollo/client';

// ============================================================
// IMPORTANT
// ============================================================
// CHANGE ONLY THIS IMPORT PATH.
//
// Use the file where you already have ADMIN_SALONS.
//
// Example:
// import { ADMIN_SALONS } from 'graphql/queries';
//
// Do NOT create another ADMIN_SALONS query in this file.
// ============================================================

import { ADMIN_SALONS } from '../../graphql/queries';

// ============================================================
// TYPES
// ============================================================

type ApprovalType =
  | 'SALON_APPLICATION'
  | 'KYC'
  | 'DOCUMENT_RESUBMISSION';

type ApprovalStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED';

type KycStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED';

type SalonStatus =
  | 'OPEN'
  | 'CLOSED'
  | 'TEMPORARILY_CLOSED';

interface SalonAddress {
  addressLine?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

interface AdminSalon {
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
  accountHolderName: string;

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

  lastUpdatedBy: string;

  createdAt: string;
  updatedAt: string;
}

interface AdminSalonListResponse {
  success: boolean;
  message: string;
  salons: AdminSalon[];
  totalCount: number;
}

interface PendingApproval {
  id: string;
  salonId: string;

  salonName: string;
  ownerName: string;

  phoneNumber: string;
  email: string;

  businessType: string;

  type: ApprovalType;
  status: ApprovalStatus;

  submittedAt: string;

  priority: 'HIGH' | 'NORMAL';

  kycStatus: KycStatus;

  documentsSubmitted: number;
  totalDocuments: number;

  city: string;
  state: string;

  notes?: string;
  rejectionReason?: string;

  reviewedBy?: string;
  reviewedAt?: string;
}

// ============================================================
// HELPERS
// ============================================================

const formatDateTime = (
  value?: string | null
): string => {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// ------------------------------------------------------------
// Determine approval type from salon state
// ------------------------------------------------------------

const getApprovalType = (
  salon: AdminSalon
): ApprovalType => {
  // Rejected KYC/document → resubmission
  if (
    salon.kycStatus === 'REJECTED' &&
    !salon.isDeleted
  ) {
    return 'DOCUMENT_RESUBMISSION';
  }

  // KYC pending → KYC verification
  if (salon.kycStatus === 'PENDING') {
    return 'KYC';
  }

  // KYC approved but salon not active → salon application
  if (
    salon.kycStatus === 'APPROVED' &&
    !salon.isActive
  ) {
    return 'SALON_APPLICATION';
  }

  // Default
  return 'SALON_APPLICATION';
};

// ------------------------------------------------------------
// Determine approval status
// ------------------------------------------------------------

const getApprovalStatus = (
  salon: AdminSalon
): ApprovalStatus => {
  if (salon.rejectedAt) {
    return 'REJECTED';
  }

  if (salon.approvedAt) {
    return 'APPROVED';
  }

  return 'PENDING';
};

// ------------------------------------------------------------
// Determine priority
// ------------------------------------------------------------

const getPriority = (
  salon: AdminSalon
): 'HIGH' | 'NORMAL' => {
  // Rejected/resubmission requires attention
  if (salon.kycStatus === 'REJECTED') {
    return 'HIGH';
  }

  // Pending KYC is high priority
  if (salon.kycStatus === 'PENDING') {
    return 'HIGH';
  }

  return 'NORMAL';
};

// ------------------------------------------------------------
// Convert AdminSalon → PendingApproval
// ------------------------------------------------------------

const mapSalonToApproval = (
  salon: AdminSalon
): PendingApproval => {
  const approvalType =
    getApprovalType(salon);

  const status =
    getApprovalStatus(salon);

  const priority =
    getPriority(salon);

  // ----------------------------------------------------------
  // Documents
  //
  // Your current AdminSalon schema does not expose individual
  // document fields, so we calculate this from available KYC
  // information.
  //
  // Expected documents:
  // PAN
  // Aadhaar
  // GST
  //
  // This can be changed later when AdminSalon exposes documents.
  // ----------------------------------------------------------

  const documentValues = [
    salon.panNumber,
    salon.aadhaarNumber,
    salon.gstNumber
  ];

  const documentsSubmitted =
    documentValues.filter(
      (value) =>
        Boolean(value && value.trim())
    ).length;

  const totalDocuments = 3;

  const city =
    salon.address?.city || '—';

  const state =
    salon.address?.state || '—';

  let notes = '';

  if (approvalType === 'KYC') {
    notes =
      'KYC verification is pending.';
  }

  if (
    approvalType ===
    'DOCUMENT_RESUBMISSION'
  ) {
    notes =
      'KYC documents require review or resubmission.';
  }

  if (
    approvalType ===
    'SALON_APPLICATION' &&
    salon.kycStatus === 'APPROVED'
  ) {
    notes =
      'KYC is approved. Salon application is awaiting final approval.';
  }

  return {
    id: `APR-${salon.salonId}`,
    salonId: salon.salonId,

    salonName:
      salon.salonName || 'Unnamed Salon',

    ownerName:
      salon.ownerName || '—',

    phoneNumber:
      salon.ownerPhoneNumber || '—',

    email:
      salon.email || '—',

    businessType:
      salon.businessType || '—',

    type: approvalType,

    status,

    submittedAt:
      formatDateTime(salon.createdAt),

    priority,

    kycStatus:
      salon.kycStatus,

    documentsSubmitted,

    totalDocuments,

    city,

    state,

    notes:
      notes || undefined,

    rejectionReason:
      salon.rejectionReason ||
      undefined,

    reviewedBy:
      salon.approvedBy ||
      salon.rejectedBy ||
      undefined,

    reviewedAt:
      salon.approvedAt ||
      salon.rejectedAt ||
      undefined
  };
};

// ============================================================
// APPROVAL TYPE LABEL
// ============================================================

const getApprovalTypeLabel = (
  type: ApprovalType
) => {
  switch (type) {
    case 'SALON_APPLICATION':
      return 'Salon Application';

    case 'KYC':
      return 'KYC Verification';

    case 'DOCUMENT_RESUBMISSION':
      return 'Document Resubmission';

    default:
      return type;
  }
};

// ============================================================
// APPROVAL TYPE COLOR
// ============================================================

const getApprovalTypeColor = (
  type: ApprovalType
): 'primary' | 'warning' | 'info' => {
  switch (type) {
    case 'SALON_APPLICATION':
      return 'primary';

    case 'KYC':
      return 'warning';

    case 'DOCUMENT_RESUBMISSION':
      return 'info';

    default:
      return 'primary';
  }
};

// ============================================================
// STATUS CHIP
// ============================================================

function ApprovalStatusChip({
  status
}: {
  status: ApprovalStatus;
}) {
  const config: Record<
    ApprovalStatus,
    {
      color:
      | 'warning'
      | 'success'
      | 'error';

      label: string;
    }
  > = {
    PENDING: {
      color: 'warning',
      label: 'Pending'
    },

    APPROVED: {
      color: 'success',
      label: 'Approved'
    },

    REJECTED: {
      color: 'error',
      label: 'Rejected'
    }
  };

  const item = config[status];

  return (
    <Chip
      size="small"
      color={item.color}
      label={item.label}
      sx={{
        minWidth: 82,
        fontWeight: 600
      }}
    />
  );
}

// ============================================================
// PRIORITY CHIP
// ============================================================

function PriorityChip({
  priority
}: {
  priority: 'HIGH' | 'NORMAL';
}) {
  if (priority === 'HIGH') {
    return (
      <Chip
        size="small"
        color="error"
        variant="outlined"
        label="High"
        sx={{
          fontWeight: 600
        }}
      />
    );
  }

  return (
    <Chip
      size="small"
      variant="outlined"
      label="Normal"
      sx={{
        fontWeight: 500
      }}
    />
  );
}

// ============================================================
// PAGE
// ============================================================

export default function PendingApprovals() {
  // ==========================================================
  // GRAPHQL
  // ==========================================================

  const {
    data,
    loading,
    error,
    refetch
  } = useQuery<{
    adminSalons: AdminSalonListResponse;
  }>(ADMIN_SALONS, {
    variables: {
      search: null,
      kycStatus: null,
      salonStatus: null,
      isActive: null
    },

    fetchPolicy: 'network-only',

    notifyOnNetworkStatusChange: true
  });

  // ==========================================================
  // SERVER DATA
  // ==========================================================

  const serverSalons =
    data?.adminSalons?.salons || [];

  const serverApprovals =
    useMemo(() => {
      return serverSalons.map(
        mapSalonToApproval
      );
    }, [serverSalons]);

  // ==========================================================
  // LOCAL UI STATE
  // ==========================================================

  const [search, setSearch] =
    useState('');

  const [typeFilter, setTypeFilter] =
    useState<
      'ALL' | ApprovalType
    >('ALL');

  const [
    selectedApproval,
    setSelectedApproval
  ] =
    useState<PendingApproval | null>(
      null
    );

  const [detailsOpen, setDetailsOpen] =
    useState(false);

  const [rejectOpen, setRejectOpen] =
    useState(false);

  const [
    rejectionReason,
    setRejectionReason
  ] = useState('');

  const [page, setPage] =
    useState(0);

  const [
    rowsPerPage,
    setRowsPerPage
  ] = useState(10);

  // ==========================================================
  // COUNTERS
  // ==========================================================

  const pendingCount =
    serverApprovals.filter(
      (item) =>
        item.status === 'PENDING'
    ).length;

  const highPriorityCount =
    serverApprovals.filter(
      (item) =>
        item.status === 'PENDING' &&
        item.priority === 'HIGH'
    ).length;

  const salonApplicationsCount =
    serverApprovals.filter(
      (item) =>
        item.status === 'PENDING' &&
        item.type ===
        'SALON_APPLICATION'
    ).length;

  const kycCount =
    serverApprovals.filter(
      (item) =>
        item.status === 'PENDING' &&
        (item.type === 'KYC' ||
          item.type ===
          'DOCUMENT_RESUBMISSION')
    ).length;

  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredApprovals =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return serverApprovals.filter(
        (item) => {
          const matchesType =
            typeFilter === 'ALL' ||
            item.type === typeFilter;

          const matchesSearch =
            !query ||
            item.id
              .toLowerCase()
              .includes(query) ||
            item.salonId
              .toLowerCase()
              .includes(query) ||
            item.salonName
              .toLowerCase()
              .includes(query) ||
            item.ownerName
              .toLowerCase()
              .includes(query) ||
            item.phoneNumber
              .toLowerCase()
              .includes(query) ||
            item.email
              .toLowerCase()
              .includes(query);

          return (
            matchesType &&
            matchesSearch
          );
        }
      );
    }, [
      serverApprovals,
      search,
      typeFilter
    ]);

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const paginatedApprovals =
    filteredApprovals.slice(
      page * rowsPerPage,
      page * rowsPerPage +
      rowsPerPage
    );

  // ==========================================================
  // HANDLERS
  // ==========================================================

  const handleTypeFilter = (
    event: SelectChangeEvent
  ) => {
    setTypeFilter(
      event.target.value as
      | 'ALL'
      | ApprovalType
    );

    setPage(0);
  };

  const handleSearch = (
    value: string
  ) => {
    setSearch(value);
    setPage(0);
  };

  const handleReset = () => {
    setSearch('');
    setTypeFilter('ALL');
    setPage(0);
  };

  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh = async () => {
    try {
      await refetch();
    } catch (refreshError) {
      console.error(
        'Failed to refresh approvals:',
        refreshError
      );
    }
  };

  // ==========================================================
  // VIEW
  // ==========================================================

  const handleView = (
    approval: PendingApproval
  ) => {
    setSelectedApproval(
      approval
    );

    setDetailsOpen(true);
  };

  // ==========================================================
  // APPROVE
  //
  // IMPORTANT:
  //
  // Your current GraphQL schema only exposes adminSalons
  // for reading salon data.
  //
  // There is currently no approveSalon / rejectSalon
  // mutation in the schema you provided.
  //
  // Therefore we DO NOT fake a successful backend approval.
  //
  // Once the mutation exists, connect it here.
  // ==========================================================

  const handleApprove = async (
    approval: PendingApproval
  ) => {
    console.warn(
      'Approve clicked for salon:',
      approval.salonId
    );

    /*
     * TODO:
     *
     * Connect your backend mutation here.
     *
     * Example later:
     *
     * await approveSalon({
     *   variables: {
     *     salonId: approval.salonId
     *   }
     * });
     *
     * await refetch();
     */

    alert(
      'Approve mutation is not connected yet. The current GraphQL schema only provides adminSalons for reading salon data.'
    );
  };

  // ==========================================================
  // OPEN REJECT
  // ==========================================================

  const openRejectDialog = (
    approval: PendingApproval
  ) => {
    setSelectedApproval(
      approval
    );

    setRejectionReason('');

    setRejectOpen(true);
  };

  // ==========================================================
  // REJECT
  // ==========================================================

  const handleReject = async () => {
    if (!selectedApproval) {
      return;
    }

    const reason =
      rejectionReason.trim();

    if (!reason) {
      alert(
        'Please provide a rejection reason.'
      );

      return;
    }

    console.warn(
      'Reject clicked:',
      selectedApproval.salonId,
      reason
    );

    /*
     * TODO:
     *
     * Connect your backend rejection mutation here.
     *
     * Example later:
     *
     * await rejectSalon({
     *   variables: {
     *     salonId:
     *       selectedApproval.salonId,
     *     reason
     *   }
     * });
     *
     * await refetch();
     */

    alert(
      'Reject mutation is not connected yet. The current GraphQL schema only provides adminSalons for reading salon data.'
    );

    setRejectOpen(false);

    setRejectionReason('');
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading && !data) {
    return (
      <Box
        sx={{
          minHeight: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <CircularProgress />

        <Typography
          color="text.secondary"
        >
          Loading approval requests...
        </Typography>
      </Box>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error && !data) {
    return (
      <Box>
        <Alert
          severity="error"
          sx={{ mb: 2 }}
        >
          <strong>
            Unable to load approvals.
          </strong>

          <Box sx={{ mt: 0.5 }}>
            {error.message}
          </Box>
        </Alert>

        <Button
          variant="contained"
          startIcon={
            <ReloadOutlined />
          }
          onClick={handleRefresh}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

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
            sx={{
              fontWeight: 700
            }}
          >
            Pending Approvals
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5
            }}
          >
            Review salon onboarding, KYC
            and document verification
            requests.
          </Typography> */}
        </Box>

        <Button
          variant="outlined"
          startIcon={
            <ReloadOutlined />
          }
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading
            ? 'Refreshing...'
            : 'Refresh'}
        </Button>
      </Stack>

      {/* ======================================================
          BACKEND MESSAGE
      ====================================================== */}

      {data?.adminSalons &&
        !data.adminSalons.success && (
          <Alert
            severity="warning"
            sx={{ mb: 3 }}
          >
            {data.adminSalons.message ||
              'Unable to load salons.'}
          </Alert>
        )}

      {/* ======================================================
          HIGH PRIORITY ALERT
      ====================================================== */}

      {highPriorityCount > 0 && (
        <Alert
          severity="warning"
          icon={
            <ClockCircleOutlined />
          }
          sx={{ mb: 3 }}
        >
          <strong>
            {highPriorityCount}
          </strong>{' '}
          high-priority approval
          {highPriorityCount > 1
            ? 's'
            : ''}{' '}
          require
          {highPriorityCount === 1
            ? 's'
            : ''}{' '}
          your attention.
        </Alert>
      )}

      {/* ======================================================
          SUMMARY CARDS
      ====================================================== */}

      <Grid
        container
        spacing={2.5}
        sx={{ mb: 3 }}
      >
        {/* PENDING */}

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <Card
            sx={{
              height: '100%',
              borderRadius: 2,
              boxShadow:
                '0 2px 12px rgba(0,0,0,0.06)'
            }}
          >
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Pending
                  </Typography>

                  <Typography
                    variant="h4"
                    sx={{
                      mt: 1,
                      fontWeight: 700
                    }}
                  >
                    {pendingCount}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems:
                      'center',
                    justifyContent:
                      'center',
                    bgcolor:
                      'warning.lighter',
                    color:
                      'warning.main'
                  }}
                >
                  <ClockCircleOutlined
                    style={{
                      fontSize: 22
                    }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* HIGH PRIORITY */}

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <Card
            sx={{
              height: '100%',
              borderRadius: 2,
              boxShadow:
                '0 2px 12px rgba(0,0,0,0.06)'
            }}
          >
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    High Priority
                  </Typography>

                  <Typography
                    variant="h4"
                    sx={{
                      mt: 1,
                      fontWeight: 700
                    }}
                  >
                    {
                      highPriorityCount
                    }
                  </Typography>
                </Box>

                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems:
                      'center',
                    justifyContent:
                      'center',
                    bgcolor:
                      'error.lighter',
                    color:
                      'error.main'
                  }}
                >
                  <SafetyCertificateOutlined
                    style={{
                      fontSize: 22
                    }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* SALON APPLICATIONS */}

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <Card
            sx={{
              height: '100%',
              borderRadius: 2,
              boxShadow:
                '0 2px 12px rgba(0,0,0,0.06)'
            }}
          >
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Salon Applications
                  </Typography>

                  <Typography
                    variant="h4"
                    sx={{
                      mt: 1,
                      fontWeight: 700
                    }}
                  >
                    {
                      salonApplicationsCount
                    }
                  </Typography>
                </Box>

                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: 'flex',
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
                  <ShopOutlined
                    style={{
                      fontSize: 22
                    }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* KYC */}

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <Card
            sx={{
              height: '100%',
              borderRadius: 2,
              boxShadow:
                '0 2px 12px rgba(0,0,0,0.06)'
            }}
          >
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    KYC / Documents
                  </Typography>

                  <Typography
                    variant="h4"
                    sx={{
                      mt: 1,
                      fontWeight: 700
                    }}
                  >
                    {kycCount}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems:
                      'center',
                    justifyContent:
                      'center',
                    bgcolor:
                      'success.lighter',
                    color:
                      'success.main'
                  }}
                >
                  <FileTextOutlined
                    style={{
                      fontSize: 22
                    }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ======================================================
          TABLE
      ====================================================== */}

      <Card
        sx={{
          borderRadius: 2,
          boxShadow:
            '0 2px 12px rgba(0,0,0,0.06)'
        }}
      >
        <CardContent sx={{ p: 0 }}>
          {/* FILTER BAR */}

          <Box
            sx={{
              p: 2.5,
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap',
              alignItems: 'center'
            }}
          >
            <TextField
              value={search}
              onChange={(event) =>
                handleSearch(
                  event.target.value
                )
              }
              placeholder="Search salon, owner, approval ID..."
              size="small"
              sx={{
                minWidth: {
                  xs: '100%',
                  md: 320
                },
                flex: 1
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined />
                  </InputAdornment>
                )
              }}
            />

            <Select
              size="small"
              value={typeFilter}
              onChange={
                handleTypeFilter
              }
              sx={{
                minWidth: 210
              }}
            >
              <MenuItem value="ALL">
                All Approval Types
              </MenuItem>

              <MenuItem value="SALON_APPLICATION">
                Salon Applications
              </MenuItem>

              <MenuItem value="KYC">
                KYC Verification
              </MenuItem>

              <MenuItem value="DOCUMENT_RESUBMISSION">
                Document Resubmission
              </MenuItem>
            </Select>

            {(search ||
              typeFilter !==
              'ALL') && (
                <Button
                  variant="text"
                  onClick={handleReset}
                >
                  Clear
                </Button>
              )}
          </Box>

          <Divider />

          {/* TABLE */}

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    Approval
                  </TableCell>

                  <TableCell>
                    Salon
                  </TableCell>

                  <TableCell>
                    Owner
                  </TableCell>

                  <TableCell>
                    Request
                  </TableCell>

                  <TableCell>
                    KYC
                  </TableCell>

                  <TableCell>
                    Priority
                  </TableCell>

                  <TableCell>
                    Submitted
                  </TableCell>

                  <TableCell align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedApprovals.length ===
                  0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                    >
                      <Box
                        sx={{
                          py: 8,
                          textAlign:
                            'center'
                        }}
                      >
                        <CheckCircleOutlined
                          style={{
                            fontSize: 44,
                            opacity: 0.35
                          }}
                        />

                        <Typography
                          variant="h6"
                          sx={{
                            mt: 2
                          }}
                        >
                          No pending approvals
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          There are no
                          approval
                          requests
                          matching
                          your
                          filters.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedApprovals.map(
                    (approval) => (
                      <TableRow
                        hover
                        key={
                          approval.id
                        }
                      >
                        {/* APPROVAL */}

                        <TableCell>
                          <Typography
                            variant="body2"
                            fontWeight={
                              600
                            }
                            color="primary.main"
                          >
                            {
                              approval.id
                            }
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {
                              approval.salonId
                            }
                          </Typography>
                        </TableCell>

                        {/* SALON */}

                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                          >
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 1.5,
                                bgcolor:
                                  'primary.lighter',
                                color:
                                  'primary.main',
                                display:
                                  'flex',
                                alignItems:
                                  'center',
                                justifyContent:
                                  'center'
                              }}
                            >
                              <ShopOutlined
                                style={{
                                  fontSize: 19
                                }}
                              />
                            </Box>

                            <Box>
                              <Typography
                                variant="body2"
                                fontWeight={
                                  600
                                }
                              >
                                {
                                  approval.salonName
                                }
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {
                                  approval.city
                                }
                                ,{' '}
                                {
                                  approval.state
                                }
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        {/* OWNER */}

                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <UserOutlined />

                            <Box>
                              <Typography variant="body2">
                                {
                                  approval.ownerName
                                }
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {
                                  approval.phoneNumber
                                }
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        {/* REQUEST */}

                        <TableCell>
                          <Chip
                            size="small"
                            color={getApprovalTypeColor(
                              approval.type
                            )}
                            label={getApprovalTypeLabel(
                              approval.type
                            )}
                            sx={{
                              fontWeight:
                                600
                            }}
                          />
                        </TableCell>

                        {/* KYC */}

                        <TableCell>
                          <Chip
                            size="small"
                            color={
                              approval.kycStatus ===
                                'APPROVED'
                                ? 'success'
                                : approval.kycStatus ===
                                  'REJECTED'
                                  ? 'error'
                                  : 'warning'
                            }
                            label={
                              approval.kycStatus
                            }
                            sx={{
                              fontWeight:
                                600
                            }}
                          />

                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            sx={{
                              mt: 0.5
                            }}
                          >
                            {
                              approval.documentsSubmitted
                            }
                            /
                            {
                              approval.totalDocuments
                            }{' '}
                            documents
                          </Typography>
                        </TableCell>

                        {/* PRIORITY */}

                        <TableCell>
                          <PriorityChip
                            priority={
                              approval.priority
                            }
                          />
                        </TableCell>

                        {/* DATE */}

                        <TableCell>
                          <Typography variant="body2">
                            {
                              approval.submittedAt
                            }
                          </Typography>
                        </TableCell>

                        {/* ACTIONS */}

                        <TableCell align="right">
                          <Stack
                            direction="row"
                            spacing={0.5}
                            justifyContent="flex-end"
                          >
                            <Tooltip title="Review">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() =>
                                  handleView(
                                    approval
                                  )
                                }
                              >
                                <EyeOutlined />
                              </IconButton>
                            </Tooltip>

                            {approval.status ===
                              'PENDING' && (
                                <>
                                  <Tooltip title="Approve">
                                    <IconButton
                                      size="small"
                                      color="success"
                                      onClick={() =>
                                        handleApprove(
                                          approval
                                        )
                                      }
                                    >
                                      <CheckCircleOutlined />
                                    </IconButton>
                                  </Tooltip>

                                  <Tooltip title="Reject">
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() =>
                                        openRejectDialog(
                                          approval
                                        )
                                      }
                                    >
                                      <CloseCircleOutlined />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
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

          <TablePagination
            component="div"
            count={
              filteredApprovals.length
            }
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
              25,
              50
            ]}
          />
        </CardContent>
      </Card>

      {/* ======================================================
          REVIEW DIALOG
      ====================================================== */}

      <Dialog
        open={detailsOpen}
        onClose={() =>
          setDetailsOpen(false)
        }
        maxWidth="md"
        fullWidth
      >
        {selectedApproval && (
          <>
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
                    Review Approval
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {
                      selectedApproval.id
                    }{' '}
                    ·{' '}
                    {
                      selectedApproval.salonName
                    }
                  </Typography>
                </Box>

                <ApprovalStatusChip
                  status={
                    selectedApproval.status
                  }
                />
              </Stack>
            </DialogTitle>

            <DialogContent dividers>
              {/* REQUEST */}

              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  sx={{
                    mb: 1.5
                  }}
                >
                  Approval Request
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  flexWrap="wrap"
                >
                  <Chip
                    color={getApprovalTypeColor(
                      selectedApproval.type
                    )}
                    label={getApprovalTypeLabel(
                      selectedApproval.type
                    )}
                  />

                  <PriorityChip
                    priority={
                      selectedApproval.priority
                    }
                  />
                </Stack>
              </Box>

              <Divider
                sx={{ mb: 3 }}
              />

              {/* SALON */}

              <Typography
                variant="subtitle1"
                fontWeight={700}
                sx={{
                  mb: 2
                }}
              >
                Salon Information
              </Typography>

              <Grid
                container
                spacing={2}
                sx={{ mb: 3 }}
              >
                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <DetailField
                    label="Salon Name"
                    value={
                      selectedApproval.salonName
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <DetailField
                    label="Business Type"
                    value={
                      selectedApproval.businessType
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <DetailField
                    label="Owner Name"
                    value={
                      selectedApproval.ownerName
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <DetailField
                    label="Phone Number"
                    value={
                      selectedApproval.phoneNumber
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                >
                  <DetailField
                    label="Email"
                    value={
                      selectedApproval.email
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <DetailField
                    label="City"
                    value={
                      selectedApproval.city
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <DetailField
                    label="State"
                    value={
                      selectedApproval.state
                    }
                  />
                </Grid>
              </Grid>

              <Divider
                sx={{ mb: 3 }}
              />

              {/* KYC */}

              <Typography
                variant="subtitle1"
                fontWeight={700}
                sx={{
                  mb: 2
                }}
              >
                Verification Status
              </Typography>

              <Stack
                direction={{
                  xs: 'column',
                  sm: 'row'
                }}
                spacing={2}
                sx={{
                  mb: 3
                }}
              >
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    flex: 1,
                    borderRadius: 1.5
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    KYC Status
                  </Typography>

                  <Box sx={{ mt: 1 }}>
                    <Chip
                      size="small"
                      color={
                        selectedApproval.kycStatus ===
                          'APPROVED'
                          ? 'success'
                          : selectedApproval.kycStatus ===
                            'REJECTED'
                            ? 'error'
                            : 'warning'
                      }
                      label={
                        selectedApproval.kycStatus
                      }
                    />
                  </Box>
                </Paper>

                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    flex: 1,
                    borderRadius: 1.5
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Documents
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      mt: 0.5
                    }}
                  >
                    {
                      selectedApproval.documentsSubmitted
                    }
                    /
                    {
                      selectedApproval.totalDocuments
                    }
                  </Typography>
                </Paper>
              </Stack>

              {/* NOTES */}

              {selectedApproval.notes && (
                <Box
                  sx={{
                    p: 2,
                    bgcolor:
                      'grey.50',
                    borderRadius: 1.5,
                    mb: 3
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                  >
                    Internal Notes
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.5
                    }}
                  >
                    {
                      selectedApproval.notes
                    }
                  </Typography>
                </Box>
              )}

              {/* REJECTION */}

              {selectedApproval.rejectionReason && (
                <Box
                  sx={{
                    p: 2,
                    bgcolor:
                      'error.lighter',
                    borderRadius: 1.5
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    color="error.main"
                    fontWeight={700}
                  >
                    Previous Rejection
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      mt: 0.5
                    }}
                  >
                    {
                      selectedApproval.rejectionReason
                    }
                  </Typography>
                </Box>
              )}

              {/* REVIEW HISTORY */}

              {selectedApproval.reviewedAt && (
                <>
                  <Divider
                    sx={{ my: 3 }}
                  />

                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                    <HistoryOutlined />

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Reviewed by{' '}
                      <strong>
                        {
                          selectedApproval.reviewedBy ||
                          'Admin'
                        }
                      </strong>{' '}
                      on{' '}
                      {
                        selectedApproval.reviewedAt
                      }
                    </Typography>
                  </Stack>
                </>
              )}
            </DialogContent>

            <DialogActions
              sx={{ p: 2 }}
            >
              <Button
                onClick={() =>
                  setDetailsOpen(
                    false
                  )
                }
              >
                Close
              </Button>

              {selectedApproval.status ===
                'PENDING' && (
                  <>
                    <Button
                      color="error"
                      variant="outlined"
                      startIcon={
                        <CloseCircleOutlined />
                      }
                      onClick={() =>
                        openRejectDialog(
                          selectedApproval
                        )
                      }
                    >
                      Reject
                    </Button>

                    <Button
                      color="success"
                      variant="contained"
                      startIcon={
                        <CheckCircleOutlined />
                      }
                      onClick={() =>
                        handleApprove(
                          selectedApproval
                        )
                      }
                    >
                      Approve
                    </Button>
                  </>
                )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ======================================================
          REJECT DIALOG
      ====================================================== */}

      <Dialog
        open={rejectOpen}
        onClose={() =>
          setRejectOpen(false)
        }
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Reject Approval
        </DialogTitle>

        <DialogContent>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2
            }}
          >
            Provide a reason for rejecting
            this approval request. This
            reason can later be shown to
            the salon owner.
          </Typography>

          <TextField
            fullWidth
            multiline
            minRows={4}
            value={rejectionReason}
            onChange={(event) =>
              setRejectionReason(
                event.target.value
              )
            }
            placeholder="Enter rejection reason..."
            error={
              rejectOpen &&
              rejectionReason.trim() ===
              ''
            }
          />
        </DialogContent>

        <DialogActions
          sx={{ p: 2 }}
        >
          <Button
            onClick={() =>
              setRejectOpen(false)
            }
          >
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            startIcon={
              <CloseCircleOutlined />
            }
            onClick={handleReject}
          >
            Reject Approval
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ============================================================
// DETAIL FIELD
// ============================================================

function DetailField({
  label,
  value
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <Box
      sx={{
        p: 1.5,
        border: '1px solid',
        borderColor:
          'divider',
        borderRadius: 1.5
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        sx={{
          mb: 0.5
        }}
      >
        {label}
      </Typography>

      <Typography
        variant="body2"
        fontWeight={600}
      >
        {value || '—'}
      </Typography>
    </Box>
  );
}

