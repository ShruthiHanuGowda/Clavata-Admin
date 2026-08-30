
import { useMemo, useState } from 'react';

// material-ui
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
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

// ==============================|| TYPES ||============================== //

type ApprovalType =
  | 'SALON_APPLICATION'
  | 'KYC'
  | 'DOCUMENT_RESUBMISSION';

type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

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

  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED';

  documentsSubmitted: number;
  totalDocuments: number;

  city: string;
  state: string;

  notes?: string;
  rejectionReason?: string;

  reviewedBy?: string;
  reviewedAt?: string;
}

// ==============================|| DUMMY DATA ||============================== //

const initialApprovals: PendingApproval[] = [
  {
    id: 'APR-1001',
    salonId: 'SALON-1001',
    salonName: 'Glow Beauty Studio',
    ownerName: 'Priya Sharma',
    phoneNumber: '+91 98765 43210',
    email: 'priya@example.com',
    businessType: 'Beauty Salon',

    type: 'SALON_APPLICATION',
    status: 'PENDING',

    submittedAt: '30 Aug 2026, 09:42 AM',
    priority: 'HIGH',

    kycStatus: 'PENDING',

    documentsSubmitted: 3,
    totalDocuments: 4,

    city: 'Bengaluru',
    state: 'Karnataka',

    notes: 'New salon partner registration.'
  },
  {
    id: 'APR-1002',
    salonId: 'SALON-1004',
    salonName: 'The Hair Lounge',
    ownerName: 'Ananya Rao',
    phoneNumber: '+91 90123 45678',
    email: 'ananya@example.com',
    businessType: 'Hair Salon',

    type: 'KYC',
    status: 'PENDING',

    submittedAt: '30 Aug 2026, 08:20 AM',
    priority: 'NORMAL',

    kycStatus: 'PENDING',

    documentsSubmitted: 4,
    totalDocuments: 4,

    city: 'Bengaluru',
    state: 'Karnataka',

    notes: 'All KYC documents submitted and ready for verification.'
  },
  {
    id: 'APR-1003',
    salonId: 'SALON-1006',
    salonName: 'Elegance Unisex Salon',
    ownerName: 'Karthik Rao',
    phoneNumber: '+91 93451 22334',
    email: 'karthik@example.com',
    businessType: 'Unisex Salon',

    type: 'DOCUMENT_RESUBMISSION',
    status: 'PENDING',

    submittedAt: '29 Aug 2026, 06:10 PM',
    priority: 'HIGH',

    kycStatus: 'REJECTED',

    documentsSubmitted: 4,
    totalDocuments: 4,

    city: 'Mysuru',
    state: 'Karnataka',

    notes: 'PAN document has been resubmitted after rejection.',
    rejectionReason: 'Previous PAN document was unclear.'
  },
  {
    id: 'APR-1004',
    salonId: 'SALON-1007',
    salonName: 'Aura Wellness Spa',
    ownerName: 'Divya Menon',
    phoneNumber: '+91 91234 99887',
    email: 'divya@example.com',
    businessType: 'Spa & Wellness',

    type: 'SALON_APPLICATION',
    status: 'PENDING',

    submittedAt: '29 Aug 2026, 02:30 PM',
    priority: 'NORMAL',

    kycStatus: 'APPROVED',

    documentsSubmitted: 4,
    totalDocuments: 4,

    city: 'Bengaluru',
    state: 'Karnataka',

    notes: 'KYC approved. Salon application awaiting final approval.'
  },
  {
    id: 'APR-1005',
    salonId: 'SALON-1008',
    salonName: 'Style Studio',
    ownerName: 'Rahul Shetty',
    phoneNumber: '+91 99887 11223',
    email: 'rahul@example.com',
    businessType: 'Hair & Beauty',

    type: 'KYC',
    status: 'PENDING',

    submittedAt: '28 Aug 2026, 11:45 AM',
    priority: 'NORMAL',

    kycStatus: 'PENDING',

    documentsSubmitted: 4,
    totalDocuments: 4,

    city: 'Hubballi',
    state: 'Karnataka',

    notes: 'Waiting for internal KYC verification.'
  }
];

// ==============================|| HELPERS ||============================== //

const getApprovalTypeLabel = (type: ApprovalType) => {
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

// ==============================|| STATUS CHIP ||============================== //

function ApprovalStatusChip({
  status
}: {
  status: ApprovalStatus;
}) {
  const config: Record<
    ApprovalStatus,
    {
      color: 'warning' | 'success' | 'error';
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

// ==============================|| PRIORITY CHIP ||============================== //

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
        sx={{ fontWeight: 600 }}
      />
    );
  }

  return (
    <Chip
      size="small"
      variant="outlined"
      label="Normal"
      sx={{ fontWeight: 500 }}
    />
  );
}

// ==============================|| PAGE ||============================== //

export default function PendingApprovals() {
  const [approvals, setApprovals] =
    useState<PendingApproval[]>(initialApprovals);

  const [search, setSearch] = useState('');

  const [typeFilter, setTypeFilter] = useState<
    'ALL' | ApprovalType
  >('ALL');

  const [selectedApproval, setSelectedApproval] =
    useState<PendingApproval | null>(null);

  const [detailsOpen, setDetailsOpen] = useState(false);

  const [rejectOpen, setRejectOpen] = useState(false);

  const [rejectionReason, setRejectionReason] = useState('');

  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ==============================|| COUNTERS ||============================== //

  const pendingCount = approvals.filter(
    (item) => item.status === 'PENDING'
  ).length;

  const highPriorityCount = approvals.filter(
    (item) =>
      item.status === 'PENDING' &&
      item.priority === 'HIGH'
  ).length;

  const salonApplicationsCount = approvals.filter(
    (item) =>
      item.status === 'PENDING' &&
      item.type === 'SALON_APPLICATION'
  ).length;

  const kycCount = approvals.filter(
    (item) =>
      item.status === 'PENDING' &&
      (item.type === 'KYC' ||
        item.type === 'DOCUMENT_RESUBMISSION')
  ).length;

  // ==============================|| FILTER ||============================== //

  const filteredApprovals = useMemo(() => {
    const query = search.trim().toLowerCase();

    return approvals.filter((item) => {
      const matchesType =
        typeFilter === 'ALL' ||
        item.type === typeFilter;

      const matchesSearch =
        !query ||
        item.id.toLowerCase().includes(query) ||
        item.salonId.toLowerCase().includes(query) ||
        item.salonName.toLowerCase().includes(query) ||
        item.ownerName.toLowerCase().includes(query) ||
        item.phoneNumber.toLowerCase().includes(query);

      return matchesType && matchesSearch;
    });
  }, [approvals, search, typeFilter]);

  // ==============================|| PAGINATION ||============================== //

  const paginatedApprovals = filteredApprovals.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // ==============================|| HANDLERS ||============================== //

  const handleTypeFilter = (
    event: SelectChangeEvent
  ) => {
    setTypeFilter(
      event.target.value as 'ALL' | ApprovalType
    );

    setPage(0);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const handleReset = () => {
    setSearch('');
    setTypeFilter('ALL');
    setPage(0);
  };

  const handleView = (
    approval: PendingApproval
  ) => {
    setSelectedApproval(approval);
    setDetailsOpen(true);
  };

  const handleApprove = (
    approval: PendingApproval
  ) => {
    setApprovals((previous) =>
      previous.map((item) =>
        item.id === approval.id
          ? {
              ...item,
              status: 'APPROVED',
              reviewedBy: 'Admin',
              reviewedAt:
                '30 Aug 2026, 11:15 AM'
            }
          : item
      )
    );

    setSelectedApproval((previous) =>
      previous
        ? {
            ...previous,
            status: 'APPROVED',
            reviewedBy: 'Admin',
            reviewedAt:
              '30 Aug 2026, 11:15 AM'
          }
        : null
    );
  };

  const openRejectDialog = (
    approval: PendingApproval
  ) => {
    setSelectedApproval(approval);
    setRejectionReason('');
    setRejectOpen(true);
  };

  const handleReject = () => {
    if (!selectedApproval) {
      return;
    }

    const reason =
      rejectionReason.trim() ||
      'Approval request was rejected by the administrator.';

    setApprovals((previous) =>
      previous.map((item) =>
        item.id === selectedApproval.id
          ? {
              ...item,
              status: 'REJECTED',
              rejectionReason: reason,
              reviewedBy: 'Admin',
              reviewedAt:
                '30 Aug 2026, 11:15 AM'
            }
          : item
      )
    );

    setRejectOpen(false);
    setDetailsOpen(false);
    setRejectionReason('');
  };

  // ==============================|| RENDER ||============================== //

  return (
    <Box>
      {/* ================= HEADER ================= */}

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
            sx={{ fontWeight: 700 }}
          >
            Pending Approvals
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Review and approve salon onboarding,
            KYC and document verification requests.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<ReloadOutlined />}
          onClick={() =>
            setApprovals(initialApprovals)
          }
        >
          Refresh
        </Button>
      </Stack>

      {/* ================= ALERT ================= */}

      {highPriorityCount > 0 && (
        <Alert
          severity="warning"
          icon={<ClockCircleOutlined />}
          sx={{ mb: 3 }}
        >
          <strong>{highPriorityCount}</strong>{' '}
          high-priority approval
          {highPriorityCount > 1 ? 's' : ''}{' '}
          require{highPriorityCount === 1 ? 's' : ''}{' '}
          your attention.
        </Alert>
      )}

      {/* ================= SUMMARY CARDS ================= */}

      <Grid
        container
        spacing={2.5}
        sx={{ mb: 3 }}
      >
        {/* Pending */}

        <Grid item xs={12} sm={6} md={3}>
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
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor:
                      'warning.lighter',
                    color: 'warning.main'
                  }}
                >
                  <ClockCircleOutlined
                    style={{ fontSize: 22 }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* High Priority */}

        <Grid item xs={12} sm={6} md={3}>
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
                    {highPriorityCount}
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
                    bgcolor:
                      'error.lighter',
                    color: 'error.main'
                  }}
                >
                  <SafetyCertificateOutlined
                    style={{ fontSize: 22 }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Salon Applications */}

        <Grid item xs={12} sm={6} md={3}>
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
                    {salonApplicationsCount}
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
                    bgcolor:
                      'primary.lighter',
                    color: 'primary.main'
                  }}
                >
                  <ShopOutlined
                    style={{ fontSize: 22 }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* KYC */}

        <Grid item xs={12} sm={6} md={3}>
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
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor:
                      'success.lighter',
                    color: 'success.main'
                  }}
                >
                  <FileTextOutlined
                    style={{ fontSize: 22 }}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ================= TABLE ================= */}

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
                handleSearch(event.target.value)
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
              onChange={handleTypeFilter}
              sx={{ minWidth: 210 }}
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
              typeFilter !== 'ALL') && (
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
                    Documents
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
                    <TableCell colSpan={8}>
                      <Box
                        sx={{
                          py: 8,
                          textAlign: 'center'
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
                          sx={{ mt: 2 }}
                        >
                          No pending approvals
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          There are no approval
                          requests matching your
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
                        key={approval.id}
                      >
                        {/* APPROVAL */}

                        <TableCell>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color="primary.main"
                          >
                            {approval.id}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {approval.salonId}
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
                                display: 'flex',
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
                                fontWeight={600}
                              >
                                {
                                  approval.salonName
                                }
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {approval.city},{' '}
                                {approval.state}
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
                              fontWeight: 600
                            }}
                          />
                        </TableCell>

                        {/* DOCUMENTS */}

                        <TableCell>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                          >
                            {
                              approval.documentsSubmitted
                            }
                            /
                            {
                              approval.totalDocuments
                            }
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
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
            count={filteredApprovals.length}
            page={page}
            onPageChange={(_, newPage) =>
              setPage(newPage)
            }
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
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

      {/* ================= REVIEW DIALOG ================= */}

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
                    {selectedApproval.id} ·{' '}
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
              {/* REQUEST TYPE */}

              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  sx={{ mb: 1.5 }}
                >
                  Approval Request
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
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

              <Divider sx={{ mb: 3 }} />

              {/* SALON DETAILS */}

              <Typography
                variant="subtitle1"
                fontWeight={700}
                sx={{ mb: 2 }}
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

              <Divider sx={{ mb: 3 }} />

              {/* KYC STATUS */}

              <Typography
                variant="subtitle1"
                fontWeight={700}
                sx={{ mb: 2 }}
              >
                Verification Status
              </Typography>

              <Stack
                direction={{
                  xs: 'column',
                  sm: 'row'
                }}
                spacing={2}
                sx={{ mb: 3 }}
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
                    sx={{ mt: 0.5 }}
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
                    bgcolor: 'grey.50',
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
                    sx={{ mt: 0.5 }}
                  >
                    {selectedApproval.notes}
                  </Typography>
                </Box>
              )}

              {/* REJECTION */}

              {selectedApproval.rejectionReason && (
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'error.lighter',
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
                    sx={{ mt: 0.5 }}
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
                  <Divider sx={{ my: 3 }} />

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
                          selectedApproval.reviewedBy
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

            <DialogActions sx={{ p: 2 }}>
              <Button
                onClick={() =>
                  setDetailsOpen(false)
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

      {/* ================= REJECT DIALOG ================= */}

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
            sx={{ mb: 2 }}
          >
            Provide a reason for rejecting this
            approval request. This reason can
            later be shown to the salon owner.
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
          />
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
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

// ==============================|| DETAIL FIELD ||============================== //

function DetailField({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <Box
      sx={{
        p: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        sx={{ mb: 0.5 }}
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

