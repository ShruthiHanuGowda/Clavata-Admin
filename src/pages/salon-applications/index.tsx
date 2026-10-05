import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
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
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  FileTextOutlined,
  SendOutlined
} from '@ant-design/icons';

import {
  ADMIN_SALONS,
  GENERATE_KYC_DOCUMENT_VIEW_URL,
  REJECT_SALON_LOCAL,
  APPROVE_SALON_LOCAL,
  SUBMIT_SALON_FOR_VERIFICATION
} from '../../graphql/queries';

/* ============================================================
 * TYPES
 * ============================================================ */

type AdminApprovalStatus =
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

type SalonVerificationStatus =
  | 'NOT_SUBMITTED'
  | 'SUBMITTED'
  | 'IN_REVIEW'
  | 'VERIFIED'
  | 'FAILED'
  | 'REJECTED';

type KycDocumentType =
  | 'PAN'
  | 'AADHAAR'
  | 'SHOP_ESTABLISHMENT'
  | 'GST'
  | 'UDYAM';

interface SalonAddress {
  addressLine?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
}

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

interface SalonServiceSelection {
  categoryId: string;
  categoryName: string;
  subcategoryId: string;
  subcategoryName: string;
  serviceName: string;
  audience: ServiceAudience;
  price: number;
  duration: number;
}

interface KycDocument {
  documentType: KycDocumentType;
  fileName: string;
  contentType: string;
  fileSize?: number | null;
  s3Key: string;
  uploadedAt: string;
}

interface SalonDocuments {
  pan?: KycDocument | null;
  aadhaar?: KycDocument | null;
  shopEstablishment?: KycDocument | null;
  gst?: KycDocument | null;
  udyam?: KycDocument | null;
}

interface SalonMedia {
  imageId: string;
  salonId: string;
  mediaType: string;
  key: string;
  objectUrl?: string | null;
  status?: string | null;
  uploadedAt?: string | null;
  approvedAt?: string | null;
  approvedBy?: string | null;
  rejectedAt?: string | null;
  rejectedBy?: string | null;
  rejectionReason?: string | null;
}

interface Salon {
  salonId: string;

  ownerUserId?: string | null;
  salonName?: string | null;
  ownerName?: string | null;

  targetAudiences?: ServiceAudience[] | null;

  ownerPhoneNumber?: string | null;
  alternatePhone?: string | null;
  email?: string | null;

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

  razorpayAccountId?: string | null;
  razorpayAccountStatus?: string | null;

  logoUrl?: string | null;
  coverImageUrl?: string | null;
  galleryImages?: string[] | null;

  logoMedia?: SalonMedia | null;
  coverMedia?: SalonMedia | null;
  galleryMedia?: SalonMedia[] | null;

  verificationStatus: SalonVerificationStatus;

  verificationSubmittedAt?: string | null;
  verificationCompletedAt?: string | null;
  verificationProvider?: string | null;
  verificationReferenceId?: string | null;
  verificationRejectionReason?: string | null;

  adminApprovalStatus: AdminApprovalStatus;

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

/* ============================================================
 * GRAPHQL RESPONSE TYPES
 * ============================================================ */

interface AdminSalonsResponse {
  adminSalons: {
    success: boolean;
    message: string;
    totalCount: number;
    salons: Salon[];
  };
}

interface AdminSalonsVariables {
  search?: string;
  verificationStatus?: SalonVerificationStatus;
  adminApprovalStatus?: AdminApprovalStatus;
  salonStatus?: SalonStatus;
  isActive?: boolean;
}

interface SalonMutationResponse {
  success: boolean;
  message: string;
}

interface ApproveSalonResponse {
  adminApproveSalon: SalonMutationResponse;
}

interface RejectSalonResponse {
  adminRejectSalon: SalonMutationResponse;
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

interface SubmitVerificationResponse {
  submitSalonForVerification: {
    success: boolean;
    message: string;
    salon?: {
      salonId: string;
      verificationStatus: SalonVerificationStatus;
      verificationSubmittedAt?: string | null;
      verificationCompletedAt?: string | null;
      verificationProvider?: string | null;
      verificationReferenceId?: string | null;
      verificationRejectionReason?: string | null;
    } | null;
  };
}

interface SubmitVerificationVariables {
  input: {
    salonId: string;
  };
}

interface DocumentViewResponse {
  generateKycDocumentViewUrl: {
    success: boolean;
    message: string;
    viewUrl?: string | null;
    fileName?: string | null;
    contentType?: string | null;
    expiresIn?: number | null;
  };
}

interface DocumentViewVariables {
  input: {
    salonId: string;
    documentType: KycDocumentType;
  };
}

/* ============================================================
 * CONSTANTS
 * ============================================================ */

const AUDIENCE_ORDER: ServiceAudience[] = [
  'FEMALE',
  'MALE',
  'KIDS'
];

const AUDIENCE_LABELS: Record<
  ServiceAudience,
  string
> = {
  FEMALE: 'Female',
  MALE: 'Male',
  KIDS: 'Kids'
};

/* ============================================================
 * HELPERS
 * ============================================================ */

const getInitials = (
  name?: string | null
) => {
  if (!name) return 'S';

  return name
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

const formatCurrency = (
  value?: number | null
) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value || 0);
};

const formatDateTime = (
  date?: string | null
) => {
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

const maskAadhaar = (
  value?: string | null
) => {
  if (!value) return 'Not provided';

  const digits = value.replace(/\D/g, '');

  if (digits.length === 12) {
    return `XXXX-XXXX-${digits.slice(-4)}`;
  }

  return value;
};

/* ============================================================
 * STATUS CHIPS
 * ============================================================ */

const VerificationStatusChip = ({
  status
}: {
  status: SalonVerificationStatus;
}) => {
  let color:
    | 'success'
    | 'error'
    | 'warning'
    | 'default'
    | 'info' = 'default';

  switch (status) {
    case 'VERIFIED':
      color = 'success';
      break;

    case 'REJECTED':
    case 'FAILED':
      color = 'error';
      break;

    case 'SUBMITTED':
    case 'IN_REVIEW':
      color = 'warning';
      break;

    case 'NOT_SUBMITTED':
    default:
      color = 'default';
      break;
  }

  return (
    <Chip
      label={status.replace(/_/g, ' ')}
      color={color}
      size="small"
      variant="outlined"
    />
  );
};

const AdminApprovalStatusChip = ({
  status
}: {
  status: AdminApprovalStatus;
}) => {
  const color =
    status === 'APPROVED'
      ? 'success'
      : status === 'REJECTED'
        ? 'error'
        : 'warning';

  return (
    <Chip
      label={status}
      color={color}
      size="small"
      variant="outlined"
    />
  );
};

const SalonStatusChip = ({
  status
}: {
  status: SalonStatus;
}) => {
  return (
    <Chip
      label={status.replace(/_/g, ' ')}
      color={
        status === 'OPEN'
          ? 'success'
          : 'default'
      }
      size="small"
      variant="outlined"
    />
  );
};

/* ============================================================
 * DETAIL FIELD
 * ============================================================ */

const DetailField = ({
  label,
  value
}: {
  label: string;
  value?: React.ReactNode;
}) => {
  const displayValue =
    value === undefined ||
    value === null ||
    value === ''
      ? 'Not provided'
      : value;

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
          fontWeight: 600,
          wordBreak: 'break-word'
        }}
      >
        {displayValue}
      </Typography>
    </Box>
  );
};

/* ============================================================
 * SECTION TITLE
 * ============================================================ */

const SectionTitle = ({
  children
}: {
  children: React.ReactNode;
}) => (
  <Typography
    variant="h6"
    fontWeight={700}
    sx={{ mb: 2 }}
  >
    {children}
  </Typography>
);

/* ============================================================
 * BUSINESS HOURS
 * ============================================================ */

const BusinessHoursSection = ({
  businessHours
}: {
  businessHours?: BusinessHours | null;
}) => {
  const days: Array<{
    key: keyof BusinessHours;
    label: string;
  }> = [
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
    <Grid container spacing={1.5}>
      {days.map((day) => {
        const hours =
          businessHours?.[day.key];

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
              <Typography
                variant="subtitle2"
                fontWeight={700}
              >
                {day.label}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {hours?.isOpen
                  ? `${hours.open || '—'} - ${
                      hours.close || '—'
                    }`
                  : 'Closed'}
              </Typography>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
};

/* ============================================================
 * DOCUMENT VIEW
 * ============================================================ */

const DocumentViewButton = ({
  salonId,
  document,
  documentType,
  loading,
  onView
}: {
  salonId: string;
  document?: KycDocument | null;
  documentType: KycDocumentType;
  loading: boolean;
  onView: (
    salonId: string,
    documentType: KycDocumentType
  ) => void;
}) => {
  if (!document) {
    return (
      <Typography
        variant="body2"
        color="text.secondary"
      >
        Document not uploaded
      </Typography>
    );
  }

  return (
    <Stack spacing={1}>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          wordBreak: 'break-word'
        }}
      >
        {document.fileName}
      </Typography>

      <Typography
        variant="caption"
        color="text.secondary"
      >
        {document.contentType}

        {document.fileSize
          ? ` • ${(
              document.fileSize / 1024
            ).toFixed(1)} KB`
          : ''}
      </Typography>

      <Button
        size="small"
        variant="outlined"
        onClick={() =>
          onView(salonId, documentType)
        }
        disabled={loading}
      >
        {loading
          ? 'Opening...'
          : 'View Document'}
      </Button>
    </Stack>
  );
};

/* ============================================================
 * MAIN COMPONENT
 * ============================================================ */

export default function SalonApplications() {
  /*
   * The application list is now driven by
   * verificationStatus rather than legacy kycStatus.
   *
   * ALL
   * NOT_SUBMITTED
   * SUBMITTED
   * IN_REVIEW
   * VERIFIED
   * FAILED
   * REJECTED
   */
  const [
    tab,
    setTab
  ] = useState<
    'ALL' | SalonVerificationStatus
  >('ALL');

  const [
    search,
    setSearch
  ] = useState('');

  const [
    page,
    setPage
  ] = useState(0);

  const [
    rowsPerPage,
    setRowsPerPage
  ] = useState(10);

  const [
    selectedSalon,
    setSelectedSalon
  ] = useState<Salon | null>(null);

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

  const [
    viewingDocument,
    setViewingDocument
  ] = useState<string | null>(null);

  /* ==========================================================
   * QUERY
   * ========================================================== */

  const {
    data,
    loading,
    error,
    refetch
  } = useQuery<
    AdminSalonsResponse,
    AdminSalonsVariables
  >(ADMIN_SALONS, {
    variables: {},
    fetchPolicy: 'network-only'
  });

  /* ==========================================================
   * MUTATIONS
   * ========================================================== */

  const [
    submitSalonForVerification,
    {
      loading:
        submittingVerification
    }
  ] = useMutation<
    SubmitVerificationResponse,
    SubmitVerificationVariables
  >(SUBMIT_SALON_FOR_VERIFICATION);

  const [
    approveSalon,
    {
      loading: approving
    }
  ] = useMutation<
    ApproveSalonResponse,
    ApproveSalonVariables
  >(APPROVE_SALON_LOCAL);

  const [
    rejectSalon,
    {
      loading: rejecting
    }
  ] = useMutation<
    RejectSalonResponse,
    RejectSalonVariables
  >(REJECT_SALON_LOCAL);

  const [
    generateDocumentViewUrl,
    {
      loading:
        generatingDocumentUrl
    }
  ] = useMutation<
    DocumentViewResponse,
    DocumentViewVariables
  >(GENERATE_KYC_DOCUMENT_VIEW_URL);

  /* ==========================================================
   * SALONS
   * ========================================================== */

  const salons =
    data?.adminSalons?.salons || [];

  /* ==========================================================
   * SEARCH + TABS
   * ========================================================== */

  const filteredApplications =
    useMemo(() => {
      const normalizedSearch =
        search.trim().toLowerCase();

      return salons.filter((salon) => {
        const matchesTab =
          tab === 'ALL' ||
          salon.verificationStatus ===
            tab;

        if (!matchesTab) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        return [
          salon.salonName,
          salon.ownerName,
          salon.email,
          salon.ownerPhoneNumber,
          salon.salonId,
          salon.address?.city,
          salon.address?.state,
          salon.address?.pincode
        ]
          .filter(Boolean)
          .some((value) =>
            String(value)
              .toLowerCase()
              .includes(
                normalizedSearch
              )
          );
      });
    }, [
      salons,
      tab,
      search
    ]);

  /* ==========================================================
   * PAGINATION
   * ========================================================== */

  const paginatedApplications =
    filteredApplications.slice(
      page * rowsPerPage,
      page * rowsPerPage +
        rowsPerPage
    );

  /* ==========================================================
   * VERIFICATION STATS
   * ========================================================== */

  const stats = useMemo(() => {
    return {
      total: salons.length,

      notSubmitted: salons.filter(
        (salon) =>
          salon.verificationStatus ===
          'NOT_SUBMITTED'
      ).length,

      submitted: salons.filter(
        (salon) =>
          salon.verificationStatus ===
          'SUBMITTED'
      ).length,

      inReview: salons.filter(
        (salon) =>
          salon.verificationStatus ===
          'IN_REVIEW'
      ).length,

      verified: salons.filter(
        (salon) =>
          salon.verificationStatus ===
          'VERIFIED'
      ).length,

      failed: salons.filter(
        (salon) =>
          salon.verificationStatus ===
          'FAILED'
      ).length,

      rejected: salons.filter(
        (salon) =>
          salon.verificationStatus ===
          'REJECTED'
      ).length,

      readyForApproval: salons.filter(
        (salon) =>
          salon.verificationStatus ===
            'VERIFIED' &&
          salon.adminApprovalStatus !==
            'APPROVED'
      ).length,

      businessApproved: salons.filter(
        (salon) =>
          salon.adminApprovalStatus ===
          'APPROVED'
      ).length
    };
  }, [salons]);

  /* ==========================================================
   * GROUP SERVICES
   * ========================================================== */

  const groupedServices =
    useMemo(() => {
      const services =
        selectedSalon?.serviceSelections ||
        [];

      const grouped: Record<
        ServiceAudience,
        SalonServiceSelection[]
      > = {
        FEMALE: [],
        MALE: [],
        KIDS: []
      };

      services.forEach((service) => {
        if (
          grouped[service.audience]
        ) {
          grouped[
            service.audience
          ].push(service);
        }
      });

      return AUDIENCE_ORDER
        .filter(
          (audience) =>
            grouped[audience].length > 0
        )
        .map((audience) => ({
          audience,
          label:
            AUDIENCE_LABELS[
              audience
            ],
          services:
            grouped[audience]
        }));
    }, [
      selectedSalon?.serviceSelections
    ]);

  /* ==========================================================
   * REVIEW / VIEW
   * ========================================================== */

  const handleView = (
    salon: Salon
  ) => {
    setSelectedSalon(salon);
    setDetailsOpen(true);
  };

  const handleReview = (
    salon: Salon
  ) => {
    setSelectedSalon(salon);
    setDetailsOpen(true);
  };

  /* ==========================================================
   * SUBMIT FOR THIRD-PARTY VERIFICATION
   * ========================================================== */

  const handleSubmitForVerification =
    async (salon: Salon) => {
      if (
        salon.verificationStatus !==
        'NOT_SUBMITTED'
      ) {
        return;
      }

      try {
        const result =
          await submitSalonForVerification(
            {
              variables: {
                input: {
                  salonId:
                    salon.salonId
                }
              }
            }
          );

        const response =
          result.data
            ?.submitSalonForVerification;

        if (!response?.success) {
          window.alert(
            response?.message ||
              'Unable to submit salon for verification.'
          );

          return;
        }

        /*
         * Refresh the complete salon list so
         * verification status, timestamps,
         * provider and reference ID are all
         * synchronized with DynamoDB.
         */
        const refreshed =
          await refetch();

        const refreshedSalon =
          refreshed.data
            ?.adminSalons?.salons.find(
              (item) =>
                item.salonId ===
                salon.salonId
            );

        if (refreshedSalon) {
          setSelectedSalon(
            refreshedSalon
          );
        }

        window.alert(
          response.message ||
            'Salon submitted for verification successfully.'
        );
      } catch (
        submissionError
      ) {
        console.error(
          'Submit verification error:',
          submissionError
        );

        window.alert(
          submissionError instanceof
            Error
            ? submissionError.message
            : 'Unable to submit salon for verification.'
        );
      }
    };

  /* ==========================================================
   * APPROVE BUSINESS
   *
   * IMPORTANT:
   *
   * verificationStatus === VERIFIED
   * does NOT mean the business is approved.
   *
   * VERIFIED = third-party verification passed.
   * APPROVED = Clavata admin approved the business.
   * ========================================================== */

  const handleApprove = async (
    salon: Salon
  ) => {
    if (
      salon.verificationStatus !==
      'VERIFIED'
    ) {
      return;
    }

    if (
      salon.adminApprovalStatus ===
      'APPROVED'
    ) {
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

      if (
        !result.data
          ?.adminApproveSalon
          .success
      ) {
        window.alert(
          result.data
            ?.adminApproveSalon
            .message ||
            'Unable to approve salon.'
        );

        return;
      }

      await refetch();

      setDetailsOpen(false);
      setSelectedSalon(null);

      window.alert(
        result.data
          .adminApproveSalon
          .message ||
          'Salon approved successfully.'
      );
    } catch (
      approveError
    ) {
      console.error(
        'Approve salon error:',
        approveError
      );

      window.alert(
        approveError instanceof
          Error
          ? approveError.message
          : 'Unable to approve salon.'
      );
    }
  };

  /* ==========================================================
   * REJECT
   * ========================================================== */

  const handleOpenReject = (
    salon: Salon
  ) => {
    setSelectedSalon(salon);
    setRejectionReason('');
    setRejectOpen(true);
  };

  const handleReject =
    async () => {
      if (
        !selectedSalon ||
        !rejectionReason.trim()
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
                  rejectionReason.trim()
              }
            }
          });

        if (
          !result.data
            ?.adminRejectSalon
            .success
        ) {
          window.alert(
            result.data
              ?.adminRejectSalon
              .message ||
              'Unable to reject salon.'
          );

          return;
        }

        await refetch();

        setRejectOpen(false);
        setDetailsOpen(false);
        setSelectedSalon(null);
        setRejectionReason('');

        window.alert(
          result.data
            .adminRejectSalon
            .message ||
            'Salon rejected successfully.'
        );
      } catch (
        rejectError
      ) {
        console.error(
          'Reject salon error:',
          rejectError
        );

        window.alert(
          rejectError instanceof
            Error
            ? rejectError.message
            : 'Unable to reject salon.'
        );
      }
    };

  /* ==========================================================
   * DOCUMENT VIEW
   * ========================================================== */

  const handleViewDocument =
    async (
      salonId: string,
      documentType: KycDocumentType
    ) => {
      const key = `${salonId}-${documentType}`;

      /*
       * Open the tab synchronously from the
       * click event so the browser does not
       * block it as a popup.
       */
      const documentWindow =
        window.open(
          '',
          '_blank'
        );

      if (!documentWindow) {
        window.alert(
          'The document could not be opened because the browser blocked the new tab. Please allow pop-ups for the admin panel and try again.'
        );

        return;
      }

      try {
        setViewingDocument(key);

        documentWindow.document.title =
          'Opening Document...';

        documentWindow.document.body.innerHTML = `
          <div style="
            font-family: Arial, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            color: #555;
            background: #fff;
          ">
            <div style="text-align:center;">
              <div style="
                font-size: 16px;
                font-weight: 600;
                margin-bottom: 8px;
              ">
                Opening document...
              </div>

              <div style="
                font-size: 13px;
                color: #888;
              ">
                Please wait.
              </div>
            </div>
          </div>
        `;

        const result =
          await generateDocumentViewUrl(
            {
              variables: {
                input: {
                  salonId,
                  documentType
                }
              }
            }
          );

        const response =
          result.data
            ?.generateKycDocumentViewUrl;

        if (!response?.success) {
          documentWindow.close();

          window.alert(
            response?.message ||
              'Unable to open document.'
          );

          return;
        }

        if (!response.viewUrl) {
          documentWindow.close();

          window.alert(
            response.message ||
              'Document URL was not generated.'
          );

          return;
        }

        documentWindow.location.href =
          response.viewUrl;
      } catch (
        documentError
      ) {
        console.error(
          'Document view error:',
          documentError
        );

        documentWindow.close();

        window.alert(
          documentError instanceof
            Error
            ? documentError.message
            : 'Unable to open document.'
        );
      } finally {
        setViewingDocument(null);
      }
    };

  /* ==========================================================
   * REFRESH
   * ========================================================== */

  const handleRefresh =
    async () => {
      await refetch();
    };

  /* ==========================================================
   * TAB CHANGE
   * ========================================================== */

  const handleTabChange = (
    _: React.SyntheticEvent,
    value:
      | 'ALL'
      | SalonVerificationStatus
  ) => {
    setTab(value);
    setPage(0);
  };

  /* ==========================================================
   * RENDER
   * ========================================================== */

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
          <Typography
            variant="h4"
            fontWeight={700}
          >
            Salon Applications
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Review salon applications,
            documents, third-party
            verification and business
            approval status.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          onClick={handleRefresh}
          disabled={
            loading ||
            submittingVerification ||
            approving ||
            rejecting
          }
        >
          Refresh
        </Button>
      </Stack>

      {/* ======================================================
          ERROR
          ====================================================== */}

      {error && (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mb: 3,
            borderColor: 'error.main'
          }}
        >
          <Typography
            color="error"
            variant="body2"
          >
            {error.message}
          </Typography>
        </Paper>
      )}

      {/* ======================================================
          STATS
          ====================================================== */}

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
            variant="outlined"
            sx={{ p: 2.5 }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Total Applications
            </Typography>

            <Typography
              variant="h4"
              fontWeight={700}
              sx={{ mt: 0.5 }}
            >
              {stats.total}
            </Typography>
          </Paper>
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <Paper
            variant="outlined"
            sx={{ p: 2.5 }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Awaiting Verification
            </Typography>

            <Typography
              variant="h4"
              fontWeight={700}
              sx={{ mt: 0.5 }}
            >
              {stats.notSubmitted}
            </Typography>
          </Paper>
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <Paper
            variant="outlined"
            sx={{ p: 2.5 }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              In Verification
            </Typography>

            <Typography
              variant="h4"
              fontWeight={700}
              sx={{ mt: 0.5 }}
            >
              {stats.submitted +
                stats.inReview}
            </Typography>
          </Paper>
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          md={3}
        >
          <Paper
            variant="outlined"
            sx={{ p: 2.5 }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Ready for Approval
            </Typography>

            <Typography
              variant="h4"
              fontWeight={700}
              sx={{
                mt: 0.5,
                color:
                  'success.main'
              }}
            >
              {stats.readyForApproval}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* ======================================================
          APPLICATION TABLE
          ====================================================== */}

      <Paper variant="outlined">
        <Tabs
          value={tab}
          onChange={handleTabChange}
          sx={{ px: 2 }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            value="ALL"
            label={`All (${stats.total})`}
          />

          <Tab
            value="NOT_SUBMITTED"
            label={`Not Submitted (${stats.notSubmitted})`}
          />

          <Tab
            value="SUBMITTED"
            label={`Submitted (${stats.submitted})`}
          />

          <Tab
            value="IN_REVIEW"
            label={`In Review (${stats.inReview})`}
          />

          <Tab
            value="VERIFIED"
            label={`Verified (${stats.verified})`}
          />

          <Tab
            value="FAILED"
            label={`Failed (${stats.failed})`}
          />

          <Tab
            value="REJECTED"
            label={`Rejected (${stats.rejected})`}
          />
        </Tabs>

        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search salon, owner, phone, email, city or salon ID..."
            value={search}
            onChange={(event) => {
              setSearch(
                event.target.value
              );
              setPage(0);
            }}
          />
        </Box>

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
                  Verification
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
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    align="center"
                    sx={{ py: 8 }}
                  >
                    <Typography color="text.secondary">
                      Loading applications...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedApplications.map(
                  (salon) => (
                    <TableRow
                      key={
                        salon.salonId
                      }
                      hover
                    >
                      {/* ==================================================
                          APPLICATION
                          ================================================== */}

                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                        >
                          #{salon.salonId}
                        </Typography>

                        {salon.verificationStatus ===
                          'VERIFIED' &&
                          salon.adminApprovalStatus !==
                            'APPROVED' && (
                            <Typography
                              variant="caption"
                              color="success.main"
                              sx={{
                                display:
                                  'block',
                                mt: 0.5
                              }}
                            >
                              Ready for admin approval
                            </Typography>
                          )}
                      </TableCell>

                      {/* ==================================================
                          SALON
                          ================================================== */}

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
                          >
                            {getInitials(
                              salon.salonName
                            )}
                          </Avatar>

                          <Box>
                            <Typography
                              variant="body2"
                              fontWeight={700}
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

                      {/* ==================================================
                          OWNER
                          ================================================== */}

                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                        >
                          {salon.ownerName ||
                            '—'}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          {salon.ownerPhoneNumber ||
                            'No phone'}
                        </Typography>
                      </TableCell>

                      {/* ==================================================
                          LOCATION
                          ================================================== */}

                      <TableCell>
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
                      </TableCell>

                      {/* ==================================================
                          SUBMITTED
                          ================================================== */}

                      <TableCell>
                        <Typography variant="body2">
                          {formatDateTime(
                            salon.verificationSubmittedAt ||
                              salon.createdAt
                          )}
                        </Typography>
                      </TableCell>

                      {/* ==================================================
                          VERIFICATION
                          ================================================== */}

                      <TableCell>
                        <VerificationStatusChip
                          status={
                            salon.verificationStatus
                          }
                        />
                      </TableCell>

                      {/* ==================================================
                          ADMIN APPROVAL
                          ================================================== */}

                      <TableCell>
                        <AdminApprovalStatusChip
                          status={
                            salon.adminApprovalStatus
                          }
                        />
                      </TableCell>

                      {/* ==================================================
                          ACTIONS
                          ================================================== */}

                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={0.5}
                          justifyContent="flex-end"
                        >
                          <Tooltip title="Review application">
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={
                                <EyeOutlined />
                              }
                              onClick={() =>
                                handleReview(
                                  salon
                                )
                              }
                              disabled={
                                approving ||
                                rejecting ||
                                submittingVerification
                              }
                            >
                              Review
                            </Button>
                          </Tooltip>

                          {/* ----------------------------------------------
                              SEND FOR VERIFICATION
                              ---------------------------------------------- */}

                          {salon.verificationStatus ===
                            'NOT_SUBMITTED' && (
                            <Tooltip title="Send for third-party verification">
                              <IconButton
                                color="primary"
                                onClick={() =>
                                  handleSubmitForVerification(
                                    salon
                                  )
                                }
                                disabled={
                                  approving ||
                                  rejecting ||
                                  submittingVerification
                                }
                              >
                                <SendOutlined />
                              </IconButton>
                            </Tooltip>
                          )}

                          {/* ----------------------------------------------
                              APPROVE / REJECT BUSINESS
                              ---------------------------------------------- */}

                          {salon.verificationStatus ===
                            'VERIFIED' &&
                            salon.adminApprovalStatus !==
                              'APPROVED' && (
                              <>
                                <Tooltip title="Approve salon business">
                                  <IconButton
                                    color="success"
                                    onClick={() =>
                                      handleApprove(
                                        salon
                                      )
                                    }
                                    disabled={
                                      approving ||
                                      rejecting ||
                                      submittingVerification
                                    }
                                  >
                                    <CheckCircleOutlined />
                                  </IconButton>
                                </Tooltip>

                                <Tooltip title="Reject salon application">
                                  <IconButton
                                    color="error"
                                    onClick={() =>
                                      handleOpenReject(
                                        salon
                                      )
                                    }
                                    disabled={
                                      approving ||
                                      rejecting ||
                                      submittingVerification
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

              {!loading &&
                filteredApplications.length ===
                  0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      align="center"
                      sx={{ py: 6 }}
                    >
                      <FileTextOutlined
                        style={{
                          fontSize: 40
                        }}
                      />

                      <Typography
                        variant="h6"
                        sx={{ mt: 1 }}
                      >
                        No applications found
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Try changing your search
                        or verification filter.
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
          onPageChange={(
            _,
            newPage
          ) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
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

      {/* ==========================================================
          DETAILS DIALOG
          ========================================================== */}

      <Dialog
        open={detailsOpen}
        onClose={() => {
          if (
            !approving &&
            !rejecting &&
            !submittingVerification
          ) {
            setDetailsOpen(false);
          }
        }}
        maxWidth="lg"
        fullWidth
        scroll="paper"
      >
        {selectedSalon && (
          <>
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
                    {getInitials(
                      selectedSalon.salonName
                    )}
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
                  <VerificationStatusChip
                    status={
                      selectedSalon.verificationStatus
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
              {/* ======================================================
                  SALON INFORMATION
                  ====================================================== */}

              <SectionTitle>
                Salon Information
              </SectionTitle>

              <Grid container spacing={2}>
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
                    label="Salon Status"
                    value={
                      selectedSalon.salonStatus
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  md={4}
                >
                  <DetailField
                    label="Target Audiences"
                    value={selectedSalon.targetAudiences?.join(
                      ', '
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
                    label="Application Created"
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
                    label="Verification Submitted"
                    value={formatDateTime(
                      selectedSalon.verificationSubmittedAt
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

              {/* ======================================================
                  SERVICES
                  ====================================================== */}

              <SectionTitle>
                Selected Services
              </SectionTitle>

              {groupedServices.length >
              0 ? (
                <Stack spacing={2}>
                  {groupedServices.map(
                    ({
                      audience,
                      label,
                      services
                    }) => (
                      <Paper
                        key={audience}
                        variant="outlined"
                        sx={{
                          borderRadius: 2,
                          overflow: 'hidden'
                        }}
                      >
                        <Box
                          sx={{
                            width: '25%',
                            px: 2,
                            py: 1.25,
                            bgcolor:
                              'primary.main',
                            color:
                              'primary.contrastText'
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            fontWeight={700}
                          >
                            {label}
                          </Typography>
                        </Box>

                        <Stack
                          spacing={1.5}
                          sx={{ p: 2 }}
                        >
                          {services.map(
                            (
                              selection,
                              index
                            ) => (
                              <Paper
                                key={`${selection.categoryId}-${selection.subcategoryId}-${selection.serviceName}-${index}`}
                                variant="outlined"
                                sx={{
                                  p: 2,
                                  borderRadius: 2
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  fontWeight={600}
                                >
                                  {
                                    selection.categoryName
                                  }
                                  {' → '}
                                  {
                                    selection.subcategoryName
                                  }
                                </Typography>

                                <Typography
                                  variant="body1"
                                  fontWeight={700}
                                  sx={{
                                    mt: 0.75
                                  }}
                                >
                                  {
                                    selection.serviceName
                                  }
                                </Typography>

                                <Stack
                                  direction="row"
                                  spacing={4}
                                  sx={{
                                    mt: 1.5
                                  }}
                                >
                                  <DetailField
                                    label="Price"
                                    value={formatCurrency(
                                      selection.price
                                    )}
                                  />

                                  <DetailField
                                    label="Duration"
                                    value={`${selection.duration} min`}
                                  />
                                </Stack>
                              </Paper>
                            )
                          )}
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
                    found.
                  </Typography>
                </Paper>
              )}

              <Divider sx={{ my: 3 }} />

              {/* ======================================================
                  OWNER
                  ====================================================== */}

              <SectionTitle>
                Owner Information
              </SectionTitle>

              <Grid container spacing={2}>
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

              {/* ======================================================
                  LOCATION
                  ====================================================== */}

              <SectionTitle>
                Business Location
              </SectionTitle>

              <Grid container spacing={2}>
                <Grid item xs={12}>
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

              {/* ======================================================
                  BUSINESS HOURS
                  ====================================================== */}

              <SectionTitle>
                Business Hours
              </SectionTitle>

              <BusinessHoursSection
                businessHours={
                  selectedSalon.businessHours
                }
              />

              <Divider sx={{ my: 3 }} />

              {/* ======================================================
                  KYC / BUSINESS INFORMATION
                  ====================================================== */}

              <SectionTitle>
                KYC / Business Information
              </SectionTitle>

              <Grid container spacing={2}>
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
                    label="Admin Approval Status"
                    value={
                      selectedSalon.adminApprovalStatus
                    }
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* ======================================================
                  DOCUMENTS
                  ====================================================== */}

              <SectionTitle>
                Uploaded Documents
              </SectionTitle>

              <Grid container spacing={2}>
                {(
                  [
                    [
                      'PAN',
                      'PAN',
                      selectedSalon
                        .documents?.pan
                    ],
                    [
                      'Aadhaar',
                      'AADHAAR',
                      selectedSalon
                        .documents?.aadhaar
                    ],
                    [
                      'Shop Establishment',
                      'SHOP_ESTABLISHMENT',
                      selectedSalon
                        .documents
                        ?.shopEstablishment
                    ],
                    [
                      'GST',
                      'GST',
                      selectedSalon
                        .documents?.gst
                    ],
                    [
                      'Udyam',
                      'UDYAM',
                      selectedSalon
                        .documents?.udyam
                    ]
                  ] as Array<
                    [
                      string,
                      KycDocumentType,
                      KycDocument |
                        null |
                        undefined
                    ]
                  >
                ).map(
                  ([
                    label,
                    documentType,
                    document
                  ]) => (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      key={documentType}
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
                          variant="subtitle2"
                          fontWeight={700}
                          sx={{ mb: 1 }}
                        >
                          {label}
                        </Typography>

                        <DocumentViewButton
                          salonId={
                            selectedSalon.salonId
                          }
                          document={
                            document
                          }
                          documentType={
                            documentType
                          }
                          loading={
                            viewingDocument ===
                              `${selectedSalon.salonId}-${documentType}` ||
                            generatingDocumentUrl
                          }
                          onView={
                            handleViewDocument
                          }
                        />
                      </Paper>
                    </Grid>
                  )
                )}
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* ======================================================
                  THIRD-PARTY VERIFICATION
                  ====================================================== */}

              <SectionTitle>
                Third-Party Verification
              </SectionTitle>

              <Grid container spacing={2}>
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
                    <DetailField
                      label="Verification Status"
                      value={
                        <VerificationStatusChip
                          status={
                            selectedSalon.verificationStatus
                          }
                        />
                      }
                    />

                    <Box sx={{ mt: 2 }}>
                      <DetailField
                        label="Provider"
                        value={
                          selectedSalon.verificationProvider
                        }
                      />
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      <DetailField
                        label="Reference ID"
                        value={
                          selectedSalon.verificationReferenceId
                        }
                      />
                    </Box>
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
                    <DetailField
                      label="Verification Submitted"
                      value={formatDateTime(
                        selectedSalon.verificationSubmittedAt
                      )}
                    />

                    <Box sx={{ mt: 2 }}>
                      <DetailField
                        label="Verification Completed"
                        value={formatDateTime(
                          selectedSalon.verificationCompletedAt
                        )}
                      />
                    </Box>

                    {selectedSalon.verificationRejectionReason && (
                      <Box sx={{ mt: 2 }}>
                        <DetailField
                          label="Verification Rejection Reason"
                          value={
                            selectedSalon.verificationRejectionReason
                          }
                        />
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* ======================================================
                  SALON IMAGES
                  ====================================================== */}

              <SectionTitle>
                Salon Images
              </SectionTitle>

              {selectedSalon.logoUrl ||
              selectedSalon.coverImageUrl ||
              selectedSalon.galleryImages
                ?.length ? (
                <>
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
                            mt: 0.5
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
                            mt: 0.5
                          }}
                        />
                      </Grid>
                    )}
                  </Grid>

                  {selectedSalon.galleryImages
                    ?.length ? (
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
                              alt={`Salon gallery ${
                                index + 1
                              }`}
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
                  ) : null}
                </>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  No salon images
                  uploaded.
                </Typography>
              )}

              <Divider sx={{ my: 3 }} />

              {/* ======================================================
                  SALON ACTIVITY
                  ====================================================== */}

              <SectionTitle>
                Salon Activity
              </SectionTitle>

              <Grid container spacing={2}>
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

              {/* ======================================================
                  BUSINESS PERFORMANCE
                  ====================================================== */}

              <SectionTitle>
                Business Performance
              </SectionTitle>

              <Grid container spacing={2}>
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

              {/* ======================================================
                  APPROVAL INFORMATION
                  ====================================================== */}

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
                      sm={4}
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
                      sm={4}
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
                      sm={4}
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

              {/* ======================================================
                  ADMIN REJECTION
                  ====================================================== */}

              {selectedSalon.rejectionReason && (
                <>
                  <Divider sx={{ my: 3 }} />

                  <SectionTitle>
                    Admin Rejection Information
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

              {/* ======================================================
                  AUDIT
                  ====================================================== */}

              <Divider sx={{ my: 3 }} />

              <SectionTitle>
                Application Audit
              </SectionTitle>

              <Grid container spacing={2}>
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

                <Grid item xs={12}>
                  <DetailField
                    label="Last Updated By"
                    value={
                      selectedSalon.lastUpdatedBy
                    }
                  />
                </Grid>
              </Grid>
            </DialogContent>

            {/* ========================================================
                DIALOG ACTIONS
                ======================================================== */}

            <DialogActions
              sx={{
                p: 2,
                gap: 1,
                flexWrap: 'wrap'
              }}
            >
              <Button
                onClick={() =>
                  setDetailsOpen(false)
                }
                disabled={
                  approving ||
                  rejecting ||
                  submittingVerification
                }
              >
                Close
              </Button>

              {/* ------------------------------------------------------
                  NOT SUBMITTED
                  ------------------------------------------------------ */}

              {selectedSalon.verificationStatus ===
                'NOT_SUBMITTED' && (
                <Button
                  color="primary"
                  variant="contained"
                  startIcon={
                    <SendOutlined />
                  }
                  onClick={() =>
                    handleSubmitForVerification(
                      selectedSalon
                    )
                  }
                  disabled={
                    approving ||
                    rejecting ||
                    submittingVerification
                  }
                >
                  {submittingVerification
                    ? 'Submitting...'
                    : 'Send for Verification'}
                </Button>
              )}

              {/* ------------------------------------------------------
                  VERIFIED → ADMIN APPROVAL
                  ------------------------------------------------------ */}

              {selectedSalon.verificationStatus ===
                'VERIFIED' &&
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
                        rejecting ||
                        submittingVerification
                      }
                    >
                      Reject
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
                        rejecting ||
                        submittingVerification
                      }
                    >
                      {approving
                        ? 'Approving...'
                        : 'Approve Business'}
                    </Button>
                  </>
                )}

              {/* ------------------------------------------------------
                  SUBMITTED
                  ------------------------------------------------------ */}

              {selectedSalon.verificationStatus ===
                'SUBMITTED' && (
                <Typography
                  variant="body2"
                  color="warning.main"
                >
                  Submitted to third-party
                  verification. Waiting for
                  verification result.
                </Typography>
              )}

              {/* ------------------------------------------------------
                  IN REVIEW
                  ------------------------------------------------------ */}

              {selectedSalon.verificationStatus ===
                'IN_REVIEW' && (
                <Typography
                  variant="body2"
                  color="warning.main"
                >
                  Third-party verification is
                  currently in progress.
                </Typography>
              )}

              {/* ------------------------------------------------------
                  FAILED
                  ------------------------------------------------------ */}

              {selectedSalon.verificationStatus ===
                'FAILED' && (
                <Typography
                  variant="body2"
                  color="error.main"
                >
                  Third-party verification
                  failed. Please review the
                  verification details.
                </Typography>
              )}

              {/* ------------------------------------------------------
                  REJECTED
                  ------------------------------------------------------ */}

              {selectedSalon.verificationStatus ===
                'REJECTED' && (
                <Typography
                  variant="body2"
                  color="error.main"
                >
                  Third-party verification was
                  rejected. Admin business
                  approval is unavailable.
                </Typography>
              )}

              {/* ------------------------------------------------------
                  ADMIN APPROVED
                  ------------------------------------------------------ */}

              {selectedSalon.adminApprovalStatus ===
                'APPROVED' && (
                <Typography
                  variant="body2"
                  color="success.main"
                >
                  Business approval completed.
                </Typography>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ============================================================
          REJECTION DIALOG
          ============================================================ */}

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
                {selectedSalon.salonName}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Salon ID:{' '}
                {selectedSalon.salonId}
              </Typography>
            </Box>
          )}

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            Please provide a reason for
            rejecting this application.
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Enter rejection reason..."
            value={rejectionReason}
            onChange={(event) =>
              setRejectionReason(
                event.target.value
              )
            }
            disabled={rejecting}
            error={
              rejectionReason.length > 0 &&
              !rejectionReason.trim()
            }
          />
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
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
            onClick={handleReject}
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