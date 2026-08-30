import { useMemo, useState } from 'react';

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

// ==============================|| TYPES ||============================== //

type KycStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface KycDocument {
  id: string;
  salonId: string;
  salonName: string;
  ownerName: string;
  phoneNumber: string;
  email: string;
  businessType: string;

  aadhaarNumber: string;
  panNumber: string;
  gstNumber: string;
  shopEstablishmentNumber: string;
  udyamNumber: string;

  aadhaarFront: string;
  aadhaarBack: string;
  panCard: string;
  gstCertificate: string;

  status: KycStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

// ==============================|| DUMMY DATA ||============================== //

const initialKycDocuments: KycDocument[] = [
  {
    id: 'KYC-1001',
    salonId: 'SALON-1001',
    salonName: 'Glow Beauty Studio',
    ownerName: 'Priya Sharma',
    phoneNumber: '+91 98765 43210',
    email: 'priya@example.com',
    businessType: 'Beauty Salon',

    aadhaarNumber: 'XXXX XXXX 4521',
    panNumber: 'ABCDE1234F',
    gstNumber: '29ABCDE1234F1Z5',
    shopEstablishmentNumber: 'KA-SE-100245',
    udyamNumber: 'UDYAM-KA-12-0012345',

    aadhaarFront: 'aadhaar-front.pdf',
    aadhaarBack: 'aadhaar-back.pdf',
    panCard: 'pan-card.pdf',
    gstCertificate: 'gst-certificate.pdf',

    status: 'PENDING',
    submittedAt: '30 Aug 2026, 09:42 AM'
  },
  {
    id: 'KYC-1002',
    salonId: 'SALON-1002',
    salonName: 'Urban Cuts & Spa',
    ownerName: 'Rahul Kumar',
    phoneNumber: '+91 99887 77665',
    email: 'rahul@example.com',
    businessType: 'Salon & Spa',

    aadhaarNumber: 'XXXX XXXX 7832',
    panNumber: 'FGHIJ5678K',
    gstNumber: '29FGHIJ5678K1Z2',
    shopEstablishmentNumber: 'KA-SE-100876',
    udyamNumber: 'UDYAM-KA-12-0056789',

    aadhaarFront: 'aadhaar-front.pdf',
    aadhaarBack: 'aadhaar-back.pdf',
    panCard: 'pan-card.pdf',
    gstCertificate: 'gst-certificate.pdf',

    status: 'APPROVED',
    submittedAt: '28 Aug 2026, 03:15 PM',
    reviewedAt: '29 Aug 2026, 10:20 AM',
    reviewedBy: 'Admin'
  },
  {
    id: 'KYC-1003',
    salonId: 'SALON-1003',
    salonName: 'Blush & Bloom',
    ownerName: 'Sneha Reddy',
    phoneNumber: '+91 91234 56789',
    email: 'sneha@example.com',
    businessType: 'Beauty Studio',

    aadhaarNumber: 'XXXX XXXX 9123',
    panNumber: 'LMNOP9012Q',
    gstNumber: '29LMNOP9012Q1Z8',
    shopEstablishmentNumber: 'KA-SE-100991',
    udyamNumber: 'UDYAM-KA-12-0087654',

    aadhaarFront: 'aadhaar-front.pdf',
    aadhaarBack: 'aadhaar-back.pdf',
    panCard: 'pan-card.pdf',
    gstCertificate: 'gst-certificate.pdf',

    status: 'REJECTED',
    submittedAt: '25 Aug 2026, 11:30 AM',
    reviewedAt: '26 Aug 2026, 02:10 PM',
    reviewedBy: 'Admin',
    rejectionReason: 'PAN document is not clearly readable.'
  },
  {
    id: 'KYC-1004',
    salonId: 'SALON-1004',
    salonName: 'The Hair Lounge',
    ownerName: 'Ananya Rao',
    phoneNumber: '+91 90123 45678',
    email: 'ananya@example.com',
    businessType: 'Hair Salon',

    aadhaarNumber: 'XXXX XXXX 3456',
    panNumber: 'RSTUV3456W',
    gstNumber: '29RSTUV3456W1Z4',
    shopEstablishmentNumber: 'KA-SE-101234',
    udyamNumber: 'UDYAM-KA-12-0098765',

    aadhaarFront: 'aadhaar-front.pdf',
    aadhaarBack: 'aadhaar-back.pdf',
    panCard: 'pan-card.pdf',
    gstCertificate: 'gst-certificate.pdf',

    status: 'PENDING',
    submittedAt: '30 Aug 2026, 08:20 AM'
  },
  {
    id: 'KYC-1005',
    salonId: 'SALON-1005',
    salonName: 'Serenity Wellness',
    ownerName: 'Meera Nair',
    phoneNumber: '+91 93456 78901',
    email: 'meera@example.com',
    businessType: 'Wellness & Spa',

    aadhaarNumber: 'XXXX XXXX 5678',
    panNumber: 'XYZAB7890C',
    gstNumber: '29XYZAB7890C1Z1',
    shopEstablishmentNumber: 'KA-SE-101456',
    udyamNumber: 'UDYAM-KA-12-0011223',

    aadhaarFront: 'aadhaar-front.pdf',
    aadhaarBack: 'aadhaar-back.pdf',
    panCard: 'pan-card.pdf',
    gstCertificate: 'gst-certificate.pdf',

    status: 'APPROVED',
    submittedAt: '22 Aug 2026, 04:45 PM',
    reviewedAt: '23 Aug 2026, 09:30 AM',
    reviewedBy: 'Admin'
  }
];

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

// ==============================|| PAGE ||============================== //

export default function KycDocuments() {
  const [documents, setDocuments] = useState<KycDocument[]>(initialKycDocuments);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | KycStatus>('ALL');

  const [selectedDocument, setSelectedDocument] = useState<KycDocument | null>(null);

  const [detailsOpen, setDetailsOpen] = useState(false);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ==============================|| COUNTERS ||============================== //

  const totalCount = documents.length;

  const pendingCount = documents.filter((item) => item.status === 'PENDING').length;

  const approvedCount = documents.filter((item) => item.status === 'APPROVED').length;

  const rejectedCount = documents.filter((item) => item.status === 'REJECTED').length;

  // ==============================|| FILTER ||============================== //

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return documents.filter((item) => {
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

      const matchesSearch =
        !query ||
        item.salonName.toLowerCase().includes(query) ||
        item.ownerName.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query) ||
        item.salonId.toLowerCase().includes(query) ||
        item.phoneNumber.toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [documents, search, statusFilter]);

  // ==============================|| HANDLERS ||============================== //

  const handleStatusFilter = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value as 'ALL' | KycStatus);
    setPage(0);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const handleView = (document: KycDocument) => {
    setSelectedDocument(document);
    setDetailsOpen(true);
  };

  const handleApprove = (document: KycDocument) => {
    setDocuments((prev) =>
      prev.map((item) =>
        item.id === document.id
          ? {
              ...item,
              status: 'APPROVED',
              reviewedAt: '30 Aug 2026, 11:00 AM',
              reviewedBy: 'Admin',
              rejectionReason: undefined
            }
          : item
      )
    );

    setSelectedDocument((prev) =>
      prev && prev.id === document.id
        ? {
            ...prev,
            status: 'APPROVED',
            reviewedAt: '30 Aug 2026, 11:00 AM',
            reviewedBy: 'Admin',
            rejectionReason: undefined
          }
        : prev
    );
  };

  const openRejectDialog = (document: KycDocument) => {
    setSelectedDocument(document);
    setRejectionReason('');
    setRejectOpen(true);
  };

  const handleReject = () => {
    if (!selectedDocument) return;

    const reason =
      rejectionReason.trim() || 'Documents could not be verified. Please resubmit valid documents.';

    setDocuments((prev) =>
      prev.map((item) =>
        item.id === selectedDocument.id
          ? {
              ...item,
              status: 'REJECTED',
              reviewedAt: '30 Aug 2026, 11:00 AM',
              reviewedBy: 'Admin',
              rejectionReason: reason
            }
          : item
      )
    );

    setSelectedDocument((prev) =>
      prev
        ? {
            ...prev,
            status: 'REJECTED',
            reviewedAt: '30 Aug 2026, 11:00 AM',
            reviewedBy: 'Admin',
            rejectionReason: reason
          }
        : null
    );

    setRejectOpen(false);
    setDetailsOpen(false);
    setRejectionReason('');
  };

  const handleReset = () => {
    setSearch('');
    setStatusFilter('ALL');
    setPage(0);
  };

  // ==============================|| DOCUMENT ROW ||============================== //

  const paginatedDocuments = filteredDocuments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
          onClick={() => setDocuments(initialKycDocuments)}
        >
          Refresh
        </Button>
      </Stack>

      {/* ================= SUMMARY CARDS ================= */}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
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
                    Total Applications
                  </Typography>

                  <Typography variant="h4" sx={{ mt: 1, fontWeight: 700 }}>
                    {totalCount}
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
                    color: 'primary.main'
                  }}
                >
                  <FileTextOutlined style={{ fontSize: 22 }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
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
                    Pending Review
                  </Typography>

                  <Typography variant="h4" sx={{ mt: 1, fontWeight: 700 }}>
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
                    bgcolor: 'warning.lighter',
                    color: 'warning.main'
                  }}
                >
                  <SafetyCertificateOutlined style={{ fontSize: 22 }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
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
                    Approved
                  </Typography>

                  <Typography variant="h4" sx={{ mt: 1, fontWeight: 700 }}>
                    {approvedCount}
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
                    bgcolor: 'success.lighter',
                    color: 'success.main'
                  }}
                >
                  <CheckCircleOutlined style={{ fontSize: 22 }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
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
                    Rejected
                  </Typography>

                  <Typography variant="h4" sx={{ mt: 1, fontWeight: 700 }}>
                    {rejectedCount}
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
                    bgcolor: 'error.lighter',
                    color: 'error.main'
                  }}
                >
                  <CloseCircleOutlined style={{ fontSize: 22 }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
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
              placeholder="Search salon, owner, KYC ID..."
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

          {/* TABLE */}

          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>KYC ID</TableCell>

                  <TableCell>Salon</TableCell>

                  <TableCell>Owner</TableCell>

                  <TableCell>Documents</TableCell>

                  <TableCell>Status</TableCell>

                  <TableCell>Submitted</TableCell>

                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedDocuments.length === 0 ? (
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

                        <Typography variant="body2" color="text.secondary">
                          Try changing your search or filters.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedDocuments.map((document) => (
                    <TableRow
                      hover
                      key={document.id}
                      sx={{
                        '&:last-child td': {
                          borderBottom: 0
                        }
                      }}
                    >
                      {/* KYC ID */}

                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: 'primary.main'
                          }}
                        >
                          {document.id}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          {document.salonId}
                        </Typography>
                      </TableCell>

                      {/* SALON */}

                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 1.5,
                              bgcolor: 'primary.lighter',
                              color: 'primary.main',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <ShopOutlined style={{ fontSize: 19 }} />
                          </Box>

                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {document.salonName}
                            </Typography>

                            <Typography variant="caption" color="text.secondary">
                              {document.businessType}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      {/* OWNER */}

                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <UserOutlined />

                          <Box>
                            <Typography variant="body2">
                              {document.ownerName}
                            </Typography>

                            <Typography variant="caption" color="text.secondary">
                              {document.phoneNumber}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      {/* DOCUMENTS */}

                      <TableCell>
                        <Stack direction="row" spacing={0.75}>
                          <Tooltip title="Aadhaar">
                            <Chip
                              size="small"
                              label="Aadhaar"
                              variant="outlined"
                            />
                          </Tooltip>

                          <Tooltip title="PAN">
                            <Chip
                              size="small"
                              label="PAN"
                              variant="outlined"
                            />
                          </Tooltip>

                          <Tooltip title="GST">
                            <Chip
                              size="small"
                              label="GST"
                              variant="outlined"
                            />
                          </Tooltip>
                        </Stack>
                      </TableCell>

                      {/* STATUS */}

                      <TableCell>
                        <StatusChip status={document.status} />
                      </TableCell>

                      {/* DATE */}

                      <TableCell>
                        <Typography variant="body2">
                          {document.submittedAt}
                        </Typography>
                      </TableCell>

                      {/* ACTIONS */}

                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={0.5}
                          justifyContent="flex-end"
                        >
                          <Tooltip title="View Documents">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleView(document)}
                            >
                              <EyeOutlined />
                            </IconButton>
                          </Tooltip>

                          {document.status === 'PENDING' && (
                            <>
                              <Tooltip title="Approve">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleApprove(document)}
                                >
                                  <CheckCircleOutlined />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Reject">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => openRejectDialog(document)}
                                >
                                  <CloseCircleOutlined />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* PAGINATION */}

          <TablePagination
            component="div"
            count={filteredDocuments.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </CardContent>
      </Card>

      {/* ================= DOCUMENT DETAILS ================= */}

      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedDocument && (
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
                    {selectedDocument.id} · {selectedDocument.salonName}
                  </Typography>
                </Box>

                <StatusChip status={selectedDocument.status} />
              </Stack>
            </DialogTitle>

            <DialogContent dividers>
              {/* SALON / OWNER */}

              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Salon & Owner Information
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <DetailField
                    label="Salon Name"
                    value={selectedDocument.salonName}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DetailField
                    label="Business Type"
                    value={selectedDocument.businessType}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DetailField
                    label="Owner Name"
                    value={selectedDocument.ownerName}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DetailField
                    label="Phone Number"
                    value={selectedDocument.phoneNumber}
                  />
                </Grid>

                <Grid item xs={12}>
                  <DetailField
                    label="Email"
                    value={selectedDocument.email}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ mb: 3 }} />

              {/* IDENTIFICATION */}

              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Identification Details
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <DetailField
                    label="Aadhaar Number"
                    value={selectedDocument.aadhaarNumber}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DetailField
                    label="PAN Number"
                    value={selectedDocument.panNumber}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DetailField
                    label="GST Number"
                    value={selectedDocument.gstNumber}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DetailField
                    label="Shop Establishment Number"
                    value={selectedDocument.shopEstablishmentNumber}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DetailField
                    label="Udyam Number"
                    value={selectedDocument.udyamNumber}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ mb: 3 }} />

              {/* DOCUMENT LIST */}

              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Submitted Documents
              </Typography>

              <Stack spacing={1.5}>
                <DocumentRow
                  title="Aadhaar Card - Front"
                  file={selectedDocument.aadhaarFront}
                />

                <DocumentRow
                  title="Aadhaar Card - Back"
                  file={selectedDocument.aadhaarBack}
                />

                <DocumentRow
                  title="PAN Card"
                  file={selectedDocument.panCard}
                />

                <DocumentRow
                  title="GST Certificate"
                  file={selectedDocument.gstCertificate}
                />
              </Stack>

              {/* REJECTION REASON */}

              {selectedDocument.status === 'REJECTED' &&
                selectedDocument.rejectionReason && (
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
                      {selectedDocument.rejectionReason}
                    </Typography>
                  </Box>
                )}

              {/* REVIEW INFO */}

              {selectedDocument.reviewedAt && (
                <>
                  <Divider sx={{ my: 3 }} />

                  <Typography variant="subtitle1" fontWeight={700}>
                    Review Information
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Reviewed by {selectedDocument.reviewedBy || 'Admin'} on{' '}
                    {selectedDocument.reviewedAt}
                  </Typography>
                </>
              )}
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setDetailsOpen(false)}>
                Close
              </Button>

              {selectedDocument.status === 'PENDING' && (
                <>
                  <Button
                    color="error"
                    variant="outlined"
                    startIcon={<CloseCircleOutlined />}
                    onClick={() => openRejectDialog(selectedDocument)}
                  >
                    Reject
                  </Button>

                  <Button
                    color="success"
                    variant="contained"
                    startIcon={<CheckCircleOutlined />}
                    onClick={() => handleApprove(selectedDocument)}
                  >
                    Approve KYC
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
        onClose={() => setRejectOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Reject KYC Verification
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please provide a reason for rejecting this verification.
          </Typography>

          <TextField
            fullWidth
            multiline
            minRows={4}
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            placeholder="Enter rejection reason..."
          />
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRejectOpen(false)}>
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={handleReject}
            startIcon={<CloseCircleOutlined />}
          >
            Reject KYC
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

      <Typography variant="body2" fontWeight={600}>
        {value || '—'}
      </Typography>
    </Box>
  );
}

// ==============================|| DOCUMENT ROW ||============================== //

function DocumentRow({
  title,
  file
}: {
  title: string;
  file: string;
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
              {file}
            </Typography>
          </Box>
        </Stack>

        <Button
          size="small"
          variant="outlined"
          startIcon={<EyeOutlined />}
          onClick={() => {
            // Later this will open the actual S3 document URL.
            alert(`Opening ${file}`);
          }}
        >
          View
        </Button>
      </Stack>
    </Paper>
  );
}