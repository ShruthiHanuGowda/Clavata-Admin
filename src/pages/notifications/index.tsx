
import { useMemo, useState } from 'react';

// material-ui
import {
  Alert,
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
  BellOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
  SendOutlined
} from '@ant-design/icons';

// ==============================|| TYPES ||============================== //

type NotificationType =
  | 'SYSTEM'
  | 'BOOKING'
  | 'PAYMENT'
  | 'VERIFICATION'
  | 'PROMOTION'
  | 'GENERAL';

type NotificationStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'SENT'
  | 'CANCELLED';

type RecipientType =
  | 'ALL_USERS'
  | 'CUSTOMERS'
  | 'PROVIDERS'
  | 'SALONS';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  recipient: RecipientType;
  status: NotificationStatus;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  createdBy: string;
  recipientsCount: number;
}

// ==============================|| STATIC DATA ||============================== //

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'NOT001',
    title: 'Welcome to Clavata',
    message:
      'Welcome to Clavata. Discover and book trusted salon services near you.',
    type: 'SYSTEM',
    recipient: 'ALL_USERS',
    status: 'SENT',
    sentAt: '30 Aug 2026, 09:30 AM',
    createdAt: '30 Aug 2026',
    createdBy: 'Admin',
    recipientsCount: 1248
  },
  {
    id: 'NOT002',
    title: 'New Booking Received',
    message:
      'You have received a new salon booking. Please review the booking details.',
    type: 'BOOKING',
    recipient: 'PROVIDERS',
    status: 'SENT',
    sentAt: '29 Aug 2026, 06:15 PM',
    createdAt: '29 Aug 2026',
    createdBy: 'System',
    recipientsCount: 86
  },
  {
    id: 'NOT003',
    title: 'Payment Successful',
    message:
      'Your booking payment has been successfully processed.',
    type: 'PAYMENT',
    recipient: 'CUSTOMERS',
    status: 'SENT',
    sentAt: '29 Aug 2026, 05:45 PM',
    createdAt: '29 Aug 2026',
    createdBy: 'System',
    recipientsCount: 342
  },
  {
    id: 'NOT004',
    title: 'Salon Verification Required',
    message:
      'Your salon application is pending verification. Please submit the required documents.',
    type: 'VERIFICATION',
    recipient: 'PROVIDERS',
    status: 'SCHEDULED',
    scheduledAt: '31 Aug 2026, 10:00 AM',
    createdAt: '29 Aug 2026',
    createdBy: 'Admin',
    recipientsCount: 14
  },
  {
    id: 'NOT005',
    title: 'Weekend Beauty Offer',
    message:
      'Explore exclusive salon offers available this weekend on Clavata.',
    type: 'PROMOTION',
    recipient: 'CUSTOMERS',
    status: 'DRAFT',
    createdAt: '28 Aug 2026',
    createdBy: 'Admin',
    recipientsCount: 0
  },
  {
    id: 'NOT006',
    title: 'Platform Maintenance',
    message:
      'Clavata will undergo scheduled maintenance. Some services may be temporarily unavailable.',
    type: 'SYSTEM',
    recipient: 'ALL_USERS',
    status: 'CANCELLED',
    scheduledAt: '28 Aug 2026, 02:00 AM',
    createdAt: '27 Aug 2026',
    createdBy: 'Admin',
    recipientsCount: 1248
  }
];

// ==============================|| FORM ||============================== //

interface NotificationForm {
  title: string;
  message: string;
  type: NotificationType;
  recipient: RecipientType;
  status: NotificationStatus;
  scheduledAt: string;
}

const EMPTY_FORM: NotificationForm = {
  title: '',
  message: '',
  type: 'GENERAL',
  recipient: 'ALL_USERS',
  status: 'DRAFT',
  scheduledAt: ''
};

// ==============================|| MAIN COMPONENT ||============================== //

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>(
    INITIAL_NOTIFICATIONS
  );

  const [search, setSearch] = useState('');

  const [typeFilter, setTypeFilter] = useState<
    'ALL' | NotificationType
  >('ALL');

  const [statusFilter, setStatusFilter] = useState<
    'ALL' | NotificationStatus
  >('ALL');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingNotification, setEditingNotification] =
    useState<Notification | null>(null);

  const [form, setForm] =
    useState<NotificationForm>(EMPTY_FORM);

  const [deleteDialog, setDeleteDialog] = useState(false);
  const [notificationToDelete, setNotificationToDelete] =
    useState<Notification | null>(null);

  const [viewDialog, setViewDialog] = useState(false);
  const [viewNotification, setViewNotification] =
    useState<Notification | null>(null);

  // ==============================|| FILTERING ||============================== //

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        notification.title.toLowerCase().includes(searchValue) ||
        notification.message.toLowerCase().includes(searchValue) ||
        notification.id.toLowerCase().includes(searchValue);

      const matchesType =
        typeFilter === 'ALL' ||
        notification.type === typeFilter;

      const matchesStatus =
        statusFilter === 'ALL' ||
        notification.status === statusFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus
      );
    });
  }, [
    notifications,
    search,
    typeFilter,
    statusFilter
  ]);

  // ==============================|| COUNTERS ||============================== //

  const totalNotifications = notifications.length;

  const sentNotifications = notifications.filter(
    (item) => item.status === 'SENT'
  ).length;

  const scheduledNotifications = notifications.filter(
    (item) => item.status === 'SCHEDULED'
  ).length;

  const draftNotifications = notifications.filter(
    (item) => item.status === 'DRAFT'
  ).length;

  // ==============================|| HANDLERS ||============================== //

  const handleOpenCreate = () => {
    setEditingNotification(null);
    setForm(EMPTY_FORM);
    setOpenDialog(true);
  };

  const handleOpenEdit = (
    notification: Notification
  ) => {
    setEditingNotification(notification);

    setForm({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      recipient: notification.recipient,
      status: notification.status,
      scheduledAt: notification.scheduledAt || ''
    });

    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingNotification(null);
    setForm(EMPTY_FORM);
  };

  const handleFormChange = (
    field: keyof NotificationForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value
    }));
  };

  const handleTypeChange = (
    event: SelectChangeEvent
  ) => {
    setForm((previous) => ({
      ...previous,
      type: event.target.value as NotificationType
    }));
  };

  const handleRecipientChange = (
    event: SelectChangeEvent
  ) => {
    setForm((previous) => ({
      ...previous,
      recipient: event.target.value as RecipientType
    }));
  };

  const handleStatusChange = (
    event: SelectChangeEvent
  ) => {
    setForm((previous) => ({
      ...previous,
      status: event.target.value as NotificationStatus
    }));
  };

  const handleSave = () => {
    if (
      !form.title.trim() ||
      !form.message.trim()
    ) {
      return;
    }

    if (editingNotification) {
      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id ===
          editingNotification.id
            ? {
                ...notification,
                title: form.title.trim(),
                message: form.message.trim(),
                type: form.type,
                recipient: form.recipient,
                status: form.status,
                scheduledAt:
                  form.scheduledAt || undefined
              }
            : notification
        )
      );
    } else {
      const newNotification: Notification = {
        id: `NOT${String(
          notifications.length + 1
        ).padStart(3, '0')}`,
        title: form.title.trim(),
        message: form.message.trim(),
        type: form.type,
        recipient: form.recipient,
        status: form.status,
        scheduledAt:
          form.scheduledAt || undefined,
        createdAt: new Date().toLocaleDateString(
          'en-GB',
          {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }
        ),
        createdBy: 'Admin',
        recipientsCount: 0
      };

      setNotifications((previous) => [
        newNotification,
        ...previous
      ]);
    }

    handleCloseDialog();
  };

  const handleSendNow = (
    notification: Notification
  ) => {
    setNotifications((previous) =>
      previous.map((item) =>
        item.id === notification.id
          ? {
              ...item,
              status: 'SENT',
              sentAt: new Date().toLocaleString(
                'en-GB',
                {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }
              ),
              recipientsCount:
                item.recipientsCount ||
                getRecipientCount(
                  item.recipient
                )
            }
          : item
      )
    );
  };

  const getRecipientCount = (
    recipient: RecipientType
  ) => {
    switch (recipient) {
      case 'CUSTOMERS':
        return 1042;
      case 'PROVIDERS':
        return 86;
      case 'SALONS':
        return 86;
      case 'ALL_USERS':
      default:
        return 1248;
    }
  };

  const handleOpenDelete = (
    notification: Notification
  ) => {
    setNotificationToDelete(notification);
    setDeleteDialog(true);
  };

  const handleCloseDelete = () => {
    setDeleteDialog(false);
    setNotificationToDelete(null);
  };

  const handleDelete = () => {
    if (!notificationToDelete) return;

    setNotifications((previous) =>
      previous.filter(
        (item) =>
          item.id !== notificationToDelete.id
      )
    );

    handleCloseDelete();
  };

  const handleOpenView = (
    notification: Notification
  ) => {
    setViewNotification(notification);
    setViewDialog(true);
  };

  // ==============================|| LABEL HELPERS ||============================== //

  const getTypeColor = (
    type: NotificationType
  ):
    | 'primary'
    | 'info'
    | 'success'
    | 'warning'
    | 'secondary' => {
    switch (type) {
      case 'BOOKING':
        return 'primary';
      case 'PAYMENT':
        return 'success';
      case 'VERIFICATION':
        return 'warning';
      case 'PROMOTION':
        return 'secondary';
      case 'SYSTEM':
        return 'info';
      default:
        return 'primary';
    }
  };

  const getStatusColor = (
    status: NotificationStatus
  ):
    | 'success'
    | 'warning'
    | 'default'
    | 'error'
    | 'info' => {
    switch (status) {
      case 'SENT':
        return 'success';
      case 'SCHEDULED':
        return 'info';
      case 'DRAFT':
        return 'warning';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getRecipientLabel = (
    recipient: RecipientType
  ) => {
    switch (recipient) {
      case 'ALL_USERS':
        return 'All Users';
      case 'CUSTOMERS':
        return 'Customers';
      case 'PROVIDERS':
        return 'Providers';
      case 'SALONS':
        return 'Salons';
      default:
        return recipient;
    }
  };

  // ==============================|| SUMMARY CARD ||============================== //

  const SummaryCard = ({
    title,
    value,
    subtitle
  }: {
    title: string;
    value: number;
    subtitle: string;
  }) => (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 1 }}
      >
        {title}
      </Typography>

      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          mb: 0.5
        }}
      >
        {value.toLocaleString()}
      </Typography>

      <Typography
        variant="caption"
        color="text.secondary"
      >
        {subtitle}
      </Typography>
    </Paper>
  );

  // ==============================|| RENDER ||============================== //

  return (
    <Box>
      {/* HEADER */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          gap: 2,
          flexWrap: 'wrap'
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700 }}
          >
            Notifications
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Create and manage notifications sent
            to Clavata users, customers and
            providers.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<PlusOutlined />}
          onClick={handleOpenCreate}
          sx={{
            borderRadius: 1.5,
            textTransform: 'none',
            px: 2.5,
            py: 1
          }}
        >
          Create Notification
        </Button>
      </Box>

      {/* SUMMARY */}
      <Grid
        container
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Total"
            value={totalNotifications}
            subtitle="All notifications"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Sent"
            value={sentNotifications}
            subtitle="Successfully sent"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Scheduled"
            value={scheduledNotifications}
            subtitle="Waiting to be sent"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Drafts"
            value={draftNotifications}
            subtitle="Not published yet"
          />
        </Grid>
      </Grid>

      {/* TABLE */}
      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        {/* FILTERS */}
        <Box sx={{ p: 2.5 }}>
          <Stack
            direction={{
              xs: 'column',
              md: 'row'
            }}
            spacing={2}
            justifyContent="space-between"
          >
            <TextField
              size="small"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
              placeholder="Search notifications..."
              sx={{
                width: {
                  xs: '100%',
                  md: 350
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined />
                  </InputAdornment>
                )
              }}
            />

            <Stack
              direction="row"
              spacing={1.5}
            >
              <Select
                size="small"
                value={typeFilter}
                onChange={(event) => {
                  setTypeFilter(
                    event.target.value as
                      | 'ALL'
                      | NotificationType
                  );
                  setPage(0);
                }}
                sx={{ minWidth: 160 }}
              >
                <MenuItem value="ALL">
                  All Types
                </MenuItem>
                <MenuItem value="SYSTEM">
                  System
                </MenuItem>
                <MenuItem value="BOOKING">
                  Booking
                </MenuItem>
                <MenuItem value="PAYMENT">
                  Payment
                </MenuItem>
                <MenuItem value="VERIFICATION">
                  Verification
                </MenuItem>
                <MenuItem value="PROMOTION">
                  Promotion
                </MenuItem>
                <MenuItem value="GENERAL">
                  General
                </MenuItem>
              </Select>

              <Select
                size="small"
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(
                    event.target.value as
                      | 'ALL'
                      | NotificationStatus
                  );
                  setPage(0);
                }}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="ALL">
                  All Status
                </MenuItem>
                <MenuItem value="DRAFT">
                  Draft
                </MenuItem>
                <MenuItem value="SCHEDULED">
                  Scheduled
                </MenuItem>
                <MenuItem value="SENT">
                  Sent
                </MenuItem>
                <MenuItem value="CANCELLED">
                  Cancelled
                </MenuItem>
              </Select>
            </Stack>
          </Stack>
        </Box>

        <Divider />

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{ fontWeight: 700 }}
                >
                  Notification
                </TableCell>

                <TableCell
                  sx={{ fontWeight: 700 }}
                >
                  Type
                </TableCell>

                <TableCell
                  sx={{ fontWeight: 700 }}
                >
                  Recipient
                </TableCell>

                <TableCell
                  sx={{ fontWeight: 700 }}
                >
                  Status
                </TableCell>

                <TableCell
                  sx={{ fontWeight: 700 }}
                >
                  Date
                </TableCell>

                <TableCell
                  align="right"
                  sx={{ fontWeight: 700 }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredNotifications
                .slice(
                  page * rowsPerPage,
                  page * rowsPerPage +
                    rowsPerPage
                )
                .map((notification) => (
                  <TableRow
                    hover
                    key={notification.id}
                  >
                    {/* NOTIFICATION */}
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
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent:
                              'center',
                            bgcolor:
                              'primary.lighter',
                            color:
                              'primary.main',
                            flexShrink: 0
                          }}
                        >
                          <BellOutlined
                            style={{
                              fontSize: 19
                            }}
                          />
                        </Box>

                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 600
                            }}
                          >
                            {notification.title}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {notification.id}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    {/* TYPE */}
                    <TableCell>
                      <Chip
                        label={
                          notification.type
                        }
                        color={getTypeColor(
                          notification.type
                        )}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>

                    {/* RECIPIENT */}
                    <TableCell>
                      <Typography variant="body2">
                        {getRecipientLabel(
                          notification.recipient
                        )}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {notification.recipientsCount.toLocaleString()}{' '}
                        recipients
                      </Typography>
                    </TableCell>

                    {/* STATUS */}
                    <TableCell>
                      <Chip
                        label={
                          notification.status
                        }
                        color={getStatusColor(
                          notification.status
                        )}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>

                    {/* DATE */}
                    <TableCell>
                      <Typography variant="body2">
                        {notification.sentAt ||
                          notification.scheduledAt ||
                          notification.createdAt}
                      </Typography>
                    </TableCell>

                    {/* ACTIONS */}
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={0.5}
                        justifyContent="flex-end"
                      >
                        <Tooltip title="View">
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleOpenView(
                                notification
                              )
                            }
                          >
                            <EyeOutlined />
                          </IconButton>
                        </Tooltip>

                        {notification.status !==
                          'SENT' && (
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleOpenEdit(
                                  notification
                                )
                              }
                            >
                              <EditOutlined />
                            </IconButton>
                          </Tooltip>
                        )}

                        {notification.status !==
                          'SENT' && (
                          <Tooltip title="Send Now">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() =>
                                handleSendNow(
                                  notification
                                )
                              }
                            >
                              <SendOutlined />
                            </IconButton>
                          </Tooltip>
                        )}

                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              handleOpenDelete(
                                notification
                              )
                            }
                          >
                            <DeleteOutlined />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}

              {filteredNotifications.length ===
                0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                    sx={{ py: 8 }}
                  >
                    <BellOutlined
                      style={{
                        fontSize: 42,
                        opacity: 0.35,
                        marginBottom: 12
                      }}
                    />

                    <Typography
                      variant="h6"
                      color="text.secondary"
                    >
                      No notifications found
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Try changing your search or
                      filters.
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
            filteredNotifications.length
          }
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, newPage) =>
            setPage(newPage)
          }
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
            25
          ]}
        />
      </Paper>

      {/* ==============================|| CREATE / EDIT DIALOG ||============================== */}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingNotification
            ? 'Edit Notification'
            : 'Create Notification'}
        </DialogTitle>

        <DialogContent>
          <Stack
            spacing={2.5}
            sx={{ mt: 1 }}
          >
            <TextField
              label="Notification Title"
              required
              fullWidth
              value={form.title}
              onChange={(event) =>
                handleFormChange(
                  'title',
                  event.target.value
                )
              }
              placeholder="Enter notification title"
            />

            <TextField
              label="Message"
              required
              fullWidth
              multiline
              minRows={4}
              value={form.message}
              onChange={(event) =>
                handleFormChange(
                  'message',
                  event.target.value
                )
              }
              placeholder="Enter notification message"
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    mb: 0.75,
                    display: 'block'
                  }}
                >
                  Notification Type
                </Typography>

                <Select
                  fullWidth
                  value={form.type}
                  onChange={handleTypeChange}
                >
                  <MenuItem value="SYSTEM">
                    System
                  </MenuItem>

                  <MenuItem value="BOOKING">
                    Booking
                  </MenuItem>

                  <MenuItem value="PAYMENT">
                    Payment
                  </MenuItem>

                  <MenuItem value="VERIFICATION">
                    Verification
                  </MenuItem>

                  <MenuItem value="PROMOTION">
                    Promotion
                  </MenuItem>

                  <MenuItem value="GENERAL">
                    General
                  </MenuItem>
                </Select>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    mb: 0.75,
                    display: 'block'
                  }}
                >
                  Recipient
                </Typography>

                <Select
                  fullWidth
                  value={form.recipient}
                  onChange={
                    handleRecipientChange
                  }
                >
                  <MenuItem value="ALL_USERS">
                    All Users
                  </MenuItem>

                  <MenuItem value="CUSTOMERS">
                    Customers
                  </MenuItem>

                  <MenuItem value="PROVIDERS">
                    Providers
                  </MenuItem>

                  <MenuItem value="SALONS">
                    Salons
                  </MenuItem>
                </Select>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    mb: 0.75,
                    display: 'block'
                  }}
                >
                  Status
                </Typography>

                <Select
                  fullWidth
                  value={form.status}
                  onChange={
                    handleStatusChange
                  }
                >
                  <MenuItem value="DRAFT">
                    Draft
                  </MenuItem>

                  <MenuItem value="SCHEDULED">
                    Scheduled
                  </MenuItem>

                  <MenuItem value="SENT">
                    Sent
                  </MenuItem>

                  <MenuItem value="CANCELLED">
                    Cancelled
                  </MenuItem>
                </Select>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Schedule Date & Time"
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(event) =>
                    handleFormChange(
                      'scheduledAt',
                      event.target.value
                    )
                  }
                  InputLabelProps={{
                    shrink: true
                  }}
                />
              </Grid>
            </Grid>

            <Alert severity="info">
              In the production version, the
              selected recipient group will be
              resolved dynamically from the user
              database.
            </Alert>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2.5
          }}
        >
          <Button
            onClick={handleCloseDialog}
            color="inherit"
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSave}
            disabled={
              !form.title.trim() ||
              !form.message.trim()
            }
          >
            {editingNotification
              ? 'Save Changes'
              : 'Create Notification'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ==============================|| VIEW DIALOG ||============================== */}

      <Dialog
        open={viewDialog}
        onClose={() =>
          setViewDialog(false)
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Notification Details
        </DialogTitle>

        <DialogContent>
          {viewNotification && (
            <Stack spacing={2.5}>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Title
                </Typography>

                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600 }}
                >
                  {viewNotification.title}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Message
                </Typography>

                <Typography
                  variant="body1"
                  sx={{ mt: 0.5 }}
                >
                  {viewNotification.message}
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Type
                  </Typography>

                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={
                        viewNotification.type
                      }
                      color={getTypeColor(
                        viewNotification.type
                      )}
                      size="small"
                    />
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Status
                  </Typography>

                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={
                        viewNotification.status
                      }
                      color={getStatusColor(
                        viewNotification.status
                      )}
                      size="small"
                    />
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Recipient
                  </Typography>

                  <Typography variant="body2">
                    {getRecipientLabel(
                      viewNotification.recipient
                    )}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Recipients
                  </Typography>

                  <Typography variant="body2">
                    {viewNotification.recipientsCount.toLocaleString()}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Created By
                  </Typography>

                  <Typography variant="body2">
                    {viewNotification.createdBy}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Created
                  </Typography>

                  <Typography variant="body2">
                    {viewNotification.createdAt}
                  </Typography>
                </Grid>
              </Grid>
            </Stack>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2.5
          }}
        >
          <Button
            onClick={() =>
              setViewDialog(false)
            }
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ==============================|| DELETE DIALOG ||============================== */}

      <Dialog
        open={deleteDialog}
        onClose={handleCloseDelete}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Delete Notification
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete{' '}
            <strong>
              {notificationToDelete?.title}
            </strong>
            ?
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2.5
          }}
        >
          <Button
            onClick={handleCloseDelete}
            color="inherit"
          >
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
