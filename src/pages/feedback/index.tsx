
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
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
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

// ant design icons
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  FilterOutlined,
  MessageOutlined,
  PlusOutlined,
  SearchOutlined,
  StarFilled,
  UserOutlined
} from '@ant-design/icons';

// ==============================|| TYPES ||============================== //

type FeedbackType = 'CUSTOMER' | 'SALON' | 'PROVIDER' | 'GENERAL';
type FeedbackStatus = 'NEW' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED';
type FeedbackPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

interface Feedback {
  id: string;
  name: string;
  email: string;
  type: FeedbackType;
  subject: string;
  message: string;
  rating: number;
  priority: FeedbackPriority;
  status: FeedbackStatus;
  createdAt: string;
  response?: string;
}

// ==============================|| DUMMY DATA ||============================== //
// Replace this later with GraphQL/API data.

const initialFeedback: Feedback[] = [
  {
    id: 'FB-1001',
    name: 'Rahul Kumar',
    email: 'rahul@example.com',
    type: 'CUSTOMER',
    subject: 'Booking experience',
    message: 'The booking process was very smooth. It would be helpful to receive a reminder before the appointment.',
    rating: 5,
    priority: 'LOW',
    status: 'NEW',
    createdAt: '30 Aug 2026, 10:32 AM'
  },
  {
    id: 'FB-1002',
    name: 'Ananya Salon',
    email: 'contact@ananyasalon.com',
    type: 'SALON',
    subject: 'Salon dashboard improvement',
    message: 'We would like to see more detailed revenue reports and appointment analytics.',
    rating: 4,
    priority: 'MEDIUM',
    status: 'IN_REVIEW',
    createdAt: '29 Aug 2026, 04:18 PM'
  },
  {
    id: 'FB-1003',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    type: 'CUSTOMER',
    subject: 'Payment issue',
    message: 'My payment was successful but the booking status took some time to update.',
    rating: 3,
    priority: 'HIGH',
    status: 'IN_REVIEW',
    createdAt: '29 Aug 2026, 11:45 AM'
  },
  {
    id: 'FB-1004',
    name: 'Style Studio',
    email: 'hello@stylestudio.com',
    type: 'PROVIDER',
    subject: 'Staff management',
    message: 'The staff management functionality is useful. We would like bulk staff scheduling.',
    rating: 4,
    priority: 'LOW',
    status: 'RESOLVED',
    createdAt: '28 Aug 2026, 02:21 PM',
    response: 'Thank you for the suggestion. Bulk scheduling has been added to our product roadmap.'
  },
  {
    id: 'FB-1005',
    name: 'Vikram Rao',
    email: 'vikram@example.com',
    type: 'CUSTOMER',
    subject: 'Unable to cancel booking',
    message: 'I was unable to cancel my appointment from the application.',
    rating: 2,
    priority: 'URGENT',
    status: 'NEW',
    createdAt: '28 Aug 2026, 09:12 AM'
  },
  {
    id: 'FB-1006',
    name: 'Clavata Internal',
    email: 'admin@clavata.com',
    type: 'GENERAL',
    subject: 'Admin panel suggestion',
    message: 'Add advanced filtering and export functionality to the admin tables.',
    rating: 5,
    priority: 'MEDIUM',
    status: 'CLOSED',
    createdAt: '27 Aug 2026, 05:40 PM'
  }
];

// ==============================|| HELPERS ||============================== //

const getStatusColor = (status: FeedbackStatus) => {
  switch (status) {
    case 'NEW':
      return 'info';
    case 'IN_REVIEW':
      return 'warning';
    case 'RESOLVED':
      return 'success';
    case 'CLOSED':
      return 'default';
    default:
      return 'default';
  }
};

const getPriorityColor = (priority: FeedbackPriority) => {
  switch (priority) {
    case 'URGENT':
      return 'error';
    case 'HIGH':
      return 'warning';
    case 'MEDIUM':
      return 'info';
    case 'LOW':
      return 'success';
    default:
      return 'default';
  }
};

const getTypeColor = (type: FeedbackType) => {
  switch (type) {
    case 'CUSTOMER':
      return 'primary';
    case 'SALON':
      return 'secondary';
    case 'PROVIDER':
      return 'info';
    case 'GENERAL':
      return 'default';
    default:
      return 'default';
  }
};

// ==============================|| FEEDBACK ||============================== //

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>(initialFeedback);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [response, setResponse] = useState('');

  const [successMessage, setSuccessMessage] = useState('');

  // ==============================|| FILTER ||============================== //

  const filteredFeedback = useMemo(() => {
    return feedback.filter((item) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        item.id.toLowerCase().includes(searchValue) ||
        item.name.toLowerCase().includes(searchValue) ||
        item.email.toLowerCase().includes(searchValue) ||
        item.subject.toLowerCase().includes(searchValue) ||
        item.message.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === 'ALL' || item.status === statusFilter;

      const matchesType =
        typeFilter === 'ALL' || item.type === typeFilter;

      const matchesPriority =
        priorityFilter === 'ALL' || item.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesPriority
      );
    });
  }, [feedback, search, statusFilter, typeFilter, priorityFilter]);

  // ==============================|| STATISTICS ||============================== //

  const statistics = useMemo(() => {
    const total = feedback.length;

    const newCount = feedback.filter(
      (item) => item.status === 'NEW'
    ).length;

    const reviewCount = feedback.filter(
      (item) => item.status === 'IN_REVIEW'
    ).length;

    const resolvedCount = feedback.filter(
      (item) => item.status === 'RESOLVED'
    ).length;

    const ratings = feedback.filter((item) => item.rating > 0);

    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, item) => sum + item.rating, 0) /
          ratings.length
        : 0;

    return {
      total,
      newCount,
      reviewCount,
      resolvedCount,
      averageRating
    };
  }, [feedback]);

  // ==============================|| OPEN DETAILS ||============================== //

  const handleOpenFeedback = (item: Feedback) => {
    setSelectedFeedback(item);
    setResponse(item.response || '');
    setDialogOpen(true);
  };

  // ==============================|| CLOSE DIALOG ||============================== //

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedFeedback(null);
    setResponse('');
  };

  // ==============================|| UPDATE STATUS ||============================== //

  const handleStatusChange = (status: FeedbackStatus) => {
    if (!selectedFeedback) return;

    setFeedback((current) =>
      current.map((item) =>
        item.id === selectedFeedback.id
          ? {
              ...item,
              status
            }
          : item
      )
    );

    setSelectedFeedback({
      ...selectedFeedback,
      status
    });
  };

  // ==============================|| SAVE RESPONSE ||============================== //

  const handleSaveResponse = () => {
    if (!selectedFeedback) return;

    setFeedback((current) =>
      current.map((item) =>
        item.id === selectedFeedback.id
          ? {
              ...item,
              response,
              status: response.trim() ? 'RESOLVED' : item.status
            }
          : item
      )
    );

    setSuccessMessage('Feedback updated successfully.');

    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);

    handleCloseDialog();
  };

  // ==============================|| DELETE ||============================== //

  const handleDelete = (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this feedback?'
    );

    if (!confirmed) return;

    setFeedback((current) =>
      current.filter((item) => item.id !== id)
    );

    setSuccessMessage('Feedback deleted successfully.');

    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  // ==============================|| RESET FILTERS ||============================== //

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setTypeFilter('ALL');
    setPriorityFilter('ALL');
    setPage(0);
  };

  return (
    <Box>
      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <Box
        sx={{
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ mb: 0.5 }}>
            Feedback
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Review and manage feedback submitted by Clavata customers,
            salons and providers.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<PlusOutlined />}
          onClick={() => {
            setSuccessMessage(
              'Feedback creation will be connected to the backend later.'
            );

            setTimeout(() => {
              setSuccessMessage('');
            }, 3000);
          }}
        >
          Add Feedback
        </Button>
      </Box>

      {/* ====================================================== */}
      {/* SUCCESS MESSAGE */}
      {/* ====================================================== */}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {/* ====================================================== */}
      {/* STATISTICS */}
      {/* ====================================================== */}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'primary.lighter',
                    color: 'primary.main'
                  }}
                >
                  <MessageOutlined style={{ fontSize: 24 }} />
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Feedback
                  </Typography>

                  <Typography variant="h4">
                    {statistics.total}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'info.lighter',
                    color: 'info.main'
                  }}
                >
                  <ClockCircleOutlined style={{ fontSize: 24 }} />
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    New
                  </Typography>

                  <Typography variant="h4">
                    {statistics.newCount}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'warning.lighter',
                    color: 'warning.main'
                  }}
                >
                  <ExclamationCircleOutlined style={{ fontSize: 24 }} />
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    In Review
                  </Typography>

                  <Typography variant="h4">
                    {statistics.reviewCount}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'success.lighter',
                    color: 'success.main'
                  }}
                >
                  <StarFilled style={{ fontSize: 22 }} />
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Average Rating
                  </Typography>

                  <Typography variant="h4">
                    {statistics.averageRating.toFixed(1)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ====================================================== */}
      {/* FILTERS */}
      {/* ====================================================== */}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', md: 'center' }}
          >
            <TextField
              fullWidth
              placeholder="Search feedback..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <SearchOutlined
                    style={{
                      marginRight: 10,
                      color: '#8c8c8c'
                    }}
                  />
                )
              }}
            />

            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel>Status</InputLabel>

              <Select
                value={statusFilter}
                label="Status"
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="ALL">All Status</MenuItem>
                <MenuItem value="NEW">New</MenuItem>
                <MenuItem value="IN_REVIEW">In Review</MenuItem>
                <MenuItem value="RESOLVED">Resolved</MenuItem>
                <MenuItem value="CLOSED">Closed</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel>Type</InputLabel>

              <Select
                value={typeFilter}
                label="Type"
                onChange={(event) => {
                  setTypeFilter(event.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="ALL">All Types</MenuItem>
                <MenuItem value="CUSTOMER">Customer</MenuItem>
                <MenuItem value="SALON">Salon</MenuItem>
                <MenuItem value="PROVIDER">Provider</MenuItem>
                <MenuItem value="GENERAL">General</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel>Priority</InputLabel>

              <Select
                value={priorityFilter}
                label="Priority"
                onChange={(event) => {
                  setPriorityFilter(event.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="ALL">All Priorities</MenuItem>
                <MenuItem value="LOW">Low</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="HIGH">High</MenuItem>
                <MenuItem value="URGENT">Urgent</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<FilterOutlined />}
              onClick={resetFilters}
              sx={{ minWidth: 120 }}
            >
              Reset
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* ====================================================== */}
      {/* TABLE */}
      {/* ====================================================== */}

      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Feedback</TableCell>
                  <TableCell>Submitted By</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredFeedback
                  .slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage
                  )
                  .map((item) => (
                    <TableRow
                      key={item.id}
                      hover
                      sx={{
                        cursor: 'pointer'
                      }}
                      onClick={() => handleOpenFeedback(item)}
                    >
                      <TableCell>
                        <Box>
                          <Typography
                            variant="body1"
                            fontWeight={600}
                          >
                            {item.subject}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {item.id}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="center"
                        >
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: 'grey.100'
                            }}
                          >
                            <UserOutlined />
                          </Box>

                          <Box>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                            >
                              {item.name}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {item.email}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={item.type}
                          color={getTypeColor(item.type)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>

                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={0.3}
                          alignItems="center"
                        >
                          <StarFilled
                            style={{
                              color: '#faad14',
                              fontSize: 15
                            }}
                          />

                          <Typography variant="body2">
                            {item.rating}/5
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={item.priority}
                          color={getPriorityColor(item.priority)}
                          size="small"
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={item.status.replace('_', ' ')}
                          color={getStatusColor(item.status)}
                          size="small"
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {item.createdAt}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Stack
                          direction="row"
                          justifyContent="flex-end"
                          spacing={0.5}
                        >
                          <Tooltip title="View / Edit">
                            <IconButton
                              color="primary"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleOpenFeedback(item);
                              }}
                            >
                              <EditOutlined />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete">
                            <IconButton
                              color="error"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleDelete(item.id);
                              }}
                            >
                              <DeleteOutlined />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}

                {filteredFeedback.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <Box
                        sx={{
                          py: 8,
                          textAlign: 'center'
                        }}
                      >
                        <MessageOutlined
                          style={{
                            fontSize: 42,
                            color: '#bfbfbf'
                          }}
                        />

                        <Typography
                          variant="h6"
                          sx={{ mt: 2 }}
                        >
                          No feedback found
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          Try changing your filters or search term.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Divider />

          <TablePagination
            component="div"
            count={filteredFeedback.length}
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

      {/* ====================================================== */}
      {/* FEEDBACK DETAILS DIALOG */}
      {/* ====================================================== */}

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="h5">
                Feedback Details
              </Typography>

              {selectedFeedback && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {selectedFeedback.id}
                </Typography>
              )}
            </Box>

            {selectedFeedback && (
              <Chip
                label={selectedFeedback.status.replace('_', ' ')}
                color={getStatusColor(selectedFeedback.status)}
              />
            )}
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          {selectedFeedback && (
            <Stack spacing={3}>
              {/* USER */}

              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Submitted By
                </Typography>

                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      bgcolor: 'primary.lighter',
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <UserOutlined
                      style={{ fontSize: 22 }}
                    />
                  </Box>

                  <Box>
                    <Typography
                      variant="body1"
                      fontWeight={600}
                    >
                      {selectedFeedback.name}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {selectedFeedback.email}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Divider />

              {/* SUBJECT */}

              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                >
                  Subject
                </Typography>

                <Typography
                  variant="h6"
                  sx={{ mt: 0.5 }}
                >
                  {selectedFeedback.subject}
                </Typography>
              </Box>

              {/* METADATA */}

              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Type
                  </Typography>

                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={selectedFeedback.type}
                      color={getTypeColor(
                        selectedFeedback.type
                      )}
                      size="small"
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Priority
                  </Typography>

                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={selectedFeedback.priority}
                      color={getPriorityColor(
                        selectedFeedback.priority
                      )}
                      size="small"
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Rating
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={0.5}
                    alignItems="center"
                    sx={{ mt: 0.5 }}
                  >
                    <StarFilled
                      style={{
                        color: '#faad14'
                      }}
                    />

                    <Typography fontWeight={600}>
                      {selectedFeedback.rating}/5
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>

              <Divider />

              {/* MESSAGE */}

              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Feedback
                </Typography>

                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'grey.50',
                    borderRadius: 2
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {selectedFeedback.message}
                  </Typography>
                </Box>
              </Box>

              {/* STATUS */}

              <FormControl fullWidth>
                <InputLabel>Feedback Status</InputLabel>

                <Select
                  value={selectedFeedback.status}
                  label="Feedback Status"
                  onChange={(event) =>
                    handleStatusChange(
                      event.target.value as FeedbackStatus
                    )
                  }
                >
                  <MenuItem value="NEW">
                    New
                  </MenuItem>

                  <MenuItem value="IN_REVIEW">
                    In Review
                  </MenuItem>

                  <MenuItem value="RESOLVED">
                    Resolved
                  </MenuItem>

                  <MenuItem value="CLOSED">
                    Closed
                  </MenuItem>
                </Select>
              </FormControl>

              {/* RESPONSE */}

              <TextField
                fullWidth
                multiline
                minRows={4}
                label="Admin Response"
                placeholder="Enter a response to this feedback..."
                value={response}
                onChange={(event) =>
                  setResponse(event.target.value)
                }
                helperText="Adding a response will mark the feedback as resolved when saved."
              />
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>
            Cancel
          </Button>

          <Button
            variant="contained"
            startIcon={<CheckCircleOutlined />}
            onClick={handleSaveResponse}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

