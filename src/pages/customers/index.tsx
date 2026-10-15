import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';

// Material UI
import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
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

// Ant Design icons
import {
    CalendarOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined,
    PhoneOutlined,
    ReloadOutlined,
    SearchOutlined,
    UserOutlined,
    UsergroupAddOutlined
} from '@ant-design/icons';

// Project imports
import { ADMIN_CUSTOMERS } from '../../graphql/queries';
import CustomerDetails from './CustomerDetails';

// ============================================================
// TYPES
// ============================================================

export type CustomerStatus = 'ACTIVE' | 'INACTIVE';

export type ProviderStatus =
    | 'NOT_REGISTERED'
    | 'PENDING'
    | 'APPROVED'
    | 'REJECTED';

export interface Customer {
    userId: string;
    fullName: string;
    phoneNumber: string;
    email?: string | null;

    role: 'CUSTOMER';
    providerStatus: ProviderStatus;
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

interface AdminCustomersResponse {
    adminCustomers: {
        success: boolean;
        message: string;
        customers: Customer[];
        totalCount: number;
    };
}

// ============================================================
// HELPERS
// ============================================================

const formatCurrency = (value?: number | null) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(Number(value) || 0);
};

const formatDate = (date?: string | null) => {
    if (!date) return 'Never';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return 'Never';
    }

    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).format(parsedDate);
};

const getInitials = (name?: string | null) => {
    if (!name?.trim()) return 'CU';

    return name
        .trim()
        .split(/\s+/)
        .map((part) => part.charAt(0))
        .join('')
        .substring(0, 2)
        .toUpperCase();
};

// ============================================================
// STAT CARD
// ============================================================

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ReactNode;
}

function StatCard({
    title,
    value,
    subtitle,
    icon
}: StatCardProps) {
    return (
        <Card
            elevation={0}
            sx={{
                height: '100%',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2.5,
                transition: 'box-shadow 0.2s ease',
                '&:hover': {
                    boxShadow: (theme) =>
                        theme.shadows[2]
                }
            }}
        >
            <CardContent sx={{ p: 2.5 }}>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={2}
                >
                    <Box sx={{ minWidth: 0 }}>
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

                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                letterSpacing: '-0.5px'
                            }}
                        >
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
                            flexShrink: 0,
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

// ============================================================
// CUSTOMERS PAGE
// ============================================================

export default function Customers() {
    // --------------------------------------------------------
    // STATE
    // --------------------------------------------------------

    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');

    const [statusFilter, setStatusFilter] =
        useState<'ALL' | CustomerStatus>('ALL');

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [selectedCustomer, setSelectedCustomer] =
        useState<Customer | null>(null);

    const [detailsOpen, setDetailsOpen] = useState(false);

    // --------------------------------------------------------
    // SEARCH DEBOUNCE
    // --------------------------------------------------------

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(0);
        }, 400);

        return () => window.clearTimeout(timer);
    }, [searchInput]);

    // --------------------------------------------------------
    // GRAPHQL QUERY
    // --------------------------------------------------------

    const {
        data,
        loading,
        error,
        refetch,
        networkStatus
    } = useQuery<AdminCustomersResponse>(
        ADMIN_CUSTOMERS,
        {
            variables: {
                search: search || undefined,
                status:
                    statusFilter === 'ALL'
                        ? undefined
                        : statusFilter
            },
            fetchPolicy: 'cache-and-network',
            notifyOnNetworkStatusChange: true
        }
    );

    const refreshing = loading && Boolean(data);

    // --------------------------------------------------------
    // DATA
    // --------------------------------------------------------

    const customers = useMemo(
        () => data?.adminCustomers?.customers ?? [],
        [data?.adminCustomers?.customers]
    );

    const totalCount =
        data?.adminCustomers?.totalCount ??
        customers.length;

    // --------------------------------------------------------
    // STATISTICS
    // --------------------------------------------------------

    const activeCustomers = useMemo(
        () =>
            customers.filter(
                (customer) => customer.status === 'ACTIVE'
            ).length,
        [customers]
    );

    const inactiveCustomers = useMemo(
        () =>
            customers.filter(
                (customer) => customer.status === 'INACTIVE'
            ).length,
        [customers]
    );

    const totalBookings = useMemo(
        () =>
            customers.reduce(
                (sum, customer) =>
                    sum + (Number(customer.totalBookings) || 0),
                0
            ),
        [customers]
    );

    // --------------------------------------------------------
    // CLIENT-SIDE PAGINATION
    // --------------------------------------------------------

    const paginatedCustomers = useMemo(() => {
        const start = page * rowsPerPage;

        return customers.slice(
            start,
            start + rowsPerPage
        );
    }, [customers, page, rowsPerPage]);

    // Prevent an invalid page after filtering or refreshing.
    useEffect(() => {
        const maxPage = Math.max(
            0,
            Math.ceil(customers.length / rowsPerPage) - 1
        );

        if (page > maxPage) {
            setPage(maxPage);
        }
    }, [customers.length, page, rowsPerPage]);

    // --------------------------------------------------------
    // HANDLERS
    // --------------------------------------------------------

    const handleSearchChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setSearchInput(event.target.value);
    };

    const handleStatusChange = (
        event: SelectChangeEvent
    ) => {
        setStatusFilter(
            event.target.value as 'ALL' | CustomerStatus
        );
        setPage(0);
    };

    const handleChangePage = (
        _event: unknown,
        newPage: number
    ) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = Number.parseInt(
            event.target.value,
            10
        );

        setRowsPerPage(
            Number.isFinite(value) && value > 0
                ? value
                : 10
        );

        setPage(0);
    };

    const handleRefresh = async () => {
        try {
            await refetch({
                search: search || undefined,
                status:
                    statusFilter === 'ALL'
                        ? undefined
                        : statusFilter
            });
        } catch (refreshError) {
            // Apollo exposes the query error in the UI.
            console.error(
                'Failed to refresh customers:',
                refreshError
            );
        }
    };

    const handleViewCustomer = (
        customer: Customer
    ) => {
        setSelectedCustomer(customer);
        setDetailsOpen(true);
    };

    const handleCloseDetails = () => {
        setDetailsOpen(false);
        setSelectedCustomer(null);
    };

    // --------------------------------------------------------
    // ERROR STATE
    // --------------------------------------------------------

    if (error && !data) {
        return (
            <Box sx={{ width: '100%' }}>
                <Stack
                    direction={{
                        xs: 'column',
                        sm: 'row'
                    }}
                    justifyContent="space-between"
                    alignItems={{
                        xs: 'flex-start',
                        sm: 'center'
                    }}
                    spacing={2}
                    sx={{ mb: 3 }}
                >
                    <Box>
                        <Typography
                            variant="h4"
                            sx={{ fontWeight: 700 }}
                        >
                            Customers
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                        >
                            Manage and monitor registered customers.
                        </Typography>
                    </Box>

                    <Button
                        variant="outlined"
                        startIcon={
                            loading
                                ? <CircularProgress size={16} />
                                : <ReloadOutlined />
                        }
                        onClick={handleRefresh}
                        disabled={loading}
                    >
                        Retry
                    </Button>
                </Stack>

                <Alert
                    severity="error"
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            onClick={handleRefresh}
                            disabled={loading}
                        >
                            Retry
                        </Button>
                    }
                >
                    <Typography
                        variant="subtitle2"
                        sx={{ mb: 0.5 }}
                    >
                        Failed to load customers.
                    </Typography>

                    <Typography variant="body2">
                        {error.message}
                    </Typography>
                </Alert>
            </Box>
        );
    }

    // --------------------------------------------------------
    // RENDER
    // --------------------------------------------------------

    return (
        <Box sx={{ width: '100%' }}>
            {/* PAGE HEADER */}

            <Stack
                direction={{
                    xs: 'column',
                    sm: 'row'
                }}
                justifyContent="space-between"
                alignItems={{
                    xs: 'flex-start',
                    sm: 'center'
                }}
                spacing={2}
                sx={{ mb: 3 }}
            >
                <Box>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            letterSpacing: '-0.5px'
                        }}
                    >
                        Customers
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.75 }}
                    >
                        Manage and monitor customers registered on your platform.
                    </Typography>
                </Box>

                <Button
                    variant="outlined"
                    color="primary"
                    startIcon={
                        refreshing
                            ? <CircularProgress size={16} />
                            : <ReloadOutlined />
                    }
                    onClick={handleRefresh}
                    disabled={loading}
                    sx={{
                        minWidth: 120,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600
                    }}
                >
                    {refreshing ? 'Refreshing…' : 'Refresh'}
                </Button>
            </Stack>

            {/* BACKEND ERROR WITH CACHED DATA */}

            {error && (
                <Alert
                    severity="warning"
                    sx={{ mb: 2 }}
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            onClick={handleRefresh}
                        >
                            Retry
                        </Button>
                    }
                >
                    Could not refresh the latest customer data.
                    Previously loaded data may still be displayed.
                    {' '}
                    {error.message}
                </Alert>
            )}

            {/* STATUS MESSAGE */}

            {data?.adminCustomers?.success === false && (
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                >
                    {data.adminCustomers.message ||
                        'The server could not retrieve customers.'}
                </Alert>
            )}

            {/* STATISTICS */}

            <Grid
                container
                spacing={2.5}
                sx={{ mb: 3 }}
            >
                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Total Customers"
                        value={loading && !data ? '—' : totalCount}
                        subtitle="Customers matching current filters"
                        icon={
                            <UsergroupAddOutlined
                                style={{ fontSize: 22 }}
                            />
                        }
                    />
                </Grid>

                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Active Customers"
                        value={loading && !data ? '—' : activeCustomers}
                        subtitle="Active on current result set"
                        icon={
                            <CheckCircleOutlined
                                style={{ fontSize: 22 }}
                            />
                        }
                    />
                </Grid>

                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Inactive Customers"
                        value={loading && !data ? '—' : inactiveCustomers}
                        subtitle="Inactive on current result set"
                        icon={
                            <CloseCircleOutlined
                                style={{ fontSize: 22 }}
                            />
                        }
                    />
                </Grid>

                <Grid item xs={12} sm={6} lg={3}>
                    <StatCard
                        title="Total Bookings"
                        value={loading && !data ? '—' : totalBookings}
                        subtitle="Bookings across displayed results"
                        icon={
                            <CalendarOutlined
                                style={{ fontSize: 22 }}
                            />
                        }
                    />
                </Grid>
            </Grid>

            {/* CUSTOMERS TABLE */}

            <Card
                elevation={0}
                sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2.5,
                    overflow: 'hidden'
                }}
            >
                {/* TOOLBAR */}

                <Box sx={{ p: 2.5 }}>
                    <Stack
                        direction={{
                            xs: 'column',
                            md: 'row'
                        }}
                        spacing={2}
                        justifyContent="space-between"
                        alignItems={{
                            xs: 'stretch',
                            md: 'center'
                        }}
                    >
                        <TextField
                            value={searchInput}
                            onChange={handleSearchChange}
                            placeholder="Search by name, phone, email or ID..."
                            size="small"
                            fullWidth
                            sx={{
                                maxWidth: {
                                    md: 460
                                },
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchOutlined
                                            style={{ fontSize: 18 }}
                                        />
                                    </InputAdornment>
                                ),
                                endAdornment: searchInput ? (
                                    <InputAdornment position="end">
                                        <IconButton
                                            size="small"
                                            aria-label="Clear search"
                                            onClick={() => {
                                                setSearchInput('');
                                                setSearch('');
                                                setPage(0);
                                            }}
                                        >
                                            <CloseCircleOutlined />
                                        </IconButton>
                                    </InputAdornment>
                                ) : undefined
                            }}
                        />

                        <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                            justifyContent="flex-end"
                        >
                            <Select
                                value={statusFilter}
                                onChange={handleStatusChange}
                                size="small"
                                displayEmpty
                                sx={{
                                    minWidth: 145,
                                    borderRadius: 2
                                }}
                                inputProps={{
                                    'aria-label': 'Filter customers by status'
                                }}
                            >
                                <MenuItem value="ALL">
                                    All Status
                                </MenuItem>

                                <MenuItem value="ACTIVE">
                                    Active
                                </MenuItem>

                                <MenuItem value="INACTIVE">
                                    Inactive
                                </MenuItem>
                            </Select>

                            {loading && (
                                <CircularProgress
                                    size={22}
                                    aria-label="Loading customers"
                                />
                            )}
                        </Stack>
                    </Stack>
                </Box>

                <Divider />

                {/* TABLE */}

                <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{ position: 'relative' }}
                >
                    <Table>
                        <TableHead>
                            <TableRow
                                sx={{
                                    bgcolor: 'action.hover',
                                    '& .MuiTableCell-root': {
                                        fontWeight: 700,
                                        whiteSpace: 'nowrap'
                                    }
                                }}
                            >
                                <TableCell>Customer</TableCell>
                                <TableCell>Phone</TableCell>
                                <TableCell>Bookings</TableCell>
                                <TableCell>Total Spent</TableCell>
                                <TableCell>Last Booking</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Action</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {loading && !data ? (
                                <TableRow>
                                    <TableCell colSpan={7}>
                                        <Box
                                            sx={{
                                                py: 8,
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                flexDirection: 'column',
                                                gap: 2
                                            }}
                                        >
                                            <CircularProgress />

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                Loading customers…
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : paginatedCustomers.length > 0 ? (
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
                                            <Stack
                                                direction="row"
                                                spacing={1.5}
                                                alignItems="center"
                                            >
                                                <Avatar
                                                    sx={{
                                                        width: 42,
                                                        height: 42,
                                                        bgcolor: 'primary.lighter',
                                                        color: 'primary.main',
                                                        fontSize: 14,
                                                        fontWeight: 700
                                                    }}
                                                >
                                                    {getInitials(customer.fullName)}
                                                </Avatar>

                                                <Box sx={{ minWidth: 0 }}>
                                                    <Typography
                                                        variant="subtitle2"
                                                        sx={{
                                                            fontWeight: 600,
                                                            overflowWrap: 'anywhere'
                                                        }}
                                                    >
                                                        {customer.fullName || 'Unnamed customer'}
                                                    </Typography>

                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        sx={{
                                                            display: 'block',
                                                            overflowWrap: 'anywhere'
                                                        }}
                                                    >
                                                        {customer.userId}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>

                                        {/* PHONE */}

                                        <TableCell>
                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                alignItems="center"
                                            >
                                                <PhoneOutlined
                                                    style={{ fontSize: 15 }}
                                                />

                                                <Typography
                                                    variant="body2"
                                                    sx={{ whiteSpace: 'nowrap' }}
                                                >
                                                    {customer.phoneNumber || '—'}
                                                </Typography>
                                            </Stack>
                                        </TableCell>

                                        {/* BOOKINGS */}

                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                sx={{ fontWeight: 600 }}
                                            >
                                                {customer.totalBookings ?? 0}
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {customer.completedBookings ?? 0} completed
                                            </Typography>
                                        </TableCell>

                                        {/* SPENDING */}

                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                sx={{ fontWeight: 600 }}
                                            >
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
                                                label={customer.status || 'INACTIVE'}
                                                icon={
                                                    customer.status === 'ACTIVE'
                                                        ? <CheckCircleOutlined />
                                                        : <CloseCircleOutlined />
                                                }
                                                color={
                                                    customer.status === 'ACTIVE'
                                                        ? 'success'
                                                        : 'default'
                                                }
                                                variant="outlined"
                                                sx={{ fontWeight: 600 }}
                                            />
                                        </TableCell>

                                        {/* ACTION */}

                                        <TableCell align="right">
                                            <Tooltip title="View customer details">
                                                <IconButton
                                                    color="primary"
                                                    aria-label={`View ${customer.fullName || 'customer'} details`}
                                                    onClick={() =>
                                                        handleViewCustomer(customer)
                                                    }
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
                                                px: 2,
                                                textAlign: 'center'
                                            }}
                                        >
                                            <Avatar
                                                sx={{
                                                    width: 60,
                                                    height: 60,
                                                    mx: 'auto',
                                                    mb: 2,
                                                    bgcolor: 'action.hover',
                                                    color: 'text.secondary'
                                                }}
                                            >
                                                <UserOutlined
                                                    style={{ fontSize: 25 }}
                                                />
                                            </Avatar>

                                            <Typography variant="h6">
                                                {loading
                                                    ? 'Refreshing customers…'
                                                    : 'No customers found'}
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ mt: 0.75, mb: 2 }}
                                            >
                                                {search
                                                    ? `No customers match "${search}".`
                                                    : statusFilter !== 'ALL'
                                                      ? `There are no ${statusFilter.toLowerCase()} customers in this result set.`
                                                      : 'No customers were returned by the server.'}
                                            </Typography>

                                            <Button
                                                variant="outlined"
                                                startIcon={<ReloadOutlined />}
                                                onClick={handleRefresh}
                                                disabled={loading}
                                            >
                                                Refresh customers
                                            </Button>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* PAGINATION */}

                <TablePagination
                    component="div"
                    count={customers.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    showFirstButton
                    showLastButton
                    sx={{
                        borderTop: '1px solid',
                        borderColor: 'divider'
                    }}
                />
            </Card>

            {/* CUSTOMER DETAILS */}

            <CustomerDetails
                customer={selectedCustomer}
                open={detailsOpen}
                onClose={handleCloseDetails}
            />
        </Box>
    );
}