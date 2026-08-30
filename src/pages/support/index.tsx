import { useMemo, useState } from 'react';

// material-ui
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography
} from '@mui/material';

// ant design icons
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CustomerServiceOutlined,
  DeleteOutlined,
  EyeOutlined,
  FilterOutlined,
  MailOutlined,
  MessageOutlined,
  PhoneOutlined,
  PlusOutlined,
  SearchOutlined,
  SendOutlined,
  ShopOutlined,
  UserOutlined,
  WarningOutlined
} from '@ant-design/icons';

// ==============================|| TYPES ||============================== //

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

type TicketType =
  | 'CUSTOMER'
  | 'SALON'
  | 'BOOKING'
  | 'PAYMENT'
  | 'TECHNICAL'
  | 'OTHER';

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  requester: string;
  requesterType: 'Customer' | 'Salon';
  email: string;
  phone: string;
  category: TicketType;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
}

// ==============================|| STATIC DATA ||============================== //

const initialTickets: SupportTicket[] = [
  {
    id: 'SUP-1001',
    subject: 'Unable to complete booking',
    description:
      'Customer is unable to complete the booking process after selecting a service.',
    requester: 'Rahul Sharma',
    requesterType: 'Customer',
    email: 'rahul@example.com',
    phone: '+91 98765 43210',
    category: 'BOOKING',
    priority: 'HIGH',
    status: 'OPEN',
    assignedTo: 'Unassigned',
    createdAt: '30 Aug 2026, 09:15 AM',
    updatedAt: '30 Aug 2026, 09:15 AM'
  },
  {
    id: 'SUP-1002',
    subject: 'Payment deducted but booking not confirmed',
    description:
      'Salon reported that the customer payment was successful but the booking remains pending.',
    requester: 'Glow Studio',
    requesterType: 'Salon',
    email: 'owner@glowstudio.com',
    phone: '+91 99887 66554',
    category: 'PAYMENT',
    priority: 'URGENT',
    status: 'IN_PROGRESS',
    assignedTo: 'Admin Team',
    createdAt: '30 Aug 2026, 08:42 AM',
    updatedAt: '30 Aug 2026, 10:02 AM'
  },
  {
    id: 'SUP-1003',
    subject: 'Unable to update salon profile',
    description:
      'Salon owner cannot update the business information from the mobile application.',
    requester: 'Urban Looks Salon',
    requesterType: 'Salon',
    email: 'support@urbanlooks.com',
    phone: '+91 91234 56789',
    category: 'TECHNICAL',
    priority: 'MEDIUM',
    status: 'OPEN',
    assignedTo: 'Unassigned',
    createdAt: '29 Aug 2026, 06:20 PM',
    updatedAt: '29 Aug 2026, 06:20 PM'
  },
  {
    id: 'SUP-1004',
    subject: 'Refund status enquiry',
    description:
      'Customer requested an update regarding a refund for a cancelled appointment.',
    requester: 'Priya Nair',
    requesterType: 'Customer',
    email: 'priya@example.com',
    phone: '+91 90123 45678',
    category: 'PAYMENT',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    assignedTo: 'Admin Team',
    createdAt: '28 Aug 2026, 02:10 PM',
    updatedAt: '29 Aug 2026, 11:30 AM'
  },
  {
    id: 'SUP-1005',
    subject: 'Salon verification question',
    description:
      'Salon owner wants to know which documents are required for verification.',
    requester: 'Style Lounge',
    requesterType: 'Salon',
    email: 'owner@stylelounge.com',
    phone: '+91 93456 78901',
    category: 'SALON',
    priority: 'LOW',
    status: 'CLOSED',
    assignedTo: 'Verification Team',
    createdAt: '27 Aug 2026, 04:45 PM',
    updatedAt: '28 Aug 2026, 09:15 AM'
  }
];

// ==============================|| SUPPORT ||============================== //

export default function Support() {
  const [tickets, setTickets] =
    useState<SupportTicket[]>(initialTickets);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<'ALL' | TicketStatus>('ALL');
  const [priorityFilter, setPriorityFilter] =
    useState<'ALL' | TicketPriority>('ALL');

  const [selectedTicket, setSelectedTicket] =
    useState<SupportTicket | null>(null);

  const [reply, setReply] = useState('');

  const [showCreate, setShowCreate] = useState(false);

  const [successMessage, setSuccessMessage] =
    useState('');

  const [newSubject, setNewSubject] = useState('');
  const [newDescription, setNewDescription] =
    useState('');
  const [newCategory, setNewCategory] =
    useState<TicketType>('OTHER');
  const [newPriority, setNewPriority] =
    useState<TicketPriority>('MEDIUM');

  // ======================================================
  // FILTER TICKETS
  // ======================================================

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch =
        ticket.id
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        ticket.subject
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        ticket.requester
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' ||
        ticket.status === statusFilter;

      const matchesPriority =
        priorityFilter === 'ALL' ||
        ticket.priority === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [
    tickets,
    search,
    statusFilter,
    priorityFilter
  ]);

  // ======================================================
  // COUNTERS
  // ======================================================

  const counters = {
    total: tickets.length,
    open: tickets.filter(
      (ticket) => ticket.status === 'OPEN'
    ).length,
    inProgress: tickets.filter(
      (ticket) => ticket.status === 'IN_PROGRESS'
    ).length,
    resolved: tickets.filter(
      (ticket) =>
        ticket.status === 'RESOLVED' ||
        ticket.status === 'CLOSED'
    ).length,
    urgent: tickets.filter(
      (ticket) => ticket.priority === 'URGENT'
    ).length
  };

  // ======================================================
  // STATUS CHANGE
  // ======================================================

  const handleStatusChange = (
    ticketId: string,
    newStatus: TicketStatus
  ) => {
    setTickets((previous) =>
      previous.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              status: newStatus,
              updatedAt: 'Just now'
            }
          : ticket
      )
    );

    if (selectedTicket?.id === ticketId) {
      setSelectedTicket((previous) =>
        previous
          ? {
              ...previous,
              status: newStatus,
              updatedAt: 'Just now'
            }
          : null
      );
    }

    showSuccess(
      `Ticket ${ticketId} updated successfully.`
    );
  };

  // ======================================================
  // ASSIGN TICKET
  // ======================================================

  const handleAssign = (ticketId: string) => {
    setTickets((previous) =>
      previous.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              assignedTo: 'Admin Team',
              status:
                ticket.status === 'OPEN'
                  ? 'IN_PROGRESS'
                  : ticket.status
            }
          : ticket
      )
    );

    showSuccess(
      `Ticket ${ticketId} assigned to Admin Team.`
    );
  };

  // ======================================================
  // SEND REPLY
  // ======================================================

  const handleReply = () => {
    if (!selectedTicket || !reply.trim()) return;

    setReply('');

    showSuccess(
      `Reply sent to ${selectedTicket.requester}.`
    );
  };

  // ======================================================
  // CREATE TICKET
  // ======================================================

  const handleCreateTicket = () => {
    if (!newSubject.trim() || !newDescription.trim()) {
      return;
    }

    const newTicket: SupportTicket = {
      id: `SUP-${1000 + tickets.length + 1}`,
      subject: newSubject,
      description: newDescription,
      requester: 'Clavata Admin',
      requesterType: 'Customer',
      email: 'support@clavata.com',
      phone: '+91 00000 00000',
      category: newCategory,
      priority: newPriority,
      status: 'OPEN',
      assignedTo: 'Unassigned',
      createdAt: 'Just now',
      updatedAt: 'Just now'
    };

    setTickets((previous) => [
      newTicket,
      ...previous
    ]);

    setNewSubject('');
    setNewDescription('');
    setNewCategory('OTHER');
    setNewPriority('MEDIUM');
    setShowCreate(false);

    showSuccess('Support ticket created successfully.');
  };

  // ======================================================
  // DELETE
  // ======================================================

  const handleDelete = (ticketId: string) => {
    setTickets((previous) =>
      previous.filter(
        (ticket) => ticket.id !== ticketId
      )
    );

    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(null);
    }

    showSuccess(`Ticket ${ticketId} removed.`);
  };

  // ======================================================
  // SUCCESS
  // ======================================================

  const showSuccess = (message: string) => {
    setSuccessMessage(message);

    window.setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  // ======================================================
  // RENDER
  // ======================================================

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
          alignItems: {
            xs: 'flex-start',
            sm: 'center'
          },
          flexDirection: {
            xs: 'column',
            sm: 'row'
          },
          gap: 2
        }}
      >
        <Box>
          <Typography variant="h4">
            Support
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Manage customer, salon and platform support
            requests.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<PlusOutlined />}
          onClick={() => setShowCreate(true)}
          sx={{
            borderRadius: 2,
            px: 2.5
          }}
        >
          Create Ticket
        </Button>
      </Box>

      {/* ====================================================== */}
      {/* SUCCESS */}
      {/* ====================================================== */}

      {successMessage && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          onClose={() => setSuccessMessage('')}
        >
          {successMessage}
        </Alert>
      )}

      {/* ====================================================== */}
      {/* SUMMARY CARDS */}
      {/* ====================================================== */}

      <Grid
        container
        spacing={2.5}
        sx={{ mb: 3 }}
      >
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            icon={<CustomerServiceOutlined />}
            title="Total Tickets"
            value={counters.total}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            icon={<ClockCircleOutlined />}
            title="Open"
            value={counters.open}
            color="warning.main"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            icon={<MessageOutlined />}
            title="In Progress"
            value={counters.inProgress}
            color="primary.main"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            icon={<CheckCircleOutlined />}
            title="Resolved"
            value={counters.resolved}
            color="success.main"
          />
        </Grid>
      </Grid>

      {/* ====================================================== */}
      {/* URGENT ALERT */}
      {/* ====================================================== */}

      {counters.urgent > 0 && (
        <Alert
          severity="warning"
          icon={<WarningOutlined />}
          sx={{ mb: 3 }}
        >
          There {counters.urgent === 1 ? 'is' : 'are'}{' '}
          <strong>{counters.urgent}</strong> urgent
          support {counters.urgent === 1 ? 'ticket' : 'tickets'}{' '}
          requiring attention.
        </Alert>
      )}

      {/* ====================================================== */}
      {/* MAIN CARD */}
      {/* ====================================================== */}

      <Card>
        <CardContent>
          {/* FILTERS */}

          <Box
            sx={{
              display: 'flex',
              alignItems: {
                xs: 'stretch',
                md: 'center'
              },
              flexDirection: {
                xs: 'column',
                md: 'row'
              },
              gap: 2,
              mb: 2
            }}
          >
            <TextField
              fullWidth
              placeholder="Search tickets, subjects or requesters..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined />
                  </InputAdornment>
                )
              }}
            />

            <Select
              value={statusFilter}
              onChange={(
                event: SelectChangeEvent
              ) =>
                setStatusFilter(
                  event.target.value as
                    | 'ALL'
                    | TicketStatus
                )
              }
              sx={{ minWidth: 170 }}
              displayEmpty
              startAdornment={
                <InputAdornment position="start">
                  <FilterOutlined />
                </InputAdornment>
              }
            >
              <MenuItem value="ALL">
                All Statuses
              </MenuItem>
              <MenuItem value="OPEN">
                Open
              </MenuItem>
              <MenuItem value="IN_PROGRESS">
                In Progress
              </MenuItem>
              <MenuItem value="RESOLVED">
                Resolved
              </MenuItem>
              <MenuItem value="CLOSED">
                Closed
              </MenuItem>
            </Select>

            <Select
              value={priorityFilter}
              onChange={(
                event: SelectChangeEvent
              ) =>
                setPriorityFilter(
                  event.target.value as
                    | 'ALL'
                    | TicketPriority
                )
              }
              sx={{ minWidth: 160 }}
              displayEmpty
            >
              <MenuItem value="ALL">
                All Priorities
              </MenuItem>
              <MenuItem value="LOW">
                Low
              </MenuItem>
              <MenuItem value="MEDIUM">
                Medium
              </MenuItem>
              <MenuItem value="HIGH">
                High
              </MenuItem>
              <MenuItem value="URGENT">
                Urgent
              </MenuItem>
            </Select>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* ====================================================== */}
          {/* TICKET LIST */}
          {/* ====================================================== */}

          {filteredTickets.length === 0 ? (
            <Box
              sx={{
                py: 8,
                textAlign: 'center'
              }}
            >
              <CustomerServiceOutlined
                style={{
                  fontSize: 48,
                  opacity: 0.35
                }}
              />

              <Typography
                variant="h6"
                sx={{ mt: 2 }}
              >
                No support tickets found
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Try changing your search or filters.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1}>
              {filteredTickets.map((ticket) => (
                <TicketRow
                  key={ticket.id}
                  ticket={ticket}
                  onView={() =>
                    setSelectedTicket(ticket)
                  }
                  onAssign={() =>
                    handleAssign(ticket.id)
                  }
                  onDelete={() =>
                    handleDelete(ticket.id)
                  }
                />
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* ====================================================== */}
      {/* TICKET DETAIL */}
      {/* ====================================================== */}

      {selectedTicket && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 2
              }}
            >
              <Box>
                <Typography variant="h6">
                  {selectedTicket.subject}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {selectedTicket.id} •{' '}
                  {selectedTicket.createdAt}
                </Typography>
              </Box>

              <IconButton
                onClick={() =>
                  setSelectedTicket(null)
                }
              >
                ×
              </IconButton>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={3}>
              {/* REQUESTER */}

              <Grid item xs={12} md={4}>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1.5 }}
                >
                  Requester
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5
                  }}
                >
                  <Avatar>
                    {selectedTicket.requester
                      .charAt(0)
                      .toUpperCase()}
                  </Avatar>

                  <Box>
                    <Typography fontWeight={600}>
                      {selectedTicket.requester}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {selectedTicket.requesterType}
                    </Typography>
                  </Box>
                </Box>

                <Stack
                  spacing={1}
                  sx={{ mt: 2 }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    <MailOutlined />{' '}
                    {selectedTicket.email}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    <PhoneOutlined />{' '}
                    {selectedTicket.phone}
                  </Typography>
                </Stack>
              </Grid>

              {/* DESCRIPTION */}

              <Grid item xs={12} md={8}>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1.5 }}
                >
                  Issue Description
                </Typography>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'background.default',
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Typography variant="body2">
                    {selectedTicket.description}
                  </Typography>
                </Box>
              </Grid>

              {/* DETAILS */}

              <Grid item xs={12}>
                <Divider />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <DetailItem
                  label="Category"
                  value={selectedTicket.category}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <DetailItem
                  label="Priority"
                  value={selectedTicket.priority}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <DetailItem
                  label="Assigned To"
                  value={selectedTicket.assignedTo}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <DetailItem
                  label="Status"
                  value={selectedTicket.status}
                />
              </Grid>

              {/* ACTIONS */}

              <Grid item xs={12}>
                <Divider />
              </Grid>

              <Grid item xs={12}>
                <Stack
                  direction={{
                    xs: 'column',
                    sm: 'row'
                  }}
                  spacing={1.5}
                >
                  <Select
                    value={selectedTicket.status}
                    size="small"
                    onChange={(event) =>
                      handleStatusChange(
                        selectedTicket.id,
                        event.target
                          .value as TicketStatus
                      )
                    }
                    sx={{ minWidth: 180 }}
                  >
                    <MenuItem value="OPEN">
                      Open
                    </MenuItem>

                    <MenuItem value="IN_PROGRESS">
                      In Progress
                    </MenuItem>

                    <MenuItem value="RESOLVED">
                      Resolved
                    </MenuItem>

                    <MenuItem value="CLOSED">
                      Closed
                    </MenuItem>
                  </Select>

                  <Button
                    variant="outlined"
                    startIcon={<UserOutlined />}
                    onClick={() =>
                      handleAssign(
                        selectedTicket.id
                      )
                    }
                  >
                    Assign to Admin Team
                  </Button>
                </Stack>
              </Grid>

              {/* REPLY */}

              <Grid item xs={12}>
                <Box
                  sx={{
                    mt: 1,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'background.default'
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1 }}
                  >
                    Reply
                  </Typography>

                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    placeholder="Write a response..."
                    value={reply}
                    onChange={(event) =>
                      setReply(event.target.value)
                    }
                  />

                  <Button
                    variant="contained"
                    startIcon={<SendOutlined />}
                    sx={{
                      mt: 1.5,
                      borderRadius: 2
                    }}
                    disabled={!reply.trim()}
                    onClick={handleReply}
                  >
                    Send Reply
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* ====================================================== */}
      {/* CREATE TICKET */}
      {/* ====================================================== */}

      {showCreate && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2
              }}
            >
              <Box>
                <Typography variant="h6">
                  Create Support Ticket
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Create an internal support request.
                </Typography>
              </Box>

              <IconButton
                onClick={() =>
                  setShowCreate(false)
                }
              >
                ×
              </IconButton>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subject"
                  value={newSubject}
                  onChange={(event) =>
                    setNewSubject(
                      event.target.value
                    )
                  }
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Select
                  fullWidth
                  value={newCategory}
                  onChange={(event) =>
                    setNewCategory(
                      event.target
                        .value as TicketType
                    )
                  }
                >
                  <MenuItem value="CUSTOMER">
                    Customer
                  </MenuItem>

                  <MenuItem value="SALON">
                    Salon
                  </MenuItem>

                  <MenuItem value="BOOKING">
                    Booking
                  </MenuItem>

                  <MenuItem value="PAYMENT">
                    Payment
                  </MenuItem>

                  <MenuItem value="TECHNICAL">
                    Technical
                  </MenuItem>

                  <MenuItem value="OTHER">
                    Other
                  </MenuItem>
                </Select>
              </Grid>

              <Grid item xs={12} md={6}>
                <Select
                  fullWidth
                  value={newPriority}
                  onChange={(event) =>
                    setNewPriority(
                      event.target
                        .value as TicketPriority
                    )
                  }
                >
                  <MenuItem value="LOW">
                    Low
                  </MenuItem>

                  <MenuItem value="MEDIUM">
                    Medium
                  </MenuItem>

                  <MenuItem value="HIGH">
                    High
                  </MenuItem>

                  <MenuItem value="URGENT">
                    Urgent
                  </MenuItem>
                </Select>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  minRows={4}
                  label="Description"
                  value={newDescription}
                  onChange={(event) =>
                    setNewDescription(
                      event.target.value
                    )
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <Stack
                  direction="row"
                  justifyContent="flex-end"
                  spacing={1.5}
                >
                  <Button
                    variant="outlined"
                    onClick={() =>
                      setShowCreate(false)
                    }
                  >
                    Cancel
                  </Button>

                  <Button
                    variant="contained"
                    startIcon={<PlusOutlined />}
                    disabled={
                      !newSubject.trim() ||
                      !newDescription.trim()
                    }
                    onClick={
                      handleCreateTicket
                    }
                  >
                    Create Ticket
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

// ==============================|| SUMMARY CARD ||============================== //

interface SummaryCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  color?: string;
}

function SummaryCard({
  icon,
  title,
  value,
  color = 'primary.main'
}: SummaryCardProps) {
  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              {title}
            </Typography>

            <Typography
              variant="h4"
              sx={{ mt: 0.5 }}
            >
              {value}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'action.hover',
              color
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// ==============================|| TICKET ROW ||============================== //

interface TicketRowProps {
  ticket: SupportTicket;
  onView: () => void;
  onAssign: () => void;
  onDelete: () => void;
}

function TicketRow({
  ticket,
  onView,
  onAssign,
  onDelete
}: TicketRowProps) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: 1
        }
      }}
    >
      <Grid
        container
        spacing={2}
        alignItems="center"
      >
        {/* ICON */}

        <Grid item xs={12} sm="auto">
          <Avatar
            sx={{
              width: 42,
              height: 42
            }}
          >
            {ticket.requesterType === 'Salon' ? (
              <ShopOutlined />
            ) : (
              <UserOutlined />
            )}
          </Avatar>
        </Grid>

        {/* MAIN */}

        <Grid item xs={12} sm>
          <Typography
            variant="subtitle1"
            fontWeight={600}
          >
            {ticket.subject}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.25 }}
          >
            {ticket.id} • {ticket.requester}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              gap: 0.75,
              mt: 1,
              flexWrap: 'wrap'
            }}
          >
            <StatusChip
              status={ticket.status}
            />

            <PriorityChip
              priority={ticket.priority}
            />

            <Chip
              label={ticket.category}
              size="small"
              variant="outlined"
            />
          </Box>
        </Grid>

        {/* ASSIGNED */}

        <Grid
          item
          xs={12}
          sm={3}
          md={2}
        >
          <Typography
            variant="caption"
            color="text.secondary"
          >
            Assigned To
          </Typography>

          <Typography
            variant="body2"
            fontWeight={600}
          >
            {ticket.assignedTo}
          </Typography>
        </Grid>

        {/* DATE */}

        <Grid
          item
          xs={12}
          sm={3}
          md={2}
        >
          <Typography
            variant="caption"
            color="text.secondary"
          >
            Updated
          </Typography>

          <Typography variant="body2">
            {ticket.updatedAt}
          </Typography>
        </Grid>

        {/* ACTIONS */}

        <Grid item xs={12} sm="auto">
          <Stack direction="row" spacing={0.5}>
            <IconButton
              color="primary"
              onClick={onView}
              title="View ticket"
            >
              <EyeOutlined />
            </IconButton>

            <IconButton
              color="primary"
              onClick={onAssign}
              title="Assign ticket"
            >
              <UserOutlined />
            </IconButton>

            <IconButton
              color="error"
              onClick={onDelete}
              title="Delete ticket"
            >
              <DeleteOutlined />
            </IconButton>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

// ==============================|| STATUS CHIP ||============================== //

function StatusChip({
  status
}: {
  status: TicketStatus;
}) {
  const config: Record<
    TicketStatus,
    {
      label: string;
      color:
        | 'default'
        | 'primary'
        | 'success'
        | 'warning';
    }
  > = {
    OPEN: {
      label: 'Open',
      color: 'warning'
    },
    IN_PROGRESS: {
      label: 'In Progress',
      color: 'primary'
    },
    RESOLVED: {
      label: 'Resolved',
      color: 'success'
    },
    CLOSED: {
      label: 'Closed',
      color: 'default'
    }
  };

  return (
    <Chip
      label={config[status].label}
      size="small"
      color={config[status].color}
    />
  );
}

// ==============================|| PRIORITY CHIP ||============================== //

function PriorityChip({
  priority
}: {
  priority: TicketPriority;
}) {
  const config: Record<
    TicketPriority,
    {
      label: string;
      color:
        | 'default'
        | 'primary'
        | 'warning'
        | 'error';
    }
  > = {
    LOW: {
      label: 'Low',
      color: 'default'
    },
    MEDIUM: {
      label: 'Medium',
      color: 'primary'
    },
    HIGH: {
      label: 'High',
      color: 'warning'
    },
    URGENT: {
      label: 'Urgent',
      color: 'error'
    }
  };

  return (
    <Chip
      label={config[priority].label}
      size="small"
      color={config[priority].color}
      variant="outlined"
    />
  );
}

// ==============================|| DETAIL ITEM ||============================== //

function DetailItem({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
      >
        {label}
      </Typography>

      <Typography
        variant="body2"
        fontWeight={600}
        sx={{ mt: 0.5 }}
      >
        {value}
      </Typography>
    </Box>
  );
}