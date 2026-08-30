import { useMemo, useState } from 'react';

// material-ui
import {
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
    CalendarOutlined,
    EyeOutlined,
    PhoneOutlined,
    SearchOutlined,
    UserOutlined,
    UsergroupAddOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';

// project import
import CustomerDetails from './CustomerDetails';

// ==============================|| TYPES ||============================== //

export type CustomerStatus = 'ACTIVE' | 'INACTIVE';

export interface Customer {
    userId: string;
    fullName: string;
    phoneNumber: string;
    email?: string;
    activeRole: 'CUSTOMER';
    providerStatus: 'NOT_REGISTERED';
    salonId?: string | null;
    status: CustomerStatus;
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    totalSpent: number;
    lastBooking?: string | null;
    createdAt: string;
    updatedAt: string;
}

// ==============================|| DUMMY DATA ||============================== //

const initialCustomers: Customer[] = [
    {
        userId: 'USR001',
        fullName: 'Priya Sharma',
        phoneNumber: '9876543210',
        email: 'priya.sharma@example.com',
        activeRole: 'CUSTOMER',
        providerStatus: 'NOT_REGISTERED',
        salonId: null,
        status: 'ACTIVE',
        totalBookings: 18,
        completedBookings: 15,
        cancelledBookings: 2,
        totalSpent: 8450,
        lastBooking: '2026-08-28T10:30:00',
        createdAt: '2026-01-12T09:15:00',
        updatedAt: '2026-08-28T10:30:00'
    },
    {
        userId: 'USR002',
        fullName: 'Rahul Kumar',
        phoneNumber: '9845012345',
        email: 'rahul.kumar@example.com',
        activeRole: 'CUSTOMER',
        providerStatus: 'NOT_REGISTERED',
        salonId: null,
        status: 'ACTIVE',
        totalBookings: 9,
        completedBookings: 8,
        cancelledBookings: 1,
        totalSpent: 4200,
        lastBooking: '2026-08-25T15:00:00',
        createdAt: '2026-02-04T11:20:00',
        updatedAt: '2026-08-25T15:00:00'
    },
    {
        userId: 'USR003',
        fullName: 'Sneha Reddy',
        phoneNumber: '9900123456',
        email: 'sneha.reddy@example.com',
        activeRole: 'CUSTOMER',
        providerStatus: 'NOT_REGISTERED',
        salonId: null,
        status: 'ACTIVE',
        totalBookings: 24,
        completedBookings: 21,
        cancelledBookings: 2,
        totalSpent: 12600,
        lastBooking: '2026-08-29T12:00:00',
        createdAt: '2025-12-20T10:10:00',
        updatedAt: '2026-08-29T12:00:00'
    },
    {
        userId: 'USR004',
        fullName: 'Arjun Mehta',
        phoneNumber: '9988776655',
        email: 'arjun.mehta@example.com',
        activeRole: 'CUSTOMER',
        providerStatus: 'NOT_REGISTERED',
        salonId: null,
        status: 'ACTIVE',
        totalBookings: 6,
        completedBookings: 5,
        cancelledBookings: 1,
        totalSpent: 2800,
        lastBooking: '2026-08-19T18:30:00',
        createdAt: '2026-04-11T08:45:00',
        updatedAt: '2026-08-19T18:30:00'
    },
    {
        userId: 'USR005',
        fullName: 'Kavya Nair',
        phoneNumber: '9870011223',
        email: 'kavya.nair@example.com',
        activeRole: 'CUSTOMER',
        providerStatus: 'NOT_REGISTERED',
        salonId: null,
        status: 'INACTIVE',
        totalBookings: 3,
        completedBookings: 2,
        cancelledBookings: 1,
        totalSpent: 1100,
        lastBooking: '2026-05-10T14:00:00',
        createdAt: '2026-03-02T13:30:00',
        updatedAt: '2026-05-10T14:00:00'
    },
    {
        userId: 'USR006',
        fullName: 'Vikram Singh',
        phoneNumber: '9811122233',
        email: 'vikram.singh@example.com',
        activeRole: 'CUSTOMER',
        providerStatus: 'NOT_REGISTERED',
        salonId: null,
        status: 'ACTIVE',
        totalBookings: 12,
        completedBookings: 10,
        cancelledBookings: 1,
        totalSpent: 5750,
        lastBooking: '2026-08-21T11:30:00',
        createdAt: '2026-01-28T16:10:00',
        updatedAt: '2026-08-21T11:30:00'
    },
    {
        userId: 'USR007',
        fullName: 'Meera Joshi',
        phoneNumber: '9898989898',
        email: 'meera.joshi@example.com',
        activeRole: 'CUSTOMER',
        providerStatus: 'NOT_REGISTERED',
        salonId: null,
        status: 'ACTIVE',
        totalBookings: 31,
        completedBookings: 28,
        cancelledBookings: 2,
        totalSpent: 18900,
        lastBooking: '2026-08-30T09:00:00',
        createdAt: '2025-11-18T12:20:00',
        updatedAt: '2026-08-30T09:00:00'
    },
    {
        userId: 'USR008',
        fullName: 'Aditya Rao',
        phoneNumber: '9765432109',
        email: 'aditya.rao@example.com',
        activeRole: 'CUSTOMER',
        providerStatus: 'NOT_REGISTERED',
        salonId: null,
        status: 'ACTIVE',
        totalBookings: 7,
        completedBookings: 7,
        cancelledBookings: 0,
        totalSpent: 3500,
        lastBooking: '2026-08-23T17:30:00',
        createdAt: '2026-05-01T09:00:00',
        updatedAt: '2026-08-23T17:30:00'
    }
];

// ==============================|| HELPERS ||============================== //

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(value);
};

const formatDate = (date?: string | null) => {
    if (!date) return 'Never';

    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).format(new Date(date));
};

const getInitials = (name: string) => {
    return name
        .split(' ')
        .map((part) => part.charAt(0))
        .join('')
        .substring(0, 2)
        .toUpperCase();
};

// ==============================|| STAT CARD ||============================== //

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ReactNode;
}

function StatCard({ title, value, subtitle, icon }: StatCardProps) {
    return (
        <Card
            elevation={0}
            sx={{
                height: '100%',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2.5
            }}
        >
            <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                fontWeight: 500,
                                mb: 1
                            }}
                        >
                            {title}
                        </Typography>

                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                            {value}
                        </Typography>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                                display: 'block',
                                mt: 0.75
                            }}
                        >
                            {subtitle}
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
                            bgcolor: 'primary.lighter',
                            color: 'primary.main'
                        }}
                    >
                        {icon}
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}

// ==============================|| CUSTOMERS PAGE ||============================== //

export default function Customers() {
    const [customers] = useState<Customer[]>(initialCustomers);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | CustomerStatus>('ALL');

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    // ==============================|| STATISTICS ||============================== //

    const totalCustomers = customers.length;

    const activeCustomers = customers.filter((customer) => customer.status === 'ACTIVE').length;

    const inactiveCustomers = customers.filter((customer) => customer.status === 'INACTIVE').length;

    const totalBookings = customers.reduce((sum, customer) => sum + customer.totalBookings, 0);

    // ==============================|| FILTER ||============================== //

    const filteredCustomers = useMemo(() => {
        const query = search.trim().toLowerCase();

        return customers.filter((customer) => {
            const matchesSearch =
                !query ||
                customer.fullName.toLowerCase().includes(query) ||
                customer.phoneNumber.toLowerCase().includes(query) ||
                customer.email?.toLowerCase().includes(query) ||
                customer.userId.toLowerCase().includes(query);

            const matchesStatus = statusFilter === 'ALL' || customer.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [customers, search, statusFilter]);

    // ==============================|| HANDLERS ||============================== //

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
        setPage(0);
    };

    const handleStatusChange = (event: SelectChangeEvent) => {
        setStatusFilter(event.target.value as 'ALL' | CustomerStatus);
        setPage(0);
    };

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleViewCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setDetailsOpen(true);
    };

    const handleCloseDetails = () => {
        setDetailsOpen(false);
        setSelectedCustomer(null);
    };

    // ==============================|| PAGINATION ||============================== //

    const paginatedCustomers = filteredCustomers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    // ==============================|| RENDER ||============================== //

    return (
        <Box sx={{ width: '100%' }}>
            {/* ==============================|| PAGE HEADER ||============================== */}

            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={2}
                sx={{ mb: 3 }}
            >
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        Customers
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Manage and monitor customers registered on your platform.
                    </Typography>
                </Box>
            </Stack>

            {/* ==============================|| STATISTICS ||============================== */}

            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Total Customers"
                        value={totalCustomers}
                        subtitle="All registered customers"
                        icon={<UsergroupAddOutlined style={{ fontSize: 22 }} />}
                    />
                </Grid>

                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Active Customers"
                        value={activeCustomers}
                        subtitle="Currently active"
                        icon={<CheckCircleOutlined style={{ fontSize: 22 }} />}
                    />
                </Grid>

                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Inactive Customers"
                        value={inactiveCustomers}
                        subtitle="Currently inactive"
                        icon={<CloseCircleOutlined style={{ fontSize: 22 }} />}
                    />
                </Grid>

                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Total Bookings"
                        value={totalBookings}
                        subtitle="Bookings made by customers"
                        icon={<CalendarOutlined style={{ fontSize: 22 }} />}
                    />
                </Grid>
            </Grid>

            {/* ==============================|| TABLE CARD ||============================== */}

            <Card
                elevation={0}
                sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2.5
                }}
            >
                {/* ==============================|| TOOLBAR ||============================== */}

                <Box sx={{ p: 2.5 }}>
                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={2}
                        justifyContent="space-between"
                    >
                        <TextField
                            value={search}
                            onChange={handleSearchChange}
                            placeholder="Search by name, phone, email or ID..."
                            size="small"
                            fullWidth
                            sx={{
                                maxWidth: { md: 420 }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchOutlined style={{ fontSize: 18 }} />
                                    </InputAdornment>
                                )
                            }}
                        />

                        <Stack direction="row" spacing={1.5}>
                            <Select
                                value={statusFilter}
                                onChange={handleStatusChange}
                                size="small"
                                sx={{
                                    minWidth: 140
                                }}
                            >
                                <MenuItem value="ALL">All Status</MenuItem>
                                <MenuItem value="ACTIVE">Active</MenuItem>
                                <MenuItem value="INACTIVE">Inactive</MenuItem>
                            </Select>
                        </Stack>
                    </Stack>
                </Box>

                <Divider />

                {/* ==============================|| TABLE ||============================== */}

                <TableContainer component={Paper} elevation={0}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Bookings</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Total Spent</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Last Booking</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>
                                    Action
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {paginatedCustomers.length > 0 ? (
                                paginatedCustomers.map((customer) => (
                                    <TableRow
                                        key={customer.userId}
                                        hover
                                        sx={{
                                            '&:last-child td, &:last-child th': {
                                                border: 0
                                            }
                                        }}
                                    >
                                        {/* CUSTOMER */}

                                        <TableCell>
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Avatar
                                                    sx={{
                                                        width: 40,
                                                        height: 40,
                                                        bgcolor: 'primary.lighter',
                                                        color: 'primary.main',
                                                        fontSize: 14,
                                                        fontWeight: 700
                                                    }}
                                                >
                                                    {getInitials(customer.fullName)}
                                                </Avatar>

                                                <Box>
                                                    <Typography
                                                        variant="subtitle2"
                                                        sx={{
                                                            fontWeight: 600
                                                        }}
                                                    >
                                                        {customer.fullName}
                                                    </Typography>

                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        {customer.userId}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>

                                        {/* PHONE */}

                                        <TableCell>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <PhoneOutlined style={{ fontSize: 15 }} />

                                                <Typography variant="body2">
                                                    {customer.phoneNumber}
                                                </Typography>
                                            </Stack>
                                        </TableCell>

                                        {/* BOOKINGS */}

                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {customer.totalBookings}
                                            </Typography>

                                            <Typography variant="caption" color="text.secondary">
                                                {customer.completedBookings} completed
                                            </Typography>
                                        </TableCell>

                                        {/* SPENDING */}

                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {formatCurrency(customer.totalSpent)}
                                            </Typography>
                                        </TableCell>

                                        {/* LAST BOOKING */}

                                        <TableCell>
                                            <Typography variant="body2">
                                                {formatDate(customer.lastBooking)}
                                            </Typography>
                                        </TableCell>

                                        {/* STATUS */}

                                        <TableCell>
                                            <Chip
                                                size="small"
                                                label={customer.status}
                                                icon={
                                                    customer.status === 'ACTIVE' ? (
                                                        <CheckCircleOutlined />
                                                    ) : (
                                                        <CloseCircleOutlined />
                                                    )
                                                }
                                                color={
                                                    customer.status === 'ACTIVE'
                                                        ? 'success'
                                                        : 'default'
                                                }
                                                variant="outlined"
                                                sx={{
                                                    fontWeight: 600
                                                }}
                                            />
                                        </TableCell>

                                        {/* ACTION */}

                                        <TableCell align="right">
                                            <Tooltip title="View customer">
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => handleViewCustomer(customer)}
                                                >
                                                    <EyeOutlined />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7}>
                                        <Box
                                            sx={{
                                                py: 8,
                                                textAlign: 'center'
                                            }}
                                        >
                                            <Avatar
                                                sx={{
                                                    width: 60,
                                                    height: 60,
                                                    mx: 'auto',
                                                    mb: 2,
                                                    bgcolor: 'grey.100',
                                                    color: 'grey.500'
                                                }}
                                            >
                                                <UserOutlined style={{ fontSize: 25 }} />
                                            </Avatar>

                                            <Typography variant="h6">
                                                No customers found
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ mt: 0.5 }}
                                            >
                                                Try changing your search or filter.
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* ==============================|| PAGINATION ||============================== */}

                <TablePagination
                    component="div"
                    count={filteredCustomers.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                />
            </Card>

            {/* ==============================|| CUSTOMER DETAILS ||============================== */}

            <CustomerDetails
                customer={selectedCustomer}
                open={detailsOpen}
                onClose={handleCloseDetails}
            />
        </Box>
    );
}