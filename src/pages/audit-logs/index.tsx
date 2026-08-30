
import { useMemo, useState } from 'react';

// material-ui
import {
  Alert,
  Box,
  Chip,
  FormControl,
  Grid,
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

// icons
import {
  AuditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  LoginOutlined,
  LogoutOutlined,
  PlusOutlined,
  SafetyOutlined,
  SearchOutlined,
  SettingOutlined,
  UserOutlined
} from '@ant-design/icons';

// ==============================|| TYPES ||============================== //

type AuditCategory =
  | 'Authentication'
  | 'User'
  | 'Salon'
  | 'Booking'
  | 'Payment'
  | 'Refund'
  | 'KYC'
  | 'Service'
  | 'Staff'
  | 'Review'
  | 'Notification'
  | 'Settings'
  | 'System'
  | 'Security';

type AuditAction =
  | 'Login'
  | 'Logout'
  | 'Created'
  | 'Updated'
  | 'Deleted'
  | 'Approved'
  | 'Rejected'
  | 'Verified'
  | 'Refunded'
  | 'Status Changed'
  | 'Settings Updated'
  | 'Permission Changed';

interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: AuditAction;
  category: AuditCategory;
  target: string;
  description: string;
  ipAddress: string;
  status: 'Success' | 'Failed';
}

// ==============================|| STATIC DATA ||============================== //

const auditLogs: AuditLog[] = [
  {
    id: 'AUD-10001',
    timestamp: '30 Aug 2026, 10:42 AM',
    actor: 'Clavata Admin',
    actorRole: 'Super Admin',
    action: 'Login',
    category: 'Authentication',
    target: 'Admin Portal',
    description: 'Administrator signed into the Clavata admin portal.',
    ipAddress: '192.168.1.10',
    status: 'Success'
  },
  {
    id: 'AUD-10002',
    timestamp: '30 Aug 2026, 10:35 AM',
    actor: 'Clavata Admin',
    actorRole: 'Super Admin',
    action: 'Approved',
    category: 'Salon',
    target: 'Glow Beauty Studio',
    description: 'Salon application was approved after verification.',
    ipAddress: '192.168.1.10',
    status: 'Success'
  },
  {
    id: 'AUD-10003',
    timestamp: '30 Aug 2026, 10:18 AM',
    actor: 'Clavata Admin',
    actorRole: 'Admin',
    action: 'Verified',
    category: 'KYC',
    target: 'Salon KYC - SAL-10045',
    description: 'Salon KYC documents were verified successfully.',
    ipAddress: '192.168.1.11',
    status: 'Success'
  },
  {
    id: 'AUD-10004',
    timestamp: '30 Aug 2026, 09:56 AM',
    actor: 'Clavata Admin',
    actorRole: 'Admin',
    action: 'Updated',
    category: 'Service',
    target: 'Hair Spa',
    description: 'Service pricing and duration were updated.',
    ipAddress: '192.168.1.11',
    status: 'Success'
  },
  {
    id: 'AUD-10005',
    timestamp: '30 Aug 2026, 09:40 AM',
    actor: 'Clavata Admin',
    actorRole: 'Finance Admin',
    action: 'Refunded',
    category: 'Refund',
    target: 'Booking #BK-20481',
    description: 'Customer booking payment was refunded.',
    ipAddress: '192.168.1.12',
    status: 'Success'
  },
  {
    id: 'AUD-10006',
    timestamp: '30 Aug 2026, 09:20 AM',
    actor: 'Clavata Admin',
    actorRole: 'Admin',
    action: 'Status Changed',
    category: 'Booking',
    target: 'Booking #BK-20480',
    description: 'Booking status changed from pending to confirmed.',
    ipAddress: '192.168.1.11',
    status: 'Success'
  },
  {
    id: 'AUD-10007',
    timestamp: '30 Aug 2026, 09:05 AM',
    actor: 'Clavata Admin',
    actorRole: 'Support Admin',
    action: 'Updated',
    category: 'User',
    target: 'Customer #USR-10091',
    description: 'Customer profile information was updated.',
    ipAddress: '192.168.1.13',
    status: 'Success'
  },
  {
    id: 'AUD-10008',
    timestamp: '29 Aug 2026, 06:45 PM',
    actor: 'Clavata Admin',
    actorRole: 'Admin',
    action: 'Rejected',
    category: 'Salon',
    target: 'Elite Hair Lounge',
    description: 'Salon application was rejected because required documents were incomplete.',
    ipAddress: '192.168.1.11',
    status: 'Success'
  },
  {
    id: 'AUD-10009',
    timestamp: '29 Aug 2026, 05:30 PM',
    actor: 'Clavata Admin',
    actorRole: 'Super Admin',
    action: 'Settings Updated',
    category: 'Settings',
    target: 'Platform Settings',
    description: 'Platform configuration was updated.',
    ipAddress: '192.168.1.10',
    status: 'Success'
  },
  {
    id: 'AUD-10010',
    timestamp: '29 Aug 2026, 04:15 PM',
    actor: 'Clavata Admin',
    actorRole: 'Super Admin',
    action: 'Permission Changed',
    category: 'Security',
    target: 'Admin Role',
    description: 'Permissions were updated for an administrator role.',
    ipAddress: '192.168.1.10',
    status: 'Success'
  },
  {
    id: 'AUD-10011',
    timestamp: '29 Aug 2026, 03:10 PM',
    actor: 'Clavata Admin',
    actorRole: 'Admin',
    action: 'Created',
    category: 'Staff',
    target: 'Staff #STF-204',
    description: 'Staff record was created for a salon.',
    ipAddress: '192.168.1.11',
    status: 'Success'
  },
  {
    id: 'AUD-10012',
    timestamp: '29 Aug 2026, 02:40 PM',
    actor: 'Clavata Admin',
    actorRole: 'Admin',
    action: 'Deleted',
    category: 'Service',
    target: 'Service #SRV-501',
    description: 'Inactive service was removed from the platform.',
    ipAddress: '192.168.1.11',
    status: 'Success'
  },
  {
    id: 'AUD-10013',
    timestamp: '29 Aug 2026, 01:25 PM',
    actor: 'Clavata Admin',
    actorRole: 'Support Admin',
    action: 'Updated',
    category: 'Review',
    target: 'Review #REV-7821',
    description: 'Review moderation status was updated.',
    ipAddress: '192.168.1.13',
    status: 'Success'
  },
  {
    id: 'AUD-10014',
    timestamp: '29 Aug 2026, 12:30 PM',
    actor: 'Unknown',
    actorRole: 'Unknown',
    action: 'Login',
    category: 'Authentication',
    target: 'Admin Portal',
    description: 'Failed administrator login attempt.',
    ipAddress: '103.25.81.22',
    status: 'Failed'
  },
  {
    id: 'AUD-10015',
    timestamp: '29 Aug 2026, 11:15 AM',
    actor: 'Clavata Admin',
    actorRole: 'Admin',
    action: 'Updated',
    category: 'Notification',
    target: 'Notification Configuration',
    description: 'Platform notification configuration was updated.',
    ipAddress: '192.168.1.11',
    status: 'Success'
  }
];

// ==============================|| HELPERS ||============================== //

const getActionIcon = (action: AuditAction) => {
  switch (action) {
    case 'Login':
      return <LoginOutlined />;

    case 'Logout':
      return <LogoutOutlined />;

    case 'Created':
      return <PlusOutlined />;

    case 'Updated':
    case 'Settings Updated':
      return <EditOutlined />;

    case 'Deleted':
      return <DeleteOutlined />;

    case 'Approved':
    case 'Verified':
      return <CheckCircleOutlined />;

    case 'Rejected':
      return <CloseCircleOutlined />;

    case 'Permission Changed':
      return <SafetyOutlined />;

    default:
      return <AuditOutlined />;
  }
};

const getCategoryColor = (
  category: AuditCategory
):
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'default' => {
  switch (category) {
    case 'Authentication':
      return 'primary';

    case 'User':
      return 'info';

    case 'Salon':
      return 'secondary';

    case 'Booking':
      return 'warning';

    case 'Payment':
    case 'Refund':
      return 'success';

    case 'KYC':
    case 'Security':
      return 'error';

    case 'Settings':
    case 'System':
      return 'default';

    default:
      return 'primary';
  }
};

// ==============================|| AUDIT HISTORY ||============================== //

export default function AuditHistory() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'All' | AuditCategory>('All');
  const [action, setAction] = useState<'All' | AuditAction>('All');
  const [status, setStatus] = useState<'All' | 'Success' | 'Failed'>('All');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        !searchValue ||
        log.id.toLowerCase().includes(searchValue) ||
        log.actor.toLowerCase().includes(searchValue) ||
        log.target.toLowerCase().includes(searchValue) ||
        log.description.toLowerCase().includes(searchValue) ||
        log.ipAddress.toLowerCase().includes(searchValue);

      const matchesCategory =
        category === 'All' || log.category === category;

      const matchesAction =
        action === 'All' || log.action === action;

      const matchesStatus =
        status === 'All' || log.status === status;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesAction &&
        matchesStatus
      );
    });
  }, [search, category, action, status]);

  const paginatedLogs = filteredLogs.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setCategory(event.target.value as 'All' | AuditCategory);
    setPage(0);
  };

  const handleActionChange = (event: SelectChangeEvent) => {
    setAction(event.target.value as 'All' | AuditAction);
    setPage(0);
  };

  const handleStatusChange = (event: SelectChangeEvent) => {
    setStatus(event.target.value as 'All' | 'Success' | 'Failed');
    setPage(0);
  };

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const successCount = auditLogs.filter(
    (log) => log.status === 'Success'
  ).length;

  const failedCount = auditLogs.filter(
    (log) => log.status === 'Failed'
  ).length;

  const todayCount = auditLogs.filter(
    (log) => log.timestamp.startsWith('30 Aug 2026')
  ).length;

  return (
    <Box>
      {/* ====================================================== */}
      {/* PAGE HEADER */}
      {/* ====================================================== */}

      <Box sx={{ mb: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
        >
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <AuditOutlined style={{ fontSize: 28 }} />

              <Typography variant="h4">
                Audit History
              </Typography>
            </Stack>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.75 }}
            >
              Track administrative actions, security events and important
              platform changes across Clavata.
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* ====================================================== */}
      {/* SUMMARY CARDS */}
      {/* ====================================================== */}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 2,
              height: '100%'
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Total Events
            </Typography>

            <Typography variant="h4" sx={{ mt: 1 }}>
              {auditLogs.length}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Recorded audit events
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 2,
              height: '100%'
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Today's Events
            </Typography>

            <Typography variant="h4" sx={{ mt: 1 }}>
              {todayCount}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Events recorded today
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 2,
              height: '100%'
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Successful
            </Typography>

            <Typography
              variant="h4"
              color="success.main"
              sx={{ mt: 1 }}
            >
              {successCount}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Successfully completed actions
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2.5,
              borderRadius: 2,
              height: '100%'
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Failed
            </Typography>

            <Typography
              variant="h4"
              color="error.main"
              sx={{ mt: 1 }}
            >
              {failedCount}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Failed or blocked actions
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* ====================================================== */}
      {/* INFORMATION */}
      {/* ====================================================== */}

      <Alert
        severity="info"
        icon={<SafetyOutlined />}
        sx={{ mb: 3 }}
      >
        Audit history is read-only. In production, these events should be
        generated automatically by the backend whenever administrators,
        support users or automated systems perform sensitive actions.
      </Alert>

      {/* ====================================================== */}
      {/* FILTERS */}
      {/* ====================================================== */}

      <Paper
        sx={{
          p: 2,
          mb: 2.5,
          borderRadius: 2
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search audit logs..."
              value={search}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <SearchOutlined
                    style={{
                      marginRight: 10,
                      color: '#888'
                    }}
                  />
                )
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>

              <Select
                value={category}
                label="Category"
                onChange={handleCategoryChange}
              >
                <MenuItem value="All">All Categories</MenuItem>

                <MenuItem value="Authentication">
                  Authentication
                </MenuItem>

                <MenuItem value="User">
                  User
                </MenuItem>

                <MenuItem value="Salon">
                  Salon
                </MenuItem>

                <MenuItem value="Booking">
                  Booking
                </MenuItem>

                <MenuItem value="Payment">
                  Payment
                </MenuItem>

                <MenuItem value="Refund">
                  Refund
                </MenuItem>

                <MenuItem value="KYC">
                  KYC
                </MenuItem>

                <MenuItem value="Service">
                  Service
                </MenuItem>

                <MenuItem value="Staff">
                  Staff
                </MenuItem>

                <MenuItem value="Review">
                  Review
                </MenuItem>

                <MenuItem value="Notification">
                  Notification
                </MenuItem>

                <MenuItem value="Settings">
                  Settings
                </MenuItem>

                <MenuItem value="Security">
                  Security
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Action</InputLabel>

              <Select
                value={action}
                label="Action"
                onChange={handleActionChange}
              >
                <MenuItem value="All">
                  All Actions
                </MenuItem>

                <MenuItem value="Login">
                  Login
                </MenuItem>

                <MenuItem value="Logout">
                  Logout
                </MenuItem>

                <MenuItem value="Created">
                  Created
                </MenuItem>

                <MenuItem value="Updated">
                  Updated
                </MenuItem>

                <MenuItem value="Deleted">
                  Deleted
                </MenuItem>

                <MenuItem value="Approved">
                  Approved
                </MenuItem>

                <MenuItem value="Rejected">
                  Rejected
                </MenuItem>

                <MenuItem value="Verified">
                  Verified
                </MenuItem>

                <MenuItem value="Refunded">
                  Refunded
                </MenuItem>

                <MenuItem value="Status Changed">
                  Status Changed
                </MenuItem>

                <MenuItem value="Settings Updated">
                  Settings Updated
                </MenuItem>

                <MenuItem value="Permission Changed">
                  Permission Changed
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>

              <Select
                value={status}
                label="Status"
                onChange={handleStatusChange}
              >
                <MenuItem value="All">
                  All Statuses
                </MenuItem>

                <MenuItem value="Success">
                  Success
                </MenuItem>

                <MenuItem value="Failed">
                  Failed
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={12}>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Showing {filteredLogs.length} audit event
              {filteredLogs.length !== 1 ? 's' : ''}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* ====================================================== */}
      {/* AUDIT TABLE */}
      {/* ====================================================== */}

      <Paper
        sx={{
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  Event
                </TableCell>

                <TableCell>
                  Actor
                </TableCell>

                <TableCell>
                  Category
                </TableCell>

                <TableCell>
                  Target
                </TableCell>

                <TableCell>
                  Description
                </TableCell>

                <TableCell>
                  IP Address
                </TableCell>

                <TableCell>
                  Status
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedLogs.length > 0 ? (
                paginatedLogs.map((log) => (
                  <TableRow
                    key={log.id}
                    hover
                    sx={{
                      '&:last-child td, &:last-child th': {
                        border: 0
                      }
                    }}
                  >
                    {/* EVENT */}
                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                      >
                        <Box
                          sx={{
                            width: 34,
                            height: 34,
                            borderRadius: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor:
                              log.status === 'Success'
                                ? 'action.hover'
                                : 'error.lighter',
                            color:
                              log.status === 'Success'
                                ? 'primary.main'
                                : 'error.main'
                          }}
                        >
                          {getActionIcon(log.action)}
                        </Box>

                        <Box>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                          >
                            {log.action}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {log.id}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            {log.timestamp}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    {/* ACTOR */}
                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                      >
                        <UserOutlined />

                        <Box>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                          >
                            {log.actor}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {log.actorRole}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    {/* CATEGORY */}
                    <TableCell>
                      <Chip
                        label={log.category}
                        color={getCategoryColor(log.category)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>

                    {/* TARGET */}
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight={500}
                      >
                        {log.target}
                      </Typography>
                    </TableCell>

                    {/* DESCRIPTION */}
                    <TableCell
                      sx={{
                        minWidth: 280,
                        maxWidth: 400
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {log.description}
                      </Typography>
                    </TableCell>

                    {/* IP */}
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'monospace'
                        }}
                      >
                        {log.ipAddress}
                      </Typography>
                    </TableCell>

                    {/* STATUS */}
                    <TableCell>
                      <Chip
                        label={log.status}
                        size="small"
                        color={
                          log.status === 'Success'
                            ? 'success'
                            : 'error'
                        }
                        icon={
                          log.status === 'Success' ? (
                            <CheckCircleOutlined />
                          ) : (
                            <CloseCircleOutlined />
                          )
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    align="center"
                    sx={{ py: 6 }}
                  >
                    <AuditOutlined
                      style={{
                        fontSize: 42,
                        opacity: 0.4
                      }}
                    />

                    <Typography
                      variant="h6"
                      sx={{ mt: 1 }}
                    >
                      No audit events found
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Try changing your search or filters.
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
          count={filteredLogs.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(
              parseInt(event.target.value, 10)
            );
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Paper>

      {/* ====================================================== */}
      {/* FUTURE BACKEND NOTE */}
      {/* ====================================================== */}

      <Box sx={{ mt: 2 }}>
        <Typography
          variant="caption"
          color="text.secondary"
        >
          Future implementation: audit events should be stored
          server-side and populated from Clavata's audit/event
          logging service rather than static frontend data.
        </Typography>
      </Box>
    </Box>
  );
}

