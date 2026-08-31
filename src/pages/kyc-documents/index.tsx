import { useMemo, useState } from 'react';
import { gql, useQuery } from '@apollo/client';

// material-ui
import {
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
  SearchOutlined,
  SafetyCertificateOutlined,
  ShopOutlined,
  UserOutlined,
  ReloadOutlined
} from '@ant-design/icons';

// ==============================|| GRAPHQL ||============================== //

export const ADMIN_SALONS = gql`
  query AdminSalons(
    $search: String
    $kycStatus: KycStatus
    $salonStatus: SalonStatus
    $isActive: Boolean
  ) {
    adminSalons(
      search: $search
      kycStatus: $kycStatus
      salonStatus: $salonStatus
      isActive: $isActive
    ) {
      success
      message
      totalCount

      salons {
        salonId
        ownerUserId
        salonName
        ownerName
        businessType
        ownerPhoneNumber
        alternatePhone
        email

        address {
          addressLine
          city
          state
          pincode
        }

        latitude
        longitude

        gstNumber
        panNumber
        aadhaarNumber

        bankAccount
        ifsc
        accountHolderName

        logoUrl
        coverImageUrl
        galleryImages

        kycStatus
        salonStatus

        isActive
        isVisible
        isDeleted

        averageRating
        totalReviews
        totalAppointments
        totalCompletedAppointments
        totalCancelledAppointments
        totalRevenue
        adminApprovalStatus
        approvedBy
        approvedAt
        rejectedBy
        rejectedAt
        rejectionReason

        lastUpdatedBy
        createdAt
        updatedAt
      }
    }
  }
`;

// ==============================|| TYPES ||============================== //

type KycStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface SalonAddress {
  addressLine?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
}

interface AdminSalon {
  salonId: string;
  ownerUserId?: string | null;
  salonName?: string | null;
  ownerName?: string | null;
  businessType?: string | null;
  ownerPhoneNumber?: string | null;
  alternatePhone?: string | null;
  email?: string | null;

  address?: SalonAddress | null;

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
  galleryImages?: string[] | null;

  kycStatus?: KycStatus | null;
  salonStatus?: string | null;

  isActive?: boolean | null;
  isVisible?: boolean | null;
  isDeleted?: boolean | null;

  averageRating?: number | null;
  totalReviews?: number | null;
  totalAppointments?: number | null;
  totalCompletedAppointments?: number | null;
  totalCancelledAppointments?: number | null;
  totalRevenue?: number | null;

  adminApprovalStatus?: string | null;
  approvedBy?: string | null;
  approvedAt?: string | null;
  rejectedBy?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;

  lastUpdatedBy?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface AdminSalonsResponse {
  adminSalons: {
    success: boolean;
    message?: string | null;
    totalCount: number;
    salons: AdminSalon[];
  };
}

interface AdminSalonsVariables {
  search?: string;
  kycStatus?: KycStatus;
  salonStatus?: string;
  isActive?: boolean;
}

// ==============================|| STATUS CHIP ||============================== //

function StatusChip({ status }: { status: KycStatus }) {
  const config: Record<
    KycStatus,
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
        fontWeight: 600,
        minWidth: 85
      }}
    />
  );
}

// ==============================|| HELPERS ||============================== //

function normalizeKycStatus(status?: string | null): KycStatus {
  if (status === 'APPROVED') return 'APPROVED';
  if (status === 'REJECTED') return 'REJECTED';

  return 'PENDING';
}

function formatDate(value?: string | null) {
  if (!value) return '—';

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
}

function maskAadhaar(value?: string | null) {
  if (!value) return '—';

  const digits = value.replace(/\D/g, '');

  if (digits.length === 12) {
    return `XXXX XXXX ${digits.slice(-4)}`;
  }

  return value;
}

// ==============================|| PAGE ||============================== //

export default function KycDocuments() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | KycStatus>('ALL');

  const [selectedSalon, setSelectedSalon] = useState<AdminSalon | null>(null);

  const [detailsOpen, setDetailsOpen] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ==============================|| QUERY ||============================== //

  const {
    data,
    loading,
    error,
    refetch
  } = useQuery<AdminSalonsResponse, AdminSalonsVariables>(ADMIN_SALONS, {
    variables: {
      search: search.trim() || undefined,
      kycStatus: statusFilter === 'ALL' ? undefined : statusFilter
    },
    fetchPolicy: 'network-only'
  });

  const salons = data?.adminSalons?.salons ?? [];

  // ==============================|| COUNTERS ||============================== //

  const totalCount = data?.adminSalons?.totalCount ?? salons.length;

  const pendingCount = salons.filter(
    (item) => normalizeKycStatus(item.kycStatus) === 'PENDING'
  ).length;

  const approvedCount = salons.filter(
    (item) => normalizeKycStatus(item.kycStatus) === 'APPROVED'
  ).length;

  const rejectedCount = salons.filter(
    (item) => normalizeKycStatus(item.kycStatus) === 'REJECTED'
  ).length;

  // ==============================|| CLIENT-SIDE FILTER ||============================== //

  const filteredSalons = useMemo(() => {
    const query = search.trim().toLowerCase();

    return salons.filter((salon) => {
      const status = normalizeKycStatus(salon.kycStatus);

      const matchesStatus =
        statusFilter === 'ALL' || status === statusFilter;

      const matchesSearch =
        !query ||
        salon.salonName?.toLowerCase().includes(query) ||
        salon.ownerName?.toLowerCase().includes(query) ||
        salon.salonId?.toLowerCase().includes(query) ||
        salon.ownerPhoneNumber?.toLowerCase().includes(query) ||
        salon.email?.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [salons, search, statusFilter]);

  // ==============================|| PAGINATION ||============================== //

  const paginatedSalons = filteredSalons.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // ==============================|| HANDLERS ||============================== //

  const handleStatusFilter = (event: SelectChangeEvent) => {
    const value = event.target.value as 'ALL' | KycStatus;

    setStatusFilter(value);
    setPage(0);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const handleView = (salon: AdminSalon) => {
    setSelectedSalon(salon);
    setDetailsOpen(true);
  };

  const handleReset = () => {
    setSearch('');
    setStatusFilter('ALL');
    setPage(0);
  };

  const handleRefresh = async () => {
    await refetch({
      search: search.trim() || undefined,
      kycStatus: statusFilter === 'ALL' ? undefined : statusFilter
    });
  };

  // ==============================|| RENDER ||============================== //

  return (
    <Box>
      {/* ================= HEADER ================= */}

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            KYC / Documents
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Review and manage salon owner verification documents.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<ReloadOutlined />}
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Stack>

      {/* ================= ERROR ================= */}

      {error && (
        <Card
          sx={{
            mb: 3,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'error.light'
          }}
        >
          <CardContent>
            <Typography color="error" fontWeight={600}>
              Failed to load KYC applications.
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {error.message}
            </Typography>

            <Button
              size="small"
              sx={{ mt: 1 }}
              onClick={handleRefresh}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ================= API MESSAGE ================= */}

      {!loading && data?.adminSalons?.success === false && (
        <Card
          sx={{
            mb: 3,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'warning.light'
          }}
        >
          <CardContent>
            <Typography color="warning.main" fontWeight={600}>
              {data.adminSalons.message || 'Unable to load KYC applications.'}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* ================= SUMMARY CARDS ================= */}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* TOTAL */}

        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Total Applications"
            value={totalCount}
            icon={<FileTextOutlined style={{ fontSize: 22 }} />}
            bgcolor="primary.lighter"
            color="primary.main"
          />
        </Grid>

        {/* PENDING */}

        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Pending Review"
            value={pendingCount}
            icon={<SafetyCertificateOutlined style={{ fontSize: 22 }} />}
            bgcolor="warning.lighter"
            color="warning.main"
          />
        </Grid>

        {/* APPROVED */}

        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Approved"
            value={approvedCount}
            icon={<CheckCircleOutlined style={{ fontSize: 22 }} />}
            bgcolor="success.lighter"
            color="success.main"
          />
        </Grid>

        {/* REJECTED */}

        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Rejected"
            value={rejectedCount}
            icon={<CloseCircleOutlined style={{ fontSize: 22 }} />}
            bgcolor="error.lighter"
            color="error.main"
          />
        </Grid>
      </Grid>

      {/* ================= MAIN TABLE ================= */}

      <Card
        sx={{
          borderRadius: 2,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
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
              onChange={(event) => handleSearch(event.target.value)}
              placeholder="Search salon, owner, salon ID..."
              size="small"
              sx={{
                minWidth: { xs: '100%', md: 320 },
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
              value={statusFilter}
              onChange={handleStatusFilter}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="ALL">All Status</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="APPROVED">Approved</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
            </Select>

            {(search || statusFilter !== 'ALL') && (
              <Button variant="text" onClick={handleReset}>
                Clear
              </Button>
            )}
          </Box>

          <Divider />

          {/* ================= LOADING ================= */}

          {loading ? (
            <Box
              sx={{
                py: 10,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Typography color="text.secondary">
                Loading KYC applications...
              </Typography>
            </Box>
          ) : (
            <>
              {/* ================= TABLE ================= */}

              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Salon ID</TableCell>

                      <TableCell>Salon</TableCell>

                      <TableCell>Owner</TableCell>

                      <TableCell>Documents</TableCell>

                      <TableCell>Status</TableCell>

                      <TableCell>Submitted</TableCell>

                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {paginatedSalons.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7}>
                          <Box
                            sx={{
                              py: 8,
                              textAlign: 'center'
                            }}
                          >
                            <FileTextOutlined
                              style={{
                                fontSize: 42,
                                opacity: 0.35
                              }}
                            />

                            <Typography variant="h6" sx={{ mt: 2 }}>
                              No KYC records found
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
                    ) : (
                      paginatedSalons.map((salon) => {
                        const status = normalizeKycStatus(salon.kycStatus);

                        return (
                          <TableRow
                            hover
                            key={salon.salonId}
                            sx={{
                              '&:last-child td': {
                                borderBottom: 0
                              }
                            }}
                          >
                            {/* SALON ID */}

                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  color: 'primary.main'
                                }}
                              >
                                {salon.salonId}
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {salon.ownerUserId || '—'}
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
                                    bgcolor: 'primary.lighter',
                                    color: 'primary.main',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden'
                                  }}
                                >
                                  {salon.logoUrl ? (
                                    <img
                                      src={salon.logoUrl}
                                      alt={salon.salonName || 'Salon'}
                                      style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                      }}
                                    />
                                  ) : (
                                    <ShopOutlined
                                      style={{ fontSize: 19 }}
                                    />
                                  )}
                                </Box>

                                <Box>
                                  <Typography variant="body2" fontWeight={600}>
                                    {salon.salonName || 'Unnamed Salon'}
                                  </Typography>

                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {salon.businessType || '—'}
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
                                    {salon.ownerName || '—'}
                                  </Typography>

                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {salon.ownerPhoneNumber || '—'}
                                  </Typography>
                                </Box>
                              </Stack>
                            </TableCell>

                            {/* DOCUMENTS */}

                            <TableCell>
                              <Stack
                                direction="row"
                                spacing={0.75}
                                flexWrap="wrap"
                              >
                                {salon.aadhaarNumber && (
                                  <Tooltip title="Aadhaar">
                                    <Chip
                                      size="small"
                                      label="Aadhaar"
                                      variant="outlined"
                                    />
                                  </Tooltip>
                                )}

                                {salon.panNumber && (
                                  <Tooltip title="PAN">
                                    <Chip
                                      size="small"
                                      label="PAN"
                                      variant="outlined"
                                    />
                                  </Tooltip>
                                )}

                                {salon.gstNumber && (
                                  <Tooltip title="GST">
                                    <Chip
                                      size="small"
                                      label="GST"
                                      variant="outlined"
                                    />
                                  </Tooltip>
                                )}

                                {!salon.aadhaarNumber &&
                                  !salon.panNumber &&
                                  !salon.gstNumber && (
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      No documents
                                    </Typography>
                                  )}
                              </Stack>
                            </TableCell>

                            {/* STATUS */}

                            <TableCell>
                              <StatusChip status={status} />
                            </TableCell>

                            {/* DATE */}

                            <TableCell>
                              <Typography variant="body2">
                                {formatDate(salon.createdAt)}
                              </Typography>
                            </TableCell>

                            {/* ACTIONS */}

                            <TableCell align="right">
                              <Stack
                                direction="row"
                                spacing={0.5}
                                justifyContent="flex-end"
                              >
                                <Tooltip title="View KYC Details">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleView(salon)}
                                  >
                                    <EyeOutlined />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* ================= PAGINATION ================= */}

              <TablePagination
                component="div"
                count={filteredSalons.length}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(parseInt(event.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* ================= KYC DETAILS ================= */}

      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedSalon && (
          <>
            <DialogTitle>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    KYC Details
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {selectedSalon.salonId} ·{' '}
                    {selectedSalon.salonName || 'Unnamed Salon'}
                  </Typography>
                </Box>

                <StatusChip
                  status={normalizeKycStatus(selectedSalon.kycStatus)}
                />
              </Stack>
            </DialogTitle>

            <DialogContent dividers>
              {/* ================= SALON / OWNER ================= */}

              <Typography
                variant="subtitle1"
                fontWeight={700}
                sx={{ mb: 2 }}
              >
                Salon & Owner Information
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <DetailField
                    label="Salon Name"
                    value={selectedSalon.salonName}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DetailField
                    label="Business Type"
                    value={selectedSalon.businessType}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DetailField
                    label="Owner Name"
                    value={selectedSalon.ownerName}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DetailField
                    label="Phone Number"
                    value={selectedSalon.ownerPhoneNumber}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DetailField
                    label="Alternate Phone"
                    value={selectedSalon.alternatePhone}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DetailField
                    label="Email"
                    value={selectedSalon.email}
                  />
                </Grid>

                <Grid item xs={12}>
                  <DetailField
                    label="Address"
                    value={[
                      selectedSalon.address?.addressLine,
                      selectedSalon.address?.city,
                      selectedSalon.address?.state,
                      selectedSalon.address?.pincode
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ mb: 3 }} />

              {/* ================= IDENTIFICATION ================= */}

              <Typography
                variant="subtitle1"
                fontWeight={700}
                sx={{ mb: 2 }}
              >
                Identification Details
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <DetailField
                    label="Aadhaar Number"
                    value={maskAadhaar(selectedSalon.aadhaarNumber)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DetailField
                    label="PAN Number"
                    value={selectedSalon.panNumber}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DetailField
                    label="GST Number"
                    value={selectedSalon.gstNumber}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ mb: 3 }} />

              {/* ================= BANK ================= */}

              <Typography
                variant="subtitle1"
                fontWeight={700}
                sx={{ mb: 2 }}
              >
                Bank Details
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <DetailField
                    label="Account Holder"
                    value={selectedSalon.accountHolderName}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DetailField
                    label="Bank Account"
                    value={selectedSalon.bankAccount}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DetailField
                    label="IFSC"
                    value={selectedSalon.ifsc}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ mb: 3 }} />

              {/* ================= DOCUMENTS ================= */}

              <Typography
                variant="subtitle1"
                fontWeight={700}
                sx={{ mb: 2 }}
              >
                Submitted Documents
              </Typography>

              <Stack spacing={1.5}>
                <DocumentRow
                  title="Aadhaar Card"
                  value={selectedSalon.aadhaarNumber}
                />

                <DocumentRow
                  title="PAN Card"
                  value={selectedSalon.panNumber}
                />

                <DocumentRow
                  title="GST Certificate"
                  value={selectedSalon.gstNumber}
                />
              </Stack>

              {/* ================= REJECTION ================= */}

              {normalizeKycStatus(selectedSalon.kycStatus) === 'REJECTED' &&
                selectedSalon.rejectionReason && (
                  <Box
                    sx={{
                      mt: 3,
                      p: 2,
                      borderRadius: 1.5,
                      bgcolor: 'error.lighter'
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      color="error.main"
                      fontWeight={700}
                    >
                      Rejection Reason
                    </Typography>

                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {selectedSalon.rejectionReason}
                    </Typography>
                  </Box>
                )}

              {/* ================= REVIEW INFO ================= */}

              {(selectedSalon.approvedAt ||
                selectedSalon.rejectedAt ||
                selectedSalon.approvedBy ||
                selectedSalon.rejectedBy) && (
                <>
                  <Divider sx={{ my: 3 }} />

                  <Typography variant="subtitle1" fontWeight={700}>
                    Review Information
                  </Typography>

                  {selectedSalon.approvedAt && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Approved by{' '}
                      {selectedSalon.approvedBy || 'Admin'} on{' '}
                      {formatDate(selectedSalon.approvedAt)}
                    </Typography>
                  )}

                  {selectedSalon.rejectedAt && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Rejected by{' '}
                      {selectedSalon.rejectedBy || 'Admin'} on{' '}
                      {formatDate(selectedSalon.rejectedAt)}
                    </Typography>
                  )}
                </>
              )}

              {/* ================= STATUS INFO ================= */}

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle1" fontWeight={700}>
                Application Information
              </Typography>

              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid item xs={12} sm={6}>
                  <DetailField
                    label="KYC Status"
                    value={normalizeKycStatus(selectedSalon.kycStatus)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DetailField
                    label="Salon Status"
                    value={selectedSalon.salonStatus}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DetailField
                    label="Admin Approval Status"
                    value={selectedSalon.adminApprovalStatus}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DetailField
                    label="Created At"
                    value={formatDate(selectedSalon.createdAt)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DetailField
                    label="Last Updated"
                    value={formatDate(selectedSalon.updatedAt)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DetailField
                    label="Last Updated By"
                    value={selectedSalon.lastUpdatedBy}
                  />
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setDetailsOpen(false)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

// ==============================|| SUMMARY CARD ||============================== //

function SummaryCard({
  title,
  value,
  icon,
  bgcolor,
  color
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  bgcolor: string;
  color: string;
}) {
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 2,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
      }}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between">
          <Box>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>

            <Typography variant="h4" sx={{ mt: 1, fontWeight: 700 }}>
              {value}
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
              bgcolor,
              color
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ==============================|| DETAIL FIELD ||============================== //

function DetailField({
  label,
  value
}: {
  label: string;
  value?: string | number | null;
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

      <Typography variant="body2" fontWeight={600}>
        {value || '—'}
      </Typography>
    </Box>
  );
}

// ==============================|| DOCUMENT ROW ||============================== //

function DocumentRow({
  title,
  value
}: {
  title: string;
  value?: string | null;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 1.5
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1,
              bgcolor: 'primary.lighter',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FileTextOutlined />
          </Box>

          <Box>
            <Typography variant="body2" fontWeight={600}>
              {title}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              {value || 'Not provided'}
            </Typography>
          </Box>
        </Stack>

        {value && (
          <Chip
            size="small"
            label="Submitted"
            color="success"
            variant="outlined"
          />
        )}
      </Stack>
    </Paper>
  );
}