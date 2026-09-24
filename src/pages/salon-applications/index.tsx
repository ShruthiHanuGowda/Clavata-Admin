import { useMemo, useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';

// material-ui
import {
  Avatar,
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
  Paper,
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
  ClockCircleOutlined,
  EnvironmentOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { ADMIN_SALONS } from '../../graphql/queries';
// ============================================================
// GRAPHQL
// ============================================================

// const ADMIN_SALONS_LOCAL = gql`
//   query AdminSalons(
//     $search: String
//     $kycStatus: KycStatus
//     $salonStatus: SalonStatus
//     $isActive: Boolean
//   ) {
//     adminSalons(
//       search: $search
//       kycStatus: $kycStatus
//       salonStatus: $salonStatus
//       isActive: $isActive
//     ) {
//       success
//       message
//       totalCount

//       salons {
//         salonId
//         ownerUserId

//         salonName
//         ownerName
//         businessType
//         ownerPhoneNumber
//         alternatePhone
//         email

//         address {
//           addressLine
//           city
//           state
//           pincode
//         }

//         latitude
//         longitude

//         businessHours {
//           MONDAY {
//             isOpen
//             open
//             close
//           }
//           TUESDAY {
//             isOpen
//             open
//             close
//           }
//           WEDNESDAY {
//             isOpen
//             open
//             close
//           }
//           THURSDAY {
//             isOpen
//             open
//             close
//           }
//           FRIDAY {
//             isOpen
//             open
//             close
//           }
//           SATURDAY {
//             isOpen
//             open
//             close
//           }
//           SUNDAY {
//             isOpen
//             open
//             close
//           }
//         }

//         serviceSelections {
//           categoryId
//           categoryName
//           subcategoryId
//           subcategoryName
//         }

//         gstNumber
//         panNumber
//         aadhaarNumber
//         shopEstablishmentNumber
//         udyamNumber

//         documents {
//           aadhaarFront
//           aadhaarBack
//           panCard
//           gstCertificate
//         }

//         bankAccount
//         ifsc
//         accountHolderName

//         logoUrl
//         coverImageUrl
//         galleryImages

//         kycStatus
//         adminApprovalStatus
//         salonStatus

//         isActive
//         isVisible
//         isDeleted

//         averageRating
//         totalReviews
//         totalAppointments
//         totalCompletedAppointments
//         totalCancelledAppointments
//         totalRevenue

//         approvedBy
//         approvedAt

//         rejectedBy
//         rejectedAt
//         rejectionReason

//         lastUpdatedBy
//         createdAt
//         updatedAt
//       }
//     }
//   }
// `;

// ============================================================
// APPROVE SALON
// ============================================================

const APPROVE_SALON_LOCAL = gql`
  mutation AdminApproveSalon(
    $input: AdminApproveSalonInput!
  ) {
    adminApproveSalon(input: $input) {
      success
      message
    }
  }
`;

// ============================================================
// REJECT SALON
// ============================================================

const REJECT_SALON_LOCAL = gql`
  mutation RejectSalon(
    $input: RejectSalonInput!
  ) {
    rejectSalon(input: $input) {
      success
      message
    }
  }
`;

// ============================================================
// TYPES
// ============================================================

type KycStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED';

type AdminApprovalStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED';

type SalonStatus =
  | 'OPEN'
  | 'CLOSED'
  | 'TEMPORARILY_CLOSED';

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
// BUSINESS HOURS
// ============================================================

interface BusinessHour {
  isOpen?: boolean | null;
  open?: string | null;
  close?: string | null;
}

interface BusinessHours {
  MONDAY?: BusinessHour | null;
  TUESDAY?: BusinessHour | null;
  WEDNESDAY?: BusinessHour | null;
  THURSDAY?: BusinessHour | null;
  FRIDAY?: BusinessHour | null;
  SATURDAY?: BusinessHour | null;
  SUNDAY?: BusinessHour | null;
}

// ============================================================
// SERVICE SELECTION
// ============================================================

interface SalonServiceSelection {
  categoryId: string;
  categoryName: string;
  subcategoryId: string;
  subcategoryName: string;
  audience: string;
  price: number;
  duration: number;
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
// SALON
// ============================================================

interface Salon {
  salonId: string;

  ownerUserId?: string | null;

  salonName?: string | null;
  ownerName?: string | null;
  ownerPhoneNumber?: string | null;
  alternatePhone?: string | null;
  email?: string | null;
  businessType?: string | null;

  address?: SalonAddress | null;

  latitude?: number | null;
  longitude?: number | null;

  businessHours?: BusinessHours | null;

  serviceSelections?: SalonServiceSelection[] | null;

  gstNumber?: string | null;
  panNumber?: string | null;
  aadhaarNumber?: string | null;
  shopEstablishmentNumber?: string | null;
  udyamNumber?: string | null;

  documents?: SalonDocuments | null;

  bankAccount?: string | null;
  ifsc?: string | null;
  accountHolderName?: string | null;

  logoUrl?: string | null;
  coverImageUrl?: string | null;
  galleryImages?: string[] | null;

  kycStatus: KycStatus;

  adminApprovalStatus?: AdminApprovalStatus | null;

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

// ============================================================
// RESPONSE
// ============================================================

interface AdminSalonsResponse {
  adminSalons: {
    success: boolean;
    message: string;
    totalCount: number;
    salons: Salon[];
  };
}

// ============================================================
// VARIABLES
// ============================================================

interface AdminSalonsVariables {
  search?: string;
  kycStatus?: KycStatus;
  salonStatus?: SalonStatus;
  isActive?: boolean;
}

// ============================================================
// MUTATION RESPONSE TYPES
// ============================================================

interface SalonMutationResponse {
  success: boolean;
  message: string;
}

interface ApproveSalonResponse {
  adminApproveSalon: SalonMutationResponse;
}

interface RejectSalonResponse {
  rejectSalon: SalonMutationResponse;
}

interface ApproveSalonVariables {
  input: {
    salonId: string;
  };
}

interface RejectSalonVariables {
  input: {
    salonId: string;
    rejectionReason: string;
  };
}

// ============================================================
// HELPERS
// ============================================================

const getInitials = (name?: string | null) => {
  if (!name) return 'S';

  return name
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

const formatCurrency = (value?: number | null) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value || 0);
};

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

const formatDateTime = (date?: string | null) => {
  if (!date) return '—';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(parsedDate);
};

const maskAadhaar = (value?: string | null) => {
  if (!value) return 'Not provided';

  const digits = value.replace(/\D/g, '');

  if (digits.length === 12) {
    return `XXXX-XXXX-${digits.slice(-4)}`;
  }

  return value;
};

const maskBankAccount = (value?: string | null) => {
  if (!value) return 'Not provided';

  if (value.length <= 4) {
    return value;
  }

  return `${'*'.repeat(
    Math.max(0, value.length - 4)
  )}${value.slice(-4)}`;
};

// ============================================================
// STATUS CHIP
// ============================================================

function StatusChip({
  status
}: {
  status: KycStatus;
}) {
  if (status === 'APPROVED') {
    return (
      <Chip
        icon={<CheckCircleOutlined />}
        label="KYC Approved"
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
        label="KYC Rejected"
        size="small"
        color="error"
        variant="outlined"
      />
    );
  }

  return (
    <Chip
      icon={<ClockCircleOutlined />}
      label="KYC Pending"
      size="small"
      color="warning"
      variant="outlined"
    />
  );
}

// ============================================================
// ADMIN APPROVAL CHIP
// ============================================================

function AdminApprovalStatusChip({
  status
}: {
  status?: AdminApprovalStatus | null;
}) {
  if (status === 'APPROVED') {
    return (
      <Chip
        icon={<CheckCircleOutlined />}
        label="Admin Approved"
        size="small"
        color="success"
      />
    );
  }

  if (status === 'REJECTED') {
    return (
      <Chip
        icon={<CloseCircleOutlined />}
        label="Admin Rejected"
        size="small"
        color="error"
      />
    );
  }

  return (
    <Chip
      icon={<ClockCircleOutlined />}
      label="Awaiting Admin Approval"
      size="small"
      color="warning"
      variant="outlined"
    />
  );
}

// ============================================================
// SALON STATUS CHIP
// ============================================================

function SalonStatusChip({
  status
}: {
  status: SalonStatus;
}) {
  if (status === 'OPEN') {
    return (
      <Chip
        label="Open"
        size="small"
        color="success"
      />
    );
  }

  if (status === 'TEMPORARILY_CLOSED') {
    return (
      <Chip
        label="Temporarily Closed"
        size="small"
        color="warning"
      />
    );
  }

  return (
    <Chip
      label="Closed"
      size="small"
      color="default"
    />
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
  value?: string | number | null;
}) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: 'block',
          mb: 0.5
        }}
      >
        {label}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          fontWeight: 500,
          wordBreak: 'break-word'
        }}
      >
        {value !== undefined &&
          value !== null &&
          String(value).trim() !== ''
          ? value
          : 'Not provided'}
      </Typography>
    </Box>
  );
}

// ============================================================
// SECTION TITLE
// ============================================================

function SectionTitle({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <Typography
      variant="h6"
      sx={{
        mb: 2,
        fontWeight: 700
      }}
    >
      {children}
    </Typography>
  );
}

// ============================================================
// BUSINESS HOURS DISPLAY
// ============================================================

function BusinessHoursSection({
  businessHours
}: {
  businessHours?: BusinessHours | null;
}) {
  const days: {
    key: keyof BusinessHours;
    label: string;
  }[] = [
      {
        key: 'MONDAY',
        label: 'Monday'
      },
      {
        key: 'TUESDAY',
        label: 'Tuesday'
      },
      {
        key: 'WEDNESDAY',
        label: 'Wednesday'
      },
      {
        key: 'THURSDAY',
        label: 'Thursday'
      },
      {
        key: 'FRIDAY',
        label: 'Friday'
      },
      {
        key: 'SATURDAY',
        label: 'Saturday'
      },
      {
        key: 'SUNDAY',
        label: 'Sunday'
      }
    ];

  return (
    <Grid
      container
      spacing={1.5}
    >
      {days.map((day) => {
        const hours =
          businessHours?.[day.key];

        const isOpen =
          hours?.isOpen === true;

        return (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            key={day.key}
          >
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                borderRadius: 2
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={1}
              >
                <Typography
                  variant="body2"
                  fontWeight={600}
                >
                  {day.label}
                </Typography>

                <Chip
                  size="small"
                  label={
                    isOpen
                      ? 'Open'
                      : 'Closed'
                  }
                  color={
                    isOpen
                      ? 'success'
                      : 'default'
                  }
                  variant={
                    isOpen
                      ? 'filled'
                      : 'outlined'
                  }
                />
              </Stack>

              {isOpen && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {hours?.open || '—'} —{' '}
                  {hours?.close || '—'}
                </Typography>
              )}

              {!isOpen && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Closed
                </Typography>
              )}
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
}

// ============================================================
// PAGE
// ============================================================

export default function SalonApplications() {
  const [tab, setTab] =
    useState<'ALL' | KycStatus>('ALL');

  const [search, setSearch] =
    useState('');

  const [page, setPage] =
    useState(0);

  const [rowsPerPage, setRowsPerPage] =
    useState(10);

  const [selectedSalon, setSelectedSalon] =
    useState<Salon | null>(null);

  const [detailsOpen, setDetailsOpen] =
    useState(false);

  const [rejectOpen, setRejectOpen] =
    useState(false);

  const [rejectionReason, setRejectionReason] =
    useState('');

  // ==========================================================
  // QUERY
  // ==========================================================

  const {
    data,
    loading,
    error,
    refetch
  } = useQuery<
    AdminSalonsResponse,
    AdminSalonsVariables
  >(
    ADMIN_SALONS,
    {
      variables: {
        search: undefined,
        kycStatus: undefined,
        salonStatus: undefined,
        isActive: undefined
      },
      fetchPolicy: 'network-only'
    }
  );

  // ==========================================================
  // APPROVE
  // ==========================================================

  const [
    approveSalon,
    {
      loading: approving
    }
  ] = useMutation<
    ApproveSalonResponse,
    ApproveSalonVariables
  >(APPROVE_SALON_LOCAL);

  // ==========================================================
  // REJECT
  // ==========================================================

  const [
    rejectSalon,
    {
      loading: rejecting
    }
  ] = useMutation<
    RejectSalonResponse,
    RejectSalonVariables
  >(REJECT_SALON_LOCAL);

  // ==========================================================
  // SALONS
  // ==========================================================

  const salons =
    data?.adminSalons?.salons || [];

  // ==========================================================
  // COUNTS
  // ==========================================================

  const counts = useMemo(() => {
    return {
      all: salons.length,

      pending: salons.filter(
        (item) =>
          item.kycStatus ===
          'PENDING'
      ).length,

      approved: salons.filter(
        (item) =>
          item.kycStatus ===
          'APPROVED'
      ).length,

      rejected: salons.filter(
        (item) =>
          item.kycStatus ===
          'REJECTED'
      ).length
    };
  }, [salons]);

  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredApplications =
    useMemo(() => {
      const query =
        search.toLowerCase().trim();

      return salons.filter((salon) => {
        const matchesTab =
          tab === 'ALL' ||
          salon.kycStatus === tab;

        const matchesSearch =
          !query ||
          (salon.salonName || '')
            .toLowerCase()
            .includes(query) ||
          (salon.ownerName || '')
            .toLowerCase()
            .includes(query) ||
          (salon.ownerPhoneNumber || '')
            .toLowerCase()
            .includes(query) ||
          (salon.email || '')
            .toLowerCase()
            .includes(query) ||
          (salon.address?.city || '')
            .toLowerCase()
            .includes(query) ||
          (salon.address?.state || '')
            .toLowerCase()
            .includes(query) ||
          salon.salonId
            .toLowerCase()
            .includes(query);

        return (
          matchesTab &&
          matchesSearch
        );
      });
    }, [
      salons,
      search,
      tab
    ]);

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const paginatedApplications =
    filteredApplications.slice(
      page * rowsPerPage,
      page * rowsPerPage +
      rowsPerPage
    );

  // ==========================================================
  // VIEW
  // ==========================================================

  const handleView = (
    salon: Salon
  ) => {
    console.log(
      '========== VIEW SALON =========='
    );

    console.log(
      'Salon:',
      salon.salonName
    );

    console.log(
      'Service selections:',
      salon.serviceSelections
    );

    setSelectedSalon(salon);
    setDetailsOpen(true);
  };

  // ==========================================================
  // APPROVE
  // ==========================================================

  const handleApprove = async (
    salon: Salon
  ) => {
    if (
      approving ||
      rejecting
    ) {
      return;
    }

    if (
      salon.kycStatus !==
      'APPROVED'
    ) {
      window.alert(
        'This salon cannot be approved by admin until third-party KYC is approved.'
      );

      return;
    }

    if (
      salon.adminApprovalStatus ===
      'APPROVED'
    ) {
      window.alert(
        'This salon has already been approved by admin.'
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to approve "${salon.salonName || 'this salon'}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      const result =
        await approveSalon({
          variables: {
            input: {
              salonId:
                salon.salonId
            }
          }
        });

      const response =
        result.data
          ?.adminApproveSalon;

      if (!response?.success) {
        throw new Error(
          response?.message ||
          'Failed to approve salon application.'
        );
      }

      window.alert(
        response.message ||
        'Salon application approved successfully.'
      );

      setDetailsOpen(false);
      setSelectedSalon(null);

      await refetch();
    } catch (
    mutationError
    ) {
      console.error(
        'Approve salon error:',
        mutationError
      );

      let message =
        'Failed to approve salon application.';

      if (
        mutationError &&
        typeof mutationError ===
        'object' &&
        'message' in
        mutationError
      ) {
        message = String(
          (
            mutationError as {
              message: string;
            }
          ).message
        );
      }

      window.alert(message);
    }
  };

  // ==========================================================
  // OPEN REJECT
  // ==========================================================

  const handleOpenReject = (
    salon: Salon
  ) => {
    setSelectedSalon(salon);
    setRejectionReason('');
    setRejectOpen(true);
  };

  // ==========================================================
  // REJECT
  // ==========================================================

  const handleReject =
    async () => {
      if (!selectedSalon) {
        return;
      }

      const reason =
        rejectionReason.trim();

      if (!reason) {
        return;
      }

      if (
        rejecting ||
        approving
      ) {
        return;
      }

      try {
        const result =
          await rejectSalon({
            variables: {
              input: {
                salonId:
                  selectedSalon.salonId,
                rejectionReason:
                  reason
              }
            }
          });

        const response =
          result.data?.rejectSalon;

        if (!response?.success) {
          throw new Error(
            response?.message ||
            'Failed to reject salon application.'
          );
        }

        window.alert(
          response.message ||
          'Salon application rejected successfully.'
        );

        setRejectOpen(false);
        setDetailsOpen(false);
        setRejectionReason('');
        setSelectedSalon(null);

        await refetch();
      } catch (
      mutationError
      ) {
        console.error(
          'Reject salon error:',
          mutationError
        );

        let message =
          'Failed to reject salon application.';

        if (
          mutationError &&
          typeof mutationError ===
          'object' &&
          'message' in
          mutationError
        ) {
          message = String(
            (
              mutationError as {
                message: string;
              }
            ).message
          );
        }

        window.alert(message);
      }
    };

  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh =
    async () => {
      try {
        await refetch();
      } catch (
      refreshError
      ) {
        console.error(
          'Failed to refresh salons:',
          refreshError
        );
      }
    };

  // ==========================================================
  // TAB CHANGE
  // ==========================================================

  const handleTabChange = (
    _: React.SyntheticEvent,
    value: 'ALL' | KycStatus
  ) => {
    setTab(value);
    setPage(0);
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <Box>
      {/* ====================================================
          HEADER
      ==================================================== */}

      <Grid
        container
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Grid item>
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
          >
            <Box />
          </Stack>
        </Grid>

        <Grid item>
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
            Refresh
          </Button>
        </Grid>
      </Grid>

      {/* ====================================================
          ERROR
      ==================================================== */}

      {error && (
        <Paper
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2,
            border: '1px solid',
            borderColor:
              'error.main',
            bgcolor:
              'error.lighter'
          }}
        >
          <Typography
            color="error"
            fontWeight={600}
          >
            Failed to load salon
            applications
          </Typography>

          <Typography
            variant="body2"
            color="error"
            sx={{ mt: 0.5 }}
          >
            {error.message}
          </Typography>

          <Button
            size="small"
            sx={{ mt: 1 }}
            onClick={
              handleRefresh
            }
          >
            Try Again
          </Button>
        </Paper>
      )}

      {/* ====================================================
          STAT CARDS
      ==================================================== */}

      <Grid
        container
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <Paper
            sx={{
              p: 2.5,
              border: '1px solid',
              borderColor:
                'divider',
              borderRadius: 2
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
            >
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Total Applications
                </Typography>

                <Typography
                  variant="h3"
                  sx={{ mt: 1 }}
                >
                  {loading
                    ? '—'
                    : counts.all}
                </Typography>
              </Box>

              <Avatar
                sx={{
                  bgcolor:
                    'primary.lighter',
                  color:
                    'primary.main'
                }}
              >
                <FileTextOutlined />
              </Avatar>
            </Stack>
          </Paper>
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <Paper
            sx={{
              p: 2.5,
              border: '1px solid',
              borderColor:
                'divider',
              borderRadius: 2
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
            >
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Pending KYC
                </Typography>

                <Typography
                  variant="h3"
                  sx={{ mt: 1 }}
                  color="warning.main"
                >
                  {loading
                    ? '—'
                    : counts.pending}
                </Typography>
              </Box>

              <Avatar
                sx={{
                  bgcolor:
                    'warning.lighter',
                  color:
                    'warning.main'
                }}
              >
                <ClockCircleOutlined />
              </Avatar>
            </Stack>
          </Paper>
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <Paper
            sx={{
              p: 2.5,
              border: '1px solid',
              borderColor:
                'divider',
              borderRadius: 2
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
            >
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  KYC Approved
                </Typography>

                <Typography
                  variant="h3"
                  sx={{ mt: 1 }}
                  color="success.main"
                >
                  {loading
                    ? '—'
                    : counts.approved}
                </Typography>
              </Box>

              <Avatar
                sx={{
                  bgcolor:
                    'success.lighter',
                  color:
                    'success.main'
                }}
              >
                <CheckCircleOutlined />
              </Avatar>
            </Stack>
          </Paper>
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <Paper
            sx={{
              p: 2.5,
              border: '1px solid',
              borderColor:
                'divider',
              borderRadius: 2
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
            >
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  KYC Rejected
                </Typography>

                <Typography
                  variant="h3"
                  sx={{ mt: 1 }}
                  color="error.main"
                >
                  {loading
                    ? '—'
                    : counts.rejected}
                </Typography>
              </Box>

              <Avatar
                sx={{
                  bgcolor:
                    'error.lighter',
                  color:
                    'error.main'
                }}
              >
                <CloseCircleOutlined />
              </Avatar>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* ====================================================
          TABLE
      ==================================================== */}

      <Paper
        sx={{
          border: '1px solid',
          borderColor:
            'divider',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Tabs
          value={tab}
          onChange={
            handleTabChange
          }
          sx={{
            px: 2,
            borderBottom:
              '1px solid',
            borderColor:
              'divider'
          }}
        >
          <Tab
            value="ALL"
            label={`All (${counts.all})`}
          />

          <Tab
            value="PENDING"
            label={`Pending KYC (${counts.pending})`}
          />

          <Tab
            value="APPROVED"
            label={`KYC Approved (${counts.approved})`}
          />

          <Tab
            value="REJECTED"
            label={`KYC Rejected (${counts.rejected})`}
          />
        </Tabs>

        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by salon, owner, phone, email, city or salon ID..."
            value={search}
            onChange={(event) => {
              setSearch(
                event.target.value
              );
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
        </Box>

        <Divider />

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  Application
                </TableCell>

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
                  Submitted
                </TableCell>

                <TableCell>
                  KYC Status
                </TableCell>

                <TableCell>
                  Admin Status
                </TableCell>

                <TableCell align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading &&
                Array.from({
                  length: 4
                }).map(
                  (_, index) => (
                    <TableRow
                      key={index}
                    >
                      <TableCell
                        colSpan={8}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            py: 1
                          }}
                        >
                          Loading salon
                          applications...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )
                )}

              {!loading &&
                paginatedApplications.map(
                  (salon) => (
                    <TableRow
                      hover
                      key={
                        salon.salonId
                      }
                    >
                      <TableCell>
                        <Typography
                          variant="subtitle2"
                          fontWeight={600}
                        >
                          {
                            salon.salonId
                          }
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {salon.businessType ||
                            'Business'}
                        </Typography>
                      </TableCell>

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
                              bgcolor:
                                'primary.lighter',
                              color:
                                'primary.main'
                            }}
                          >
                            <ShopOutlined />
                          </Avatar>

                          <Box>
                            <Typography
                              variant="subtitle2"
                              fontWeight={600}
                            >
                              {salon.salonName ||
                                'Unnamed Salon'}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {salon.email ||
                                'No email'}
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
                              {salon.ownerName ||
                                'Unknown Owner'}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {salon.ownerPhoneNumber ||
                                'No phone'}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={0.75}
                          alignItems="center"
                        >
                          <EnvironmentOutlined />

                          <Box>
                            <Typography variant="body2">
                              {salon.address?.city ||
                                '—'}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {salon.address?.state ||
                                '—'}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(
                            salon.createdAt
                          )}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <StatusChip
                          status={
                            salon.kycStatus
                          }
                        />

                        {salon.kycStatus ===
                          'PENDING' && (
                            <Typography
                              variant="caption"
                              color="warning.main"
                              sx={{
                                display:
                                  'block',
                                mt: 0.5
                              }}
                            >
                              Awaiting third-party
                              verification
                            </Typography>
                          )}

                        {salon.kycStatus ===
                          'REJECTED' && (
                            <Typography
                              variant="caption"
                              color="error.main"
                              sx={{
                                display:
                                  'block',
                                mt: 0.5
                              }}
                            >
                              KYC was rejected
                            </Typography>
                          )}
                      </TableCell>

                      <TableCell>
                        <AdminApprovalStatusChip
                          status={
                            salon.adminApprovalStatus
                          }
                        />

                        {salon.kycStatus ===
                          'APPROVED' &&
                          salon.adminApprovalStatus !==
                          'APPROVED' && (
                            <Typography
                              variant="caption"
                              color="warning.main"
                              sx={{
                                display:
                                  'block',
                                mt: 0.5
                              }}
                            >
                              Ready for admin
                              approval
                            </Typography>
                          )}
                      </TableCell>

                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={0.5}
                          justifyContent="flex-end"
                        >
                          <Tooltip title="View application">
                            <IconButton
                              color="primary"
                              onClick={() =>
                                handleView(
                                  salon
                                )
                              }
                              disabled={
                                approving ||
                                rejecting
                              }
                            >
                              <EyeOutlined />
                            </IconButton>
                          </Tooltip>

                          {salon.kycStatus ===
                            'APPROVED' &&
                            salon.adminApprovalStatus !==
                            'APPROVED' && (
                              <Tooltip title="Approve salon">
                                <IconButton
                                  color="success"
                                  onClick={() =>
                                    handleApprove(
                                      salon
                                    )
                                  }
                                  disabled={
                                    approving ||
                                    rejecting
                                  }
                                >
                                  <CheckCircleOutlined />
                                </IconButton>
                              </Tooltip>
                            )}

                          {salon.kycStatus ===
                            'APPROVED' &&
                            salon.adminApprovalStatus !==
                            'APPROVED' && (
                              <Tooltip title="Reject salon">
                                <IconButton
                                  color="error"
                                  onClick={() =>
                                    handleOpenReject(
                                      salon
                                    )
                                  }
                                  disabled={
                                    approving ||
                                    rejecting
                                  }
                                >
                                  <CloseCircleOutlined />
                                </IconButton>
                              </Tooltip>
                            )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )
                )}

              {!loading &&
                filteredApplications.length ===
                0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      align="center"
                      sx={{ py: 8 }}
                    >
                      <FileTextOutlined
                        style={{
                          fontSize: 40
                        }}
                      />

                      <Typography
                        variant="h6"
                        sx={{ mt: 2 }}
                      >
                        No applications found
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Try changing your
                        search or filter.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={
            filteredApplications.length
          }
          page={page}
          onPageChange={(_, newPage) =>
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
      </Paper>

      {/* ====================================================
          VIEW / APPLICATION DETAILS
      ==================================================== */}

      <Dialog
        open={detailsOpen}
        onClose={() =>
          setDetailsOpen(false)
        }
        maxWidth="lg"
        fullWidth
        scroll="paper"
      >
        {selectedSalon && (
          <>
            {/* ==================================================
                DIALOG HEADER
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
                spacing={2}
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
                      width: 60,
                      height: 60,
                      bgcolor:
                        'primary.lighter',
                      color:
                        'primary.main'
                    }}
                  >
                    <ShopOutlined />
                  </Avatar>

                  <Box>
                    <Typography
                      variant="h5"
                      fontWeight={700}
                    >
                      {selectedSalon.salonName ||
                        'Unnamed Salon'}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 0.5
                      }}
                    >
                      Salon ID:{' '}
                      {
                        selectedSalon.salonId
                      }
                    </Typography>
                  </Box>
                </Stack>

                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                >
                  <StatusChip
                    status={
                      selectedSalon.kycStatus
                    }
                  />

                  <AdminApprovalStatusChip
                    status={
                      selectedSalon.adminApprovalStatus
                    }
                  />

                  <SalonStatusChip
                    status={
                      selectedSalon.salonStatus
                    }
                  />
                </Stack>
              </Stack>
            </DialogTitle>

            <DialogContent dividers>
              {/* ==================================================
                  1. BUSINESS INFORMATION
              ================================================== */}

              <SectionTitle>
                Business Information
              </SectionTitle>

              <Grid
                container
                spacing={2}
              >
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
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
                  md={4}
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
                  md={4}
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
                  md={4}
                >
                  <DetailField
                    label="Application Submitted"
                    value={formatDateTime(
                      selectedSalon.createdAt
                    )}
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                >
                  <DetailField
                    label="Last Updated"
                    value={formatDateTime(
                      selectedSalon.updatedAt
                    )}
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                >
                  <DetailField
                    label="Last Updated By"
                    value={
                      selectedSalon.lastUpdatedBy
                    }
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* ==================================================
                  2. SELECTED SERVICES
              ================================================== */}

              <SectionTitle>
                Selected Services
              </SectionTitle>

              {Array.isArray(
                selectedSalon.serviceSelections
              ) &&
                selectedSalon.serviceSelections
                  .length > 0 ? (
                <Stack
                  spacing={1.5}
                  sx={{ mb: 1 }}
                >
                  {selectedSalon.serviceSelections.map(
                    (
                      selection,
                      index
                    ) => (
                      <Paper
                        key={`${selection.categoryId}-${selection.subcategoryId}-${index}`}
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: 2
                        }}
                      >
                        <Stack
                          direction={{
                            xs: 'column',
                            sm: 'row'
                          }}
                          spacing={1}
                          alignItems={{
                            xs: 'flex-start',
                            sm: 'center'
                          }}
                        >
                          <Chip
                            label={
                              selection.categoryName ||
                              'Category name unavailable'
                            }
                            color="primary"
                            variant="outlined"
                            size="small"
                          />

                          <Typography
                            sx={{
                              fontWeight: 700,
                              color: 'text.secondary'
                            }}
                          >
                            →
                          </Typography>

                          <Chip
                            label={
                              selection.subcategoryName ||
                              'Subcategory name unavailable'
                            }
                            variant="outlined"
                            size="small"
                          />
                          <Chip
                            label={
                              selection.audience ||
                              'Audience unavailable'
                            }
                            color="secondary"
                            variant="outlined"
                            size="small"
                          />
                        </Stack>

                        {/* PRICE + DURATION */}
                        <Stack
                          direction={{
                            xs: 'column',
                            sm: 'row'
                          }}
                          spacing={3}
                          sx={{
                            mt: 2
                          }}
                        >
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: 'block'
                              }}
                            >
                              Price
                            </Typography>

                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: 700
                              }}
                            >
                              {selection.price !== undefined &&
                                selection.price !== null
                                ? formatCurrency(
                                  selection.price
                                )
                                : 'Not provided'}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: 'block'
                              }}
                            >
                              Duration
                            </Typography>

                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: 700
                              }}
                            >
                              {selection.duration !== undefined &&
                                selection.duration !== null
                                ? `${selection.duration} min`
                                : 'Not provided'}
                            </Typography>
                          </Box>
                        </Stack>

                        {/* IDS */}
                        <Stack
                          direction={{
                            xs: 'column',
                            sm: 'row'
                          }}
                          spacing={{
                            xs: 0.5,
                            sm: 2
                          }}
                          sx={{
                            mt: 1.5
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            Category ID:{' '}
                            {selection.categoryId}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            Subcategory ID:{' '}
                            {selection.subcategoryId}
                          </Typography>
                        </Stack>
                      </Paper>
                    )
                  )}
                </Stack>
              ) : (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
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

              <Divider sx={{ my: 3 }} />

              {/* ==================================================
                  3. OWNER INFORMATION
              ================================================== */}

              <SectionTitle>
                Owner Information
              </SectionTitle>

              <Grid
                container
                spacing={2}
              >
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                >
                  <DetailField
                    label="Owner Name"
                    value={
                      selectedSalon.ownerName
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                >
                  <DetailField
                    label="Phone Number"
                    value={
                      selectedSalon.ownerPhoneNumber
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                >
                  <DetailField
                    label="Alternate Phone"
                    value={
                      selectedSalon.alternatePhone
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
                  sm={6}
                >
                  <DetailField
                    label="Owner User ID"
                    value={
                      selectedSalon.ownerUserId
                    }
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* ==================================================
                  4. BUSINESS LOCATION
              ================================================== */}

              <SectionTitle>
                Business Location
              </SectionTitle>

              <Grid
                container
                spacing={2}
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

              <Divider sx={{ my: 3 }} />

              {/* ==================================================
                  5. BUSINESS HOURS
              ================================================== */}

              <SectionTitle>
                Business Hours
              </SectionTitle>

              <BusinessHoursSection
                businessHours={
                  selectedSalon.businessHours
                }
              />

              <Divider sx={{ my: 3 }} />

              {/* ==================================================
                  6. KYC / BUSINESS INFORMATION
              ================================================== */}

              <SectionTitle>
                KYC / Business Documents
              </SectionTitle>

              <Grid
                container
                spacing={2}
              >
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
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
                  md={4}
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
                  md={4}
                >
                  <DetailField
                    label="Aadhaar"
                    value={maskAadhaar(
                      selectedSalon.aadhaarNumber
                    )}
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                >
                  <DetailField
                    label="Shop Establishment Number"
                    value={
                      selectedSalon.shopEstablishmentNumber
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                >
                  <DetailField
                    label="Udyam Number"
                    value={
                      selectedSalon.udyamNumber
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                >
                  <DetailField
                    label="KYC Status"
                    value={
                      selectedSalon.kycStatus
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <DetailField
                    label="Admin Approval Status"
                    value={
                      selectedSalon.adminApprovalStatus
                    }
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* ==================================================
                  7. VERIFICATION
              ================================================== */}

              <SectionTitle>
                Verification & Approval
              </SectionTitle>

              <Grid
                container
                spacing={2}
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
                      borderRadius: 2
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Third-Party KYC
                    </Typography>

                    <Box sx={{ mt: 1 }}>
                      <StatusChip
                        status={
                          selectedSalon.kycStatus
                        }
                      />
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      KYC is controlled
                      by the third-party
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
                      borderRadius: 2
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Admin Approval
                    </Typography>

                    <Box sx={{ mt: 1 }}>
                      <AdminApprovalStatusChip
                        status={
                          selectedSalon.adminApprovalStatus
                        }
                      />
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Admin approval
                      activates the
                      provider approval
                      flow.
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* ==================================================
                  8. DOCUMENT FILES
              ================================================== */}

              <SectionTitle>
                Uploaded Documents
              </SectionTitle>

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
                    label="Aadhaar Front"
                    value={
                      selectedSalon.documents
                        ?.aadhaarFront
                        ? 'Uploaded'
                        : 'Not provided'
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <DetailField
                    label="Aadhaar Back"
                    value={
                      selectedSalon.documents
                        ?.aadhaarBack
                        ? 'Uploaded'
                        : 'Not provided'
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <DetailField
                    label="PAN Card"
                    value={
                      selectedSalon.documents
                        ?.panCard
                        ? 'Uploaded'
                        : 'Not provided'
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <DetailField
                    label="GST Certificate"
                    value={
                      selectedSalon.documents
                        ?.gstCertificate
                        ? 'Uploaded'
                        : 'Not provided'
                    }
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* ==================================================
                  9. BANK
              ================================================== */}

              <SectionTitle>
                Bank Information
              </SectionTitle>

              <Grid
                container
                spacing={2}
              >
                <Grid
                  item
                  xs={12}
                  sm={4}
                >
                  <DetailField
                    label="Account Holder"
                    value={
                      selectedSalon.accountHolderName
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={4}
                >
                  <DetailField
                    label="Bank Account"
                    value={maskBankAccount(
                      selectedSalon.bankAccount
                    )}
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={4}
                >
                  <DetailField
                    label="IFSC"
                    value={
                      selectedSalon.ifsc
                    }
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* ==================================================
                  10. SALON ACTIVITY
              ================================================== */}

              <SectionTitle>
                Salon Activity
              </SectionTitle>

              <Grid
                container
                spacing={2}
              >
                <Grid
                  item
                  xs={12}
                  sm={4}
                >
                  <DetailField
                    label="Active"
                    value={
                      selectedSalon.isActive
                        ? 'Yes'
                        : 'No'
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={4}
                >
                  <DetailField
                    label="Visible"
                    value={
                      selectedSalon.isVisible
                        ? 'Yes'
                        : 'No'
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={4}
                >
                  <DetailField
                    label="Deleted"
                    value={
                      selectedSalon.isDeleted
                        ? 'Yes'
                        : 'No'
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={4}
                >
                  <DetailField
                    label="Rating"
                    value={
                      selectedSalon.averageRating
                        ? `⭐ ${selectedSalon.averageRating.toFixed(
                          1
                        )}`
                        : 'No ratings'
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={4}
                >
                  <DetailField
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
                  <DetailField
                    label="Appointments"
                    value={selectedSalon.totalAppointments?.toLocaleString(
                      'en-IN'
                    )}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* ==================================================
                  11. BUSINESS PERFORMANCE
              ================================================== */}

              <SectionTitle>
                Business Performance
              </SectionTitle>

              <Grid
                container
                spacing={2}
              >
                <Grid
                  item
                  xs={12}
                  sm={4}
                >
                  <DetailField
                    label="Total Appointments"
                    value={selectedSalon.totalAppointments?.toLocaleString(
                      'en-IN'
                    )}
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={4}
                >
                  <DetailField
                    label="Completed"
                    value={selectedSalon.totalCompletedAppointments?.toLocaleString(
                      'en-IN'
                    )}
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={4}
                >
                  <DetailField
                    label="Cancelled"
                    value={selectedSalon.totalCancelledAppointments?.toLocaleString(
                      'en-IN'
                    )}
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <DetailField
                    label="Total Revenue"
                    value={formatCurrency(
                      selectedSalon.totalRevenue
                    )}
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                >
                  <DetailField
                    label="Total Reviews"
                    value={
                      selectedSalon.totalReviews
                    }
                  />
                </Grid>
              </Grid>

              {/* ==================================================
                  12. APPROVAL INFORMATION
              ================================================== */}

              {selectedSalon.approvedAt && (
                <>
                  <Divider sx={{ my: 3 }} />

                  <SectionTitle>
                    Approval Information
                  </SectionTitle>

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
                        label="Approved At"
                        value={formatDateTime(
                          selectedSalon.approvedAt
                        )}
                      />
                    </Grid>

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
                        label="Admin Approval Status"
                        value={
                          selectedSalon.adminApprovalStatus
                        }
                      />
                    </Grid>
                  </Grid>
                </>
              )}

              {/* ==================================================
                  13. REJECTION INFORMATION
              ================================================== */}

              {selectedSalon.rejectionReason && (
                <>
                  <Divider sx={{ my: 3 }} />

                  <SectionTitle>
                    Rejection Information
                  </SectionTitle>

                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2
                    }}
                  >
                    <DetailField
                      label="Reason"
                      value={
                        selectedSalon.rejectionReason
                      }
                    />

                    <Box sx={{ mt: 2 }}>
                      <DetailField
                        label="Rejected At"
                        value={formatDateTime(
                          selectedSalon.rejectedAt
                        )}
                      />
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      <DetailField
                        label="Rejected By"
                        value={
                          selectedSalon.rejectedBy
                        }
                      />
                    </Box>
                  </Paper>
                </>
              )}

              {/* ==================================================
                  14. SALON IMAGES
              ================================================== */}

              {(selectedSalon.logoUrl ||
                selectedSalon.coverImageUrl ||
                (selectedSalon.galleryImages &&
                  selectedSalon.galleryImages
                    .length > 0)) && (
                  <>
                    <Divider sx={{ my: 3 }} />

                    <SectionTitle>
                      Salon Images
                    </SectionTitle>

                    <Grid
                      container
                      spacing={2}
                    >
                      {selectedSalon.logoUrl && (
                        <Grid
                          item
                          xs={12}
                          sm={4}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            Logo
                          </Typography>

                          <Box
                            component="img"
                            src={
                              selectedSalon.logoUrl
                            }
                            alt="Salon logo"
                            sx={{
                              width: '100%',
                              height: 160,
                              objectFit:
                                'cover',
                              borderRadius: 2,
                              mt: 1
                            }}
                          />
                        </Grid>
                      )}

                      {selectedSalon.coverImageUrl && (
                        <Grid
                          item
                          xs={12}
                          sm={8}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            Cover Image
                          </Typography>

                          <Box
                            component="img"
                            src={
                              selectedSalon.coverImageUrl
                            }
                            alt="Salon cover"
                            sx={{
                              width: '100%',
                              height: 160,
                              objectFit:
                                'cover',
                              borderRadius: 2,
                              mt: 1
                            }}
                          />
                        </Grid>
                      )}
                    </Grid>

                    {selectedSalon
                      .galleryImages
                      ?.length ? (
                      <Box sx={{ mt: 2 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Gallery Images
                        </Typography>

                        <Grid
                          container
                          spacing={2}
                          sx={{ mt: 0.5 }}
                        >
                          {selectedSalon.galleryImages.map(
                            (
                              image,
                              index
                            ) => (
                              <Grid
                                item
                                xs={6}
                                sm={4}
                                md={3}
                                key={`${image}-${index}`}
                              >
                                <Box
                                  component="img"
                                  src={image}
                                  alt={`Salon gallery ${index + 1}`}
                                  sx={{
                                    width:
                                      '100%',
                                    height: 130,
                                    objectFit:
                                      'cover',
                                    borderRadius: 2,
                                    border:
                                      '1px solid',
                                    borderColor:
                                      'divider'
                                  }}
                                />
                              </Grid>
                            )
                          )}
                        </Grid>
                      </Box>
                    ) : null}
                  </>
                )}

              {/* ==================================================
                  15. CREATED / UPDATED
              ================================================== */}

              <Divider sx={{ my: 3 }} />

              <SectionTitle>
                Application Audit
              </SectionTitle>

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

                <Grid
                  item
                  xs={12}
                >
                  <DetailField
                    label="Last Updated By"
                    value={
                      selectedSalon.lastUpdatedBy
                    }
                  />
                </Grid>
              </Grid>
            </DialogContent>

            {/* ==================================================
                ACTIONS
            ================================================== */}

            <DialogActions
              sx={{
                p: 2,
                gap: 1
              }}
            >
              <Button
                onClick={() =>
                  setDetailsOpen(false)
                }
                disabled={
                  approving ||
                  rejecting
                }
              >
                Close
              </Button>

              {selectedSalon.kycStatus ===
                'APPROVED' &&
                selectedSalon.adminApprovalStatus !==
                'APPROVED' && (
                  <>
                    <Button
                      color="error"
                      variant="outlined"
                      startIcon={
                        rejecting
                          ? undefined
                          : (
                            <CloseCircleOutlined />
                          )
                      }
                      onClick={() =>
                        handleOpenReject(
                          selectedSalon
                        )
                      }
                      disabled={
                        approving ||
                        rejecting
                      }
                    >
                      {rejecting
                        ? 'Rejecting...'
                        : 'Reject'}
                    </Button>

                    <Button
                      color="success"
                      variant="contained"
                      startIcon={
                        approving
                          ? undefined
                          : (
                            <CheckCircleOutlined />
                          )
                      }
                      onClick={() =>
                        handleApprove(
                          selectedSalon
                        )
                      }
                      disabled={
                        approving ||
                        rejecting
                      }
                    >
                      {approving
                        ? 'Approving...'
                        : 'Approve Application'}
                    </Button>
                  </>
                )}

              {selectedSalon.kycStatus ===
                'PENDING' && (
                  <Typography
                    variant="body2"
                    color="warning.main"
                    sx={{ mr: 1 }}
                  >
                    Waiting for third-party
                    KYC approval.
                  </Typography>
                )}

              {selectedSalon.kycStatus ===
                'REJECTED' && (
                  <Typography
                    variant="body2"
                    color="error.main"
                    sx={{ mr: 1 }}
                  >
                    This application cannot
                    be approved because KYC
                    was rejected.
                  </Typography>
                )}

              {selectedSalon.adminApprovalStatus ===
                'APPROVED' && (
                  <Typography
                    variant="body2"
                    color="success.main"
                    sx={{ mr: 1 }}
                  >
                    Admin approval completed.
                  </Typography>
                )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ====================================================
          REJECT DIALOG
      ==================================================== */}

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
          Reject Salon Application
        </DialogTitle>

        <DialogContent>
          {selectedSalon && (
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle1"
                fontWeight={600}
              >
                {
                  selectedSalon.salonName
                }
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Salon ID:{' '}
                {
                  selectedSalon.salonId
                }
              </Typography>
            </Box>
          )}

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            Please provide a reason
            for rejecting this
            application.
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Enter rejection reason..."
            value={
              rejectionReason
            }
            onChange={(event) =>
              setRejectionReason(
                event.target.value
              )
            }
            disabled={rejecting}
            error={
              rejectionReason.length >
              0 &&
              !rejectionReason.trim()
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
            disabled={rejecting}
          >
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            disabled={
              !rejectionReason.trim() ||
              rejecting ||
              approving
            }
            onClick={
              handleReject
            }
          >
            {rejecting
              ? 'Rejecting...'
              : 'Reject Application'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}