import { useMemo, useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';

// material-ui
import {
  Alert,
  Box,
  Button,
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
  BellOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
  SendOutlined
} from '@ant-design/icons';

// ==============================|| GRAPHQL ||============================== //

const GET_NOTIFICATIONS = gql`
  query GetNotifications {
    notifications {
      success
      message
      totalCount
      notifications {
        notificationId
        title
        message
        type
        recipient
        status
        scheduledAt
        sentAt
        createdAt
        updatedAt
        createdBy
        createdByName
        recipientsCount
      }
    }
  }
`;

const CREATE_NOTIFICATION = gql`
  mutation CreateNotification(
    $input: CreateNotificationInput!
  ) {
    createNotification(input: $input) {
      success
      message
      notification {
        notificationId
        title
        message
        type
        recipient
        status
        scheduledAt
        sentAt
        createdAt
        updatedAt
        createdBy
        createdByName
        recipientsCount
      }
    }
  }
`;

const UPDATE_NOTIFICATION = gql`
  mutation UpdateNotification(
    $input: UpdateNotificationInput!
  ) {
    updateNotification(input: $input) {
      success
      message
      notification {
        notificationId
        title
        message
        type
        recipient
        status
        scheduledAt
        sentAt
        createdAt
        updatedAt
        createdBy
        createdByName
        recipientsCount
      }
    }
  }
`;

const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification(
    $notificationId: ID!
  ) {
    deleteNotification(
      notificationId: $notificationId
    ) {
      success
      message
    }
  }
`;

const SEND_NOTIFICATION = gql`
  mutation SendNotification(
    $notificationId: ID!
  ) {
    sendNotification(
      notificationId: $notificationId
    ) {
      success
      message
      notification {
        notificationId
        title
        message
        type
        recipient
        status
        scheduledAt
        sentAt
        createdAt
        updatedAt
        createdBy
        createdByName
        recipientsCount
      }
    }
  }
`;

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
  notificationId: string;
  title: string;
  message: string;
  type: NotificationType;
  recipient: RecipientType;
  status: NotificationStatus;
  scheduledAt?: string | null;
  sentAt?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  createdByName?: string | null;
  recipientsCount: number;
}

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

// ==============================|| HELPERS ||============================== //

const formatDate = (
  value?: string | null
): string => {
  if (!value) {
    return '-';
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

const formatDateOnly = (
  value?: string | null
): string => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

// ==============================|| MAIN COMPONENT ||============================== //

export default function Notifications() {
  // ==============================|| QUERY ||============================== //

  const {
    data,
    loading,
    error,
    refetch
  } = useQuery(GET_NOTIFICATIONS, {
    fetchPolicy: 'network-only'
  });

  // ==============================|| MUTATIONS ||============================== //

  const [
    createNotification,
    {
      loading: creating
    }
  ] = useMutation(CREATE_NOTIFICATION);

  const [
    updateNotification,
    {
      loading: updating
    }
  ] = useMutation(UPDATE_NOTIFICATION);

  const [
    deleteNotification,
    {
      loading: deleting
    }
  ] = useMutation(DELETE_NOTIFICATION);

  const [
    sendNotification,
    {
      loading: sending
    }
  ] = useMutation(SEND_NOTIFICATION);

  // ==============================|| STATE ||============================== //

  const notifications: Notification[] =
    data?.notifications?.notifications || [];

  const [search, setSearch] = useState('');

  const [
    typeFilter,
    setTypeFilter
  ] = useState<'ALL' | NotificationType>('ALL');

  const [
    statusFilter,
    setStatusFilter
  ] = useState<'ALL' | NotificationStatus>('ALL');

  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] =
    useState(10);

  const [openDialog, setOpenDialog] =
    useState(false);

  const [
    editingNotification,
    setEditingNotification
  ] = useState<Notification | null>(null);

  const [form, setForm] =
    useState<NotificationForm>(EMPTY_FORM);

  const [deleteDialog, setDeleteDialog] =
    useState(false);

  const [
    notificationToDelete,
    setNotificationToDelete
  ] = useState<Notification | null>(null);

  const [viewDialog, setViewDialog] =
    useState(false);

  const [
    viewNotification,
    setViewNotification
  ] = useState<Notification | null>(null);

  const [actionError, setActionError] =
    useState<string | null>(null);

  const [actionSuccess, setActionSuccess] =
    useState<string | null>(null);

  // ==============================|| FILTERING ||============================== //

  const filteredNotifications = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return notifications.filter(
      (notification) => {
        const matchesSearch =
          !searchValue ||
          notification.title
            .toLowerCase()
            .includes(searchValue) ||
          notification.message
            .toLowerCase()
            .includes(searchValue) ||
          notification.notificationId
            .toLowerCase()
            .includes(searchValue);

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
      }
    );
  }, [
    notifications,
    search,
    typeFilter,
    statusFilter
  ]);

  // ==============================|| COUNTERS ||============================== //

  const totalNotifications =
    notifications.length;

  const sentNotifications =
    notifications.filter(
      (item) => item.status === 'SENT'
    ).length;

  const scheduledNotifications =
    notifications.filter(
      (item) => item.status === 'SCHEDULED'
    ).length;

  const draftNotifications =
    notifications.filter(
      (item) => item.status === 'DRAFT'
    ).length;

  // ==============================|| DIALOG HANDLERS ||============================== //

  const handleOpenCreate = () => {
    setActionError(null);
    setActionSuccess(null);

    setEditingNotification(null);
    setForm(EMPTY_FORM);
    setOpenDialog(true);
  };

  const handleOpenEdit = (
    notification: Notification
  ) => {
    setActionError(null);
    setActionSuccess(null);

    setEditingNotification(notification);

    setForm({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      recipient: notification.recipient,
      status: notification.status,
      scheduledAt: notification.scheduledAt
        ? toDateTimeLocal(
            notification.scheduledAt
          )
        : ''
    });

    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    if (creating || updating) {
      return;
    }

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
      recipient:
        event.target.value as RecipientType
    }));
  };

  const handleStatusChange = (
    event: SelectChangeEvent
  ) => {
    setForm((previous) => ({
      ...previous,
      status:
        event.target.value as NotificationStatus
    }));
  };

  // ==============================|| CREATE / UPDATE ||============================== //

  const handleSave = async () => {
    if (
      !form.title.trim() ||
      !form.message.trim()
    ) {
      return;
    }

    setActionError(null);
    setActionSuccess(null);

    try {
      if (editingNotification) {
        const result =
          await updateNotification({
            variables: {
              input: {
                notificationId:
                  editingNotification.notificationId,
                title: form.title.trim(),
                message: form.message.trim(),
                type: form.type,
                recipient: form.recipient,
                status: form.status,
                scheduledAt:
                  form.scheduledAt || null
              }
            }
          });

        const response =
          result.data?.updateNotification;

        if (!response?.success) {
          throw new Error(
            response?.message ||
              'Failed to update notification.'
          );
        }

        setActionSuccess(
          'Notification updated successfully.'
        );
      } else {
        const result =
          await createNotification({
            variables: {
              input: {
                title: form.title.trim(),
                message: form.message.trim(),
                type: form.type,
                recipient: form.recipient,
                status: form.status,
                scheduledAt:
                  form.scheduledAt || null
              }
            }
          });

        const response =
          result.data?.createNotification;

        if (!response?.success) {
          throw new Error(
            response?.message ||
              'Failed to create notification.'
          );
        }

        setActionSuccess(
          'Notification created successfully.'
        );
      }

      await refetch();

      handleCloseDialog();
    } catch (err: any) {
      console.error(
        'Notification save error:',
        err
      );

      setActionError(
        err?.message ||
          'Unable to save notification.'
      );
    }
  };

  // ==============================|| SEND ||============================== //

  const handleSendNow = async (
    notification: Notification
  ) => {
    setActionError(null);
    setActionSuccess(null);

    try {
      const result =
        await sendNotification({
          variables: {
            notificationId:
              notification.notificationId
          }
        });

      const response =
        result.data?.sendNotification;

      if (!response?.success) {
        throw new Error(
          response?.message ||
            'Failed to send notification.'
        );
      }

      setActionSuccess(
        response.message ||
          'Notification sent successfully.'
      );

      await refetch();
    } catch (err: any) {
      console.error(
        'Send notification error:',
        err
      );

      setActionError(
        err?.message ||
          'Unable to send notification.'
      );
    }
  };

  // ==============================|| DELETE ||============================== //

  const handleOpenDelete = (
    notification: Notification
  ) => {
    setActionError(null);
    setActionSuccess(null);

    setNotificationToDelete(notification);
    setDeleteDialog(true);
  };

  const handleCloseDelete = () => {
    if (deleting) {
      return;
    }

    setDeleteDialog(false);
    setNotificationToDelete(null);
  };

  const handleDelete = async () => {
    if (!notificationToDelete) {
      return;
    }

    setActionError(null);
    setActionSuccess(null);

    try {
      const result =
        await deleteNotification({
          variables: {
            notificationId:
              notificationToDelete.notificationId
          }
        });

      const response =
        result.data?.deleteNotification;

      if (!response?.success) {
        throw new Error(
          response?.message ||
            'Failed to delete notification.'
        );
      }

      setActionSuccess(
        'Notification deleted successfully.'
      );

      await refetch();

      handleCloseDelete();
    } catch (err: any) {
      console.error(
        'Delete notification error:',
        err
      );

      setActionError(
        err?.message ||
          'Unable to delete notification.'
      );
    }
  };

  // ==============================|| VIEW ||============================== //

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

  // ==============================|| LOADING ||============================== //

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Stack
          spacing={2}
          alignItems="center"
        >
          <CircularProgress />
          <Typography color="text.secondary">
            Loading notifications...
          </Typography>
        </Stack>
      </Box>
    );
  }

  // ==============================|| ERROR ||============================== //

  if (error) {
    return (
      <Box>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => refetch()}
            >
              Retry
            </Button>
          }
        >
          Failed to load notifications:{' '}
          {error.message}
        </Alert>
      </Box>
    );
  }

  // ==============================|| PAGINATION ||============================== //

  const paginatedNotifications =
    filteredNotifications.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );

  // ==============================|| RENDER ||============================== //

  return (
    <Box>
      {/* ============================== HEADER ============================== */}

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

      {/* ============================== ALERTS ============================== */}

      {actionError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() =>
            setActionError(null)
          }
        >
          {actionError}
        </Alert>
      )}

      {actionSuccess && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() =>
            setActionSuccess(null)
          }
        >
          {actionSuccess}
        </Alert>
      )}

      {/* ============================== SUMMARY ============================== */}

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

      {/* ============================== TABLE ============================== */}

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
                setSearch(
                  event.target.value
                );
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
                <TableCell sx={{ fontWeight: 700 }}>
                  Notification
                </TableCell>

                <TableCell sx={{ fontWeight: 700 }}>
                  Type
                </TableCell>

                <TableCell sx={{ fontWeight: 700 }}>
                  Recipient
                </TableCell>

                <TableCell sx={{ fontWeight: 700 }}>
                  Status
                </TableCell>

                <TableCell sx={{ fontWeight: 700 }}>
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
              {paginatedNotifications.map(
                (notification) => (
                  <TableRow
                    hover
                    key={
                      notification.notificationId
                    }
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
                            {
                              notification.title
                            }
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {
                              notification.notificationId
                            }
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
                        {formatDate(
                          notification.sentAt ||
                            notification.scheduledAt ||
                            notification.createdAt
                        )}
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
                              disabled={
                                updating
                              }
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
                          'SENT' &&
                          notification.status !==
                            'CANCELLED' && (
                            <Tooltip title="Send Now">
                              <IconButton
                                size="small"
                                color="primary"
                                disabled={
                                  sending
                                }
                                onClick={() =>
                                  handleSendNow(
                                    notification
                                  )
                                }
                              >
                                {sending ? (
                                  <CircularProgress
                                    size={18}
                                  />
                                ) : (
                                  <SendOutlined />
                                )}
                              </IconButton>
                            </Tooltip>
                          )}

                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            disabled={
                              deleting
                            }
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
                )
              )}

              {paginatedNotifications.length ===
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

      {/* ============================== CREATE / EDIT ============================== */}

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
              Recipient count is resolved
              dynamically by the backend when
              the notification is sent.
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
            disabled={
              creating || updating
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSave}
            disabled={
              creating ||
              updating ||
              !form.title.trim() ||
              !form.message.trim()
            }
          >
            {creating || updating ? (
              <CircularProgress
                size={20}
                color="inherit"
              />
            ) : editingNotification ? (
              'Save Changes'
            ) : (
              'Create Notification'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ============================== VIEW ============================== */}

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
                    {viewNotification.createdByName ||
                      viewNotification.createdBy ||
                      'Admin'}
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
                    {formatDate(
                      viewNotification.createdAt
                    )}
                  </Typography>
                </Grid>

                {viewNotification.scheduledAt && (
                  <Grid item xs={6}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Scheduled At
                    </Typography>

                    <Typography variant="body2">
                      {formatDate(
                        viewNotification.scheduledAt
                      )}
                    </Typography>
                  </Grid>
                )}

                {viewNotification.sentAt && (
                  <Grid item xs={6}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Sent At
                    </Typography>

                    <Typography variant="body2">
                      {formatDate(
                        viewNotification.sentAt
                      )}
                    </Typography>
                  </Grid>
                )}
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

      {/* ============================== DELETE ============================== */}

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
            disabled={deleting}
          >
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <CircularProgress
                size={20}
                color="inherit"
              />
            ) : (
              'Delete'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ==============================|| DATE INPUT HELPER ||============================== //

function toDateTimeLocal(
  value: string
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const pad = (number: number) =>
    String(number).padStart(2, '0');

  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1
  )}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}