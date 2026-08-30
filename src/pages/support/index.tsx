
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
  ClockCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  MessageOutlined,
  PlusOutlined,
  SearchOutlined,
  UserOutlined
} from '@ant-design/icons';

// ==============================|| TYPES ||============================== //

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
type TicketCategory = 'BOOKING' | 'PAYMENT' | 'SALON' | 'ACCOUNT' | 'TECHNICAL' | 'OTHER';
type UserType = 'CUSTOMER' | 'SALON_OWNER';

interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  userName: string;
  userPhone: string;
  userType: UserType;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
}

// ==============================|| STATIC DATA ||============================== //

const initialTickets: SupportTicket[] = [
  {
    id: '1',
    ticketNumber: 'SUP-1001',
    subject: 'Booking cancellation issue',
    description: 'Customer is unable to cancel a confirmed booking from the application.',
    userName: 'Ananya Sharma',
    userPhone: '+91 98765 43210',
    userType: 'CUSTOMER',
    category: 'BOOKING',
    priority: 'HIGH',
    status: 'OPEN',
    assignedTo: 'Unassigned',
    createdAt: '30 Aug 2026, 09:20 AM',
    updatedAt: '30 Aug 2026, 09:20 AM'
  },
  {
    id: '2',
    ticketNumber: 'SUP-1002',
    subject: 'Payment deducted but booking not confirmed',
    description: 'Payment was successful but the booking is still showing as pending.',
    userName: 'Rahul Kumar',
    userPhone: '+91 99887 66554',
    userType: 'CUSTOMER',
    category: 'PAYMENT',
    priority: 'URGENT',
    status: 'IN_PROGRESS',
    assignedTo: 'Support Team',
    createdAt: '30 Aug 2026, 08:45 AM',
    updatedAt: '30 Aug 2026, 10:05 AM'
  },
  {
    id: '3',
    ticketNumber: 'SUP-1003',
    subject: 'Salon profile verification query',
    description: 'Salon owner is asking about the status of their salon verification.',
    userName: 'Priya Beauty Studio',
    userPhone: '+91 91234 56789',
    userType: 'SALON_OWNER',
    category: 'SALON',
    priority: 'MEDIUM',
    status: 'OPEN',
    assignedTo: 'Verification Team',
    createdAt: '29 Aug 2026, 04:10 PM',
    updatedAt: '29 Aug 2026, 04:10 PM'
  },
  {
    id: '4',
    ticketNumber: 'SUP-1004',
    subject: 'Unable to update profile',
    description: 'User reports that profile changes are not being saved.',
    userName: 'Sneha Reddy',
    userPhone: '+91 93456 78901',
    userType: 'CUSTOMER',
    category: 'ACCOUNT',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    assignedTo: 'Support Team',
    createdAt: '28 Aug 2026, 11:30 AM',
    updatedAt: '29 Aug 2026, 02:15 PM'
  },
  {
    id: '5',
    ticketNumber: 'SUP-1005',
    subject: 'Application showing blank screen',
    description: 'Customer reports a blank screen after opening the booking section.',
    userName: 'Vikram Singh',
    userPhone: '+91 90123 45678',
    userType: 'CUSTOMER',
    category: 'TECHNICAL',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    assignedTo: 'Technical Team',
    createdAt: '27 Aug 2026, 03:45 PM',
    updatedAt: '28 Aug 2026, 09:30 AM'
  },
  {
    id: '6',
    ticketNumber: 'SUP-1006',
    subject: 'Refund not received',
    description: 'Customer has not received the refund for a cancelled booking.',
    userName: 'Megha Rao',
    userPhone: '+91 97654 32109',
    userType: 'CUSTOMER',
    category: 'PAYMENT',
    priority: 'HIGH',
    status: 'CLOSED',
    assignedTo: 'Finance Team',
    createdAt: '25 Aug 2026, 01:20 PM',
    updatedAt: '27 Aug 2026, 05:00 PM'
  },
  {
    id: '7',
    ticketNumber: 'SUP-1007',
    subject: 'Salon timings need to be corrected',
    description: 'Salon owner requested an update to business hours.',
    userName: 'Glow Salon',
    userPhone: '+91 98761 23456',
    userType: 'SALON_OWNER',
    category: 'SALON',
    priority: 'LOW',
    status: 'OPEN',
    assignedTo: 'Support Team',
    createdAt: '24 Aug 2026, 10:15 AM',
    updatedAt: '24 Aug 2026, 10:15 AM'
  },
  {
    id: '8',
    ticketNumber: 'SUP-1008',
    subject: 'Cannot login to account',
    description: 'User is not receiving the OTP while attempting to login.',
    userName: 'Arjun Nair',
    userPhone: '+91 98876 54321',
    userType: 'CUSTOMER',
    category: 'ACCOUNT',
    priority: 'URGENT',
    status: 'RESOLVED',
    assignedTo: 'Technical Team',
    createdAt: '23 Aug 2026, 09:10 AM',
    updatedAt: '23 Aug 2026, 11:40 AM'
  }
];

// ==============================|| HELPERS ||============================== //

const getStatusColor = (status: TicketStatus) => {
  switch (status) {
    case 'OPEN':
      return 'info';
    case 'IN_PROGRESS':
      return 'warning';
    case 'RESOLVED':
      return 'success';
    case 'CLOSED':
      return 'default';
    default:
      return 'default';
  }
};

const getPriorityColor = (priority: TicketPriority) => {
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

const getCategoryLabel = (category: TicketCategory) => {
  switch (category) {
    case 'BOOKING':
      return 'Booking';
    case 'PAYMENT':
      return 'Payment';
    case 'SALON':
      return 'Salon';
    case 'ACCOUNT':
      return 'Account';
    case 'TECHNICAL':
      return 'Technical';
    case 'OTHER':
      return 'Other';
    default:
      return category;
  }
};

// ==============================|| STAT CARD ||============================== //

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
}

function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
        '&:hover': {
          boxShadow: 2
        }
      }}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="body2" color="text.secondary" mb={1}>
              {title}
            </Typography>

            <Typography variant="h4" fontWeight={700}>
              {value}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              {description}
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
              color: 'primary.main',
              fontSize: 22
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ==============================|| SUPPORT PAGE ||============================== //

export default function Support() {
  const [tickets, setTickets] = useState<SupportTicket[]>(initialTickets);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TicketStatus>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | TicketPriority>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | TicketCategory>('ALL');

  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // New ticket fields
  const [newSubject, setNewSubject] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<TicketCategory>('OTHER');
  const [newPriority, setNewPriority] = useState<TicketPriority>('MEDIUM');
  const [newUserName, setNewUserName] = useState('');

  // ==============================|| STATS ||============================== //

  const stats = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter((ticket) => ticket.status === 'OPEN').length,
      inProgress: tickets.filter((ticket) => ticket.status === 'IN_PROGRESS').length,
      resolved: tickets.filter((ticket) => ticket.status === 'RESOLVED').length,
      urgent: tickets.filter((ticket) => ticket.priority === 'URGENT').length
    };
  }, [tickets]);

  // ==============================|| FILTER ||============================== //

  const filteredTickets = useMemo(() => {
    const query = search.toLowerCase().trim();

    return tickets.filter((ticket) => {
      const matchesSearch =
        !query ||
        ticket.ticketNumber.toLowerCase().includes(query) ||
        ticket.subject.toLowerCase().includes(query) ||
        ticket.userName.toLowerCase().includes(query) ||
        ticket.userPhone.toLowerCase().includes(query);

      const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;

      const matchesPriority = priorityFilter === 'ALL' || ticket.priority === priorityFilter;

      const matchesCategory = categoryFilter === 'ALL' || ticket.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  }, [tickets, search, statusFilter, priorityFilter, categoryFilter]);

  // ==============================|| STATUS UPDATE ||============================== //

  const handleStatusChange = (ticketId: string, event: SelectChangeEvent) => {
    const newStatus = event.target.value as TicketStatus;

    setTickets((currentTickets) =>
      currentTickets.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              status: newStatus,
              updatedAt: '30 Aug 2026, 11:30 AM'
            }
          : ticket
      )
    );

    if (selectedTicket?.id === ticketId) {
      setSelectedTicket((current) =>
        current
          ? {
              ...current,
              status: newStatus,
              updatedAt: '30 Aug 2026, 11:30 AM'
            }
          : null
      );
    }
  };

  // ==============================|| CREATE TICKET ||============================== //

  const handleCreateTicket = () => {
    if (!newSubject.trim() || !newDescription.trim() || !newUserName.trim()) {
      return;
    }

    const newTicket: SupportTicket = {
      id: String(Date.now()),
      ticketNumber: `SUP-${1000 + tickets.length + 1}`,
      subject: newSubject,
      description: newDescription,
      userName: newUserName,
      userPhone: 'Not available',
      userType: 'CUSTOMER',
      category: newCategory,
      priority: newPriority,
      status: 'OPEN',
      assignedTo: 'Unassigned',
      createdAt: '30 Aug 2026, 11:30 AM',
      updatedAt: '30 Aug 2026, 11:30 AM'
    };

    setTickets((currentTickets) => [newTicket, ...currentTickets]);

    setNewSubject('');
    setNewDescription('');
    setNewUserName('');
    setNewCategory('OTHER');
    setNewPriority('MEDIUM');

    setCreateDialogOpen(false);
  };

  // ==============================|| PAGINATION ||============================== //

  const paginatedTickets = filteredTickets.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // ==============================|| RENDER ||============================== //

  return (
    <Box>
      {/* HEADER */}

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Support
          </Typography>

          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Manage customer and salon support requests
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<PlusOutlined />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Ticket
        </Button>
      </Stack>

      {/* STATISTICS */}

      <Grid container spacing={2.5} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Tickets"
            value={stats.total}
            icon={<MessageOutlined />}
            description="All support requests"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Open"
            value={stats.open}
            icon={<ClockCircleOutlined />}
            description="Awaiting response"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="In Progress"
            value={stats.inProgress}
            icon={<MessageOutlined />}
            description="Currently being handled"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Urgent"
            value={stats.urgent}
            icon={<CloseCircleOutlined />}
            description="Requires immediate attention"
          />
        </Grid>
      </Grid>

      {/* TABLE CARD */}

      <Card
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none'
        }}
      >
        <CardContent sx={{ p: 0 }}>
          {/* FILTER HEADER */}

          <Box p={2.5}>
            <Stack
              direction={{ xs: 'column', lg: 'row' }}
              spacing={2}
              alignItems={{ xs: 'stretch', lg: 'center' }}
              justifyContent="space-between"
            >
              <TextField
                placeholder="Search ticket, user or phone..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(0);
                }}
                size="small"
                sx={{ minWidth: { lg: 300 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined />
                    </InputAdornment>
                  )
                }}
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Select
                  size="small"
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value as 'ALL' | TicketStatus);
                    setPage(0);
                  }}
                  sx={{ minWidth: 150 }}
                >
                  <MenuItem value="ALL">All Status</MenuItem>
                  <MenuItem value="OPEN">Open</MenuItem>
                  <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                  <MenuItem value="RESOLVED">Resolved</MenuItem>
                  <MenuItem value="CLOSED">Closed</MenuItem>
                </Select>

                <Select
                  size="small"
                  value={priorityFilter}
                  onChange={(event) => {
                    setPriorityFilter(event.target.value as 'ALL' | TicketPriority);
                    setPage(0);
                  }}
                  sx={{ minWidth: 150 }}
                >
                  <MenuItem value="ALL">All Priority</MenuItem>
                  <MenuItem value="URGENT">Urgent</MenuItem>
                  <MenuItem value="HIGH">High</MenuItem>
                  <MenuItem value="MEDIUM">Medium</MenuItem>
                  <MenuItem value="LOW">Low</MenuItem>
                </Select>

                <Select
                  size="small"
                  value={categoryFilter}
                  onChange={(event) => {
                    setCategoryFilter(event.target.value as 'ALL' | TicketCategory);
                    setPage(0);
                  }}
                  sx={{ minWidth: 150 }}
                >
                  <MenuItem value="ALL">All Categories</MenuItem>
                  <MenuItem value="BOOKING">Booking</MenuItem>
                  <MenuItem value="PAYMENT">Payment</MenuItem>
                  <MenuItem value="SALON">Salon</MenuItem>
                  <MenuItem value="ACCOUNT">Account</MenuItem>
                  <MenuItem value="TECHNICAL">Technical</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </Select>
              </Stack>
            </Stack>
          </Box>

          <Divider />

          {/* TABLE */}

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ticket</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedTickets.length > 0 ? (
                  paginatedTickets.map((ticket) => (
                    <TableRow
                      key={ticket.id}
                      hover
                      sx={{
                        '&:last-child td, &:last-child th': {
                          border: 0
                        }
                      }}
                    >
                      <TableCell>
                        <Typography fontWeight={600} variant="body2">
                          {ticket.ticketNumber}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ maxWidth: 240 }}>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          noWrap
                          title={ticket.subject}
                        >
                          {ticket.subject}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              bgcolor: 'primary.lighter',
                              color: 'primary.main',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <UserOutlined />
                          </Box>

                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {ticket.userName}
                            </Typography>

                            <Typography variant="caption" color="text.secondary">
                              {ticket.userType === 'SALON_OWNER'
                                ? 'Salon Owner'
                                : 'Customer'}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {getCategoryLabel(ticket.category)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={ticket.priority}
                          color={getPriorityColor(ticket.priority)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>

                      <TableCell>
                        <Select
                          size="small"
                          value={ticket.status}
                          onChange={(event) => handleStatusChange(ticket.id, event)}
                          sx={{
                            minWidth: 125,
                            '& .MuiSelect-select': {
                              py: 0.75
                            }
                          }}
                        >
                          <MenuItem value="OPEN">Open</MenuItem>
                          <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                          <MenuItem value="RESOLVED">Resolved</MenuItem>
                          <MenuItem value="CLOSED">Closed</MenuItem>
                        </Select>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {ticket.assignedTo}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {ticket.createdAt}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Tooltip title="View Ticket">
                          <IconButton
                            color="primary"
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            <EyeOutlined />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <Box py={8} textAlign="center">
                        <MessageOutlined
                          style={{
                            fontSize: 40,
                            opacity: 0.35
                          }}
                        />

                        <Typography variant="h6" mt={2}>
                          No support tickets found
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          Try changing your filters or search query.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredTickets.length}
            page={page}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
          />
        </CardContent>
      </Card>

      {/* ==============================|| VIEW TICKET DIALOG ||============================== */}

      <Dialog
        open={Boolean(selectedTicket)}
        onClose={() => setSelectedTicket(null)}
        fullWidth
        maxWidth="md"
      >
        {selectedTicket && (
          <>
            <DialogTitle>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                spacing={2}
              >
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    {selectedTicket.subject}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" mt={0.5}>
                    {selectedTicket.ticketNumber}
                  </Typography>
                </Box>

                <Chip
                  label={selectedTicket.status.replace('_', ' ')}
                  color={getStatusColor(selectedTicket.status)}
                />
              </Stack>
            </DialogTitle>

            <DialogContent dividers>
              <Grid container spacing={3}>
                {/* USER */}

                <Grid item xs={12} md={6}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      height: '100%'
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={600} mb={2}>
                      User Information
                    </Typography>

                    <Stack spacing={1.5}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Name
                        </Typography>

                        <Typography variant="body2">
                          {selectedTicket.userName}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Phone
                        </Typography>

                        <Typography variant="body2">
                          {selectedTicket.userPhone}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          User Type
                        </Typography>

                        <Box mt={0.5}>
                          <Chip
                            size="small"
                            label={
                              selectedTicket.userType === 'SALON_OWNER'
                                ? 'Salon Owner'
                                : 'Customer'
                            }
                          />
                        </Box>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>

                {/* TICKET INFO */}

                <Grid item xs={12} md={6}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      height: '100%'
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={600} mb={2}>
                      Ticket Information
                    </Typography>

                    <Stack spacing={1.5}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Category
                        </Typography>

                        <Typography variant="body2">
                          {getCategoryLabel(selectedTicket.category)}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Priority
                        </Typography>

                        <Box mt={0.5}>
                          <Chip
                            size="small"
                            label={selectedTicket.priority}
                            color={getPriorityColor(selectedTicket.priority)}
                          />
                        </Box>
                      </Box>

                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Assigned To
                        </Typography>

                        <Typography variant="body2">
                          {selectedTicket.assignedTo}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>

                {/* DESCRIPTION */}

                <Grid item xs={12}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={600} mb={1}>
                      Issue Description
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {selectedTicket.description}
                    </Typography>
                  </Paper>
                </Grid>

                {/* STATUS */}

                <Grid item xs={12}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={600} mb={2}>
                      Update Ticket
                    </Typography>

                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={2}
                    >
                      <Select
                        fullWidth
                        size="small"
                        value={selectedTicket.status}
                        onChange={(event) =>
                          handleStatusChange(selectedTicket.id, event)
                        }
                      >
                        <MenuItem value="OPEN">Open</MenuItem>
                        <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                        <MenuItem value="RESOLVED">Resolved</MenuItem>
                        <MenuItem value="CLOSED">Closed</MenuItem>
                      </Select>

                      <Button
                        variant="outlined"
                        startIcon={<MessageOutlined />}
                      >
                        Add Reply
                      </Button>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setSelectedTicket(null)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ==============================|| CREATE TICKET DIALOG ||============================== */}

      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Create Support Ticket</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5} mt={0.5}>
            <TextField
              fullWidth
              label="User Name"
              placeholder="Enter customer or salon owner name"
              value={newUserName}
              onChange={(event) => setNewUserName(event.target.value)}
            />

            <TextField
              fullWidth
              label="Subject"
              placeholder="Enter support issue"
              value={newSubject}
              onChange={(event) => setNewSubject(event.target.value)}
            />

            <TextField
              fullWidth
              multiline
              minRows={4}
              label="Description"
              placeholder="Describe the issue..."
              value={newDescription}
              onChange={(event) => setNewDescription(event.target.value)}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Select
                  fullWidth
                  value={newCategory}
                  onChange={(event) =>
                    setNewCategory(event.target.value as TicketCategory)
                  }
                >
                  <MenuItem value="BOOKING">Booking</MenuItem>
                  <MenuItem value="PAYMENT">Payment</MenuItem>
                  <MenuItem value="SALON">Salon</MenuItem>
                  <MenuItem value="ACCOUNT">Account</MenuItem>
                  <MenuItem value="TECHNICAL">Technical</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </Select>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Select
                  fullWidth
                  value={newPriority}
                  onChange={(event) =>
                    setNewPriority(event.target.value as TicketPriority)
                  }
                >
                  <MenuItem value="LOW">Low</MenuItem>
                  <MenuItem value="MEDIUM">Medium</MenuItem>
                  <MenuItem value="HIGH">High</MenuItem>
                  <MenuItem value="URGENT">Urgent</MenuItem>
                </Select>
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleCreateTicket}
            disabled={
              !newUserName.trim() ||
              !newSubject.trim() ||
              !newDescription.trim()
            }
          >
            Create Ticket
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

