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
  SearchOutlined,
  ShopOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  EnvironmentOutlined,
  BankOutlined,
  StarFilled,
  CalendarOutlined
} from '@ant-design/icons';

import { gql, useMutation, useQuery } from '@apollo/client';

import { ADMIN_SALONS } from '../../graphql/queries';

// ============================================================
// APPROVE SALON
// ============================================================

const ADMIN_APPROVE_SALON = gql`
  mutation AdminApproveSalon($input: AdminApproveSalonInput!) {
    adminApproveSalon(input: $input) {
      success
      message
    }
  }
`;

// ============================================================
// REJECT SALON
// ============================================================

const ADMIN_REJECT_SALON = gql`
  mutation AdminRejectSalon($input: AdminRejectSalonInput!) {
    adminRejectSalon(input: $input) {
      success
      message
    }
  }
`;

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

type ServiceAudience =
  | 'FEMALE'
  | 'MALE'
  | 'KIDS';

// ============================================================
// ADDRESS
// ============================================================

interface SalonAddress {
  addressLine?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
}

// ============================================================
// DOCUMENTS
// ============================================================

interface SalonDocuments {
  aadhaarFront?: string | null;
  aadhaarBack?: string | null;
  panCard?: string | null;
  gstCertificate?: string | null;
}

// ============================================================
// SERVICE SELECTION
// ============================================================

interface SalonServiceSelection {
  categoryId: string;
  categoryName: string;
  subcategoryId: string;
  subcategoryName: string;

  // NEW
  audience?: ServiceAudience | null;

  // Existing backend fields
  price?: number | null;
  duration?: number | null;
}

// ============================================================
// ADMIN SALON
// ============================================================

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

  documents?: SalonDocuments | null;

  bankAccount?: string | null;
  ifsc?: string | null;
  accountHolderName: string;

  logoUrl?: string | null;
  coverImageUrl?: string | null;
  galleryImages?: string[];

  businessHours?: Record<
    string,
    {
      isOpen?: boolean | null;
      open?: string | null;
      close?: string | null;
    }
  > | null;

  // ==========================================================
  // SELECTED SERVICES
  // ==========================================================

  serviceSelections?: SalonServiceSelection[];

  kycStatus: KycStatus;

  adminApprovalStatus?: ApprovalStatus | null;

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

// ============================================================
// GRAPHQL RESPONSE
// ============================================================

interface AdminSalonListResponse {
  success: boolean;
  message: string;
  salons: AdminSalon[];
  totalCount: number;
}

interface MutationResponse {
  success: boolean;
  message: string;
}

// ============================================================
// PENDING APPROVAL
// ============================================================

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

const formatCurrency = (
  value?: number | null
): string => {
  return `₹${Number(value || 0).toLocaleString(
    'en-IN'
  )}`;
};

const formatDuration = (
  value?: number | null
): string => {
  if (
    value === undefined ||
    value === null ||
    !Number.isFinite(Number(value))
  ) {
    return '—';
  }

  const duration = Number(value);

  if (duration < 60) {
    return `${duration} min`;
  }

  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  if (minutes === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${minutes} min`;
};

const formatAudience = (
  audience?: ServiceAudience | null
): string => {
  switch (audience) {
    case 'FEMALE':
      return 'Female';

    case 'MALE':
      return 'Male';

    case 'KIDS':
      return 'Kids';

    default:
      return 'Audience unavailable';
  }
};

const getAudienceColor = (
  audience?: ServiceAudience | null
): 'secondary' | 'info' | 'warning' | 'default' => {
  switch (audience) {
    case 'FEMALE':
      return 'secondary';

    case 'MALE':
      return 'info';

    case 'KIDS':
      return 'warning';

    default:
      return 'default';
  }
};

const maskValue = (
  value?: string | null
): string => {
  if (!value) {
    return 'Not provided';
  }

  const clean = String(value);

  if (clean.length <= 4) {
    return clean;
  }

  return `XXXX-XXXX-${clean.slice(-4)}`;
};

// ============================================================
// APPROVAL TYPE
// ============================================================

const getApprovalType = (
  salon: AdminSalon
): ApprovalType => {
  if (
    salon.kycStatus === 'REJECTED' &&
    !salon.isDeleted
  ) {
    return 'DOCUMENT_RESUBMISSION';
  }

  if (salon.kycStatus === 'PENDING') {
    return 'KYC';
  }

  if (
    salon.kycStatus === 'APPROVED' &&
    !salon.isActive
  ) {
    return 'SALON_APPLICATION';
  }

  return 'SALON_APPLICATION';
};

// ============================================================
// APPROVAL STATUS
// ============================================================

const getApprovalStatus = (
  salon: AdminSalon
): ApprovalStatus => {
  if (salon.adminApprovalStatus) {
    return salon.adminApprovalStatus;
  }

  if (salon.rejectedAt) {
    return 'REJECTED';
  }

  if (salon.approvedAt) {
    return 'APPROVED';
  }

  return 'PENDING';
};

// ============================================================
// PRIORITY
// ============================================================

const getPriority = (
  salon: AdminSalon
): 'HIGH' | 'NORMAL' => {
  if (salon.kycStatus === 'REJECTED') {
    return 'HIGH';
  }

  if (salon.kycStatus === 'PENDING') {
    return 'HIGH';
  }

  return 'NORMAL';
};

// ============================================================
// DOCUMENT COUNT
// ============================================================

const getDocumentCount = (
  documents?: SalonDocuments | null
): number => {
  if (!documents) {
    return 0;
  }

  const documentValues = [
    documents.aadhaarFront,
    documents.aadhaarBack,
    documents.panCard,
    documents.gstCertificate
  ];

  return documentValues.filter(
    (value) =>
      Boolean(
        value &&
        value.trim()
      )
  ).length;
};

// ============================================================
// MAP SALON → APPROVAL
// ============================================================

const mapSalonToApproval = (
  salon: AdminSalon
): PendingApproval => {
  const approvalType =
    getApprovalType(salon);

  const status =
    getApprovalStatus(salon);

  const priority =
    getPriority(salon);

  const documentsSubmitted =
    getDocumentCount(
      salon.documents
    );

  const totalDocuments = 4;

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

    salonId:
      salon.salonId,

    salonName:
      salon.salonName ||
      'Unnamed Salon',

    ownerName:
      salon.ownerName ||
      '—',

    phoneNumber:
      salon.ownerPhoneNumber ||
      '—',

    email:
      salon.email ||
      '—',

    businessType:
      salon.businessType ||
      '—',

    type:
      approvalType,

    status,

    submittedAt:
      formatDateTime(
        salon.createdAt
      ),

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
// LABEL HELPERS
// ============================================================

const getApprovalTypeLabel = (
  type: ApprovalType
): string => {
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

const getKycColor = (
  status: KycStatus
): 'warning' | 'success' | 'error' => {
  switch (status) {
    case 'APPROVED':
      return 'success';

    case 'REJECTED':
      return 'error';

    default:
      return 'warning';
  }
};

// ============================================================
// APPROVAL CHIP
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

  const item =
    config[status];

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
  priority:
    | 'HIGH'
    | 'NORMAL';
}) {
  if (
    priority === 'HIGH'
  ) {
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
// SECTION HEADER
// ============================================================

function SectionHeader({
  title,
  subtitle
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="h6"
        fontWeight={700}
      >
        {title}
      </Typography>

      {subtitle && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.25 }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

// ============================================================
// DETAIL FIELD
// ============================================================

function DetailField({
  label,
  value,
  icon
}: {
  label: string;
  value?: string | number | null;
  icon?: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        p: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        height: '100%'
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ mb: 0.5 }}
      >
        {icon && (
          <Box
            sx={{
              color:
                'text.secondary',
              display: 'flex'
            }}
          >
            {icon}
          </Box>
        )}

        <Typography
          variant="caption"
          color="text.secondary"
        >
          {label}
        </Typography>
      </Stack>

      <Typography
        variant="body2"
        fontWeight={600}
        sx={{
          wordBreak:
            'break-word'
        }}
      >
        {value !== undefined &&
          value !== null &&
          String(value).trim()
          ? String(value)
          : '—'}
      </Typography>
    </Box>
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
    adminSalons:
      AdminSalonListResponse;
  }>(
    ADMIN_SALONS,
    {
      variables: {
        search: null,
        kycStatus: null,
        salonStatus: null,
        isActive: null
      },

      fetchPolicy:
        'network-only',

      notifyOnNetworkStatusChange:
        true
    }
  );

  // ==========================================================
  // APPROVE
  // ==========================================================

  const [
    approveSalon,
    {
      loading:
        approving
    }
  ] =
    useMutation<{
      adminApproveSalon:
        MutationResponse;
    }>(
      ADMIN_APPROVE_SALON
    );

  // ==========================================================
  // REJECT
  // ==========================================================

  const [
    rejectSalon,
    {
      loading:
        rejecting
    }
  ] =
    useMutation<{
      adminRejectSalon:
        MutationResponse;
    }>(
      ADMIN_REJECT_SALON
    );

  // ==========================================================
  // SERVER DATA
  // ==========================================================

  const serverSalons =
    data?.adminSalons?.salons ||
    [];

  const serverApprovals =
    useMemo(
      () =>
        serverSalons.map(
          mapSalonToApproval
        ),
      [serverSalons]
    );

  // ==========================================================
  // STATE
  // ==========================================================

  const [search, setSearch] =
    useState('');

  const [
    typeFilter,
    setTypeFilter
  ] =
    useState<
      'ALL' | ApprovalType
    >('ALL');

  const [
    selectedApproval,
    setSelectedApproval
  ] =
    useState<
      PendingApproval | null
    >(null);

  const [
    selectedSalon,
    setSelectedSalon
  ] =
    useState<
      AdminSalon | null
    >(null);

  const [
    detailsOpen,
    setDetailsOpen
  ] = useState(false);

  const [
    rejectOpen,
    setRejectOpen
  ] = useState(false);

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
        item.status ===
        'PENDING' &&
        item.priority ===
        'HIGH'
    ).length;

  const salonApplicationsCount =
    serverApprovals.filter(
      (item) =>
        item.status ===
        'PENDING' &&
        item.type ===
        'SALON_APPLICATION'
    ).length;

  const kycCount =
    serverApprovals.filter(
      (item) =>
        item.status ===
        'PENDING' &&
        (
          item.type === 'KYC' ||
          item.type ===
            'DOCUMENT_RESUBMISSION'
        )
    ).length;

  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredApprovals =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return serverApprovals.filter(
        (item) => {
          const matchesType =
            typeFilter ===
              'ALL' ||
            item.type ===
              typeFilter;

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
  // SEARCH
  // ==========================================================

  const handleSearch = (
    value: string
  ) => {
    setSearch(value);
    setPage(0);
  };

  // ==========================================================
  // FILTER
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

  // ==========================================================
  // RESET
  // ==========================================================

  const handleReset = () => {
    setSearch('');
    setTypeFilter('ALL');
    setPage(0);
  };

  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh =
    async () => {
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
    const salon =
      serverSalons.find(
        item =>
          item.salonId ===
          approval.salonId
      );

    console.log(
      '========== PENDING APPROVAL VIEW =========='
    );

    console.log(
      'Salon ID:',
      approval.salonId
    );

    console.log(
      'Full salon:',
      JSON.stringify(
        salon,
        null,
        2
      )
    );

    console.log(
      'Service selections:',
      salon?.serviceSelections
    );

    console.log(
      '============================================'
    );

    if (!salon) {
      alert(
        'Complete salon details could not be found.'
      );

      return;
    }

    setSelectedApproval(
      approval
    );

    setSelectedSalon(
      salon
    );

    setDetailsOpen(true);
  };

  // ==========================================================
  // APPROVE
  // ==========================================================

  const handleApprove = async (
    approval: PendingApproval
  ) => {
    try {
      setDetailsOpen(false);

      const result =
        await approveSalon({
          variables: {
            input: {
              salonId:
                approval.salonId
            }
          }
        });

      const response =
        result.data
          ?.adminApproveSalon;

      if (
        !response?.success
      ) {
        alert(
          response?.message ||
            'Failed to approve salon application.'
        );

        return;
      }

      alert(
        response.message ||
          'Salon application approved successfully.'
      );

      setSelectedApproval(
        null
      );

      setSelectedSalon(
        null
      );

      await refetch();
    } catch (approveError) {
      console.error(
        'Failed to approve salon:',
        approveError
      );

      alert(
        approveError instanceof Error
          ? approveError.message
          : 'Failed to approve salon application.'
      );
    }
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
      return;
    }

    try {
      const result =
        await rejectSalon({
          variables: {
            input: {
              salonId:
                selectedApproval.salonId,
              reason
            }
          }
        });

      const response =
        result.data
          ?.adminRejectSalon;

      if (
        !response?.success
      ) {
        alert(
          response?.message ||
            'Failed to reject salon application.'
        );

        return;
      }

      alert(
        response.message ||
          'Salon application rejected successfully.'
      );

      setRejectOpen(false);
      setDetailsOpen(false);
      setRejectionReason('');
      setSelectedApproval(null);
      setSelectedSalon(null);

      await refetch();
    } catch (rejectError) {
      console.error(
        'Failed to reject salon:',
        rejectError
      );

      alert(
        rejectError instanceof Error
          ? rejectError.message
          : 'Failed to reject salon application.'
      );
    }
  };

  // ==========================================================
  // CLOSE DETAILS
  // ==========================================================

  const closeDetails = () => {
    if (
      approving ||
      rejecting
    ) {
      return;
    }

    setDetailsOpen(false);
    setSelectedSalon(null);
    setSelectedApproval(null);
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (
    loading &&
    !data
  ) {
    return (
      <Box
        sx={{
          minHeight: 400,
          display: 'flex',
          alignItems:
            'center',
          justifyContent:
            'center',
          flexDirection:
            'column',
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

  if (
    error &&
    !data
  ) {
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
          onClick={
            handleRefresh
          }
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
      {/* HEADER */}

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
        sx={{
          mb: 3
        }}
      >
        <Box>
          <Typography
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
            Review salon onboarding,
            KYC and document
            verification requests.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={
            <ReloadOutlined />
          }
          onClick={
            handleRefresh
          }
          disabled={
            loading ||
            approving ||
            rejecting
          }
        >
          {loading
            ? 'Refreshing...'
            : 'Refresh'}
        </Button>
      </Stack>

      {/* BACKEND MESSAGE */}

      {data?.adminSalons &&
        !data.adminSalons
          .success && (
          <Alert
            severity="warning"
            sx={{ mb: 3 }}
          >
            {data.adminSalons
              .message ||
              'Unable to load salons.'}
          </Alert>
        )}

      {/* HIGH PRIORITY */}

      {highPriorityCount >
        0 && (
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
          {highPriorityCount >
          1
            ? 's'
            : ''}{' '}
          require
          {highPriorityCount ===
          1
            ? 's'
            : ''}{' '}
          your attention.
        </Alert>
      )}

      {/* SUMMARY */}

      <Grid
        container
        spacing={2.5}
        sx={{ mb: 3 }}
      >
        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <SummaryCard
            title="Pending"
            value={pendingCount}
            icon={
              <ClockCircleOutlined
                style={{
                  fontSize: 22
                }}
              />
            }
            iconBg="warning.lighter"
            iconColor="warning.main"
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <SummaryCard
            title="High Priority"
            value={
              highPriorityCount
            }
            icon={
              <SafetyCertificateOutlined
                style={{
                  fontSize: 22
                }}
              />
            }
            iconBg="error.lighter"
            iconColor="error.main"
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <SummaryCard
            title="Salon Applications"
            value={
              salonApplicationsCount
            }
            icon={
              <ShopOutlined
                style={{
                  fontSize: 22
                }}
              />
            }
            iconBg="primary.lighter"
            iconColor="primary.main"
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <SummaryCard
            title="KYC / Documents"
            value={kycCount}
            icon={
              <FileTextOutlined
                style={{
                  fontSize: 22
                }}
              />
            }
            iconBg="success.lighter"
            iconColor="success.main"
          />
        </Grid>
      </Grid>

      {/* TABLE */}

      <Card
        sx={{
          borderRadius: 2,
          boxShadow:
            '0 2px 12px rgba(0,0,0,0.06)'
        }}
      >
        <CardContent
          sx={{ p: 0 }}
        >
          {/* FILTER */}

          <Box
            sx={{
              p: 2.5,
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap',
              alignItems:
                'center'
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
                  <InputAdornment
                    position="start"
                  >
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
                onClick={
                  handleReset
                }
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
                            opacity:
                              0.35
                          }}
                        />

                        <Typography
                          variant="h6"
                          sx={{
                            mt: 2
                          }}
                        >
                          No approvals found
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
                    (
                      approval
                    ) => (
                      <TableRow
                        hover
                        key={
                          approval.id
                        }
                      >
                        <TableCell>
                          <Typography
                            variant="body2"
                            fontWeight={600}
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
                                borderRadius:
                                  1.5,
                                bgcolor:
                                  'primary.lighter',
                                color:
                                  'primary.main',
                                display:
                                  'flex',
                                alignItems:
                                  'center',
                                justifyContent:
                                  'center',
                                flexShrink: 0
                              }}
                            >
                              <ShopOutlined
                                style={{
                                  fontSize:
                                    19
                                }}
                              />
                            </Box>

                            <Box
                              sx={{
                                minWidth: 0
                              }}
                            >
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                noWrap
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

                        <TableCell>
                          <Chip
                            size="small"
                            color={getKycColor(
                              approval.kycStatus
                            )}
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

                        <TableCell>
                          <PriorityChip
                            priority={
                              approval.priority
                            }
                          />
                        </TableCell>

                        <TableCell>
                          <Typography
                            variant="body2"
                          >
                            {
                              approval.submittedAt
                            }
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Stack
                            direction="row"
                            spacing={0.5}
                            justifyContent="flex-end"
                          >
                            <Tooltip title="View">
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
                                  <span>
                                    <IconButton
                                      size="small"
                                      color="success"
                                      disabled={
                                        approving ||
                                        rejecting
                                      }
                                      onClick={() =>
                                        handleApprove(
                                          approval
                                        )
                                      }
                                    >
                                      {approving ? (
                                        <CircularProgress
                                          size={18}
                                        />
                                      ) : (
                                        <CheckCircleOutlined />
                                      )}
                                    </IconButton>
                                  </span>
                                </Tooltip>

                                <Tooltip title="Reject">
                                  <span>
                                    <IconButton
                                      size="small"
                                      color="error"
                                      disabled={
                                        approving ||
                                        rejecting
                                      }
                                      onClick={() =>
                                        openRejectDialog(
                                          approval
                                        )
                                      }
                                    >
                                      <CloseCircleOutlined />
                                    </IconButton>
                                  </span>
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
              _event,
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
          FULL SALON VIEW DIALOG
      ====================================================== */}

      <Dialog
        open={
          detailsOpen &&
          Boolean(selectedSalon)
        }
        onClose={
          closeDetails
        }
        fullWidth
        maxWidth="lg"
        scroll="paper"
      >
        {selectedSalon && (
          <>
            {/* ==================================================
                TITLE
            ================================================== */}

            <DialogTitle>
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
                spacing={1.5}
              >
                <Box>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                  >
                    {selectedSalon.salonName ||
                      'Salon Details'}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Salon ID:{' '}
                    {
                      selectedSalon.salonId
                    }
                  </Typography>
                </Box>

                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  useFlexGap
                >
                  <Chip
                    size="small"
                    color={getKycColor(
                      selectedSalon.kycStatus
                    )}
                    label={`KYC ${selectedSalon.kycStatus}`}
                  />

                  <ApprovalStatusChip
                    status={getApprovalStatus(
                      selectedSalon
                    )}
                  />
                </Stack>
              </Stack>
            </DialogTitle>

            <DialogContent
              dividers
            >
              {/* ==================================================
                  BUSINESS INFORMATION
              ================================================== */}

              <SectionHeader
                title="Business Information"
                subtitle="Salon registration and business details"
              />

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
                      selectedSalon.salonName
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
                      selectedSalon.businessType
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <DetailField
                    label="Salon Status"
                    value={
                      selectedSalon.salonStatus
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <DetailField
                    label="Application Submitted"
                    value={formatDateTime(
                      selectedSalon.createdAt
                    )}
                    icon={
                      <CalendarOutlined />
                    }
                  />
                </Grid>
              </Grid>

              <Divider sx={{ mb: 3 }} />

              {/* ==================================================
                  OWNER INFORMATION
              ================================================== */}

              <SectionHeader
                title="Owner Information"
              />

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
                    label="Owner Name"
                    value={
                      selectedSalon.ownerName
                    }
                    icon={
                      <UserOutlined />
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <DetailField
                    label="Phone"
                    value={
                      selectedSalon.ownerPhoneNumber
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <DetailField
                    label="Alternate Phone"
                    value={
                      selectedSalon.alternatePhone ||
                      'Not provided'
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <DetailField
                    label="Email"
                    value={
                      selectedSalon.email
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                >
                  <DetailField
                    label="Owner User ID"
                    value={
                      selectedSalon.ownerUserId
                    }
                  />
                </Grid>
              </Grid>

              <Divider sx={{ mb: 3 }} />

              {/* ==================================================
                  BUSINESS LOCATION
              ================================================== */}

              <SectionHeader
                title="Business Location"
                subtitle="Registered salon address and coordinates"
              />

              <Grid
                container
                spacing={2}
                sx={{ mb: 3 }}
              >
                <Grid
                  item
                  xs={12}
                >
                  <DetailField
                    label="Address"
                    value={
                      selectedSalon.address
                        ?.addressLine
                    }
                    icon={
                      <EnvironmentOutlined />
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={4}
                >
                  <DetailField
                    label="City"
                    value={
                      selectedSalon.address
                        ?.city
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={4}
                >
                  <DetailField
                    label="State"
                    value={
                      selectedSalon.address
                        ?.state
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={4}
                >
                  <DetailField
                    label="Pincode"
                    value={
                      selectedSalon.address
                        ?.pincode
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <DetailField
                    label="Latitude"
                    value={
                      selectedSalon.latitude
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <DetailField
                    label="Longitude"
                    value={
                      selectedSalon.longitude
                    }
                  />
                </Grid>
              </Grid>

              <Divider sx={{ mb: 3 }} />

              {/* ==================================================
                  SELECTED SERVICES
              ================================================== */}

              <SectionHeader
                title="Selected Services"
                subtitle={
                  Array.isArray(
                    selectedSalon.serviceSelections
                  )
                    ? `${selectedSalon.serviceSelections.length} selected service${
                        selectedSalon.serviceSelections.length ===
                        1
                          ? ''
                          : 's'
                      }`
                    : 'Services selected during salon registration'
                }
              />

              {Array.isArray(
                selectedSalon.serviceSelections
              ) &&
              selectedSalon
                .serviceSelections
                .length > 0 ? (
                <Box sx={{ mb: 3 }}>
                  <Stack
                    spacing={1.5}
                  >
                    {selectedSalon.serviceSelections.map(
                      (
                        selection,
                        index
                      ) => (
                        <Paper
                          key={`${selection.categoryId}-${selection.subcategoryId}-${selection.audience || 'NO_AUDIENCE'}-${index}`}
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: 2
                          }}
                        >
                          {/* SERVICE NAME ROW */}

                          <Stack
                            direction={{
                              xs: 'column',
                              sm: 'row'
                            }}
                            spacing={1.25}
                            alignItems={{
                              xs: 'flex-start',
                              sm: 'center'
                            }}
                            flexWrap="wrap"
                            useFlexGap
                          >
                            <Chip
                              label={
                                selection.categoryName ||
                                'Category name unavailable'
                              }
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{
                                fontWeight: 600
                              }}
                            />

                            <Typography
                              sx={{
                                fontWeight: 700,
                                color:
                                  'text.secondary'
                              }}
                            >
                              →
                            </Typography>

                            <Chip
                              label={
                                selection.subcategoryName ||
                                'Subcategory name unavailable'
                              }
                              size="small"
                              variant="outlined"
                            />

                            {/* ==================================================
                                AUDIENCE
                            ================================================== */}

                            <Chip
                              label={formatAudience(
                                selection.audience
                              )}
                              size="small"
                              color={getAudienceColor(
                                selection.audience
                              )}
                              variant={
                                selection.audience
                                  ? 'filled'
                                  : 'outlined'
                              }
                              sx={{
                                fontWeight: 600
                              }}
                            />
                          </Stack>

                          {/* ==================================================
                              PRICE + DURATION
                          ================================================== */}

                          <Stack
                            direction="row"
                            spacing={1}
                            flexWrap="wrap"
                            useFlexGap
                            sx={{
                              mt: 1.5
                            }}
                          >
                            <Chip
                              size="small"
                              variant="outlined"
                              label={`Price: ${formatCurrency(
                                selection.price
                              )}`}
                            />

                            <Chip
                              size="small"
                              variant="outlined"
                              label={`Duration: ${formatDuration(
                                selection.duration
                              )}`}
                            />
                          </Stack>

                          {/* ==================================================
                              IDS
                          ================================================== */}

                          {(selection.categoryId ||
                            selection.subcategoryId) && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display:
                                  'block',
                                mt: 1
                              }}
                            >
                              Category ID:{' '}
                              {
                                selection.categoryId
                              }
                              {' · '}
                              Subcategory ID:{' '}
                              {
                                selection.subcategoryId
                              }
                            </Typography>
                          )}
                        </Paper>
                      )
                    )}
                  </Stack>
                </Box>
              ) : (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    mb: 3,
                    borderRadius: 2
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    No service selections
                    found for this salon.
                  </Typography>
                </Paper>
              )}

              <Divider sx={{ mb: 3 }} />

              {/* ==================================================
                  KYC / BUSINESS DOCUMENTS
              ================================================== */}

              <SectionHeader
                title="KYC / Business Documents"
              />

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
                    label="GST Number"
                    value={
                      selectedSalon.gstNumber
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <DetailField
                    label="PAN Number"
                    value={
                      selectedSalon.panNumber
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <DetailField
                    label="Aadhaar"
                    value={maskValue(
                      selectedSalon.aadhaarNumber
                    )}
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <DetailField
                    label="KYC Status"
                    value={
                      selectedSalon.kycStatus
                    }
                  />
                </Grid>
              </Grid>

              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 3,
                  borderRadius: 2
                }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  sx={{ mb: 1.5 }}
                >
                  Submitted Documents
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  useFlexGap
                >
                  <DocumentChip
                    label="Aadhaar Front"
                    value={
                      selectedSalon.documents
                        ?.aadhaarFront
                    }
                  />

                  <DocumentChip
                    label="Aadhaar Back"
                    value={
                      selectedSalon.documents
                        ?.aadhaarBack
                    }
                  />

                  <DocumentChip
                    label="PAN"
                    value={
                      selectedSalon.documents
                        ?.panCard
                    }
                  />

                  <DocumentChip
                    label="GST"
                    value={
                      selectedSalon.documents
                        ?.gstCertificate
                    }
                  />
                </Stack>
              </Paper>

              <Divider sx={{ mb: 3 }} />

              {/* ==================================================
                  VERIFICATION
              ================================================== */}

              <SectionHeader
                title="Verification & Approval"
              />

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
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      height: '100%'
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
                        color={getKycColor(
                          selectedSalon.kycStatus
                        )}
                        label={
                          selectedSalon.kycStatus
                        }
                      />
                    </Box>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display:
                          'block',
                        mt: 1
                      }}
                    >
                      KYC is controlled by
                      the third-party
                      verification
                      provider.
                    </Typography>
                  </Paper>
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      height: '100%'
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Admin Approval
                    </Typography>

                    <Box sx={{ mt: 1 }}>
                      <ApprovalStatusChip
                        status={getApprovalStatus(
                          selectedSalon
                        )}
                      />
                    </Box>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display:
                          'block',
                        mt: 1
                      }}
                    >
                      Admin approval controls
                      the provider approval
                      flow.
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Divider sx={{ mb: 3 }} />

              {/* ==================================================
                  BANK
              ================================================== */}

              <SectionHeader
                title="Bank Information"
              />

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
                    label="Account Holder"
                    value={
                      selectedSalon.accountHolderName
                    }
                    icon={
                      <BankOutlined />
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <DetailField
                    label="Bank Account"
                    value={
                      selectedSalon.bankAccount ||
                      'Not provided'
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <DetailField
                    label="IFSC"
                    value={
                      selectedSalon.ifsc ||
                      'Not provided'
                    }
                  />
                </Grid>
              </Grid>

              <Divider sx={{ mb: 3 }} />

              {/* ==================================================
                  SALON ACTIVITY
              ================================================== */}

              <SectionHeader
                title="Salon Activity"
              />

              <Grid
                container
                spacing={2}
                sx={{ mb: 3 }}
              >
                <Grid
                  item
                  xs={12}
                  sm={4}
                >
                  <StatusField
                    label="Active"
                    value={
                      selectedSalon.isActive
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={4}
                >
                  <StatusField
                    label="Visible"
                    value={
                      selectedSalon.isVisible
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={4}
                >
                  <StatusField
                    label="Deleted"
                    value={
                      selectedSalon.isDeleted
                    }
                  />
                </Grid>
              </Grid>

              <Divider sx={{ mb: 3 }} />

              {/* ==================================================
                  RATING
              ================================================== */}

              <SectionHeader
                title="Salon Performance"
              />

              <Grid
                container
                spacing={2}
                sx={{ mb: 3 }}
              >
                <Grid
                  item
                  xs={12}
                  sm={4}
                >
                  <MetricCard
                    label="Rating"
                    value={
                      selectedSalon.averageRating >
                        0
                        ? selectedSalon.averageRating.toFixed(
                            1
                          )
                        : 'No ratings'
                    }
                    icon={
                      <StarFilled />
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={4}
                >
                  <MetricCard
                    label="Reviews"
                    value={
                      selectedSalon.totalReviews
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={4}
                >
                  <MetricCard
                    label="Total Appointments"
                    value={
                      selectedSalon.totalAppointments
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={4}
                >
                  <MetricCard
                    label="Completed"
                    value={
                      selectedSalon.totalCompletedAppointments
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={4}
                >
                  <MetricCard
                    label="Cancelled"
                    value={
                      selectedSalon.totalCancelledAppointments
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={4}
                >
                  <MetricCard
                    label="Total Revenue"
                    value={formatCurrency(
                      selectedSalon.totalRevenue
                    )}
                  />
                </Grid>
              </Grid>

              {/* ==================================================
                  APPROVAL HISTORY
              ================================================== */}

              {(selectedSalon.approvedAt ||
                selectedSalon.rejectedAt ||
                selectedSalon.rejectionReason) && (
                <>
                  <Divider
                    sx={{ mb: 3 }}
                  />

                  <SectionHeader
                    title="Approval History"
                  />

                  <Grid
                    container
                    spacing={2}
                    sx={{ mb: 2 }}
                  >
                    {selectedSalon.approvedAt && (
                      <>
                        <Grid
                          item
                          xs={12}
                          sm={6}
                        >
                          <DetailField
                            label="Approved By"
                            value={
                              selectedSalon.approvedBy
                            }
                          />
                        </Grid>

                        <Grid
                          item
                          xs={12}
                          sm={6}
                        >
                          <DetailField
                            label="Approved At"
                            value={formatDateTime(
                              selectedSalon.approvedAt
                            )}
                          />
                        </Grid>
                      </>
                    )}

                    {selectedSalon.rejectedAt && (
                      <>
                        <Grid
                          item
                          xs={12}
                          sm={6}
                        >
                          <DetailField
                            label="Rejected By"
                            value={
                              selectedSalon.rejectedBy
                            }
                          />
                        </Grid>

                        <Grid
                          item
                          xs={12}
                          sm={6}
                        >
                          <DetailField
                            label="Rejected At"
                            value={formatDateTime(
                              selectedSalon.rejectedAt
                            )}
                          />
                        </Grid>
                      </>
                    )}
                  </Grid>

                  {selectedSalon.rejectionReason && (
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        borderColor:
                          'error.main',
                        mb: 2
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        color="error.main"
                        fontWeight={700}
                      >
                        Rejection Reason
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{ mt: 0.5 }}
                      >
                        {
                          selectedSalon.rejectionReason
                        }
                      </Typography>
                    </Paper>
                  )}
                </>
              )}

              {/* ==================================================
                  AUDIT
              ================================================== */}

              <Divider sx={{ mb: 3 }} />

              <SectionHeader
                title="Audit Information"
              />

              <Grid
                container
                spacing={2}
              >
                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <DetailField
                    label="Last Updated By"
                    value={
                      selectedSalon.lastUpdatedBy
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <DetailField
                    label="Created At"
                    value={formatDateTime(
                      selectedSalon.createdAt
                    )}
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <DetailField
                    label="Updated At"
                    value={formatDateTime(
                      selectedSalon.updatedAt
                    )}
                  />
                </Grid>
              </Grid>
            </DialogContent>

            {/* ==================================================
                ACTIONS
            ================================================== */}

            <DialogActions
              sx={{
                p: 2
              }}
            >
              <Button
                onClick={
                  closeDetails
                }
                disabled={
                  approving ||
                  rejecting
                }
              >
                Close
              </Button>

              {selectedApproval?.status ===
                'PENDING' && (
                <>
                  <Button
                    color="error"
                    variant="outlined"
                    startIcon={
                      rejecting ? (
                        <CircularProgress
                          size={16}
                        />
                      ) : (
                        <CloseCircleOutlined />
                      )
                    }
                    onClick={() =>
                      openRejectDialog(
                        selectedApproval
                      )
                    }
                    disabled={
                      approving ||
                      rejecting
                    }
                  >
                    Reject
                  </Button>

                  <Button
                    color="success"
                    variant="contained"
                    startIcon={
                      approving ? (
                        <CircularProgress
                          size={16}
                        />
                      ) : (
                        <CheckCircleOutlined />
                      )
                    }
                    onClick={() =>
                      handleApprove(
                        selectedApproval
                      )
                    }
                    disabled={
                      approving ||
                      rejecting
                    }
                  >
                    {approving
                      ? 'Approving...'
                      : 'Approve'}
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
        onClose={() => {
          if (!rejecting) {
            setRejectOpen(false);
          }
        }}
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
            value={
              rejectionReason
            }
            onChange={(event) =>
              setRejectionReason(
                event.target.value
              )
            }
            placeholder="Enter rejection reason..."
            disabled={rejecting}
            error={
              rejectOpen &&
              rejectionReason.trim() ===
                ''
            }
            helperText={
              rejectOpen &&
              rejectionReason.trim() ===
                ''
                ? 'Rejection reason is required.'
                : ' '
            }
          />
        </DialogContent>

        <DialogActions
          sx={{
            p: 2
          }}
        >
          <Button
            onClick={() => {
              setRejectOpen(
                false
              );

              setRejectionReason(
                ''
              );
            }}
            disabled={rejecting}
          >
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            startIcon={
              rejecting ? (
                <CircularProgress
                  size={16}
                />
              ) : (
                <CloseCircleOutlined />
              )
            }
            onClick={
              handleReject
            }
            disabled={
              rejecting ||
              !rejectionReason.trim()
            }
          >
            {rejecting
              ? 'Rejecting...'
              : 'Reject Approval'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ============================================================
// DOCUMENT CHIP
// ============================================================

function DocumentChip({
  label,
  value
}: {
  label: string;
  value?: string | null;
}) {
  const submitted =
    Boolean(
      value &&
        value.trim()
    );

  return (
    <Chip
      size="small"
      icon={
        submitted ? (
          <CheckCircleOutlined />
        ) : (
          <ClockCircleOutlined />
        )
      }
      color={
        submitted
          ? 'success'
          : 'default'
      }
      variant="outlined"
      label={`${label}: ${
        submitted
          ? 'Submitted'
          : 'Not provided'
      }`}
    />
  );
}

// ============================================================
// STATUS FIELD
// ============================================================

function StatusField({
  label,
  value
}: {
  label: string;
  value: boolean;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
      >
        {label}
      </Typography>

      <Box sx={{ mt: 1 }}>
        <Chip
          size="small"
          color={
            value
              ? 'success'
              : 'default'
          }
          label={
            value
              ? 'Yes'
              : 'No'
          }
        />
      </Box>
    </Paper>
  );
}

// ============================================================
// METRIC CARD
// ============================================================

function MetricCard({
  label,
  value,
  icon
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        height: '100%'
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
      >
        {icon && (
          <Box
            sx={{
              color:
                'warning.main',
              display: 'flex'
            }}
          >
            {icon}
          </Box>
        )}

        <Typography
          variant="caption"
          color="text.secondary"
        >
          {label}
        </Typography>
      </Stack>

      <Typography
        variant="h6"
        fontWeight={700}
        sx={{ mt: 0.75 }}
      >
        {value}
      </Typography>
    </Paper>
  );
}

// ============================================================
// SUMMARY CARD
// ============================================================

function SummaryCard({
  title,
  value,
  icon,
  iconBg,
  iconColor
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}) {
  return (
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
          alignItems="center"
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
              bgcolor: iconBg,
              color: iconColor
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}