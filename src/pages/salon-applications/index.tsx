
import { useMemo, useState } from 'react';

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
  EnvironmentOutlined
} from '@ant-design/icons';

// ==============================|| TYPES ||============================== //

type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface SalonApplication {
  id: string;
  salonName: string;
  ownerName: string;
  phone: string;
  email: string;
  businessType: string;
  city: string;
  state: string;
  pincode: string;
  submittedDate: string;
  status: ApplicationStatus;

  gstNumber?: string;
  panNumber?: string;
  aadhaarNumber?: string;
  shopEstablishmentNumber?: string;
  udyamNumber?: string;

  aadhaarFront?: string;
  aadhaarBack?: string;
  panCard?: string;
  gstCertificate?: string;
}

// ==============================|| MOCK DATA ||============================== //

const initialApplications: SalonApplication[] = [
  {
    id: 'APP-1001',
    salonName: 'Glow Beauty Studio',
    ownerName: 'Ananya Sharma',
    phone: '+91 98765 43210',
    email: 'ananya@example.com',
    businessType: 'Beauty Salon',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560001',
    submittedDate: '30 Aug 2026',
    status: 'PENDING',
    gstNumber: '29ABCDE1234F1Z5',
    panNumber: 'ABCDE1234F',
    aadhaarNumber: 'XXXX-XXXX-1234',
    shopEstablishmentNumber: 'KA-SE-100234',
    udyamNumber: 'UDYAM-KA-12-0012345'
  },
  {
    id: 'APP-1002',
    salonName: 'The Hair Lounge',
    ownerName: 'Rahul Verma',
    phone: '+91 99887 66554',
    email: 'rahul@example.com',
    businessType: 'Hair Salon',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560034',
    submittedDate: '29 Aug 2026',
    status: 'PENDING',
    gstNumber: '29FGHIJ5678K1Z2',
    panNumber: 'FGHIJ5678K',
    aadhaarNumber: 'XXXX-XXXX-5678'
  },
  {
    id: 'APP-1003',
    salonName: 'Aura Unisex Salon',
    ownerName: 'Priya Nair',
    phone: '+91 91234 56789',
    email: 'priya@example.com',
    businessType: 'Unisex Salon',
    city: 'Mysuru',
    state: 'Karnataka',
    pincode: '570001',
    submittedDate: '28 Aug 2026',
    status: 'APPROVED',
    gstNumber: '29KLMNO9012P1Z8',
    panNumber: 'KLMNO9012P',
    aadhaarNumber: 'XXXX-XXXX-9012'
  },
  {
    id: 'APP-1004',
    salonName: 'Style Studio',
    ownerName: 'Vikram Singh',
    phone: '+91 90000 11223',
    email: 'vikram@example.com',
    businessType: 'Beauty & Wellness',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560103',
    submittedDate: '26 Aug 2026',
    status: 'REJECTED',
    gstNumber: '29QRSTU3456V1Z6',
    panNumber: 'QRSTU3456V'
  },
  {
    id: 'APP-1005',
    salonName: 'Blush Beauty Bar',
    ownerName: 'Sneha Rao',
    phone: '+91 98888 77665',
    email: 'sneha@example.com',
    businessType: 'Beauty Salon',
    city: 'Hubballi',
    state: 'Karnataka',
    pincode: '580020',
    submittedDate: '25 Aug 2026',
    status: 'PENDING',
    panNumber: 'ABCDE9876X',
    aadhaarNumber: 'XXXX-XXXX-3456'
  }
];

// ==============================|| STATUS CHIP ||============================== //

function StatusChip({ status }: { status: ApplicationStatus }) {
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

// ==============================|| PAGE ||============================== //

export default function SalonApplications() {
  const [applications, setApplications] = useState(initialApplications);

  const [tab, setTab] = useState<'ALL' | ApplicationStatus>('ALL');

  const [search, setSearch] = useState('');

  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [selectedApplication, setSelectedApplication] =
    useState<SalonApplication | null>(null);

  const [detailsOpen, setDetailsOpen] = useState(false);

  const [rejectOpen, setRejectOpen] = useState(false);

  const [rejectionReason, setRejectionReason] = useState('');

  // ==============================|| COUNTS ||============================== //

  const counts = useMemo(() => {
    return {
      all: applications.length,
      pending: applications.filter((item) => item.status === 'PENDING').length,
      approved: applications.filter((item) => item.status === 'APPROVED').length,
      rejected: applications.filter((item) => item.status === 'REJECTED').length
    };
  }, [applications]);

  // ==============================|| FILTER ||============================== //

  const filteredApplications = useMemo(() => {
    const query = search.toLowerCase().trim();

    return applications.filter((application) => {
      const matchesTab =
        tab === 'ALL' || application.status === tab;

      const matchesSearch =
        !query ||
        application.salonName.toLowerCase().includes(query) ||
        application.ownerName.toLowerCase().includes(query) ||
        application.phone.toLowerCase().includes(query) ||
        application.email.toLowerCase().includes(query) ||
        application.city.toLowerCase().includes(query) ||
        application.id.toLowerCase().includes(query);

      return matchesTab && matchesSearch;
    });
  }, [applications, search, tab]);

  // ==============================|| HANDLERS ||============================== //

  const handleView = (application: SalonApplication) => {
    setSelectedApplication(application);
    setDetailsOpen(true);
  };

  const handleApprove = (application: SalonApplication) => {
    setApplications((previous) =>
      previous.map((item) =>
        item.id === application.id
          ? {
              ...item,
              status: 'APPROVED'
            }
          : item
      )
    );

    setDetailsOpen(false);
  };

  const handleOpenReject = (application: SalonApplication) => {
    setSelectedApplication(application);
    setRejectionReason('');
    setRejectOpen(true);
  };

  const handleReject = () => {
    if (!selectedApplication) return;

    setApplications((previous) =>
      previous.map((item) =>
        item.id === selectedApplication.id
          ? {
              ...item,
              status: 'REJECTED'
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
      {/* ============================== HEADER ============================== */}

      <Grid
        container
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Grid item>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              sx={{
                bgcolor: 'primary.lighter',
                color: 'primary.main',
                width: 48,
                height: 48
              }}
            >
              <ShopOutlined style={{ fontSize: 24 }} />
            </Avatar>

            <Box>
              <Typography variant="h4">
                Salon Applications
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Review and verify salon partner applications
              </Typography>
            </Box>
          </Stack>
        </Grid>
      </Grid>

      {/* ============================== STAT CARDS ============================== */}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2.5,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2
            }}
          >
            <Stack direction="row" justifyContent="space-between">
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Total Applications
                </Typography>

                <Typography variant="h3" sx={{ mt: 1 }}>
                  {counts.all}
                </Typography>
              </Box>

              <Avatar
                sx={{
                  bgcolor: 'primary.lighter',
                  color: 'primary.main'
                }}
              >
                <FileTextOutlined />
              </Avatar>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2.5,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2
            }}
          >
            <Stack direction="row" justifyContent="space-between">
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Pending Review
                </Typography>

                <Typography
                  variant="h3"
                  sx={{ mt: 1 }}
                  color="warning.main"
                >
                  {counts.pending}
                </Typography>
              </Box>

              <Avatar
                sx={{
                  bgcolor: 'warning.lighter',
                  color: 'warning.main'
                }}
              >
                <ClockCircleOutlined />
              </Avatar>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2.5,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2
            }}
          >
            <Stack direction="row" justifyContent="space-between">
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Approved
                </Typography>

                <Typography
                  variant="h3"
                  sx={{ mt: 1 }}
                  color="success.main"
                >
                  {counts.approved}
                </Typography>
              </Box>

              <Avatar
                sx={{
                  bgcolor: 'success.lighter',
                  color: 'success.main'
                }}
              >
                <CheckCircleOutlined />
              </Avatar>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2.5,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2
            }}
          >
            <Stack direction="row" justifyContent="space-between">
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Rejected
                </Typography>

                <Typography
                  variant="h3"
                  sx={{ mt: 1 }}
                  color="error.main"
                >
                  {counts.rejected}
                </Typography>
              </Box>

              <Avatar
                sx={{
                  bgcolor: 'error.lighter',
                  color: 'error.main'
                }}
              >
                <CloseCircleOutlined />
              </Avatar>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* ============================== TABLE ============================== */}

      <Paper
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        {/* TABS */}

        <Tabs
          value={tab}
          onChange={(_, value) => {
            setTab(value);
            setPage(0);
          }}
          sx={{
            px: 2,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Tab
            value="ALL"
            label={`All (${counts.all})`}
          />

          <Tab
            value="PENDING"
            label={`Pending (${counts.pending})`}
          />

          <Tab
            value="APPROVED"
            label={`Approved (${counts.approved})`}
          />

          <Tab
            value="REJECTED"
            label={`Rejected (${counts.rejected})`}
          />
        </Tabs>

        {/* TOOLBAR */}

        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by salon, owner, phone, email, city or application ID..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
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

        {/* TABLE */}

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
                  Status
                </TableCell>

                <TableCell align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredApplications
                .slice(
                  page * rowsPerPage,
                  page * rowsPerPage + rowsPerPage
                )
                .map((application) => (
                  <TableRow
                    hover
                    key={application.id}
                  >
                    {/* APPLICATION */}

                    <TableCell>
                      <Typography
                        variant="subtitle2"
                        fontWeight={600}
                      >
                        {application.id}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {application.businessType}
                      </Typography>
                    </TableCell>

                    {/* SALON */}

                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                      >
                        <Avatar
                          sx={{
                            bgcolor: 'primary.lighter',
                            color: 'primary.main'
                          }}
                        >
                          <ShopOutlined />
                        </Avatar>

                        <Box>
                          <Typography
                            variant="subtitle2"
                            fontWeight={600}
                          >
                            {application.salonName}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {application.email}
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
                            {application.ownerName}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {application.phone}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    {/* LOCATION */}

                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={0.75}
                        alignItems="center"
                      >
                        <EnvironmentOutlined />

                        <Typography variant="body2">
                          {application.city}
                        </Typography>
                      </Stack>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {application.state}
                      </Typography>
                    </TableCell>

                    {/* DATE */}

                    <TableCell>
                      <Typography variant="body2">
                        {application.submittedDate}
                      </Typography>
                    </TableCell>

                    {/* STATUS */}

                    <TableCell>
                      <StatusChip
                        status={application.status}
                      />
                    </TableCell>

                    {/* ACTIONS */}

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
                              handleView(application)
                            }
                          >
                            <EyeOutlined />
                          </IconButton>
                        </Tooltip>

                        {application.status === 'PENDING' && (
                          <>
                            <Tooltip title="Approve">
                              <IconButton
                                color="success"
                                onClick={() =>
                                  handleApprove(application)
                                }
                              >
                                <CheckCircleOutlined />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Reject">
                              <IconButton
                                color="error"
                                onClick={() =>
                                  handleOpenReject(application)
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
                ))}

              {filteredApplications.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    align="center"
                    sx={{ py: 8 }}
                  >
                    <FileTextOutlined
                      style={{
                        fontSize: 40,
                        color: '#999'
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
                      Try changing your search or filter.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* PAGINATION */}

        <TablePagination
          component="div"
          count={filteredApplications.length}
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

      {/* ============================== APPLICATION DETAILS ============================== */}

      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedApplication && (
          <>
            <DialogTitle>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography variant="h5">
                    {selectedApplication.salonName}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Application ID: {selectedApplication.id}
                  </Typography>
                </Box>

                <StatusChip
                  status={selectedApplication.status}
                />
              </Stack>
            </DialogTitle>

            <DialogContent dividers>
              {/* BUSINESS INFORMATION */}

              <Typography
                variant="h6"
                sx={{ mb: 2 }}
              >
                Business Information
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Salon Name
                  </Typography>

                  <Typography>
                    {selectedApplication.salonName}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Business Type
                  </Typography>

                  <Typography>
                    {selectedApplication.businessType}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* OWNER */}

              <Typography
                variant="h6"
                sx={{ mb: 2 }}
              >
                Owner Information
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Owner Name
                  </Typography>

                  <Typography>
                    {selectedApplication.ownerName}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Phone
                  </Typography>

                  <Typography>
                    {selectedApplication.phone}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Email
                  </Typography>

                  <Typography>
                    {selectedApplication.email}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* ADDRESS */}

              <Typography
                variant="h6"
                sx={{ mb: 2 }}
              >
                Business Location
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    City
                  </Typography>

                  <Typography>
                    {selectedApplication.city}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    State
                  </Typography>

                  <Typography>
                    {selectedApplication.state}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Pincode
                  </Typography>

                  <Typography>
                    {selectedApplication.pincode}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* KYC */}

              <Typography
                variant="h6"
                sx={{ mb: 2 }}
              >
                KYC / Business Documents
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    GST Number
                  </Typography>

                  <Typography>
                    {selectedApplication.gstNumber || 'Not provided'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    PAN Number
                  </Typography>

                  <Typography>
                    {selectedApplication.panNumber || 'Not provided'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Aadhaar
                  </Typography>

                  <Typography>
                    {selectedApplication.aadhaarNumber || 'Not provided'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Shop Establishment
                  </Typography>

                  <Typography>
                    {selectedApplication.shopEstablishmentNumber || 'Not provided'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    UDYAM
                  </Typography>

                  <Typography>
                    {selectedApplication.udyamNumber || 'Not provided'}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* DOCUMENT PREVIEW PLACEHOLDERS */}

              <Typography
                variant="h6"
                sx={{ mb: 2 }}
              >
                Uploaded Documents
              </Typography>

              <Grid container spacing={2}>
                {[
                  'Aadhaar Front',
                  'Aadhaar Back',
                  'PAN Card',
                  'GST Certificate'
                ].map((document) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    key={document}
                  >
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                      >
                        <FileTextOutlined />

                        <Typography>
                          {document}
                        </Typography>
                      </Stack>

                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EyeOutlined />}
                      >
                        View
                      </Button>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
              <Button
                onClick={() => setDetailsOpen(false)}
              >
                Close
              </Button>

              {selectedApplication.status === 'PENDING' && (
                <>
                  <Button
                    color="error"
                    variant="outlined"
                    startIcon={<CloseCircleOutlined />}
                    onClick={() =>
                      handleOpenReject(selectedApplication)
                    }
                  >
                    Reject
                  </Button>

                  <Button
                    color="success"
                    variant="contained"
                    startIcon={<CheckCircleOutlined />}
                    onClick={() =>
                      handleApprove(selectedApplication)
                    }
                  >
                    Approve Application
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ============================== REJECT DIALOG ============================== */}

      <Dialog
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Reject Salon Application
        </DialogTitle>

        <DialogContent>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            Please provide a reason for rejecting this
            application.
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Enter rejection reason..."
            value={rejectionReason}
            onChange={(event) =>
              setRejectionReason(event.target.value)
            }
          />
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setRejectOpen(false)}
          >
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            disabled={!rejectionReason.trim()}
            onClick={handleReject}
          >
            Reject Application
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
